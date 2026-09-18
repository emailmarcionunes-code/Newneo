import type { SqlClient, WorkspaceScope } from './agent-repository';
import { registryAccess, RegistryError } from './registry';
export async function readWorkspaceAnalytics(
  db: SqlClient,
  s: WorkspaceScope,
  actor: string,
  company = false,
) {
  const access = await registryAccess(db, s);
  if (company && access.role !== 'Org Admin')
    throw new RegistryError(403, 'Company administrator access is required.');
  const args = [s.organizationId, s.workspaceId, company ? null : actor];
  // Scope is derived from the verified session. Personal views never return another user's activity.
  const filter = `r.organization_id=$1 AND r.workspace_id=$2 AND ($3::uuid IS NULL OR r.actor_id=$3) AND r.created_at>=now()-interval '30 days'`;
  const agents = (
    await db.query(
      `SELECT a.id,a.name,count(*)::int AS searches,count(*) FILTER(WHERE jsonb_array_length(r.result)>0)::int AS matched,round(avg(r.duration_ms))::int AS latency,count(DISTINCT r.actor_id)::int AS users,max(r.created_at) AS latest FROM newneo.source_runs r JOIN newneo.agent_versions v ON v.id=r.agent_version_id JOIN newneo.agents a ON a.id=v.agent_id WHERE ${filter} GROUP BY a.id,a.name ORDER BY searches DESC,a.id`,
      args,
    )
  ).rows;
  const trend = (
    await db.query(
      `SELECT to_char(r.created_at AT TIME ZONE 'UTC','YYYY-MM-DD') AS day,count(*)::int AS searches FROM newneo.source_runs r WHERE ${filter} GROUP BY day ORDER BY day`,
      args,
    )
  ).rows;
  const users = company
    ? (
        await db.query(
          `SELECT r.actor_id AS id,count(*)::int AS searches,count(DISTINCT v.agent_id)::int AS agents,max(r.created_at) AS latest FROM newneo.source_runs r JOIN newneo.agent_versions v ON v.id=r.agent_version_id WHERE ${filter} GROUP BY r.actor_id ORDER BY searches DESC,r.actor_id`,
          args,
        )
      ).rows
    : [];
  return {
    scope: company ? 'workspace' : 'personal',
    period: 'Last 30 days · UTC',
    agents,
    trend,
    users,
    costAttributionAvailable: false,
  };
}
