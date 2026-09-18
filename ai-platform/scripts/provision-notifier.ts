import { Client } from 'pg';
async function main() {
  const password = process.env.NOTIFIER_DATABASE_PASSWORD;
  if (!process.env.MIGRATION_DATABASE_URL || !password || password.length < 24)
    throw new Error('Admin connection and strong notifier password required');
  const db = new Client({
    connectionString: process.env.MIGRATION_DATABASE_URL,
  });
  await db.connect();
  try {
    await db.query('BEGIN');
    await db.query('SELECT pg_advisory_xact_lock(19405,3)');
    const existing = await db.query(
      "SELECT 1 FROM pg_roles WHERE rolname='newneo_notifier'",
    );
    if (existing.rows.length) {
      const {
        rows: [r],
      } = await db.query(
        "SELECT EXISTS(SELECT 1 FROM pg_roles r WHERE pg_has_role('newneo_notifier',r.oid,'MEMBER') AND (r.rolsuper OR r.rolbypassrls OR r.rolcreaterole OR r.rolcreatedb OR EXISTS(SELECT 1 FROM pg_class c WHERE c.relowner=r.oid))) AS unsafe",
      );
      if (r.unsafe) throw new Error('Unsafe existing notifier role');
    } else
      await db.query(
        'CREATE ROLE newneo_notifier LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS',
      );
    const {
      rows: [statement],
    } = await db.query(
      "SELECT format('ALTER ROLE newneo_notifier PASSWORD %L',$1::text) AS sql",
      [password],
    );
    await db.query(statement.sql);
    await db.query('GRANT USAGE ON SCHEMA newneo_cost TO newneo_notifier');
    await db.query('GRANT SELECT ON newneo_cost.events TO newneo_notifier');
    await db.query(
      'GRANT UPDATE (published_at,provider_message_id,lease_token,lease_until,last_error,next_attempt_at,attempts) ON newneo_cost.events TO newneo_notifier',
    );
    await db.query('COMMIT');
    console.log('Restricted cost-notifier role provisioned.');
  } catch (e) {
    await db.query('ROLLBACK');
    throw e;
  } finally {
    await db.end();
  }
}
main().catch(() => {
  console.error(
    'Notifier provisioning failed. Check administrative access and role permissions.',
  );
  process.exitCode = 1;
});
