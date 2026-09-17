import { getSession, sameOrigin } from '@/server/auth';
import { withOperationsIdentity as withVerifiedIdentity } from '@/server/product-access';
import { readDrafts, storeDraft, validatedDraft } from '@/server/drafts';
import { readJson, noStore } from '@/server/http';
export async function GET() {
  const session = await getSession();
  if (!session?.organizationId || !session.workspaceId)
    return Response.json(
      { error: 'Sign in and select a workspace' },
      { status: 401, headers: noStore },
    );
  try {
    return Response.json(
      {
        drafts: await withVerifiedIdentity(session, (db) =>
          readDrafts(db, {
            organizationId: session.organizationId!,
            workspaceId: session.workspaceId!,
          }),
        ),
      },
      { headers: noStore },
    );
  } catch {
    return Response.json(
      { error: 'Saved drafts are unavailable' },
      { status: 503, headers: noStore },
    );
  }
}
async function save(request: Request, update: boolean) {
  if (!sameOrigin(request))
    return Response.json(
      { error: 'Invalid origin' },
      { status: 403, headers: noStore },
    );
  const session = await getSession();
  if (!session?.organizationId || !session.workspaceId)
    return Response.json(
      { error: 'Sign in and select a workspace' },
      { status: 401, headers: noStore },
    );
  let body;
  try {
    body = await readJson(request);
    validatedDraft(body?.configuration);
    if (body.workspaceId !== session.workspaceId)
      throw new Error('Workspace changed');
    if (
      update &&
      (typeof body.id !== 'string' ||
        !/^[0-9a-f-]{36}$/i.test(body.id) ||
        !Number.isInteger(body.revision) ||
        body.revision < 1)
    )
      throw new Error();
  } catch {
    return Response.json(
      { error: 'Invalid draft' },
      { status: 400, headers: noStore },
    );
  }
  try {
    const draft = await withVerifiedIdentity(session, (db) =>
      storeDraft(
        db,
        {
          organizationId: session.organizationId!,
          workspaceId: session.workspaceId!,
        },
        body.configuration,
        update ? body.id : undefined,
        update ? body.revision : undefined,
      ),
    );
    return Response.json(
      { draft },
      { status: update ? 200 : 201, headers: noStore },
    );
  } catch {
    return Response.json(
      {
        error:
          'Could not save. Check workspace access and reload the latest revision before retrying.',
      },
      { status: 409, headers: noStore },
    );
  }
}
export const POST = (request: Request) => save(request, false);
export const PUT = (request: Request) => save(request, true);
