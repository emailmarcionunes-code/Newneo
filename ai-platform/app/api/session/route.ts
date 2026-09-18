import {productCapabilities} from '@/lib/product-access';
import { cookies } from 'next/headers';
import { authConfigured, getSession, demoCookie } from '@/server/auth';
import { withVerifiedIdentity } from '@/server/database';
import { noStore } from '@/server/http';
export async function GET() {
  if ((await cookies()).get(demoCookie)?.value === 'acme') return Response.json({authenticated:false, mode:'demo', displayName:'Ana Martinez', organizationName:'Acme Corp', workspaces:[]}, {headers:noStore});
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
            'SELECT w.id, w.organization_id, o.name AS organization_name, w.name, m.role, newneo.can_author(w.organization_id,w.id) AS can_edit_agents FROM newneo.workspaces w JOIN newneo.organizations o ON o.id=w.organization_id JOIN newneo.workspace_memberships m ON m.workspace_id=w.id AND m.organization_id=w.organization_id ORDER BY w.name',
          )
        ).rows,
    );
    const displayName = await withVerifiedIdentity(session, async (db, id) => (await db.query('SELECT display_name FROM newneo.identities WHERE id=$1', [id])).rows[0]?.display_name);
    return Response.json(
      {
        displayName: displayName || 'Workspace member',
        authenticated: true,
        workspaces: workspaces.map(w=>({...w,capabilities:productCapabilities(w.role)})),
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
