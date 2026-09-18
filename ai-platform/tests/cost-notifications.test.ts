import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import {
  dispatchCostNotice,
  renderCostNotice,
} from '../server/cost-notifications';

test('notifier retries failures, expires leases, records acceptance and cannot raise limits', async () => {
  const db = new PGlite();
  try {
    for (const name of [
      '001_platform.sql',
      '003_cost_controls.sql',
      '004_cost_notifications.sql',
    ])
      await db.exec(
        await readFile(
          new URL(`../db/migrations/${name}`, import.meta.url),
          'utf8',
        ),
      );
    await db.query(
      "INSERT INTO newneo_cost.events(id,kind,payload) VALUES ('alert','spend-approval-required',$1::jsonb)",
      [
        JSON.stringify({
          period: '2026-09',
          usedCents: 95000,
          limitCents: 100000,
          requestedCents: 6000,
        }),
      ],
    );
    assert.equal(
      await dispatchCostNotice(db, async () => {
        throw new Error('provider secret must not be logged');
      }),
      'retry',
    );
    const failed = (
      await db.query<{
        attempts: number;
        last_error: string;
        published_at: null;
      }>('SELECT * FROM newneo_cost.events')
    ).rows[0];
    assert.equal(failed.attempts, 1);
    assert.equal(failed.published_at, null);
    assert.ok(!failed.last_error.includes('secret'));
    assert.equal(
      await dispatchCostNotice(db, async () => {
        throw new Error('must not run before retry');
      }),
      'idle',
    );
    await db.exec(
      "UPDATE newneo_cost.events SET next_attempt_at=now(),lease_until=now()+interval '1 minute'",
    );
    assert.equal(
      await dispatchCostNotice(db, async () => {
        throw new Error('must not steal active lease');
      }),
      'idle',
    );
    await db.exec(
      "UPDATE newneo_cost.events SET lease_until=now()-interval '1 minute'",
    );
    let calls = 0;
    assert.equal(
      await dispatchCostNotice(db, async (e) => {
        calls++;
        assert.equal(e.recipient, 'adm@gawservices.com');
        return 'receipt-1';
      }),
      'published',
    );
    assert.equal(
      await dispatchCostNotice(db, async () => {
        calls++;
        return 'bad';
      }),
      'idle',
    );
    assert.equal(calls, 1);
    const saved = (
      await db.query<{
        provider_message_id: string;
        published_at: unknown;
        lease_token: null;
      }>('SELECT * FROM newneo_cost.events')
    ).rows[0];
    assert.equal(saved.provider_message_id, 'receipt-1');
    assert.ok(saved.published_at);
    assert.equal(saved.lease_token, null);
    await db.exec(
      "INSERT INTO newneo_cost.events(id,kind,payload) VALUES ('audit-only','accounting-updated','{}')",
    );
    assert.equal(
      await dispatchCostNotice(db, async () => {
        throw new Error('audit event must not send');
      }),
      'idle',
    );
    await db.exec(
      'CREATE ROLE notifier_test; GRANT USAGE ON SCHEMA newneo_cost TO notifier_test; GRANT SELECT ON newneo_cost.events TO notifier_test; GRANT UPDATE (published_at,provider_message_id,lease_token,lease_until,last_error,next_attempt_at,attempts) ON newneo_cost.events TO notifier_test; SET ROLE notifier_test',
    );
    assert.equal(await dispatchCostNotice(db, async () => 'unused'), 'idle');
    await assert.rejects(
      db.query('UPDATE newneo_cost.policy SET customer_limit=999'),
      /permission denied/,
    );
    await assert.rejects(
      db.query("UPDATE newneo_cost.events SET recipient='other@example.com'"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});

test('notice explains requested spending without pretending to provide live billing or email approval', () => {
  const notice = renderCostNotice({
    id: 'test',
    kind: 'spend-approval-required',
    recipient: 'adm@gawservices.com',
    created_at: '2026-09-16T00:00:00Z',
    attempts: 1,
    payload: {
      period: '2026-09',
      usedCents: 99000,
      limitCents: 100000,
      requestedCents: 3000,
      drivers: [{ organization_id: 'org', service: 'bedrock', cents: '90000' }],
    },
  });
  assert.match(notice.message, /bedrock/);
  assert.match(notice.message, /não foi autorizada/);
  assert.match(notice.message, /Responder a este e-mail não aumenta/);
  assert.match(notice.message, /não é uma fatura/);
  const customers = renderCostNotice({
    id: '10',
    kind: 'customer-limit-reached',
    recipient: 'adm@gawservices.com',
    created_at: new Date(),
    attempts: 1,
    payload: { count: 10, limit: 10 },
  });
  assert.match(customers.message, /Empresas ativas: 10/);
});
