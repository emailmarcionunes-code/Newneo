import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Client } from 'pg';
async function main() {
  if (!process.env.MIGRATION_DATABASE_URL)
    throw new Error(
      'Set MIGRATION_DATABASE_URL to the migration-owner connection.',
    );
  const db = new Client({
    connectionString: process.env.MIGRATION_DATABASE_URL,
  });
  await db.connect();
  try {
    await db.query('BEGIN');
    await db.query('SELECT pg_advisory_xact_lock(19405, 1)');
    await db.query(
      'CREATE TABLE IF NOT EXISTS public.newneo_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())',
    );
    for (const name of ['001_platform.sql', '002_identity_and_drafts.sql']) {
      const sql = await readFile(
        new URL(`../db/migrations/${name}`, import.meta.url),
        'utf8',
      );
      const checksum = createHash('sha256').update(sql).digest('hex');
      const previous = await db.query(
        'SELECT checksum FROM public.newneo_migrations WHERE name = $1',
        [name],
      );
      if (previous.rows.length && previous.rows[0].checksum !== checksum)
        throw new Error(
          'Applied migration has changed. Create a new migration.',
        );
      if (!previous.rows.length) {
        await db.query(sql);
        await db.query(
          'INSERT INTO public.newneo_migrations (name,checksum) VALUES ($1,$2)',
          [name, checksum],
        );
      }
    }
    await db.query('COMMIT');
    console.log('Database migrations are up to date.');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    await db.end();
  }
}
main().catch(() => {
  console.error(
    'Migration failed. Check database availability, migration ownership and migration checksums.',
  );
  process.exitCode = 1;
});
