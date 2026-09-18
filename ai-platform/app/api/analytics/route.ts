import { getSession } from '@/server/auth';
import { withVerifiedIdentity } from '@/server/database';
import { RegistryError } from '@/server/registry';
import { readWorkspaceAnalytics } from '@/server/workspace-analytics';
import { noStore } from '@/server/http';
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.organizationId || !session.workspaceId)
    return Response.json(
      { error: 'Sign in and select your workspace.' },
      { status: 401, headers: noStore },
    );
  const scope = new URL(request.url).searchParams.get('scope') ?? 'personal';
  if (!['personal', 'workspace'].includes(scope))
    return Response.json(
      { error: 'Invalid analytics scope.' },
      { status: 400, headers: noStore },
    );
  try {
    const data = await withVerifiedIdentity(session, (db, actor) =>
      readWorkspaceAnalytics(
        db,
        {
          organizationId: session.organizationId!,
          workspaceId: session.workspaceId!,
        },
        actor,
        scope === 'workspace',
      ),
    );
    return Response.json(data, { headers: noStore });
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof RegistryError
            ? e.message
            : 'Analytics temporarily unavailable.',
      },
      { status: e instanceof RegistryError ? e.status : 503, headers: noStore },
    );
  }
}
