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

## Portfolio refinement — 2026-09-16

The global Skills surface now expresses **Capability Core → Domain Pattern → Skill** through lightweight metadata (`skill-portfolio.ts`). CapabilityCore describes reusable logic, inputs/output contract, tool, governance and evaluation patterns. DomainPattern carries terminology, regulatory review requirements, data boundaries and domain evaluations. Skill-specific configuration and immutable Skill versions remain authoritative. Neither concept introduces a sidebar inventory.

**Build vertically. Reuse horizontally.** The value of the NEWNEO portfolio increases as reusable capabilities improve across customer projects. A vertical implementation should contribute reusable horizontal intelligence whenever possible. Canonical question: **What did we build here that the next customer should not have to pay us to build again?**

Portfolio KPIs include Cores reused across domains and distinct active Agents using Skills. Reuse describes breadth, not quality. Matrix cells reference real demo library definitions, open Skill Detail, expose maturity/version/use/telemetry on hover/focus, and distinguish Experimental (slate), Validated (light blue), Production Ready (blue), Proven at Scale (green). A representative view expands to all ten domain and capability axes with contained scrolling and sticky headers. Multiple Skills may occupy a cell. Empty cells report an opportunity and never create a Skill.

Eight additional domain-adaptation demo definitions join the original ten without changing pinned Agent compositions. They have no measured execution or evaluation score. Portfolio Intelligence and Opportunities are derived from metadata, not fabricated comparative percentages or claims of regulatory compliance. Detail shows Built from, reuse breadth, components and related Skills sharing the same Core.

Builder Step 1 searches similar Skills, capability descriptions, tool patterns and governance requirements. Explicitly choosing a pattern adds its metadata and merges tool/governance requirements for review; it does not copy executable logic, authorize tools or grant production readiness. The visible assembly percentage is an explicitly illustrative demo estimate, not an inferred measured match. Saving, evaluation invalidation and immutable publication retain composition metadata. Agent Detail remains the simple consumption/binding surface; the matrix is global only.

Portfolio verification: production build passed; 35 unit tests passed, with one optional native PostgreSQL test skipped; all 61 Chromium browser tests passed. Matrix navigation, empty opportunities, related Skills, pattern reuse and saved draft recovery were checked at 1440px and 390px with accessibility and document-overflow assertions. Desktop/mobile screenshots were inspected. Preview 3117 serves the updated build.
