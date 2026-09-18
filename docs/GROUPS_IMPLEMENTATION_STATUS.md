# NEWNEO hosted implementation checkpoint — 2026-09-17 UTC

This is a partial delivery of the multi-group roadmap, not completion of all groups.

## Latest advancement — operational health (migration 015)

- Published a bounded, cached database-connectivity health probe (public ready boolean only), Docker application health checks, and bounded application log rotation.
- Installed/enabled a local five-minute systemd monitor for application/database/proxy, backup freshness and last service result, and free disk. It writes sanitized status atomically to a read-only application mount.
- Owner-only AgentOps health view refreshes once per minute. Missing, invalid, future-dated or older-than-15-minute evidence never confirms healthy status. Backup failure, age over 30 hours or disk below 4 GiB needs attention.
- Centralized verified platform-owner authorization shared with FinOps. The real owner read still reports 1/10 customers, missing monthly accounting and blocked paid reservations; no limits changed.
- Full tests: 48 total, 47 passed, one optional integration skipped, zero failures. Final targeted operations/owner tests: 3 passed. Production build passed. Isolated unavailable-database probe returned false without affecting production.
- Live first monitor: application/database healthy, proxy running, backup fresh, timer enabled, service exit 0. Public health returned HTTP 200 with ready=true. Private operations endpoint requires authentication.
- Docker build cache corruption was resolved by clearing only build cache, preserving running containers, database volumes and backups.
- This is local monitoring, not external outage detection or email delivery. Off-host backup, cloud accounting, external notifications and model/tool runtime remain pending. No authenticated browser visual verification was available in this iteration.

## Latest advancement — owner financial visibility (migrations 013–014)

- FinOps reads actual private control-plane records through a read-only function bound to the verified identity/issuer/subject and an explicit platform-owner allowlist. Tenant Org Admin roles do not grant platform financial access. No direct private-schema grant or browser mutation endpoint was added.
- Displays admitted clients/cap, missing/stale/fresh monthly accounting, exposure and unsettled reservations, top recorded service drivers, application alert publication status and historical approved increases. Provider acceptance is not labeled as inbox delivery.
- Production restricted-role validation: existing GAW owner enabled, 1 admitted client / cap 10, monthly accounting missing, reservation gate blocked. No limits changed. The USD 1,000 monthly default is still not presented as a verified monthly ledger.
- Tests: 46 total, 45 passed, one optional integration skipped, zero failures. The financial fixture includes the existing notification migration; migration 014 corrects the read function for its published_at column while preserving the already-applied migration 013 checksum.
- This is visibility into internal control records, not completed AWS billing integration or notification-worker activation. Paid runtime and off-host backups remain pending.

## Latest advancement — retrieval evaluations (migration 012)

- Hosted Evaluations now separates Source retrieval from Configuration checks. Authors create immutable suites pinned to exact Agent versions, with 1–10 distinct queries and active expected documents. Operators execute suites; readers inspect retained evidence.
- Every case runs the actual lexical search and records whether its expected source appears in the top five. Evaluation retries are idempotent; all case executions and the evaluation commit atomically. Tenant isolation, immutable history, query/source validation and archived-source behavior are covered by backend tests.
- Audit includes suite creation and evaluation runs. Bounded suite selection and paginated evaluation history prevent an unbounded result list.
- Build/TypeScript passed; suite remains 45 tests, 44 passed, one optional integration skipped, zero failures. New lifecycle assertions cover matched/unmatched cases, role separation, cross-tenant rejection, conflicting retries, archive failure and audit events.
- Actual GAW Agent v3 suite executed one starter-document case: expected NEWNEO source found, result persisted, zero model calls. One sample case is not a comprehensive business evaluation or production approval.
- Paid AI runtime, AWS accounting/service credentials, external connectors and off-host disaster recovery remain pending. No spending limit or deployment authorization changed.

## Latest advancement — lifecycle, source execution and reviews

Published migrations 009–011 and production app on 2026-09-17 UTC.

- Agent/Skill archive and restore; restoring a prior immutable configuration creates a new version. Scoped optimistic revisions and audit records preserve history.
- Agent versions pin Knowledge documents as well as Skill versions. Archived sources cannot be newly bound or searched.
- Playground executes bounded lexical searches over pinned documents, stores excerpts and measured search latency, and supports idempotent retries. This is NOT generated AI output, semantic retrieval or an external tool execution.
- Evaluations records actual structural configuration checks. Governance records independent human review of an exact version/check; author/requester self-approval is rejected in both API logic and database policy. This approval never grants production deployment authorization.
- AgentOps and Reports expose persisted source-search history and current-page CSV. FinOps distinguishes this measured activity from unavailable AWS spend reconciliation.
- Audit includes source runs, configuration checks and review events.
- Real GAW Agent v3 pins the existing pilot guide and Skill. A real NEWNEO search returned one source. Its review is pending an independent reviewer; no approval was fabricated.
- Latest test suite: 45 tests, 44 passed, one optional integration skipped, zero failures. Production TypeScript/build passed. New APIs returned 401 anonymously and 403 for foreign-origin writes.
- Daily local backup timer installed (04:15 UTC plus up to 5 minutes jitter). Manual service run succeeded. Latest dump restored to an isolated temporary database: 19 forced-RLS tables, one source run, one review, zero broken document bindings. Test database dropped.
- Backup remains on the same server, not off-host disaster recovery. No automatic deletion or off-host copy was enabled.
- Authenticated browser visual verification was unavailable due to expired login. Backend pilot validation used a trusted maintenance transaction with the restricted application role, not an invented browser session.

## Previously published — workspace access

- Migration 008 and Settings member directory: bounded 50-member pagination, role changes, revocation and reactivation for existing members. Only an active Org Admin can administer members.
- Verified issuer/subject authorization inside narrowly scoped database functions; runtime cannot directly update memberships or append membership audit. Optimistic revisions reject stale updates. Workspace locking and a last-admin rule preserve an active administrator.
- Membership changes are included in Audit Log. Revocation is enforced by membership RLS on subsequent scoped requests.
- Existing GAW owner adm@gawservices.com initialized as Org Admin with an audit record; no new person or external application was granted access.
- Session-loading failure/expired access no longer falls back to Acme demo UI.
- Production build passed. Latest suite: 44 tests, 43 passed, one optional PostgreSQL integration skipped, zero failures. Production PostgreSQL read under newneo_app verified the GAW directory and author permissions. Public members endpoint rejects anonymous requests with 401.
- Backup before migration: /home/ubuntu/backups/newneo-20260917T021800Z.dump.
- Authenticated visual confirmation of Settings is pending a fresh login because the browser session expired; no credential was bypassed.

## Previously published

- Migration 007: workspace-scoped Knowledge documents, immutable content, full-text index, archive flag and append-only import/archive audit.
- Knowledge API and UI: plain text/Markdown up to 20 KB, 1,000-document pilot storage bound including archives, 25-row pagination, bounded text search, source reading and duplicate-content detection. Archived documents are excluded from search; content remains retained. No embedding, semantic search, external connector or generated answers is claimed.
- Audit API/UI: real Agent, Skill and Knowledge events, type filter, 50-event pagination, current-page CSV export. This is not yet a complete platform/security audit.
- Authenticated Command Center reads persisted Agent/Skill/document counts. Demo samples remain in the demo context.
- Real operational screens explicitly identify services not yet connected; fake operational metrics and sample notifications are no longer presented as GAW results. Legacy demo detail routes are also guarded.
- Settings describes actual persistence and distinguishes hosting charges from unavailable paid Agent execution.

## Verified

- Latest backend test run: 43 tests, 42 passed, 1 optional integration test skipped, no failures.
- Production compilation and TypeScript check passed, including final Settings copy update.
- Migration 007 applied successfully; app/database/proxy running.
- Public Knowledge API: anonymous 401, demo cookie 401, foreign-origin write 403.
- Restore rehearsal: pre-007 production dump restored successfully to isolated temporary database; six migrations, eleven forced-RLS tables and valid Skill bindings verified. Temporary database dropped, private backup retained. This is NOT an off-host disaster recovery solution.
- Actual authenticated browser session: selected existing GAW Principal workspace; imported and searched a guide, read original text; created Skill, created Agent and saved a second Agent version with the exact Skill version; Audit Log shows all four real events.

## Real GAW pilot records created

- Knowledge: NEWNEO — guia inicial do piloto (product documentation, not an invented GAW business policy).
- Skill: Consulta documental GAW, v1.
- Agent: Assistente documental GAW, v3 pins the Skill v1 and pilot guide. Previous immutable versions remain retained.
- Agent is NOT deployed or executing. No model calls or external tool actions were made.

## Group status and remaining work

1. Identity: existing OIDC session and selected-workspace authorization verified. Existing-member administration and revocation are now published. Invitations, complete role capabilities across future runtime operations, and custom auth domain remain.
2. Registry: durable versions/bindings verified end-to-end. Knowledge bindings and archive/restore lifecycle are now implemented. Full guided configuration and production release/rollback remain.
3. Knowledge: text-document import and lexical source search delivered. PDF parsing, source ACL synchronization, embeddings, external GAW connector and real business documents remain.
4. Runtime: no model runtime, durable task worker or live tool connector is enabled. These are still implementation work, not merely a switch.
5. Governance/evaluation: structural configuration evidence and independent configuration review are implemented. Behavioral evaluation, external execution evidence and production deployment gates remain; preview scores are not accepted.
6. Costs: customer limit remains 10; one customer admitted. Month ledger has NO initialized accounting row. USD 1,000 is the schema default for a future month, not an active/current-account reconciliation. Paid reservations fail closed without fresh accounting. Notification worker is not running; its DB URL and SNS destination are configured but AWS sending credentials are absent. Existing account-level AWS alerts were not revalidated in this iteration. No limit was increased.
7. Operations: real configuration/Knowledge/source-search/review audit and measured source-search telemetry delivered. Model/tool telemetry, incidents and reconciled cloud FinOps remain.
8. Security/recovery: isolation tests, API rejection checks and local restore verified. Daily local backup and a post-011 restore drill succeeded. Off-host encrypted backups, runtime security review and load acceptance remain.
9. Pilot: versioned starter configuration, pinned guide, persisted lexical search and pending configuration review verified. End-to-end AI business execution and customer onboarding are not complete.

## Next dependencies

- Establish least-privilege service authentication and verified budget accounting before any paid runtime activation.
- Connect a selected model with bounded usage, durable Tasks, idempotency and settlement; implement real evidence/approval gates.
- Add approved GAW content and one connector without inventing enterprise credentials or permissions.
- Configure off-host recovery, complete guided authoring and actual runtime integrations. Do not describe pending code as completed because the public UI is hosted.

## Recovery artifacts

Remote: /tmp/newneo-before-knowledge.tgz; private pre-knowledge database dump under /home/ubuntu/backups.
Source remains authoritative at /home/ubuntu/platform. No environment secrets are included in source checkpoint archives.
