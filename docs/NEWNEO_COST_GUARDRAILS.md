# Pilot cost approval gate

Status: AWS budget `NEWNEO-monthly-account-guardrail` created successfully in the authenticated MNS account through the AWS console on 2026-09-16. Monthly recurring USD 1,000; actual alerts above 50%, 80%, 100% and forecast above 100%, all to adm@gawservices.com. Console confirmed success and healthy status. SNS test email delivery was confirmed by the user on 2026-09-16; AWS Budgets threshold-triggered delivery has not been exercised. CloudFormation template is a reproducible reference, not the deployed stack; do not deploy it over the existing budget without importing or reconciling it. Local database primitives for cost reservations, customer admission, finite operator approvals and explanatory event storage are implemented and tested. They are NOT deployed or connected to a paid runtime. SNS dispatch is implemented locally; hosting and verified delivery, automated billing reconciliation, authenticated owner UI and customer-onboarding wiring remain pending. Live execution remains disabled. Do not enable live execution until the gates below pass.

## Initial policy

Alert recipient confirmed: `adm@gawservices.com`. Monthly period is the stated initial assumption. USD 1,000 per calendar month, total AWS account costs; warning at USD 500 and USD 800 and forecast above USD 1,000. Count distinct active paying customer organizations, not agents, skills, users or demo workspaces. Notify at 10; require owner approval before admitting the 11th. Existing customers remain accessible.

`ai-platform/infra/cost-alerts.json` is a CloudFormation budget with email notifications only. It includes the whole account, tax and support; credits/refunds do not mask usage. Cloudflare, domain registration and other external charges are outside this AWS budget. Inspect existing budgets and confirm the account before deployment to avoid duplicate alerts. Deployment requires AlertEmail. Validate the template with AWS and verify notifications after deployment; local JSON parsing is not AWS validation.

## Required runtime enforcement before enabling paid execution

- Use a durable global monthly ledger with atomic reservations BEFORE every billable operation, including retries, queued work, tool calls, retrieval and background jobs. Include conservative remaining fixed-infrastructure allowance and unreported usage without double-counting reconciled charges.
- A reservation must cover the operation's maximum bounded cost; limit tokens, tool loops and concurrency. If cost cannot be bounded, pricing is stale, the ledger is unavailable or the allowance is exhausted, refuse new paid work.
- Reconcile actual usage against reservations and delayed AWS billing using idempotent identifiers. Never erase in-flight obligations at month rollover.
- Admission of customers must similarly use a transaction to prevent concurrent activations bypassing the approved limit. Emit the 10-customer notification through a durable outbox.
- On exhaustion pause new paid execution; keep login, billing, customer data and owner approval available. Do not destroy resources or stop the database.
- Only the platform owner may approve a specific new ceiling and expiry. Require server-side authorization, audit reason and idempotency; tenant administrators and browser/localStorage settings cannot authorize global spending. No response means no increase.
- Explanatory notices need current total, accounting timestamp/delay, forecast, cost by service/model/customer, main drivers versus prior period, customer count and proposed explicit increase. Mark estimates as estimates. AWS budget emails alone do not provide this workflow.
- Deliver through a durable worker with retries, deduplication and delivery-failure monitoring, independent of this conversation or an open browser.

## Acceptance checks

1. At 10 active organizations send one notice; concurrent attempts at an 11th are blocked until approved.
2. Concurrent reservations cannot exceed the approved allowance; retries are idempotent.
3. At the allowance, queued and scheduled paid work also stops; existing data stays accessible.
4. Non-owner, expired and replayed approvals are rejected; approved finite increase is audited.
5. Missing telemetry/pricing, month rollover and late billing cannot silently reopen spending.
6. Verify an actual notification delivery and test the pause/approve/resume path before launch.

AWS billing alerts are delayed and are not an absolute account spending cap. Standing infrastructure, already-started work and unrelated AWS resources can continue accruing charges. Reserve headroom rather than promising a USD 1,000 exact bill ceiling.

References:
- https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html
- https://docs.aws.amazon.com/cost-management/latest/userguide/manage-ad.html

## Local implementation (2026-09-16)

Migration `003_cost_controls.sql` creates a separate private control-plane schema; the tenant application role receives no grants. `server/cost-controls.ts` serializes decisions with a shared policy row lock. Call every mutating operation inside one committed transaction on a trusted connection; a denied decision must still commit its notification event. Do not call a provider until a successful reservation transaction commits. A duplicate reservation returns `already-reserved` and never grants a second provider execution. Recover ambiguous provider outcomes by reconciliation, never by replaying a charged call.

The ledger retains per-customer/service drivers, USD-cent reservations and settlements. Missing or expired accounting closes the gate. Unsettled previous-month operations block new-month work until reconciled. Actual costs above a reservation are preserved, not capped or hidden. This cannot retroactively stop an already-started operation.

Trusted operator commands (not exposed to tenant web sessions):

```
node --import tsx scripts/cost-control.ts status
node --import tsx scripts/cost-control.ts admit < admission.json
node --import tsx scripts/cost-control.ts approve < approval.json
node --import tsx scripts/cost-control.ts accounting < accounting.json
```

All require `MIGRATION_DATABASE_URL` on a trusted operator host. Never put that connection in the web runtime. Admission input: `organizationId`. Approval input: unique `id`, `scope` (`customers` or `monthly-spend`), integer `newLimit` (customers or USD cents), and `reason`. Actor is derived from the authenticated DB session, not the input. Monthly approvals apply only to the current period. Customer increases remain a finite approved ceiling. The owner-facing approval UI and dedicated control-plane role still need implementation before customer self-service is enabled.

Accounting input: `baselineCents` and `reason`. This is a trusted, manually reviewed accounting checkpoint valid for one hour, not an automatic AWS import. Baseline must include expected fixed costs and usage outside the ledger, excluding charges already represented by reservations/settlements. Do not use a fabricated zero baseline to enable paid work. Automated reconciliation must resolve this allocation and lateness before release.

Events are a durable outbox; local rows alone do not send email. Rows include recipient, timestamp, current limit, cost drivers and requested reservation. The sender and retry worker are now implemented (see below); hosted monitoring and verified delivery are outstanding. No background monitoring is implied by these local files.

Validation: 37 tests passed, one external PostgreSQL integration test skipped because its database was not configured; TypeScript passed. New embedded-Postgres cases cover admission cap, duplicate admission, approval replay, monetary boundary, idempotency conflicts, settlement, stale/missing accounting, previous-month obligations and denied tenant access. Real multi-connection PostgreSQL concurrency and end-to-end delivery remain release gates.

## SNS dispatcher and AWS channel

Created via the authorized AWS console on 2026-09-16:
- Region: us-east-1
- Topic: `arn:aws:sns:us-east-1:250910721619:newneo-cost-approvals`
- Email: `adm@gawservices.com`
- Subscription: `99b96876-bad2-47ea-a89e-97c3d580c542`
- Last verified status: Confirmed (2026-09-16). The console showed exactly one email subscriber: adm@gawservices.com. A clearly labeled test was published successfully through the AWS console; SNS MessageId: 731c4d69-9083-589c-95e4-2e4c96d190f9. The user confirmed receipt in the inbox on 2026-09-16. This tests the SNS channel, not the undeployed backend worker.

`004_cost_notifications.sql` renames delivered_at to published_at: SNS acceptance does NOT prove inbox delivery. The dispatcher atomically leases one due event, retries publication failures with bounded exponential backoff (up to one hour), recovers expired leases, and stores the SNS MessageId. Delivery is at-least-once; a crash between publish and persistence can produce a duplicate with the same event ID. Accounting audit events are not emailed. Failed events are retained indefinitely.

`server/cost-sns.ts` verifies that the dedicated topic has only the intended email subscriber and that it is confirmed before sending. Restrict IAM to the topic using `infra/cost-notifier-iam.json`. This policy file is not yet attached to any AWS identity. Never give the worker administrator/root AWS credentials.

Deployment preparation:
1. Run migrations, then `node --import tsx scripts/provision-notifier.ts` with MIGRATION_DATABASE_URL and a strong NOTIFIER_DATABASE_PASSWORD on the trusted maintenance host.
2. Set COST_NOTIFIER_DATABASE_URL with the restricted newneo_notifier role; set AWS_REGION and COST_ALERT_TOPIC_ARN above.
3. Provide dedicated scoped AWS credentials to the isolated worker, not the browser or app container. Compose accepts COST_NOTIFIER_AWS_ACCESS_KEY_ID, COST_NOTIFIER_AWS_SECRET_ACCESS_KEY and optional COST_NOTIFIER_AWS_SESSION_TOKEN. Temporary credentials must be refreshed; role-based automatic renewal is preferred where supported.
4. Start `docker compose -f compose.production.yml --profile cost-alerts up -d cost-notifier` only on the configured host. It runs unprivileged with a read-only filesystem. No worker is running in AWS yet.
5. Verify a real alert end-to-end; configure external health/failed-message monitoring. Console output includes heartbeat status but is not yet connected to CloudWatch.

The notifier role only reads events and updates publication/lease/retry columns. It cannot change recipients, event payloads, customer limits or approvals. An email reply cannot approve expenditure. The owner-facing approval interface remains outstanding; trusted operator CLI is available.

Updated validation: 39 tests passed, one external PostgreSQL test skipped; TypeScript passed. New tests cover retry delay, active/expired leases, no resend after acceptance, exclusion of audit-only events, provider error redaction, restricted role access and explanatory text. No actual email delivery or real PostgreSQL concurrency is claimed.
