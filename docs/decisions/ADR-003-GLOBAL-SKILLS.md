# ADR-003 — Skills as a first-class product surface

Status: accepted; organization-level interactive demo implemented, 2026-09-16.
Supersedes ADR-002's navigation and embedded creation entry points; preserves its lifecycle and production gates.

## Canonical rules

- Skills are first-class product objects.
- Skills are created globally and consumed by Agents.
- Agents grow through versioned Skill bindings.
- Create Skill globally. Add Skill locally.
- Skill Definition ≠ Agent Skill Binding.
- Agent Version → Skill Binding → Skill Version.

One Neo. Many Agents. Reusable Skills. Tools remain execution mechanisms; Knowledge remains information/context. The Agent creation journey retains its eight stages.

## Product surfaces

BUILD / MANAGE: Overview, Agents, Skills, Knowledge, Tools & MCP. Governance follows Tools & MCP. Other navigation groups are unchanged. Skills uses the canonical icon, active indicator, collapsed tooltip and breadcrumb.

`/skills` is the organization library. It contains ten initial reusable definitions plus published session definitions, six KPIs, most-used capability, search and domain/maturity/risk/status/owner/usage filters. Rows open `/skills/:id`. Detail has Overview, Configuration, Tools, Knowledge, Governance, Evaluations, Versions and Usage. Maturity, status, risk and evaluation are independent.

`/skills/new` hosts the five-stage builder: Define Capability, Connect Requirements, Governance, Evaluate, Publish. `?source=:id` appends an immutable version. Proven at Scale cannot be selected manually. Publication never upgrades consumers automatically. Detail shows an update notice for consumers pinned to older versions.

Agent Detail's Skills tab consumes the same repository. Add Skill directly opens selection mode, followed by Configure Binding, Validate and Add to Version. A secondary link navigates to the global builder when no suitable definition exists. After publication, users return to the Agent and select the shared definition. There are no Agent-local definition copies and no create-or-select entry screen.

Bindings configure requirements, permissions, parameters, environment and approval constraints. Inactive definitions cannot be newly added. Existing bindings remain pinned when library status changes. Binding mutations create/update drafts, record history and require the existing evaluation/approval/promotion gates. New library versions do not alter Production.

## Analytics and integration contract

Active composition references determine Agents Using and most-used ranking. Executions, success, P95 latency, cost and adoption snapshots are explicitly labeled historical demo samples, keyed by Skill ID and version. New definitions have no invented execution history. The current per-Agent sample allocation is illustrative and labeled as such, not measured activity. Global metrics summarize available samples across consumed versions; this is not billing or operational evidence.

The existing SkillExecution domain carries organization/workspace, Agent/version, Skill/version/binding, Task, environment, model, tool calls, outcome, latency and cost. Future AgentOps/FinOps should group authoritative events by these dimensions. Server integration must persist tenant-scoped immutable definitions, bindings, audited status changes and evaluation evidence; enforce authorization, pinned versions and promotion gates; and replace demo aggregates with real execution aggregates. No public marketplace, live connector execution or additional AWS resources are introduced here.

## Verification

Production build passed. Unit suite: 33 passed, one optional native PostgreSQL test skipped. Browser regression: 58 passed initially; the remaining catalogue test used an obsolete category label without its count and passed after correcting the selector. All 59 scenarios therefore passed across the regression and targeted rerun. Seven focused Skills flows passed at desktop/mobile widths, including accessibility and overflow checks. Global library screenshots were visually inspected. Preview port 3117 was restarted and `/skills` returned HTTP 200.
