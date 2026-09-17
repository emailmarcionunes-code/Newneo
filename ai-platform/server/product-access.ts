import { withVerifiedIdentity } from './database';
import { getSession, type Session } from './auth';
import { registryAccess, RegistryError } from './registry';
import { hasCapability } from '../lib/product-access';
import type { PoolClient } from 'pg';
export async function withOperationsIdentity<T>(
  session: Session,
  action: (db: PoolClient, actor: string) => Promise<T>,
): Promise<T> {
  return withVerifiedIdentity(session, async (db, actor) => {
    if (!session.organizationId || !session.workspaceId)
      throw new RegistryError(403, 'Select a workspace.');
    const access = await registryAccess(db, {
      organizationId: session.organizationId,
      workspaceId: session.workspaceId,
    });
    if (!hasCapability(String(access.role), 'operations:view'))
      throw new RegistryError(403, 'Operations access is required.');
    return action(db, actor);
  });
}
export async function canOpenOperations() {
  const s = await getSession();
  if (!s) return false;
  try {
    return await withOperationsIdentity(s, async () => true);
  } catch {
    return false;
  }
}
