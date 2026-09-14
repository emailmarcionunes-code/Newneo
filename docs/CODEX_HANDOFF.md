# Newneo — Codex Implementation Handoff

## Mission
Continue Newneo as three coordinated product surfaces:

1. `newneo-website` — public marketing, education, SEO, public HTML presentations and lead generation.
2. `newneo-business-platform` — authenticated internal operating system for CRM, sales playbook, assessments, customer-specific presentations, proposals, admin and delivery handoff.
3. `newneo-ai-platform` — customer-facing SaaS/control plane for building, governing, deploying and operating enterprise AI.

The current repository contains the public website plus authoritative product specifications.

## Current public site repository
Repository: `emailmarcionunes-code/Newneo`
Working branch: `newneo-site-v1`
PR: `#1 Build complete Newneo enterprise AI website in Next.js`
Base branch: `main`

Do not merge to `main` unless explicitly instructed.

## Strategic positioning
Newneo is no longer positioned publicly as infrastructure-first.

Primary public positioning:
**Enterprise AI Platform + Deployment Engineering + AI Operations**

Primary commercial promise:
**We bring enterprise AI into production.**

Newneo remains capable of infrastructure, compute, networking, private AI and hybrid AI engineering, but these are deployment capabilities rather than headline products.

Customer engagement model:
`Discover → Assess → Prove → Deploy → Operate`

Commercial principles:
- Start with the business workflow and desired outcome.
- Discovery is conversational and free.
- Assessment is engineering and paid.
- Assessment may be credited toward a subsequent Newneo implementation under agreed commercial terms.
- POCs are paid.
- No implementation proposal without a Newneo Assessment or equivalent validated by Newneo.
- The formal proposal is the last pre-sales artifact.
- Meet for decisions, not for information transfer.
- Enter once. Reuse everywhere.
- Infrastructure is a deployment decision, not the headline.
- Remain vendor-neutral across models, clouds and private runtimes.

## Deployment principle
Never assume every customer needs a local AI network or GPU cluster.

Newneo may recommend and integrate:
- managed AI/model APIs
- customer AWS/Azure/GCP
- private AI
- hybrid AI
- private Kubernetes/OpenShift
- NVIDIA/private model environments

Decision dimensions:
- privacy
- performance
- scale
- cost
- control

Reuse the customer environment where it works. Add specialized infrastructure only when justified by the workload.

Newneo assumes responsibility for architecture, integration and deployment, even when cloud or infrastructure is supplied by the customer or a partner.

## Public website work
Preserve the current design direction:
- dark-first premium enterprise design
- Newneo green `#60d394`
- green-circle logo mark
- restrained enterprise aesthetic
- progressive disclosure
- strong 5-second positioning
- English canonical language

The homepage narrative should prioritize:
1. Newneo AI Platform
2. Deployment Engineering
3. AI Operations

Infrastructure, compute and private/hybrid AI remain available as deeper capability pages, not top-level commercial pillars.

Primary homepage message:
**We bring enterprise AI into production.**

Support message:
Newneo combines an enterprise AI platform, deployment engineering and ongoing AI operations to turn business workflows into governed production systems.

## Public HTML Presentation System
Public presentations are a core website feature.

Primary commercial presentation:
- `/presentations/newneo`

Detailed engagement presentation:
- `/presentations/engagement`

The About Newneo presentation should tell the commercial story:
- who Newneo is
- business-first approach
- Newneo AI Platform
- deployment engineering
- AI Operations / AgentOps
- vendor-neutral runtime choices
- Discover → Assess → Prove → Deploy → Operate
- land-and-expand model

Public presentations are the canonical material used by customers, Sales, SREs, architects and delivery teams.

## Newneo Business Platform
Create the internal platform as a separate app/repository.

Purpose:
- CRM
- qualification
- assessments
- customer-specific commercial presentation
- proposal readiness
- proposal generation
- delivery handoff
- commercial approvals

Preferred stack:
- Next.js
- TypeScript
- PostgreSQL / Supabase
- Supabase Auth initially
- RBAC
- object storage
- HTML-to-PDF
- audit events
- opportunity state machine

Read `docs/NEWNEO_PLATFORM_PRODUCT_SPEC.md` for the business-platform requirements.

## Newneo AI Platform
Treat the customer-facing AI platform as a separate strategic product, not a future CRM feature.

Read `docs/NEWNEO_AI_PLATFORM_SPEC.md` before implementation.

Core product model:
`Build → Knowledge → Connect → Intelligence → Govern → Evaluate & Deploy → Operate`

V1 navigation:
- Overview
- Workspaces
- Agent Catalog
- Agent Builder
- Knowledge
- Tools & MCP
- Models
- Evaluations
- Security & Governance
- Deployments
- AgentOps
- Settings / Administration

The platform is a vendor-neutral control plane above cloud, private and hybrid AI execution environments.

The platform must not attempt to replace AWS, Azure, GCP, model providers, Kubernetes/OpenShift or customer infrastructure. It orchestrates and governs AI workloads across them.

## AI Platform V1 principles
- multi-tenant organization/workspace model
- customer-safe SaaS experience
- RBAC and audit from day one
- model-agnostic
- external runtime integration is acceptable initially
- do not build a new LLM runtime unless required
- reusable assets across agents are core: knowledge, tools, MCP, policies, evaluation suites
- self-service must remain governed
- every production agent should have an evaluation suite
- AgentOps combines quality, reliability, security, economics and business outcomes

## Newneo Business Platform → AI Platform integration
When an opportunity becomes an active deployment, the Business Platform should eventually be able to provision:
- customer organization
- customer workspace
- approved users
- engagement metadata

in Newneo AI Platform.

Do not duplicate CRM/commercial data unnecessarily inside the AI Platform.

## Opportunity workflow
Internal stages:
`New Lead → Qualified → Discovery Complete → Assessment Sold → Assessment Complete → Solution Review → Scope & Commercial Review → Proposal Ready → Proposal → Won/Lost → Delivery → AgentOps`

Enforce stage gates in code with conditional requirements.

## Proposal-last rule
`Generate Proposal` remains disabled until required Proposal Readiness reaches 100%.

The proposal should be concise and link/attach detailed technical documents rather than duplicate them.

Recommended proposal structure:
1. Executive Summary
2. What We Understood
3. Recommended Engagement / Solution
4. Scope & Deliverables
5. Customer / Newneo Responsibilities
6. Assumptions & Key Dependencies
7. Success / Acceptance Criteria
8. Timeline
9. Commercials
10. Optional Training / Enablement
11. Next Steps

## Assessment Engine
Assessment families remain available, but public sales language should emphasize the business outcome rather than selling infrastructure assessments as the primary company identity.

Assessment types:
- Business & AI Opportunity
- Infrastructure Readiness
- AI Compute
- Knowledge & RAG
- Integration & MCP
- AI Security & Governance
- Production Readiness
- AgentOps Baseline

Infrastructure/compute assessments are selected only when the use case requires them.

## Newneo Academy / Learning Factory — future
Maintain extensibility for courses, modules, lessons, labs, learning paths and customer training packages.

## Read these first
Before coding, read:
- `docs/NEWNEO_AI_PLATFORM_SPEC.md`
- `docs/NEWNEO_PLATFORM_PRODUCT_SPEC.md`
- `docs/SALES_ENGAGEMENT_PLAYBOOK.md`
- `docs/PUBLIC_PRESENTATIONS_AND_PROPOSAL_FLOW.md`
- `docs/LEARNING_FACTORY_ROADMAP.md`

## Engineering expectations
- Prefer simple, explicit architecture over premature abstraction.
- Use typed domain models.
- Enforce authorization server-side.
- Separate customer-safe and internal-only data.
- Preserve auditability.
- Use migrations.
- Add realistic seed/demo data.
- Add automated tests for gates, permissions and critical workflows.
- Run typecheck/build/tests before considering work complete.

## Next product-design milestone
Before deep implementation of Newneo AI Platform, define and prototype one end-to-end customer path:

1. Customer organization/workspace exists.
2. User opens Agent Catalog.
3. Selects one approved agent pattern.
4. Connects a knowledge source.
5. Selects or connects one enterprise tool/MCP endpoint.
6. Selects an approved model/runtime.
7. Applies permissions and approval rules.
8. Runs an evaluation suite.
9. Promotes from Test to Production.
10. Views health, task success, cost, incidents and business KPI in AgentOps.

This vertical slice is more important than building many shallow modules.
