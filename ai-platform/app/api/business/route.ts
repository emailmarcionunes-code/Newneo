import { getSession, sameOrigin } from '@/server/auth';
import { withVerifiedIdentity } from '@/server/database';
import { RegistryError } from '@/server/registry';
import { readBusinessWorkspace } from '@/server/business-workspace';
import { runSourceQuery } from '@/server/source-runs';
import { saveAgentRequest } from '@/server/agent-requests';
import { readJson, noStore } from '@/server/http';
async function handle(request: Request, write = false) {
  if (write && !sameOrigin(request))
    return Response.json(
      { error: 'Invalid origin' },
      { status: 403, headers: noStore },
    );
  const session = await getSession();
  if (!session?.workspaceId || !session.organizationId)
    return Response.json(
      { error: 'Sign in and select your workspace.' },
      { status: 401, headers: noStore },
    );
  try {
    const body = write ? await readJson(request) : null;
    if (write && body?.workspaceId !== session.workspaceId)
      throw new RegistryError(
        409,
        'Workspace changed. Reload before continuing.',
      );
    const scope = {
      organizationId: session.organizationId,
      workspaceId: session.workspaceId,
    };
    const result = await withVerifiedIdentity(session, async (db, actor) => {
      if (!write) return readBusinessWorkspace(db, scope, actor);
      if (body?.action === 'search')
        return runSourceQuery(db, scope, actor, body);
      if (body?.action === 'request')
        return saveAgentRequest(db, scope, actor, body.brief);
      throw new RegistryError(400, 'Unknown action.');
    });
    return Response.json(result, { headers: noStore });
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof RegistryError
            ? e.message
            : 'Your workspace is temporarily unavailable.',
      },
      { status: e instanceof RegistryError ? e.status : 503, headers: noStore },
    );
  }
}
export const GET = (r: Request) => handle(r);
export const POST = (r: Request) => handle(r, true);
