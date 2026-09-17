import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import {
  admitCustomer,
  reserveCost,
  settleCost,
  approveIncrease,
  costSummary,
} from '../server/cost-controls';

test('cost control persists caps, deduplicates requests, and isolates tenant access', async () => {
  const db = new PGlite();
  try {
    for (const name of [
      '001_platform.sql',
      '002_identity_and_drafts.sql',
      '003_cost_controls.sql',
    ])
      await db.exec(
        await readFile(
          new URL(`../db/migrations/${name}`, import.meta.url),
          'utf8',
        ),
      );
    const orgs = (
      await db.query<{ id: string }>(
        "INSERT INTO newneo.organizations(name) SELECT 'Customer '||n FROM generate_series(1,11) n RETURNING id",
      )
    ).rows;
    const tx = <T>(fn: (c: any) => Promise<T>) => db.transaction(fn);
    for (const org of orgs.slice(0, 10))
      assert.equal(await tx((c) => admitCustomer(c, org.id)), true);
    assert.equal(await tx((c) => admitCustomer(c, orgs[10].id)), false);
    assert.equal(await tx((c) => admitCustomer(c, orgs[0].id)), true);
    assert.equal(
      (
        await db.query(
          "SELECT * FROM newneo_cost.events WHERE kind='customer-limit-reached'",
        )
      ).rows.length,
      1,
    );
    const approval = {
      id: 'owner-approval-1',
      actor: 'platform-owner',
      reason: 'Reviewed pilot expansion',
      scope: 'customers' as const,
      newLimit: 11,
    };
    await tx((c) => approveIncrease(c, approval));
    await assert.rejects(
      tx((c) => approveIncrease(c, approval)),
      /already used/,
    );
    assert.equal(await tx((c) => admitCustomer(c, orgs[10].id)), true);
    const req = {
      id: 'run-1',
      organizationId: orgs[0].id,
      service: 'bedrock',
      maximumCents: 60000,
    };
    assert.equal(
      (await tx((c) => reserveCost(c, req))).reason,
      'missing-or-stale-accounting',
    );
    const period = new Date().toISOString().slice(0, 7);
    await db.query(
      "INSERT INTO newneo_cost.months(period,baseline_cents,valid_until) VALUES ($1,10000,now()+interval '1 hour')",
      [period],
    );
    assert.equal((await tx((c) => reserveCost(c, req))).allowed, true);
    assert.equal(
      (await tx((c) => reserveCost(c, req))).reason,
      'already-reserved',
    );
    await assert.rejects(
      tx((c) => reserveCost(c, { ...req, maximumCents: 1 })),
      /conflict/,
    );
    assert.equal(
      (await tx((c) => reserveCost(c, { ...req, id: 'run-2' }))).reason,
      'budget-exhausted',
    );
    await tx((c) => settleCost(c, req.id, 10000));
    await tx((c) => settleCost(c, req.id, 10000));
    await assert.rejects(
      tx((c) => settleCost(c, req.id, 1)),
      /conflict/,
    );
    assert.equal((await costSummary(db))?.usedCents, 20000);
    assert.equal(
      (
        await tx((c) =>
          reserveCost(c, { ...req, id: 'run-2', maximumCents: 80000 }),
        )
      ).allowed,
      true,
    );
    assert.equal(
      (
        await tx((c) =>
          reserveCost(c, { ...req, id: 'run-3', maximumCents: 1 }),
        )
      ).allowed,
      false,
    );
    await tx((c) =>
      approveIncrease(c, {
        ...approval,
        id: 'spend-approval',
        scope: 'monthly-spend',
        newLimit: 110000,
      }),
    );
    assert.equal(
      (
        await tx((c) =>
          reserveCost(c, { ...req, id: 'run-3', maximumCents: 1 }),
        )
      ).allowed,
      true,
    );
    await db.exec(
      "UPDATE newneo_cost.months SET valid_until=now()-interval '1 minute'",
    );
    assert.equal(
      (await tx((c) => reserveCost(c, { ...req, id: 'run-4' }))).reason,
      'missing-or-stale-accounting',
    );
    await db.exec('CREATE ROLE tenant_test; SET ROLE tenant_test');
    await assert.rejects(
      db.query('UPDATE newneo_cost.policy SET customer_limit=999'),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});

test('month rollover retains unresolved reservations and blocks new calls', async () => {
  const db = new PGlite();
  try {
    for (const name of ['001_platform.sql', '003_cost_controls.sql'])
      await db.exec(
        await readFile(
          new URL(`../db/migrations/${name}`, import.meta.url),
          'utf8',
        ),
      );
    const id = (
      await db.query<{ id: string }>(
        "INSERT INTO newneo.organizations(name) VALUES ('Pilot') RETURNING id",
      )
    ).rows[0].id;
    await db.transaction((c) => admitCustomer(c, id));
    const period = new Date().toISOString().slice(0, 7);
    await db.query(
      "INSERT INTO newneo_cost.months(period,baseline_cents,valid_until) VALUES ('2000-01',0,now()),($1,0,now()+interval '1 hour')",
      [period],
    );
    await db.query(
      "INSERT INTO newneo_cost.reservations VALUES ('old','2000-01',$1,'bedrock',200,NULL,now())",
      [id],
    );
    assert.equal(
      (
        await db.transaction((c) =>
          reserveCost(c, {
            id: 'new',
            organizationId: id,
            service: 'bedrock',
            maximumCents: 1,
          }),
        )
      ).reason,
      'unsettled-previous-period',
    );
    await db.transaction((c) => settleCost(c, 'old', 200));
    assert.equal(
      (
        await db.transaction((c) =>
          reserveCost(c, {
            id: 'new',
            organizationId: id,
            service: 'bedrock',
            maximumCents: 1,
          }),
        )
      ).allowed,
      true,
    );
  } finally {
    await db.close();
  }
});
