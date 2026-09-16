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

Each Agent Version stores references to explicit Skill IDs and versions, plus bindings. Definitions are reused rather than copied into Agents. The initial library provides one version per Skill; future library editing must append immutable versions, never overwrite a version consumed by a deployed composition. Version upgrade, binding configuration and draft removal editors are implemented; typed changes include Added Skill, Removed Skill, Skill version changed, Tool binding changed, Knowledge binding changed and policy change.

Session composition is stored by Agent ID and Agent Version under `agent:<id>:skillVersions`. New bindings create/update a draft, preserve the current snapshot, reject duplicate Skill IDs and record activity/audit text. Subsequent configuration drafts inherit their predecessor's Skills. Evaluation configuration fingerprints include the Skill composition, so stale evaluation/approval cannot authorize a changed candidate through the existing demo promotion checks. Existing Test → approval → Production preview gates remain.

Risk/permission review uses the selected Agent domain (including a newly created Agent's template domain), never the mascot identity. Custom domains require future approved boundary configuration; the preview does not silently classify an arbitrary Agent as IT.

## Explicit demo limitations

No AWS, production database migration, live tool connections, authorization grants, real scenario execution or billing was added. Acme Corp is the demo organization. Connection/permission/compatibility choices are labeled fixtures; validation is deterministic against those choices. Passing a preview is not enterprise evidence. Library scores/maturity are supplied sample data. Skill-specific and Agent regression checks in the binding flow are simulated; subsequent full-version evaluation is also the existing preview.

The domain includes organization/workspace, Task, Agent/Version, Skill/Version/binding, environment, model, tool-call, outcome, latency and cost attribution fields for future telemetry. There are no fabricated measured Skill dashboards or charges.

Before live release, implement scoped persistent definitions and immutable versions, tenant-consistent bindings, registry-resolved resource IDs, approved boundary metadata, schema-based parameter validation, signed test evidence, execution-time authorization and approval, idempotent mutations and server-enforced composition immutability. Store real configuration digests rather than trusting client session fingerprints. Refer to ADR-001 for the full migration requirements.

## Separate Skill Builder

Create New Skill now opens a complete interactive demo: Define Capability → Connect Requirements → Governance → Evaluate → Publish. Users define schemas, instructions, owner/domain, dependency requirements, permissions, parameter defaults, risk, data boundaries and evaluation scenarios. A builder draft can be saved and resumed in the browser session. Publication appends an immutable library version and leaves all Agent bindings unchanged. Maturity stays separate from active status/risk/score. Experimental, Validated and Production Ready require their respective evidence; Proven at Scale is never manually selected for publication without operational evidence.

## Verification

Tests cover missing bindings/domain mismatch, pinned versions, stale validation, duplicate prevention, reusable definitions and unchanged production composition. Browser coverage exercises search, configuration, blocking validation, scenario preview, draft creation, reload, history, full-version evaluation, Test/Production approval and inheritance by the next draft. Accessibility is checked on the validation surface. The original eight-stage creation tests remain part of regression.

Final verification (2026-09-16): production build passed; 29 unit tests passed with one optional PostgreSQL test skipped; all 54 Chromium browser tests passed. Desktop and mobile Skill library/binding screenshots were inspected, with accessibility and horizontal-overflow checks at 1440px and 390px. The local preview on port 3117 serves the verified build.

## Builder completion — 2026-09-16

`SkillBuilder.tsx` implements the separate five-stage workflow. Simulation outcomes are explicitly selectable as Passed, Warning or Failed; no model or tool is called. Definition edits invalidate preview evidence. Validated requires fresh evidence without failures; Production Ready additionally requires no warnings. Experimental can be published with a complete definition without passing evaluation. Scores represent simulated scenarios only. Proven at Scale remains unavailable.

Organization library versions are stored in the demo UI state. Existing definitions remain inspectable and pinned consumers resolve the exact version rather than the newest metadata. New version creation allocates the next minor version and rejects overwriting an existing definition. Published Skill edits always create another library version.

Agent cards expose Configure, Upgrade (when available) and Remove. Configure/Upgrade reuse binding validation and regression preview. Removal requires explicit inline confirmation. All mutations update only a draft Agent Version, record version/activity/audit history and invalidate prior full-version evaluation through the existing composition fingerprint. The live snapshot is preserved.

The full interactive frontend milestone is complete; durable tenant-scoped persistence, actual scenario execution, authoritative evidence and server enforcement remain AWS integration work. Library publication does not imply live deployment.

Builder verification: production build passed; 32 unit tests passed (one optional native PostgreSQL test skipped); all 56 Chromium browser tests passed. New desktop/mobile flows cover draft resume, creation/publication, binding, immutable library upgrade, Agent configuration/removal and history. Unit tests cover stale evidence, duplicate version rejection and maturity gates for failed/warning outcomes. The builder evaluation screenshot was inspected, and its desktop/mobile accessibility and overflow checks passed. Preview port 3117 was restarted with this build.

Entry refinement: Add Skill now asks users to choose Create New Skill or Select Existing Skill before showing either workflow. The builder renders independently; the library appears only for selection (or after successful publication). Back/close returns to the choice. Production build and five focused desktop/mobile Skill browser tests passed.
