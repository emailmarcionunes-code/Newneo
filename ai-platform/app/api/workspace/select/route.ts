import { getSession, sameOrigin, writeSession } from '@/server/auth';
import { withVerifiedIdentity } from '@/server/database';
import { readJson, noStore } from '@/server/http';
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { error: 'Invalid origin' },
      { status: 403, headers: noStore },
    );
  const session = await getSession();
  if (!session)
    return Response.json(
      { error: 'Sign in required' },
      { status: 401, headers: noStore },
    );
  let body;
  try {
    body = await readJson(request);
    if (
      typeof body?.workspaceId !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(body.workspaceId)
    )
      throw new Error();
  } catch {
    return Response.json(
      { error: 'Invalid workspace' },
      { status: 400, headers: noStore },
    );
  }
  try {
    const workspace = await withVerifiedIdentity(
      session,
      async (db) =>
        (
          await db.query(
            'SELECT id,organization_id FROM newneo.workspaces WHERE id=$1',
            [body.workspaceId],
          )
        ).rows[0],
    );
    if (!workspace)
      return Response.json(
        { error: 'Workspace unavailable' },
        { status: 403, headers: noStore },
      );
    await writeSession({
      ...session,
      organizationId: workspace.organization_id,
      workspaceId: workspace.id,
    });
    return Response.json({ selected: true }, { headers: noStore });
  } catch {
    return Response.json(
      { error: 'Workspace unavailable' },
      { status: 503, headers: noStore },
    );
  }
}
