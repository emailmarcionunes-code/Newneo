# NEWNEO integration handoff — v1

`platform-v1.openapi.json` is the **proposed** frontend/backend contract. No `/api/v1` handler is implemented or enabled by this file. The current demo remains independent and cannot authorize real actions.

## Existing API (implemented separately, not v1-compatible)

| Route | Current behavior |
| --- | --- |
| GET `/api/session` | `{authenticated:false,configured}` without identity; authenticated response contains authorized workspaces and selected workspaceId. 503 for unavailable access/database. |
| GET `/api/auth/login`, GET `/api/auth/callback`, POST `/api/auth/logout` | Existing OIDC/session entry points. Provider configuration is required. |
| POST `/api/workspace/select` | `{workspaceId}`; checks origin, session and verified membership. `{selected:true}` on success. |
| GET/POST/PUT `/api/workspace/drafts` | Session-scoped persistence; `{drafts}` / `{draft}`. Save configuration + workspaceId; PUT also requires id and revision. Current errors use `{error:string}`. |
| POST `/api/launch/preview` | Explicit preview mode; evaluate/chat/deploy simulation only. Signed reference evaluation receipt is not a production approval. |
| POST `/api/launch/deploy` | Always 503 until real evaluation, approval and runtime adapters exist. |

Do not replace these responses silently with the proposed envelope. Introduce `/api/v1` and migrate consumers per surface, with regression tests.

## Boundary rules

- All v1 routes require a server-verified session and workspace membership. Tenant IDs from a request never grant access; derive organization/workspace scope from the session. Recheck permissions for every mutation and job execution.
- Responses declare `mode: live` and observation time. Demo/sessionStorage records never become live data automatically. Imported draft configuration must be revalidated server-side.
- Pagination uses opaque cursor + bounded limit (1–100, default 25). Stable ordering includes ID; filters are explicit query parameters.
- Mutation requests carry `Idempotency-Key`. Retain key/result per workspace and operation; a different payload with the same key returns 409. Optimistic concurrency uses numeric `revision`; stale edits return 409 without overwriting current data.
- Jobs return 202 plus job ID. Poll GET job with backoff; terminal states succeeded/failed/cancelled. Progress is optional when not measurable; no fabricated percentage. Retrying uses a new operation only after observing the previous result.
- Production promotion binds agent, immutable version, configuration hash, successful evaluation and a separate authorized approval. Approval becomes invalid when configuration changes. Preview scores and client role selection grant no authority.
- Passwords/provider credentials are never returned to the browser. Connections use opaque credential references; upload initiation returns short-lived restricted URLs. Validate file size/type and scan before ingestion.
- Monetary values are integer minor units + currency; rates are 0–100; counts are integers; timestamps are UTC RFC3339. Missing measurements are null, never an implicit zero.
- Metrics specify period and observedAt. Overview, Reports, AgentOps and FinOps use the same aggregation service and definitions (success rate weighted by measured task count).
- Errors include code, safe message, requestId, retryable and optional field errors. Map 401 to sign-in with safe return path, 403 to access notice, 404 to resource unavailable, 409 to reload/review, 422 to field errors, 429 to bounded retry and 503 to retryable unavailable state. Do not expose provider secrets or cross-tenant existence.
- Every mutation records actor, workspace, operation, resource/version, outcome and request ID in the server audit log. Demo strings are not production audit evidence.

## Screen mapping

| Surface | Proposed endpoints/resources |
| --- | --- |
| Overview | metrics snapshot, agents, incidents, audit |
| Agents + eight-step launch | agents, versions, sources, tools, model endpoints, policies, evaluations, approvals, releases |
| Knowledge | sources, upload initiation, source documents, sync jobs |
| Tools & MCP | tools, servers, tool test jobs |
| Governance | policies, approvals, audit |
| Evaluations | evaluations + jobs, version/configuration binding |
| Deployments | releases + approval evidence; pause/resume/rollback jobs |
| AgentOps | incidents and metrics; telemetry details in agent resource |
| FinOps | metrics, budget |
| Reports | metrics, report export jobs, schedules |
| Playground | sandbox conversation jobs; no production side effects |
| Audit Log | cursor-based audit search and report export |
| Settings | workspace settings, members, opaque integration references |

## Adapter sequence

1. Identity + workspace + read-only agents; keep demo explicitly selectable.
2. Draft CRUD with revisions and reload/retry states.
3. Sources and upload/sync workers; approved model/tool endpoints.
4. Real evaluation evidence, separate approval, staging release worker.
5. Monitoring/cost aggregation and audit; then production promotion.
6. Scheduled exports/notifications only after explicit recipient configuration and delivery testing.

Provider-specific AWS implementation, production secrets and live deployment are deliberately not part of this frontend freeze. API contract publication is a handoff, not evidence of live endpoint availability.
