import { authConfigured, getSession } from '@/server/auth';
import { withVerifiedIdentity } from '@/server/database';
import { noStore } from '@/server/http';
export async function GET() {
  const session = await getSession();
  if (!session)
    return Response.json(
      { authenticated: false, configured: authConfigured() },
      { headers: noStore },
    );
  try {
    const workspaces = await withVerifiedIdentity(
      session,
      async (db) =>
        (
          await db.query(
            'SELECT w.id, w.organization_id, w.name, m.can_edit_agents FROM newneo.workspaces w JOIN newneo.workspace_memberships m ON m.workspace_id=w.id AND m.organization_id=w.organization_id ORDER BY w.name',
          )
        ).rows,
    );
    return Response.json(
      {
        authenticated: true,
        workspaces,
        workspaceId: session.workspaceId ?? null,
      },
      { headers: noStore },
    );
  } catch {
    return Response.json(
      {
        error:
          'Your workspace access is not available. Ask the administrator to verify provisioning and database availability.',
      },
      { status: 503, headers: noStore },
    );
  }
}
