/** Trusted operator CLI. Uses the migration-owner connection, never app credentials.
 * No runtime adapter should receive this credential. JSON input comes from stdin. */
import { Client } from 'pg';
import {
  admitCustomer,
  approveIncrease,
  costSummary,
} from '../server/cost-controls';
async function main() {
  const command = process.argv[2];
  if (!['status', 'admit', 'approve', 'accounting'].includes(command ?? ''))
    throw new Error('Use status, admit, approve or accounting');
  if (!process.env.MIGRATION_DATABASE_URL)
    throw new Error('Trusted control-plane connection required');
  const chunks: Buffer[] = [];
  if (command !== 'status')
    for await (const chunk of process.stdin) {
      chunks.push(Buffer.from(chunk));
      if (chunks.reduce((n, c) => n + c.length, 0) > 8192)
        throw new Error('Input too large');
    }
  const input = chunks.length
    ? JSON.parse(Buffer.concat(chunks).toString('utf8'))
    : {};
  const db = new Client({
    connectionString: process.env.MIGRATION_DATABASE_URL,
  });
  await db.connect();
  try {
    await db.query('BEGIN');
    let result: unknown;
    if (command === 'status')
      result = {
        budget: await costSummary(db),
        customers: (
          await db.query('SELECT count(*) AS active FROM newneo_cost.customers')
        ).rows[0],
        unpublishedEvents: (
          await db.query(
            'SELECT id,kind,recipient,payload,created_at FROM newneo_cost.events WHERE published_at IS NULL ORDER BY created_at',
          )
        ).rows,
      };
    if (command === 'admit')
      result = { admitted: await admitCustomer(db, input.organizationId) };
    if (command === 'approve') {
      if (!['customers', 'monthly-spend'].includes(input.scope))
        throw new Error('Invalid scope');
      // Actor is the authenticated database operator, not a JSON field.
      const actor = (await db.query('SELECT session_user AS actor')).rows[0]
        .actor;
      await approveIncrease(db, { ...input, actor });
      result = { approved: true };
    }
    if (command === 'accounting') {
      // Baseline must include fixed infrastructure allowance plus costs NOT in the
      // reservation ledger. Never insert the total AWS bill here (double counting).
      if (
        !Number.isSafeInteger(input.baselineCents) ||
        input.baselineCents < 0 ||
        typeof input.reason !== 'string' ||
        !input.reason.trim()
      )
        throw new Error('Non-negative baseline and explanation required');
      const period = new Date().toISOString().slice(0, 7);
      await db.query(
        'SELECT id FROM newneo_cost.policy WHERE id=true FOR UPDATE',
      );
      await db.query(
        "INSERT INTO newneo_cost.months(period,baseline_cents,valid_until) VALUES ($1,$2,now()+interval '1 hour') ON CONFLICT(period) DO UPDATE SET baseline_cents=EXCLUDED.baseline_cents,valid_until=EXCLUDED.valid_until",
        [period, input.baselineCents],
      );
      await db.query(
        "INSERT INTO newneo_cost.events(id,kind,payload) VALUES (gen_random_uuid()::text,'accounting-updated',$1::jsonb)",
        [
          JSON.stringify({
            period,
            baselineCents: input.baselineCents,
            reason: input.reason,
          }),
        ],
      );
      result = { accountingUpdated: true, validForMinutes: 60 };
    }
    await db.query('COMMIT');
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    await db.query('ROLLBACK');
    throw e;
  } finally {
    await db.end();
  }
}
main().catch(() => {
  console.error(
    'Cost-control operation failed; no changes committed. Check input, permissions and database availability.',
  );
  process.exitCode = 1;
});
