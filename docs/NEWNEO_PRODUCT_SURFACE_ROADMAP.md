# Newneo Product Surface Roadmap

> **Canonical architecture — ADR-001 (accepted).** [Neo, Agents and reusable Skills](decisions/ADR-001-NEO-AGENTS-SKILLS.md) governs the Agent/Skill/Neo model and resolves older conceptual ambiguity. **One Neo. Many Agents. Reusable Skills.** Neo orchestrates bounded specialized Agents; Skills are reusable versioned capabilities distinct from Tools. Production changes require a new evaluated and approved Agent Version. Hybrid v4 and its eight-stage journey remain unchanged. See the ADR for the current-code audit and unimplemented prerequisites.

> **Current implementation authority — Issue #3 / Hybrid v4.** The approved Hybrid file `7NFyk2kxLzbWsFWF8zWKNO` supersedes earlier visual references, navigation and seven-stage journey definitions in this document. The journey is now Use Case → Knowledge → Tools & MCP → Infrastructure → Model → Governance → Evaluate → Deploy. Existing commercial, security and product boundaries remain in force. See [Hybrid v4 implementation](HYBRID_V4_IMPLEMENTATION.md) for node mappings and verification.

## Purpose
This document records the current design/implementation status across the Newneo product family and prevents future teams, Codex, Figma or other assistants from reinterpreting the approved visual system.

## Canonical rule
**One design language. Different information density.**

Golden Reference UI:
- Newneo AI Platform — Agent Catalog
- Newneo AI Platform — Agent Launch Guide

Visual source of truth: Figma file `Newneo Product Design`.
Product source of truth: GitHub `/docs`.
Implementation source of truth: GitHub codebase.

## Current status

### Design System v2
**Status: APPROVED**

- foundations/tokens approved
- typography approved
- application shell approved
- sidebar/navigation pattern approved
- stepper approved
- cards/forms/context panels approved
- progressive disclosure pattern approved
- semantic color rules approved
- application density rules approved

Remaining visual polish:
- final third-party logos / official SVG assets
- selected icon refinements
- minor optical alignment where discovered during implementation QA

These items do not block engineering.

### Customer AI Platform — Agent Catalog + Launch Guide
**Status: APPROVED FOR IMPLEMENTATION**

Approved sequence:
`Agent Catalog → Use Case → Knowledge → Tools & MCP → Model & Runtime → Governance → Evaluate → Deploy → Success`

Figma canonical node IDs are recorded in `FIGMA_HANDOFF_AGENT_LAUNCH_GUIDE.md`.

Engineering may begin while final logos/icons are polished in parallel.

## Remaining Customer AI Platform screens
**Status: DESIGN PENDING unless otherwise noted**

Top-level navigation:
1. Overview
2. Agents
3. Knowledge
4. Tools & MCP
5. Models
6. Evaluations
7. Deployments
8. AgentOps
9. FinOps
10. Governance
11. Settings

### Overview
Status: existing concept/prototype; requires final Figma treatment using Golden Reference UI.

### Agents
- Agent Catalog — approved
- Agent Launch Guide — approved
- Agent Detail — product-defined; final Figma pending
- Versions / activity / promotion / rollback states — final Figma pending

### Knowledge
- Launch-step selection screen — approved
- Knowledge registry / source management — pending
- Source detail / permissions / readiness — pending

### Tools & MCP
- Launch-step selection screen — approved
- Connector registry — pending
- Connector/action detail — pending
- permissions / approvals / scope — pending

### Models
- Launch-step Model & Runtime — approved
- Model registry — pending
- Model endpoint detail — pending
- approved execution environments — pending

### Evaluations
- Launch-step Evaluate — approved
- Evaluation suite management — pending
- Evaluation run detail / regression history — pending

### Deployments
- Launch-step Deploy / Success — approved
- deployment inventory — pending
- environment/promotion history — pending
- rollback / pause states — pending

### AgentOps
Product specification complete; final Figma screens pending.
Primary views should cover fleet health, affected tasks, incidents, evidence, likely cause and recommended action.

### FinOps
Product specification complete; final Figma screens pending.
Primary views should cover AI Units, spend, cost/task, cost/successful task, budget/forecast and optimization.

### Governance
- Launch-step Governance — approved
- organization-level governance console — pending
- roles / policies / approvals / data classifications / audit — pending

### Settings
Pending.

## Newneo Admin Plane
**Status: PRODUCT SPECIFIED / FIGMA PENDING**

Internal-only operating console.

Required surfaces:
1. Overview
2. Customers
3. Customer 360
4. Subscriptions
5. Usage
6. Contracts
7. Infrastructure / deployment state
8. Incidents
9. Internal FinOps
10. Analytics
11. Platform Operations
12. Administration

Design rule: same Newneo system, highest information density, calm/flat visual language.

## Newneo Business Platform
**Status: PRODUCT SPECIFIED / FIGMA PENDING**

Internal commercial + delivery platform.

Required surfaces:
1. Overview
2. Pipeline
3. Accounts
4. Discovery
5. Assessments
6. Solution Review
7. Proposal Readiness
8. Proposals
9. Delivery Handoff
10. Renewals / Expansion
11. Analytics
12. Playbooks / checklists where useful

Design rule: same Newneo system, workflow-oriented, higher density than Customer AI Platform but less operationally dense than Admin Plane.

## Newneo Website
**Status: EXISTING WEBSITE / VISUAL ALIGNMENT PENDING**

Required/target sections and pages include:
- Homepage
- Platform
- Deployment Engineering
- AI Operations / AgentOps
- FinOps
- Private / Hybrid AI
- Public Sector / Sovereign AI
- Use Cases
- Assessments / POCs
- About / Contact
- presentations / commercial pages

Website may be more expressive than application surfaces while preserving Newneo typography, palette discipline, component DNA and brand identity.

## Reuse beyond Newneo
The Newneo Design System is approved as a reusable foundation for other products when intentionally adopted.

Reusable foundations:
- typography
- spacing
- radius
- semantic color behavior
- form controls
- cards
- navigation patterns
- tables
- status patterns
- charts
- progressive disclosure
- layout discipline

Product-specific branding, accent color, IA and terminology may change.

## Implementation sequence
Recommended design/engineering sequence:

### Wave 1 — current
- Codex refactor application shell
- Agent Catalog
- Agent Launch Guide complete flow
- responsive states
- component extraction
- initial Code Connect after 1:1 code components exist

### Wave 2 — complete Customer AI Platform
- Overview
- Agent Detail
- Knowledge registry/detail
- Tools & MCP registry/detail
- Models registry/detail
- Evaluations management
- Deployments management
- AgentOps
- FinOps
- Governance console
- Settings

### Wave 3 — internal operating surfaces
- Admin Plane
- Business Platform

### Wave 4 — public brand alignment
- Website redesign/alignment to approved family system
- presentations and commercial experiences

## Handoff principle
No future screen should begin from a blank visual direction.

Process:
`Product brief → Golden Reference UI / Design System → Figma → Product approval → Codex → Product acceptance → Release`

## Status shorthand
- **APPROVED** = visual/product direction frozen enough to reuse
- **APPROVED FOR IMPLEMENTATION** = engineering may begin; minor asset polish may continue
- **PRODUCT SPECIFIED / FIGMA PENDING** = functionality is defined but final visual design is not
- **DESIGN PENDING** = screen still needs canonical Figma treatment
- **VISUAL ALIGNMENT PENDING** = existing artifact exists but must be brought into the family system

## Skill lifecycle milestone

[ADR-002: Skill lifecycle](decisions/ADR-002-SKILL-LIFECYCLE.md) defines the implemented demo Skills tab, reusable library, four-step Add Skill flow, version gates and restrained Neo confirmation. Create Skill remains a separate builder scaffold. Live persistence, execution and evidence are future prerequisites.
