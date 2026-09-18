import { Pool } from 'pg';
import { dispatchCostNotice } from '../server/cost-notifications';
import { createCostSender } from '../server/cost-sns';
async function main() {
  if (
    !process.env.COST_NOTIFIER_DATABASE_URL ||
    !process.env.AWS_REGION ||
    !process.env.COST_ALERT_TOPIC_ARN
  )
    throw new Error('Missing notifier configuration');
  const pool = new Pool({
    connectionString: process.env.COST_NOTIFIER_DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  });
  const send = createCostSender(
    process.env.AWS_REGION,
    process.env.COST_ALERT_TOPIC_ARN,
  );
  let stopping = false;
  process.on('SIGTERM', () => {
    stopping = true;
  });
  process.on('SIGINT', () => {
    stopping = true;
  });
  try {
    const {
      rows: [role],
    } = await pool.query('SELECT current_user AS name');
    if (role.name !== 'newneo_notifier')
      throw new Error('Use the restricted notifier database role');
    while (!stopping) {
      const result = await dispatchCostNotice(pool, send);
      console.log(
        JSON.stringify({
          component: 'cost-notifier',
          status: result,
          at: new Date().toISOString(),
        }),
      );
      if (process.argv.includes('--once')) break;
      if (result !== 'published')
        await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  } finally {
    await pool.end();
  }
}
main().catch(() => {
  console.error(
    'Cost notifier failed. Check configuration, database and IAM permissions.',
  );
  process.exitCode = 1;
});
