import { Client } from 'pg';
async function main() {
  const password = process.env.APP_DATABASE_PASSWORD;
  if (!process.env.MIGRATION_DATABASE_URL || !password || password.length < 24)
    throw new Error(
      'Administrative database URL and a strong application password are required',
    );
  const db = new Client({
    connectionString: process.env.MIGRATION_DATABASE_URL,
  });
  await db.connect();
  try {
    await db.query('BEGIN');
    await db.query('SELECT pg_advisory_xact_lock(19405,2)');
    const existing = await db.query(
      "SELECT rolsuper,rolbypassrls,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname='newneo_app'",
    );
    if (existing.rows.length) {
      const unsafe = await db.query(
        "SELECT EXISTS(SELECT 1 FROM pg_roles r WHERE pg_has_role('newneo_app',r.oid,'MEMBER') AND (r.rolsuper OR r.rolbypassrls OR r.rolcreaterole OR r.rolcreatedb OR EXISTS(SELECT 1 FROM pg_class c WHERE c.relowner=r.oid))) AS unsafe",
      );
      if (unsafe.rows[0].unsafe)
        throw new Error(
          'Existing application role has administrative privileges',
        );
    } else
      await db.query(
        'CREATE ROLE newneo_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS',
      );
    const statement = await db.query(
      "SELECT format('ALTER ROLE newneo_app PASSWORD %L', $1::text) AS sql",
      [password],
    );
    await db.query(statement.rows[0].sql);
    await db.query('GRANT USAGE ON SCHEMA newneo TO newneo_app');
    await db.query(
      'GRANT SELECT ON newneo.identities,newneo.workspaces,newneo.workspace_memberships TO newneo_app',
    );
    await db.query(
      'GRANT SELECT,INSERT,UPDATE ON newneo.agents,newneo.drafts TO newneo_app',
    );
    await db.query('COMMIT');
    console.log('Restricted application role provisioned.');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    await db.end();
  }
}
main().catch(() => {
  console.error(
    'Provisioning failed. Check administrative access, existing role privileges and required environment settings.',
  );
  process.exitCode = 1;
});
