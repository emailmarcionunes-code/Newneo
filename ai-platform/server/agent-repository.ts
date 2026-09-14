// Database-neutral query interface; PostgreSQL in service, PGlite only in tests.
export interface SqlClient {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
}
export type AgentRecord = {
  id: string;
  organization_id: string;
  workspace_id: string;
  name: string;
  description: string;
  revision: number;
};
export type WorkspaceScope = { organizationId: string; workspaceId: string };
function fields(name: string, description: string) {
  if (!name.trim() || name.length > 120 || description.length > 2000)
    throw new Error('Invalid agent name or description.');
}
export async function listAgents(db: SqlClient, scope: WorkspaceScope) {
  return (
    await db.query<AgentRecord>(
      'SELECT id, organization_id, workspace_id, name, description, revision FROM newneo.agents WHERE organization_id = $1 AND workspace_id = $2 ORDER BY created_at, id',
      [scope.organizationId, scope.workspaceId],
    )
  ).rows;
}
export async function createAgent(
  db: SqlClient,
  scope: WorkspaceScope,
  name: string,
  description: string,
) {
  fields(name, description);
  const result = await db.query<AgentRecord>(
    'INSERT INTO newneo.agents (organization_id, workspace_id, name, description) VALUES ($1, $2, $3, $4) RETURNING id, organization_id, workspace_id, name, description, revision',
    [scope.organizationId, scope.workspaceId, name.trim(), description],
  );
  return result.rows[0];
}
export async function updateAgent(
  db: SqlClient,
  scope: WorkspaceScope,
  id: string,
  revision: number,
  name: string,
  description: string,
) {
  fields(name, description);
  if (!Number.isInteger(revision) || revision < 1)
    throw new Error('Invalid agent revision.');
  const result = await db.query<AgentRecord>(
    'UPDATE newneo.agents SET name = $5, description = $6, revision = revision + 1, updated_at = now() WHERE organization_id = $1 AND workspace_id = $2 AND id = $3 AND revision = $4 RETURNING id, organization_id, workspace_id, name, description, revision',
    [
      scope.organizationId,
      scope.workspaceId,
      id,
      revision,
      name.trim(),
      description,
    ],
  );
  // Do not reveal whether an inaccessible agent exists in another tenant.
  if (!result.rows.length)
    throw new Error('Agent unavailable or revision conflict.');
  return result.rows[0];
}
