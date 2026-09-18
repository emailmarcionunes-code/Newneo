import type { SqlClient, WorkspaceScope } from './agent-repository';
import {
  readRegistry,
  registryAccess,
  RegistryError,
  saveRegistry,
} from './registry';
import { agentTemplates } from '../lib/catalog';
import { agentAddition, type AdditionLibrary } from '../lib/agent-addition';
import { hasCapability, productCapabilities } from '../lib/product-access';
const strings = (value: unknown): string[] => {
  try {
    const a = JSON.parse(String(value ?? '[]'));
    return Array.isArray(a) ? a.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
};
export function businessAgent(
  a: Record<string, unknown>,
  version: Record<string, unknown> | undefined,
  sources: { id: string; title: string }[],
) {
  const c = (version?.configuration ?? {}) as Record<string, unknown>;
  return {
    id: a.id,
    name: a.name,
    purpose: c.mission || a.description,
    targetUsers: c.targetUsers || '',
    capabilities: strings(c.skillPlan),
    sources,
    versionId: version?.id ?? null,
    templateId: c.blueprintTemplateId ?? null,
    status: 'Not activated',
    canSearch: sources.length > 0,
  };
}
export async function readBusinessWorkspace(
  db: SqlClient,
  s: WorkspaceScope,
  actor: string,
) {
  const registry = await readRegistry(db, s);
  const access = registry.access as { role: string };
  const versions = registry.agentVersions as Record<string, unknown>[];
  const docs = registry.documents as {
    id: string;
    title: string;
    archived_at?: string;
  }[];
  const bindings = registry.knowledgeBindings as {
    agent_version_id: string;
    document_id: string;
  }[];
  const agents = (registry.agents as Record<string, unknown>[])
    .filter((a) => !a.archived_at)
    .map((a) => {
      const v = versions
        .filter((v) => v.agent_id === a.id)
        .sort((a, b) => Number(b.number) - Number(a.number))[0];
      const projected = businessAgent(
        a,
        v,
        docs
          .filter(
            (d) =>
              !d.archived_at &&
              bindings.some(
                (b) => b.agent_version_id === v?.id && b.document_id === d.id,
              ),
          )
          .map((d) => ({ id: d.id, title: d.title })),
      );
      const linked = (
        registry.bindings as {
          agent_version_id: string;
          skill_version_id: string;
        }[]
      )
        .filter((b) => b.agent_version_id === v?.id)
        .map(
          (b) =>
            (registry.skillVersions as { id: string; skill_id: string }[]).find(
              (sv) => sv.id === b.skill_version_id,
            )?.skill_id,
        );
      const names = (registry.skills as { id: string; name: string }[])
        .filter((s) => linked.includes(s.id))
        .map((s) => s.name);
      return {
        ...projected,
        capabilities: [...new Set([...projected.capabilities, ...names])],
      };
    });
  // Business work history is personal; Operations retains workspace-wide oversight.
  const work = (
    await db.query(
      `SELECT r.id,r.query,r.result,r.created_at,a.id AS agent_id,a.name AS agent_name FROM newneo.source_runs r JOIN newneo.agent_versions v ON v.id=r.agent_version_id JOIN newneo.agents a ON a.id=v.agent_id WHERE r.organization_id=$1 AND r.workspace_id=$2 AND r.actor_id=$3 ORDER BY r.created_at DESC LIMIT 50`,
      [s.organizationId, s.workspaceId, actor],
    )
  ).rows;
  const requests = (
    await db.query(
      'SELECT id,status,brief,created_at FROM newneo.agent_requests WHERE organization_id=$1 AND workspace_id=$2 AND created_by=$3 ORDER BY created_at DESC LIMIT 25',
      [s.organizationId, s.workspaceId, actor],
    )
  ).rows;
  return {
    agents,
    work,
    requests,
    capabilities: productCapabilities(access.role),
    role: access.role,
  };
}
export async function addBusinessAgent(
  db: SqlClient,
  s: WorkspaceScope,
  actor: string,
  value: Record<string, unknown>,
) {
  const access = await registryAccess(db, s);
  if (!hasCapability(String(access.role), 'agents:configure'))
    throw new RegistryError(403, 'Ask your administrator to add this Agent.');
  const template = agentTemplates.find((t) => t.id === value.templateId);
  if (!template) throw new RegistryError(400, 'Choose an Agent from Discover.');
  if (
    value.accepted !== true ||
    typeof value.name !== 'string' ||
    !value.name.trim() ||
    value.name.length > 120
  )
    throw new RegistryError(400, 'Enter a name and accept the Agent profile.');
  const data = await readRegistry(db, s);
  return saveRegistry(
    db,
    s,
    actor,
    agentAddition(
      template,
      template.id,
      value.name,
      template.description,
      data as unknown as AdditionLibrary,
    ),
  );
}
