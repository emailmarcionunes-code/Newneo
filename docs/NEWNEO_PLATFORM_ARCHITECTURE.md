# NEWNEO Platform Architecture

Status: accepted foundation, 2026-09-16. This document distinguishes deployed foundations, preview product models and proposed execution contracts. Hybrid v4 is preserved. No production runtime is enabled by this change.

## Principles

- NEWNEO is the product. Cloud is infrastructure.
- AWS-first implementation. Provider-neutral architecture.
- Own the control plane. Abstract the execution plane.
- Provider services accelerate NEWNEO; they do not define NEWNEO.
- Run anywhere. Operate through NEWNEO.
- Build vertically. Reuse horizontally.
- One Neo. Many Agents. Reusable Skills.

“Run anywhere” is an architectural direction, not a claim of currently certified runtimes. Agents are organizational objects. Tasks are economic objects.

## Current implementation audit

| Area | Evidence and finding | Decision / remaining work |
|---|---|---|
| Domain leakage | `lib/skills.ts`, `lib/skill-portfolio.ts`, `lib/launch.ts` own preview concepts. Persisted `newneo.agents` contains identity, tenant, name, description and revision; no AWS Agent ID. | Preserve these concepts. Preview models are not durable execution definitions. Add versioned persistence before runtime activation. |
| Customer UI | AccountSettings named AWS in a preview infrastructure notice. Model vendor names describe actual model choices and are useful. | Changed notice to cloud infrastructure. Preserve model vendor labels. No redesign or unsupported deployment claims. |
| Direct dependencies | SNS SDK in cost sender; `pg` in database transport; `openid-client` in authentication. | SNS moved under `server/providers/aws`, retaining compatibility import. PostgreSQL and OIDC remain existing adapters; no rewrite of their security transactions or login flow. |
| Canonical objects | Migrations persist organizations, identities, workspaces, memberships, basic agents, drafts, account profile data and cost controls. | Versions, bindings, knowledge indices, task lifecycle, evaluation evidence and deployment history still need production schemas/services. Do not mistake local preview state for persistence. |
| Telemetry | Product AgentOps largely presents demo/reference data; no active workload event pipeline. | Added canonical event projection and validation. Actual provider translators, durable outbox and consumers remain to implement. |
| Economics | Reservation/approval ledger uses cents and service/organization attribution; no live usage collector. | Added integer USD micro-unit charge contract, batch deduplication and Task aggregation. Connect metering and reconcile the ledger before paid execution. SNS is notification delivery, not cost measurement. |
| Identity | OIDC issuer/subject resolves a provisioned NEWNEO identity. PostgreSQL RLS uses transaction-local identity and membership; current edit permission is `can_edit_agents`. | Keep IAM infrastructure-only. Full NEWNEO role matrix is planned, not already enforced. |

Scope of verification: source review and local tests, not a new inspection of the deployed AWS account. Existing infrastructure, budget delivery and production settings must be independently verified for runtime rollout.

## Control Plane: NEWNEO intellectual property

The Control Plane owns organization and workspace isolation, identity context, Agents and immutable Agent Versions, Skill Definitions and immutable Skill Versions, Agent Skill Bindings, Capability Cores, Domain Patterns, Knowledge Sources/Bindings/Indices/Coverage, Tool Connectors/Actions, policies, evaluation suites/runs, deployments, Tasks, incidents and audit records. Neo routing, portfolio intelligence, AgentOps and FinOps operate on those objects.

`lib/skills.ts` and `lib/skill-portfolio.ts` remain the existing preview source of Skill semantics; do not create a second competing Skill model. Production persistence must preserve definition versus binding: a reusable definition is versioned independently, and an Agent Version pins a Skill Version plus configuration and authorization scope. Changing the library never silently changes production Agents.

An Agent owns mission, business owner, target users and version references to skills, knowledge, tools, approved model endpoint, governance and evaluation evidence. `server/platform/contracts.ts` defines the execution handoff (`AgentVersionPlan`), not a replacement for the entire authoring model or a new database schema.

## Execution Plane and adapter boundaries

Execution providers run approved work. The Control Plane resolves a server-only `ExecutionBinding` with a `providerKey` and `providerConfigRef`. Resource IDs, ARNs, bucket names, credentials and proprietary runtime handles belong in protected provider configuration or internal diagnostic records, never normal Agent/Skill DTOs. Configuration references contain no secret material.

Changing provider updates execution configuration; Agent ID, Agent Version, Skill bindings, policy IDs and evaluation history stay stable. A migration still requires compatibility evaluation, permissions, data-residency checks and a new deployment record. Stable identity does not imply automatic executable compatibility.

| Port in `server/platform/contracts.ts` | Responsibility | Implementation status |
|---|---|---|
| AgentRuntimeProvider | Execute an authorized, pinned plan | Contract only; live deploy remains HTTP 503 |
| ModelProvider | ModelEndpoint to inference and token usage | Contract only |
| KnowledgeProvider | Scoped retrieval with NEWNEO document references | Contract only |
| ObjectStorageProvider | Tenant-scoped object read/write | Contract only |
| SecretsProvider | Resolve internal secret reference | Contract only; never expose to browser |
| IdentityProvider | Verified external principal | Contract target; existing OIDC login remains working implementation, not rewired |
| ObservabilityProvider | Publish canonical events | Contract only |
| QueueProvider | Idempotent task message transport | Contract only |
| DatabaseProvider | Identity-scoped transaction callback | Contract target; existing PostgreSQL transactions remain implementation |
| ToolExecutionProvider | Authorized action execution | Contract only |
| PolicyEnforcementProvider | Allow, deny, require approval | Contract only |
| CostProvider | Cursor-based normalized usage input | Contract only |

Ports are deliberately small. Do not build empty adapter classes for hypothetical clouds. Concrete SDK imports belong in server infrastructure/adapters, not components or canonical domain code. PostgreSQL SQL is not magically portable: changing database engine requires repository adaptation and RLS-equivalent security verification. OIDC is already an open identity protocol; retain its established callback/session handling.

The actual SNS notification adapter is `server/providers/aws/cost-notification.ts`, exposed through the existing `cost-sns.ts` facade. It retains region/topic validation, approved recipient checks, confirmed subscription requirement, timeouts and receipt verification.

## Neo orchestration and Tasks

Canonical sequence: User → verified identity → Neo → intent → Agent routing → pinned Agent Version → Skill → Knowledge / Model / Tool → enterprise system → result → AgentOps / FinOps / Audit.

Neo is one NEWNEO orchestration identity, not one new persona per Skill and not a cloud-native Agent object. The orchestrator must resolve membership server-side, authorize the selected version, reserve a cost budget, load scoped bindings, enforce policy and approval, execute idempotently, then settle usage and record outcome. Approval is a durable scoped decision, not a client checkbox or provider “success” response.

One Task is one business request from start to terminal outcome. It may contain many model calls, Skills, tools and retrievals. Retries reuse the Task and invocation idempotency keys; they do not create extra business Tasks. Awaiting approval is nonterminal. Queue acknowledgment, timeout, cancellation, retry and reconciliation need explicit implementations before activation.

## Knowledge, Tools, Governance and Evaluations

KnowledgeSource identifies the business source; KnowledgeBinding pins access for a version; KnowledgeIndex tracks index version and freshness; KnowledgeCoverage records evidence against the mission. Providers implement ingestion, embeddings, vector search and object storage behind these objects. Source selection in the current preview does not prove ingestion or permissions.

ToolConnector owns connection metadata; ToolAction owns input/output contracts, permission scope, risk and approval requirements. MCP is an integration protocol, not the product domain or an automatic authorization grant. Tool execution must re-check authorization and approval scope immediately before side effects.

Governance owns definition, scope, severity, enforcement, approvals, audit, retention, residency, PII and human review. Provider guardrails are additional mechanisms; they cannot override a NEWNEO denial. Evaluations own versioned suites and immutable runs tied to the exact Agent/Skill configuration. Changes invalidate deployment eligibility until re-evaluated. Preview scores are not deployment evidence.

## AgentOps normalization

Canonical events: TaskStarted, TaskCompleted, TaskFailed, SkillInvoked, SkillCompleted, ToolCalled, ToolFailed, ModelInvoked, KnowledgeRetrieved, PolicyTriggered, ApprovalRequested, DeploymentChanged, IncidentOpened.

`normalization.ts` projects explicitly mapped adapter input into an allowlisted envelope with tenant, workspace, timestamp, environment and correlation. Task execution events require a Task ID. Deployment/incident events can exist outside a Task. Unknown event types are rejected and raw provider fields are omitted. This projection is not authentication, redaction of arbitrary identifier values or a lifecycle state machine: adapters must assign trusted NEWNEO identifiers, verify tenant ownership and keep prompts/secrets out of identifiers.

Next: durable event outbox, unique event IDs, authenticated ingestion, per-Task ordering/state validation, redacted diagnostic storage and operational consumers. Raw CloudWatch/provider logs stay engineering diagnostics; customer AgentOps uses normalized events.

## FinOps normalization and cost controls

UsageCharge carries NEWNEO charge identity, organization, workspace, environment, Task, Agent, optional Skill and ModelEndpoint, timestamp and integer USD micro-units. Adapters must map provider usage IDs to stable, collision-free NEWNEO charge IDs; private mapping retains original provider/billing IDs. Required dimensions must come from trusted execution context. Missing Skill/Model attribution remains unattributed, never fabricated.

`summarizeCharges` deduplicates identical charge IDs inside one workspace batch, rejects conflicting repeats and mixed workspace batches, checks overflow and counts distinct business Tasks. It is not a durable billing ledger. Production ingestion needs a unique tenant/charge key, transactional persistence and replay-safe reconciliation. Aggregate by Task, Agent, Skill, model, workspace and environment from the canonical dimensions.

Existing cost controls use cents; convert only at ledger settlement after aggregating micro-units, with documented conservative reservation rounding. Never count provider invoice totals and detailed usage as two charges for the same consumption. Keep estimates, actual charges, fixed infrastructure overhead, credits, currency conversion and invoice corrections distinct. Credits need a separate adjustment model; this first usage contract rejects negative amounts and non-USD currencies.

Preserve the requested 10-customer and USD 1,000 approval gates and notification recipient `adm@gawservices.com`. Runtime must reserve before consumption and stop new paid work when authorization is exhausted. Budget notifications alone are not a spending cap, and infrastructure can continue incurring cost while application work is paused. The present contracts neither enable the cost worker nor connect provider metering.

## Deployment modes and security

Canonical modes: NEWNEO Managed, Customer Cloud, Private AI, Hybrid AI. Air-Gapped is future, excluded from current executable contract. Current hosted application is not proof that any Agent runtime mode is operational. Use NEWNEO Managed Runtime in customer copy; providers/regions may appear when useful in approved model choices, advanced diagnostics or internal administration.

Target roles: Org Admin, AI Platform Admin, AI Engineer, Business Owner, Operator, Reviewer/Approver and Read Only. Implement an explicit permission matrix; the current membership edit boolean is not full RBAC. OIDC authenticates the external principal, NEWNEO membership authorizes product actions, infrastructure IAM authorizes service access. Never infer NEWNEO roles from arbitrary browser input or cloud permissions.

Maintain separate demo and real contexts, fail-closed production deployment, tenant-scoped repositories, encrypted sessions, least-privilege database role, immutable approvals and audit, private secret resolution, bounded queues/timeouts and cost gates. Contracts/types do not enforce these controls by themselves. No raw provider configuration enters customer serialization. An internal Admin Plane must require separate authorization and audit even when support personnel can inspect provider metadata.

## Delivery sequence and acceptance gates

1. Persist versioned Agents, Skills and bindings, policies, evidence and deployment references with tenant constraints and audit.
2. Complete role/permission enforcement and approval lifecycle; test cross-tenant denial.
3. Implement one AWS-first runtime/model path behind the ports, one knowledge source and one scoped tool. Keep unsupported providers unavailable.
4. Add durable Tasks, invocation idempotency, event outbox, metering and reservation/settlement reconciliation. Test failure and retry paths before activation.
5. Run real evaluations for the exact pinned versions; demonstrate approval denial and budget refusal; verify backup/restore and operational alerts.
6. Enable a bounded GAW pilot. Expand providers only after a second adapter proves stable domain identity and parity.

This change establishes contracts and normalization utilities, not production orchestration. Acceptance for live operation requires measured end-to-end evidence; successful TypeScript checks alone are insufficient.
