# Newneo — Codex Implementation Handoff

## Mission
Continue Newneo as two coordinated products:

1. `newneo-website` — public marketing, education, SEO and lead generation.
2. `newneo-platform` — authenticated internal operating system for CRM, sales playbook, assessments, live presentations, proposals, admin, customer portal and future Academy.

The current repository contains the public website plus product specifications that define the internal platform. Treat those specifications as authoritative product requirements.

## Current public site repository
Repository: `emailmarcionunes-code/Newneo`
Working branch: `newneo-site-v1`
PR: `#1 Build complete Newneo enterprise AI website in Next.js`
Base branch: `main`

Do not merge to `main` unless explicitly instructed.

## Product positioning
Newneo is an enterprise AI engineering company.

Core architecture:
`AI Infrastructure → AI Compute → Agent Factory → AgentOps`

Customer engagement model:
`Discover → Assess → Prove → Deploy → Operate`

Commercial principles:
- Discovery is conversational and free.
- Assessment is engineering and paid.
- Assessment may be credited toward a subsequent Newneo implementation under agreed commercial terms.
- POCs are paid.
- No implementation proposal without a Newneo Assessment or equivalent assessment validated by Newneo.
- Meet for decisions, not for information transfer.
- Enter once. Reuse everywhere.

## Infrastructure / compute principle
Never assume every customer needs a local AI network or GPU cluster.

Newneo first assesses readiness and then recommends one of:
- Cloud AI
- Compute Starter
- Private AI Cluster
- Hybrid AI

Decision dimensions:
- privacy
- performance
- scale
- cost
- control

Reuse the customer environment where it works. Add specialized infrastructure only when justified by the workload.

## Public website work
Preserve the current design direction:
- dark-first premium enterprise design
- Newneo green `#60d394`
- green-circle logo mark
- restrained enterprise aesthetic
- progressive disclosure
- strong 5-second positioning
- English canonical language

Current/required public pages include:
- `/`
- `/ai-infrastructure`
- `/ai-compute`
- `/agent-factory`
- `/agentops`
- `/rag`
- `/mcp`
- `/ai-security`
- `/private-hybrid-ai`
- solution pages
- industry pages
- `/company`
- `/how-we-work`
- `/contact`
- `/start-assessment`

### Implement the production Start an Assessment form
The current page defines the information model but does not yet submit to a backend.

Implement a polished form that collects:
- name
- company
- business email
- phone optional
- country
- industry
- business objective
- current AI stage: idea / experiment / POC / production
- company knowledge requirement: yes / no / not sure
- enterprise actions requirement: yes / no / not sure
- expected execution model: cloud / private / hybrid / not sure
- local AI compute: yes / limited / no / not sure
- sensitive or regulated data: yes / no / not sure
- systems involved
- expected users / transaction volume
- success outcome
- free-text context

The public form should not display automated pricing.

Initially, design the API boundary cleanly so submissions can create leads in Newneo Platform when its backend exists. Until the platform API is available, use a safe development adapter or documented stub rather than embedding permanent business logic into the public site.

## Internal platform
Create a separate repository/app for Newneo Platform rather than placing authenticated CRM code inside the public SEO site.

Preferred initial stack:
- Next.js
- TypeScript
- PostgreSQL / Supabase
- Supabase Auth initially
- RBAC
- object storage for documents
- HTML-to-PDF proposal generation
- audit events
- explicit opportunity state machine

Build mobile-responsive but optimize primary workflows for desktop/laptop.

## V1 platform modules
1. Authentication
2. Admin & User Management
3. CRM
4. Lead Qualification
5. Sales / Engagement Playbook
6. Assessment Engine
7. Live Engagement Presentation
8. Proposal Engine
9. Basic Customer View / secure share links

Do not implement Learning Factory first; prepare schema boundaries only.

## Opportunity workflow
Internal stages:
`New Lead → Qualified → Discovery Complete → Assessment Sold → Assessment Complete → Solution Review → Proposal → Won/Lost → Delivery → AgentOps`

Enforce stage gates in code. The seller must not be able to skip required information.

### Proposal readiness
Create a visible readiness component showing at least:
- Business Case
- Sponsor
- Assessment
- Architecture
- Scope
- Risks
- Effort Estimate
- Pricing
- Commercial Approval
- Legal Terms

`Generate Proposal` is disabled until all required gates are complete.

## Assessment Engine
Assessment types:
- Business & AI Opportunity
- Infrastructure Readiness
- AI Compute
- Knowledge & RAG
- Integration & MCP
- AI Security & Governance
- Production Readiness
- AgentOps Baseline

Each assessment needs:
- owner
- status
- objective
- scope
- required customer inputs
- activities
- findings
- risks
- recommendations
- deliverables
- recommended next step

AI Compute Assessment must explicitly support Cloud AI / Compute Starter / Private AI Cluster / Hybrid AI.

## Live Engagement Presentation
This is a core product feature.

Every opportunity receives an automatically generated HTML presentation sourced from live CRM/opportunity data.

Two modes:

### Internal View
May show margin, probability, competitive notes, internal risks, pricing assumptions and approvals.

### Customer View
Must show:
- Customer Challenge
- Newneo Engagement Process
- Where We Are
- What We Understood
- Current State
- Findings
- Recommended Architecture
- Recommended Path
- POC Scope / Results if applicable
- Proposal Status
- Next Decision

Always render the engagement bar:
`Discover → Assess → Prove → Deploy → Operate`

Completed = completed state.
Current = Newneo green highlight.
Future = neutral.

Do not duplicate data into the presentation. Render the opportunity source of truth.

Support a clean presentation/full-screen mode suitable for customer calls and a secure customer share-link architecture.

## Proposal Engine
Generate proposal content from structured data.

Default sections:
1. Executive Summary
2. Customer Challenge
3. Current State
4. Proposed Solution
5. Architecture
6. Scope of Work
7. Deliverables
8. Responsibilities
9. Assumptions
10. Exclusions
11. Timeline
12. Acceptance Criteria
13. Pricing
14. Commercial Terms
15. Training / Enablement Options
16. Next Steps

Requirements:
- versioning
- approval status
- responsive HTML output
- print/PDF output
- controlled editable narrative fields
- no manual re-entry of known opportunity data

## Newneo Academy / Learning Factory — future
Do not prioritize for v1, but maintain extensibility for:
- courses
- modules
- lessons
- labs
- learning paths
- customer training packages
- enrollments
- completions

Course factory direction:
`Course Brief → Learning Objectives → Syllabus → Modules → Lessons → Technical Content → Labs → Knowledge Checks → Assessment → Instructor Guide → Student Material → Presentation`

Proposal Engine should later be able to recommend training products based on project scope.

## Read these first
Before coding the internal platform, read:
- `docs/NEWNEO_PLATFORM_PRODUCT_SPEC.md`
- `docs/SALES_ENGAGEMENT_PLAYBOOK.md`
- `docs/LEARNING_FACTORY_ROADMAP.md`

## Engineering expectations
- Prefer simple, explicit architecture over premature abstraction.
- Use typed domain models.
- Enforce authorization server-side.
- Separate customer-safe and internal-only fields.
- Preserve auditability of stage changes and approvals.
- Use migrations for database changes.
- Add seed/demo data for one realistic opportunity so the full workflow can be demonstrated.
- Add automated tests for stage gates and proposal readiness.
- Run typecheck/build/tests before considering work complete.
- Do not weaken gates merely to make the demo easier.

## First Codex milestone
Deliver an end-to-end demonstrable vertical slice:

1. Login.
2. Admin creates a Sales user and an AI Architect user.
3. Create/import a lead.
4. Convert lead to opportunity.
5. Complete qualification and discovery gates.
6. Select a paid assessment.
7. Record assessment findings and recommended compute path.
8. Complete internal Solution Review.
9. Reach 100% Proposal Readiness.
10. Generate HTML proposal.
11. Open customer-safe Live Engagement Presentation with the current stage highlighted.
12. Generate/print proposal to PDF.

This vertical slice is more important than building many shallow modules.
