import { Pool, type PoolClient } from 'pg';
let pool: Pool | undefined;
function connectionPool() {
  if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL is not configured.');
  return (pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  }));
}
/** identityId must come from a verified server identity, never from request JSON. */
export async function withIdentityTransaction<T>(
  identityId: string,
  action: (client: PoolClient) => Promise<T>,
): Promise<T> {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identityId,
    )
  )
    throw new Error('Invalid identity.');
  const client = await connectionPool().connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query<{
      unsafe: boolean;
    }>(`SELECT rolsuper OR rolbypassrls OR EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'newneo' AND c.relowner = r.oid
    ) AS unsafe FROM pg_roles r WHERE rolname = current_user`);
    if (!rows.length || rows[0].unsafe)
      throw new Error(
        'The application requires a non-owner database role without superuser or BYPASSRLS.',
      );
    await client.query("SELECT set_config('newneo.identity_id', $1, true)", [
      identityId,
    ]);
    const result = await action(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function withVerifiedIdentity<T>(
  identity: { issuer: string; subject: string },
  action: (client: PoolClient, identityId: string) => Promise<T>,
): Promise<T> {
  const client = await connectionPool().connect();
  try {
    await client.query('BEGIN');
    const unsafe = await client.query(
      `SELECT EXISTS (SELECT 1 FROM pg_roles r WHERE pg_has_role(current_user,r.oid,'MEMBER') AND (r.rolsuper OR r.rolbypassrls OR EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='newneo' AND c.relowner=r.oid))) AS unsafe`,
    );
    if (unsafe.rows[0].unsafe) throw new Error('Unsafe database role');
    await client.query(
      "SELECT set_config('newneo.issuer',$1,true), set_config('newneo.subject',$2,true)",
      [identity.issuer, identity.subject],
    );
    const result = await client.query<{ id: string }>(
      'SELECT id FROM newneo.identities WHERE issuer=$1 AND subject=$2',
      [identity.issuer, identity.subject],
    );
    if (!result.rows.length) throw new Error('Identity not provisioned');
    const id = result.rows[0].id;
    await client.query("SELECT set_config('newneo.identity_id',$1,true)", [id]);
    const value = await action(client, id);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function closeDatabase() {
  await pool?.end();
  pool = undefined;
}
