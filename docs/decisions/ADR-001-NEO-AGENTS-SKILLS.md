# ADR-001 — Neo, specialized Agents and reusable Skills

Status: **Accepted — canonical product architecture**. Decision supplied by the product owner on 16 September 2026. This decision governs future product, data, engineering, UX, governance, AgentOps and FinOps work. It extends the approved Hybrid v4 / Interactive v4 interface; it does not authorize a redesign or claim that orchestration is already implemented.

## Canonical principles

**One Neo. Many Agents. Reusable Skills.**

**Super-agent experience. Multi-agent architecture.**

**Employees interact with Neo. Enterprises govern Agents. Agents execute through Skills.**

**Agent = composition. Skill = reusable capability. Neo = orchestration.**

Neo is the universal user-facing interface, intent interpreter, router, orchestrator and permanent NEWNEO product companion. Neo is not one unrestricted mega-agent, a shared credential store, or an Agent that contains every enterprise permission. One universal interface does not imply one runtime identity or one global execution context.

## Definitions and boundaries

| Concept | Meaning | Boundary |
| --- | --- | --- |
| Neo | Universal front door and orchestration layer; also represented by the mascot | Routes inside user, tenant, Agent Version, Skill, Tool Action and policy permissions |
| Agent | Durable specialized business purpose, with stable identity | Mission, owner, users, domain, data and permission boundaries |
| Agent Version | Governed composition and deployment candidate | Pins instructions, Skill versions, knowledge/tool bindings, infrastructure, model endpoint, policies, evaluation suite and runtime configuration |
| Skill | Reusable business/technical capability | Instructions/reasoning, knowledge requirements, actions, validation, permissions, governance, evaluation criteria and execution logic |
| Knowledge | What the Agent knows | Scoped sources and retrieval permissions |
| Tool Action | What the Agent can technically call | Execution mechanism with explicit authorization and approved credential reference |
| Task | Business request/outcome | Can contain routing, delegation, several Skill executions, tool/model calls and retries |

Each Agent owns its mission, business owner, target users, knowledge, Skills, tools/actions, infrastructure, model, governance, evaluations, versions, deployments, operational ownership and economics. Agents remain bounded by business purpose. Skills are not aliases for individual APIs or the number of selected tools.

Example: Reset Password may combine identity verification, employee lookup, password reset API, ServiceNow incident creation, notification, validation and approval. Create ServiceNow Ticket can be reused by IT Support, Customer Service and Incident Response through references to the same immutable Skill version, with separate Agent-specific bindings.

## Canonical structure and request path

Composition and lifecycle (not a literal nested SQL ownership chain):

`Organization → Workspace → Agent → Agent Version → Skills → Knowledge Bindings → Tool Bindings → Model → Infrastructure → Governance → Evaluation → Deployment → Tasks → AgentOps / FinOps`

Neo sits above this as the orchestration and user-experience layer. Knowledge, tools, models, policies and evaluations are composition references; they are not children owned by a Skill merely because they appear after it in this conceptual path.

Canonical request path:

`User → Identity → Neo → Intent / Routing → Specialized Agent → Agent Version → Skill → Knowledge / Model / Tools → Enterprise System → Result → AgentOps / FinOps / Audit`

For “Neo, my Salesforce access stopped working”, Neo recognizes an access/support intent, routes to IT Support, selects the approved access-recovery Skill and executes only its authorized mechanisms. Mentioning Salesforce does not automatically select Sales Assistant. Ambiguous intent requires clarification; unavailable or unauthorized routes cannot fall back to unrestricted tools.

One Task may delegate to several Agents when necessary. Each execution records its own Agent and immutable version; context passed between Agents is minimized and authorization is rechecked, rather than inheriting the first Agent's permissions.

## Add a Skill or create an Agent?

Add a Skill when domain, mission, owner, users, data boundary, permission boundary and governance model remain aligned. IT Support can gain Unlock User, Provision Access, Troubleshoot VPN, Check Device Health, Execute Runbook, Send Teams Message and Escalate Incident while retaining its Agent ID.

Create a new Agent when business mission, owner, target population, domain, sensitive-data boundary, permissions, governance, evaluation criteria or operational ownership materially changes. Analyze Sales Pipeline belongs to Sales Assistant, not IT Support. Technical feasibility alone is not justification for widening an Agent.

A proposed Skill outside existing permissions must enter boundary review, not silently expand privileges. A capability within the domain may still require an approved permission change and fresh evaluation.

## Version lifecycle and production invariant

**Never edit Production directly.**

Adding or updating a Skill creates or updates a draft Agent Version under the existing Agent ID. It does not create a duplicate Agent and does not mutate its active production version.

1. Select an approved, explicitly versioned Skill compatible with mission and boundaries.
2. Create or reuse an editable candidate; bind that Skill version and scoped configuration.
3. Validate dependencies, knowledge/tool access, data residency and governance.
4. Freeze a candidate configuration digest containing all versioned dependencies; run Skill and composed-Agent evaluations.
5. Obtain a separate authorized approval and promote the exact evaluated version through the release process.
6. Preserve the previous immutable version for rollback; bind subsequent Tasks to the release selected for their environment.

Any candidate dependency/configuration change invalidates evaluation and approval evidence. Updating a reusable Skill must not silently change any existing Agent Version. Skill maturity is evidence-based: Experimental → Validated → Production Ready → Proven at Scale. Maturity is neither permission nor automatic approval.

## Security and governance

Effective permission is constrained by the authenticated user, organization/workspace, Agent, Agent Version, Skill binding, Tool Action and governance policy. Neo cannot grant any of these permissions or hold unrestricted access to all enterprise systems. Apply least privilege, scoped credentials, explicit approvals and deny-by-default checks at routing and at execution. Recheck identity and approval validity when resuming queued jobs. Store credential references, not secrets, in composition manifests.

Catalog visibility is not execution permission. Shared reusable implementation must not share customer data, secret bindings or authorization across tenants. Cross-workspace reuse requires explicit organization approval and workspace binding. Agent and Skill isolation must remain visible in traces and operational ownership.

## Required data-model evolution (planned, not migrated)

| Resource | Required fields / relationships |
| --- | --- |
| Agent | Tenant/workspace, stable ID, mission, domain, business/operational owner, target users and boundary references |
| AgentVersion | Agent FK within tenant/workspace, immutable version ID, draft revision, parent version, lifecycle, composition manifest, configuration digest |
| Skill | Organization scope, durable ID, purpose, owner, input/output contract and approved distribution scope |
| SkillVersion | Skill FK, immutable ID/version, instructions/execution artifact digest, knowledge/tool requirements, validation/governance/evaluation references, maturity evidence |
| AgentVersionSkillBinding | AgentVersion FK + SkillVersion FK, tenant scope, scoped configuration, knowledge/tool mapping and permission constraints; uniqueness prevents accidental duplicate bindings |
| Evaluation / Approval / Release | Exact AgentVersion and composition digest, evidence IDs, actor, environment, policy versions and timestamps; approval separate from evaluation |
| Task / orchestration event | Task ID, request/correlation ID, authenticated actor and tenant, intent, parent/delegation relationship, route decision, outcome and timing |
| SkillExecution / ToolCall | Task/trace/span IDs, Agent ID, AgentVersion ID, SkillVersion/binding ID, action/model references, environment, outcome, timing and approval evidence |
| Cost event | Unique event ID, Task and execution references, Agent/version/Skill/model/infrastructure/tool/environment dimensions, measured amount in minor units, currency and observation time |

Enforce tenant-consistent foreign keys, row-level access and server-side validation. Existing agent `revision` is an optimistic concurrency token, not an immutable Agent Version. Draft schema evolution needs explicit schema versions and migration adapters; never infer a Skill from a selected Tool without a reviewed mapping.

## AgentOps and FinOps attribution

AgentOps primarily observes Agent, Agent Version, Task, Skill execution, tool calls, incidents, latency and success/failure. Neo route/delegation events are correlated but cannot erase the specialized Agent/Skill responsible for execution.

FinOps must support cost per Task, cost per successful Task, by Agent, Skill, model and environment, including infrastructure and tool execution. Routing/model costs incurred by Neo remain attributable to the Task as orchestration overhead, not fabricated Skill execution. One business request may remain one Task despite many internal calls. Define Task completion at the business-outcome level; retry spans are not new successful Tasks.

Use an idempotent cost ledger and aggregate each event once. Preserve shared overhead separately or use an explicit allocation rule; do not sum overlapping Agent/Skill/model subtotals as additional charges. Missing measurements remain unknown, not zero. No measured Skill economics can be displayed before these execution identities exist.

## UX and Neo communication

Preserve the eight steps: Use Case → Knowledge → Tools & MCP → Infrastructure → Model → Governance → Evaluate → Deploy. Do not add a ninth stage or rename Tools to Skills. Design a future Skill selector/binding view within the existing composition experience and an Add Skill action in Agent detail, subject to normal UX review.

Neo remains Neo, never IT Support or Customer Service. Keep the Agent name separate. First creation can use the prominent saluting success pose and “Hello, my name is Neo!” with “Agent Created!” and the Agent/environment below. Continue to identify simulated deployments as previews.

Adding a Skill uses a small neutral Neo confirmation, without the creation celebration or salute:

- “Skill added successfully”
- “Reset Password was added to IT Support Agent.”
- Optional: “IT Support Agent now has 10 skills.”

Before promotion, specify “Added to draft vX; evaluation and promotion required” and count the draft's distinct bindings. Do not imply a production Agent has gained a capability until that version is promoted. Once promoted, the count belongs to the active version. Retries must not increment the count or repeat a successful mutation.

The existing compact Readiness card and top progress guide remain. Ask Neo is a later universal-interface experience; do not present the current static Playground as a working autonomous router.

## Code/data audit at decision time

| Finding | Evidence | Disposition |
| --- | --- | --- |
| Multiple scoped Agents supported | `ai-platform/db/migrations/001_platform.sql`, `server/agent-repository.ts` | Retain stable Agent IDs and tenant RLS |
| Editable drafts with concurrency exist | `db/migrations/002_identity_and_drafts.sql`, `server/drafts.ts` | Extend via versioned schema; drafts currently use template IDs and JSON configuration, not durable AgentVersion FKs |
| Infrastructure, model, knowledge and actions already separate | `lib/launch.ts`, `lib/configuration.ts` | Retain; add explicit Skill bindings rather than reinterpreting tools |
| Version/promotion UX already exists in preview | `components/hybrid/AgentWorkspace.tsx`, `components/journeys/PreviewState.tsx`, `components/DeployStep.tsx` | Good foundation; sessionStorage, display-version strings and optional agent IDs are not production integrity |
| No first-class reusable Skill or binding | `lib/launch.ts`, both SQL migrations, `contracts/platform-v1.openapi.json` | Add Skill/SkillVersion/binding model before implementing Add Skill or claiming counts |
| Server Agent updates are mutable metadata | `server/agent-repository.ts` `updateAgent` | Acceptable foundation; must never become a live runtime-composition update path |
| Proposed Version contract is insufficiently explicit | `contracts/platform-v1.openapi.json` Version configuration | Add pinned Skill/dependency schemas in a reviewed additive contract revision; current proposal is not a deployed API |
| Preview evaluations/releases lack full durable attribution | `components/journeys/PreviewState.tsx` Run/Release | Require tenant, AgentVersion, binding and digest linkage for live paths |
| Current metrics aggregate sample Agent data | `lib/workspace-summary.ts`, `lib/preview-records.ts`, `components/hybrid/Platform.tsx` | Cannot derive real per-Skill cost or tracing; add execution ledger rather than relabeling totals |
| Neo exists as presentation, not runtime orchestration | `components/NeoMascot.tsx`, `components/LaunchSuccess.tsx` | Identity already consistent; no universal routing service or delegated permission enforcement exists yet |
| Real deployment remains closed | `app/api/launch/deploy/route.ts`, `contracts/README.md` | Preserve until actual evaluation, approval and runtime adapters exist |

These gaps are not evidence that live production is currently being edited unsafely: no live deployment path is enabled. They are prerequisites before enabling it.

## Sequenced follow-up and acceptance

1. **This decision:** publish canonical terms, audit and cross-links. No UI, migration, runtime or naming-only refactor.
2. **Before live Skill composition:** design additive AgentVersion/SkillVersion/binding contracts and migrations, authorization and draft lineage. Tests must prove reuse without duplication, tenant isolation, fixed dependency versions and duplicate-add idempotency.
3. **Before live promotion:** immutable manifests, evaluated digests, separate approvals, staging/promotion/rollback; tests prove production remains unchanged until promotion and changes invalidate evidence.
4. **UX milestone:** Add Skill / Skills detail with approved catalog, compatibility, draft counts and restrained confirmation. Keep Hybrid v4 and the eight-stage journey. Simulations remain visibly marked.
5. **Before live orchestration:** identity-aware Ask Neo routing, bounded delegation, execution traces and cost ledger. Tests cover unauthorized/ambiguous requests, cross-Agent delegation and no double counting.
6. **Later:** broader reusable catalog, richer Skill maturity analytics, cross-workspace distribution, routing optimization and dedicated thinking/warning mascot poses. Their absence must not weaken initial permission or version gates.

Architecture acceptance requires universal Neo experience with multiple specialized Agents, reusable Skills distinct from Tools, stable Agent identity across Skill additions, version-governed production changes, bounded permissions and attributable operations/costs. The documentation is accepted now; those runtime capabilities remain planned until implemented and verified.
