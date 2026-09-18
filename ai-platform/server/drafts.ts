import type { SqlClient, WorkspaceScope } from './agent-repository';
import { parseDraft, type LaunchDraft } from '@/lib/launch';
import { getTemplate } from '@/lib/catalog';
export type StoredDraft = {
  id: string;
  template_id: string;
  configuration: LaunchDraft;
  revision: number;
  updated_at: string;
};
export function validatedDraft(value: unknown): LaunchDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid draft');
  const input = value as LaunchDraft;
  if (
    typeof input.templateId !== 'string' ||
    getTemplate(input.templateId).id !== input.templateId
  )
    throw new Error('Invalid template');
  const parsed = parseDraft(JSON.stringify(input), input.templateId);
  if (
    !parsed ||
    !parsed.name.trim() ||
    parsed.name.length > 120 ||
    parsed.description.length > 2000 ||
    parsed.targetUsers.length > 500 ||
    parsed.industry.length > 100
  )
    throw new Error('Invalid draft');
  // Stored preview configuration never grants runtime permissions or deployment approval.
  return { ...parsed, step: Math.min(parsed.step, 5), environment: null };
}
export async function readDrafts(db: SqlClient, scope: WorkspaceScope) {
  return (
    await db.query<StoredDraft>(
      'SELECT id, template_id, configuration, revision, updated_at FROM newneo.drafts WHERE organization_id=$1 AND workspace_id=$2 ORDER BY updated_at DESC',
      [scope.organizationId, scope.workspaceId],
    )
  ).rows;
}
export async function storeDraft(
  db: SqlClient,
  scope: WorkspaceScope,
  value: unknown,
  id?: string,
  revision?: number,
) {
  const draft = validatedDraft(value);
  if (id && (!Number.isInteger(revision) || revision! < 1))
    throw new Error('Invalid revision');
  const result = id
    ? await db.query<StoredDraft>(
        'UPDATE newneo.drafts SET configuration=$4, revision=revision+1, updated_at=now() WHERE organization_id=$1 AND workspace_id=$2 AND id=$3 AND revision=$5 AND template_id=$6 RETURNING id,template_id,configuration,revision,updated_at',
        [
          scope.organizationId,
          scope.workspaceId,
          id,
          JSON.stringify(draft),
          revision,
          draft.templateId,
        ],
      )
    : await db.query<StoredDraft>(
        'INSERT INTO newneo.drafts(organization_id,workspace_id,template_id,configuration) VALUES($1,$2,$3,$4) RETURNING id,template_id,configuration,revision,updated_at',
        [
          scope.organizationId,
          scope.workspaceId,
          draft.templateId,
          JSON.stringify(draft),
        ],
      );
  if (!result.rows.length)
    throw new Error('Draft unavailable or revision conflict');
  return result.rows[0];
}
