# ADR-002 — Skill lifecycle and Agent composition

Status: accepted; interactive demo implemented. Extends [ADR-001](ADR-001-NEO-AGENTS-SKILLS.md) without redesigning Hybrid v4 or adding a ninth creation stage.

## Canonical rules

- Agents grow through Skills.
- Skills are reusable capabilities, not raw tools.
- A Skill is defined once and bound safely to many Agents.
- Production Agents change through Versions, never direct edits.

Create Agent = full lifecycle. Add Skill = controlled extension. Create Skill = reusable capability engineering. These remain three distinct workflows. Neo remains the universal orchestrator/companion; no Skill or Agent renames Neo.

Knowledge is what the Agent knows. Tools are what it can technically call. Skills are what it knows how to accomplish. An IT Agent can accumulate multiple IT capabilities under one identity; materially different missions/domains need a separate Agent.

## Implemented milestone

Agent Detail tabs are Overview, Configuration, Knowledge, Tools, Skills, Evaluations, Versions, Activity, AgentOps. Skills exposes name, description, pinned version, maturity, risk, status, tools, knowledge requirements, sample library score and update time. The active version and editable draft are distinguished explicitly.

Add Skill opens the organization library within Agent Detail, without a new sidebar entry. Ten demo capabilities support search, category, maturity and risk filters, inspection, required systems and active-agent usage counts derived from version bindings. Shared Create ServiceNow Ticket demonstrates reuse across IT and Customer Service. Usage is fixture/session data, not live analytics.

The focused flow is:

1. Choose Skill: inspect and select an existing organization capability.
2. Bind & Configure: knowledge, tool actions, permission scope, JSON parameters, environment constraints and human-approval requirements.
3. Validate: Passed / Warning / Blocking checks for mission/domain, pinned version, dependencies, permission scope, governance, approvals, model, infrastructure and parameters; explicit simulated Skill scenarios plus Agent regression evidence.
4. Add to Version: review the proposed version and changes, save a draft under the existing Agent identity, then use existing Evaluate Version and Request Approval / Promote flows.

Blocking results prevent adding. High risk and experimental maturity retain warnings independently from status and evaluation. Editing any binding field invalidates its scenario evidence. Privileged/high-risk capabilities require the approval setting. Production is never a binding environment option.

The small neutral Neo confirmation says “Skill added successfully”, identifies the draft version, and counts Skills in that draft. It explicitly requires evaluation before Production promotion. No salute or Agent Created celebration occurs.

## Domain boundary

`ai-platform/lib/skills.ts` defines versioned Skill fixtures, SkillBinding, SkillComposition, typed change categories and future SkillExecution attribution dimensions. Definition includes purpose/domain, version/maturity/risk, owner/instructions, requirements, governance, reusable evaluation scenarios, input/output contracts and timestamps. Binding separates Agent-specific knowledge, actions, permissions, parameters, scope, environment and approval from reusable implementation.

Each Agent Version stores references to explicit Skill IDs and versions, plus bindings. Definitions are reused rather than copied into Agents. The initial library provides one version per Skill; future library editing must append immutable versions, never overwrite a version consumed by a deployed composition. Version upgrade/removal editors are not part of this milestone; typed changes reserve Added Skill, Removed Skill, Skill version changed, Tool binding changed, Knowledge binding changed and policy change.

Session composition is stored by Agent ID and Agent Version under `agent:<id>:skillVersions`. New bindings create/update a draft, preserve the current snapshot, reject duplicate Skill IDs and record activity/audit text. Subsequent configuration drafts inherit their predecessor's Skills. Evaluation configuration fingerprints include the Skill composition, so stale evaluation/approval cannot authorize a changed candidate through the existing demo promotion checks. Existing Test → approval → Production preview gates remain.

Risk/permission review uses the selected Agent domain (including a newly created Agent's template domain), never the mascot identity. Custom domains require future approved boundary configuration; the preview does not silently classify an arbitrary Agent as IT.

## Explicit demo limitations

No AWS, production database migration, live tool connections, authorization grants, real scenario execution or billing was added. Acme Corp is the demo organization. Connection/permission/compatibility choices are labeled fixtures; validation is deterministic against those choices. Passing a preview is not enterprise evidence. Library scores/maturity are supplied sample data. Skill-specific and Agent regression checks in the binding flow are simulated; subsequent full-version evaluation is also the existing preview.

The domain includes organization/workspace, Task, Agent/Version, Skill/Version/binding, environment, model, tool-call, outcome, latency and cost attribution fields for future telemetry. There are no fabricated measured Skill dashboards or charges.

Before live release, implement scoped persistent definitions and immutable versions, tenant-consistent bindings, registry-resolved resource IDs, approved boundary metadata, schema-based parameter validation, signed test evidence, execution-time authorization and approval, idempotent mutations and server-enforced composition immutability. Store real configuration digests rather than trusting client session fingerprints. Refer to ADR-001 for the full migration requirements.

## Separate Skill Builder

Create New Skill opens a clearly labeled scaffold: Define Capability → Connect Requirements → Governance → Evaluate → Publish. Publishing is disabled until the next milestone. Maturity stays separate from active status/risk/score. Experimental, Validated and Production Ready require their respective evidence; Proven at Scale is never manually selected for publication without operational evidence.

## Verification

Tests cover missing bindings/domain mismatch, pinned versions, stale validation, duplicate prevention, reusable definitions and unchanged production composition. Browser coverage exercises search, configuration, blocking validation, scenario preview, draft creation, reload, history, full-version evaluation, Test/Production approval and inheritance by the next draft. Accessibility is checked on the validation surface. The original eight-stage creation tests remain part of regression.

Final verification (2026-09-16): production build passed; 29 unit tests passed with one optional PostgreSQL test skipped; all 54 Chromium browser tests passed. Desktop and mobile Skill library/binding screenshots were inspected, with accessibility and horizontal-overflow checks at 1440px and 390px. The local preview on port 3117 serves the verified build.
