/** Internal control-plane primitives. Caller MUST hold one transaction on a
 * dedicated trusted DB connection. No browser inputs or tenant DB grants.
 * Monetary values are integer USD cents; no model adapter is enabled here. */
type DB = {
  query<T = Record<string, unknown>>(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
};
const cents = (n: number) => {
  if (!Number.isSafeInteger(n) || n < 0) throw new Error('Invalid amount');
  return n;
};
const month = () => new Date().toISOString().slice(0, 7);
async function lock(db: DB) {
  await db.query('SELECT id FROM newneo_cost.policy WHERE id=true FOR UPDATE');
}
async function event(db: DB, id: string, kind: string, payload: unknown) {
  await db.query(
    'INSERT INTO newneo_cost.events(id,kind,payload) VALUES ($1,$2,$3::jsonb) ON CONFLICT(id) DO NOTHING',
    [id, kind, JSON.stringify(payload)],
  );
}
export async function admitCustomer(db: DB, organizationId: string) {
  await lock(db);
  if (
    (
      await db.query(
        'SELECT 1 FROM newneo_cost.customers WHERE organization_id=$1',
        [organizationId],
      )
    ).rows.length
  )
    return true;
  const {
    rows: [state],
  } = await db.query<{ count: string; customer_limit: number }>(
    'SELECT (SELECT count(*) FROM newneo_cost.customers) AS count, customer_limit FROM newneo_cost.policy',
  );
  const count = Number(state.count);
  if (count >= state.customer_limit) {
    await event(
      db,
      `customers-blocked:${state.customer_limit}`,
      'customer-approval-required',
      { count, limit: state.customer_limit },
    );
    return false;
  }
  await db.query(
    'INSERT INTO newneo_cost.customers(organization_id) VALUES ($1)',
    [organizationId],
  );
  if (count + 1 === state.customer_limit)
    await event(
      db,
      `customers-reached:${state.customer_limit}`,
      'customer-limit-reached',
      {
        count: count + 1,
        limit: state.customer_limit,
        reason: 'The next customer requires an owner-approved increase.',
      },
    );
  return true;
}
export async function costSummary(db: DB, period = month()) {
  const {
    rows: [state],
  } = await db.query<{
    limit_cents: string;
    baseline_cents: string;
    fresh: boolean;
    usage: string;
  }>(
    `SELECT m.limit_cents,m.baseline_cents,m.valid_until>now() AS fresh,
    COALESCE((SELECT sum(COALESCE(actual_cents,reserved_cents)) FROM newneo_cost.reservations r WHERE r.period=m.period),0) AS usage
    FROM newneo_cost.months m WHERE period=$1`,
    [period],
  );
  if (!state) return null;
  const drivers = (
    await db.query(
      `SELECT organization_id,service,sum(COALESCE(actual_cents,reserved_cents)) AS cents FROM newneo_cost.reservations WHERE period=$1 GROUP BY organization_id,service ORDER BY cents DESC LIMIT 10`,
      [period],
    )
  ).rows;
  return {
    period,
    limitCents: Number(state.limit_cents),
    usedCents: Number(state.baseline_cents) + Number(state.usage),
    fresh: state.fresh,
    drivers,
  };
}
export async function reserveCost(
  db: DB,
  request: {
    id: string;
    organizationId: string;
    service: string;
    maximumCents: number;
  },
) {
  cents(request.maximumCents);
  if (request.maximumCents === 0)
    throw new Error('A positive bounded maximum is required');
  await lock(db);
  const prior = (
    await db.query<{
      organization_id: string;
      service: string;
      reserved_cents: string;
      actual_cents: string | null;
      period: string;
    }>('SELECT * FROM newneo_cost.reservations WHERE id=$1', [request.id])
  ).rows[0];
  if (prior) {
    if (
      prior.organization_id !== request.organizationId ||
      prior.service !== request.service ||
      Number(prior.reserved_cents) !== request.maximumCents
    )
      throw new Error('Idempotency conflict');
    // A retry must never authorize the provider call a second time.
    return { allowed: false, reason: 'already-reserved' };
  }
  if (
    !(
      await db.query(
        'SELECT 1 FROM newneo_cost.customers WHERE organization_id=$1',
        [request.organizationId],
      )
    ).rows.length
  )
    return { allowed: false, reason: 'customer-not-admitted' };
  const summary = await costSummary(db);
  if (!summary?.fresh)
    return { allowed: false, reason: 'missing-or-stale-accounting' };
  // Unsettled prior-month operations cannot be discarded at rollover.
  if (
    (
      await db.query(
        'SELECT 1 FROM newneo_cost.reservations WHERE period<>$1 AND actual_cents IS NULL LIMIT 1',
        [summary.period],
      )
    ).rows.length
  )
    return { allowed: false, reason: 'unsettled-previous-period' };
  if (summary.usedCents + request.maximumCents > summary.limitCents) {
    await event(
      db,
      `budget-blocked:${summary.period}:${summary.limitCents}`,
      'spend-approval-required',
      {
        ...summary,
        requestedCents: request.maximumCents,
        reason: 'This operation would exceed the approved monthly allowance.',
      },
    );
    return { allowed: false, reason: 'budget-exhausted' };
  }
  await db.query(
    'INSERT INTO newneo_cost.reservations(id,period,organization_id,service,reserved_cents) VALUES ($1,$2,$3,$4,$5)',
    [
      request.id,
      summary.period,
      request.organizationId,
      request.service,
      request.maximumCents,
    ],
  );
  const updated = (await costSummary(db))!;
  for (const threshold of [50, 80, 100])
    if (updated.usedCents >= (updated.limitCents * threshold) / 100)
      await event(
        db,
        `spend:${summary.period}:${summary.limitCents}:${threshold}`,
        'spend-threshold',
        { ...updated, threshold },
      );
  return { allowed: true, reason: 'reserved' };
}
export async function settleCost(db: DB, id: string, actualCents: number) {
  cents(actualCents);
  await lock(db);
  const row = (
    await db.query<{ actual_cents: string | null }>(
      'SELECT actual_cents FROM newneo_cost.reservations WHERE id=$1',
      [id],
    )
  ).rows[0];
  if (!row) throw new Error('Unknown reservation');
  if (row.actual_cents !== null) {
    if (Number(row.actual_cents) !== actualCents)
      throw new Error('Settlement conflict');
    return;
  }
  await db.query(
    'UPDATE newneo_cost.reservations SET actual_cents=$2 WHERE id=$1',
    [id, actualCents],
  );
  // Never hide an unexpected provider overrun; subsequent requests are denied.
}
/** Trusted platform-owner administration only. Changes are finite and audited;
 * monthly increases apply solely to the current month, never future months. */
export async function approveIncrease(
  db: DB,
  approval: {
    id: string;
    actor: string;
    reason: string;
    scope: 'customers' | 'monthly-spend';
    newLimit: number;
  },
) {
  cents(approval.newLimit);
  if (!approval.actor.trim() || !approval.reason.trim() || !approval.id.trim())
    throw new Error('Approval identity and reason required');
  await lock(db);
  if (
    (
      await db.query('SELECT 1 FROM newneo_cost.approvals WHERE id=$1', [
        approval.id,
      ])
    ).rows.length
  )
    throw new Error('Approval already used');
  const period = approval.scope === 'monthly-spend' ? month() : null;
  const sql =
    approval.scope === 'customers'
      ? 'SELECT customer_limit AS value FROM newneo_cost.policy'
      : 'SELECT limit_cents AS value FROM newneo_cost.months WHERE period=$1';
  const row = (await db.query<{ value: string }>(sql, period ? [period] : []))
    .rows[0];
  if (!row || approval.newLimit <= Number(row.value))
    throw new Error('Approval must increase an existing limit');
  await db.query(
    'INSERT INTO newneo_cost.approvals(id,scope,period,previous_limit,new_limit,actor,reason) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [
      approval.id,
      approval.scope,
      period,
      Number(row.value),
      approval.newLimit,
      approval.actor,
      approval.reason,
    ],
  );
  if (period)
    await db.query(
      'UPDATE newneo_cost.months SET limit_cents=$2 WHERE period=$1',
      [period, approval.newLimit],
    );
  else
    await db.query('UPDATE newneo_cost.policy SET customer_limit=$1', [
      approval.newLimit,
    ]);
}
