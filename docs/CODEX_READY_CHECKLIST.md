# Newneo AI Platform — Codex Ready Checklist

## Product decisions complete
- Positioning: Enterprise AI Platform + Deployment Engineering + AI Operations
- Primary promise: We bring enterprise AI into production
- Global, vendor-neutral product language
- Business-first sales and product experience
- Infrastructure and compute treated as deployment choices, not headline products
- customer lifecycle clarified as Deploy → Operate → Expand
- Platform is the production control layer
- agents are organizational objects; tasks are economic objects
- reusable skills are important, but the moat is broader operating intelligence
- Newneo requires a separate internal Admin Plane for customer, subscription, contract, technical and financial operations
- FinOps is cross-cutting for both customer and internal views
- AWS is the initial Newneo SaaS home, but the product must remain portable
- Public Sector/Sovereign requirements must be supported by the same core platform
- a future Service Provider/white-label edition must remain architecturally possible but is not V1 scope
- customer autonomy is the target operating model after onboarding and first production use cases
- Platform Support is included according to support tier; Managed AgentOps is a separate optional recurring service

## UX decisions complete
- Design Manifesto approved
- canonical Product Design System approved
- approved Agent Catalog / Agent Launch Guide reference is the primary visual north star
- Overview defined and prototyped
- Agent Catalog defined and prototyped
- Agent Launch Guide defined and prototyped
- Agent Detail defined and prototyped
- AgentOps fully defined in product/UX specification
- Governance defined and prototyped
- Progressive disclosure required
- One primary intention per screen
- Business language before technical language
- customer AI Platform and internal Newneo Admin Plane must remain separate experiences
- application UI should gain sophistication through precision, not decoration

## Visual implementation rule
Codex must implement the product shell and screens according to `NEWNEO_PRODUCT_DESIGN_SYSTEM.md` and `NEWNEO_AI_PLATFORM_DESIGN_MANIFESTO.md`.

Key rules:
- compact dark navy sidebar
- simple Newneo wordmark, not an ornamental logo tile
- predominantly white canvas
- visually quiet topbar
- thin neutral borders
- low or no card shadow by default
- moderate radii
- compact typography and forms
- restrained semantic colors
- blue primary action
- green success/healthy state
- real connector identities when available
- linear launch stepper
- no oversized hero cards or decorative waves in ordinary application workflows
- no unnecessary gradients, glows or dashboard decoration
- same core shell across Customer Platform, Business Platform and Admin Plane, with density changing by surface

## Core customer flow
`Overview → Agent Catalog → Use Case → Knowledge → Tools → Model & Runtime → Governance → Evaluate → Deploy → Agent Detail → AgentOps → FinOps`

## Engineering journey
`Business Outcome → Identity → Knowledge → Tools/MCP → Skills → Model & Runtime → Governance → Agent Version → Evaluate → Test → Approve → Production → AgentOps → FinOps → Business Outcome`

This journey is defined in `NEWNEO_ENGINEERING_JOURNEY.md` and should guide the first end-to-end implementation.

## Internal Newneo flow
`Admin Overview → Customers → Subscriptions → Usage → Contracts → Infrastructure → Incidents → FinOps → Analytics → Platform Operations`

## V1 product objects
- Organization
- Workspace
- Agent Template
- Agent
- Agent Version
- Knowledge Source
- Tool / MCP Connector
- Tool Action
- Model Endpoint
- Policy
- Evaluation Suite
- Evaluation Run
- Deployment
- Operational Metric
- Task / Execution Outcome
- Usage Record
- Subscription
- Contract Reference
- Cost Allocation
- Incident
- Audit Event

## Runtime principle
Newneo owns the product model and customer experience.
External model providers, clouds and agent runtimes connect through adapters.
V1 may use an existing agent runtime behind the Newneo abstraction.

## Deployment principle
The product must support the same customer flow across:
- Newneo SaaS
- Dedicated
- Customer Cloud / BYOC
- Private / On-Prem
- future disconnected/private environments

Newneo SaaS may initially run on AWS, but implementation should preserve portable primitives and avoid unnecessary AWS-only coupling.

## Production lifecycle
`Draft → Configure → Evaluate → Test → Approve → Production → Operate → New Version`

Production changes create a new version rather than editing the live version directly.

## Customer autonomy and support
Newneo should be heavily involved during onboarding and the first production use cases, then enable authorized customer teams to create, configure, evaluate and deploy additional agents within governance and approval rules.

Platform subscription should include:
- AgentOps product capabilities
- FinOps product capabilities
- Platform Support according to contracted support level

Managed AgentOps is a separate optional service where Newneo personnel actively monitor, analyze, recommend and operate alongside the customer.

## Economics and FinOps requirement
AgentOps and FinOps must support task-level operating economics over time, including:
- task outcome
- underlying usage/cost attribution
- AI Units
- cost per task
- cost per successful task
- spend by workspace/agent/model/runtime
- budgets and forecast
- escalation
- business KPI/value when available

Internal Newneo FinOps must additionally support:
- revenue by customer
- direct cost
- gross profit
- gross margin
- customer profitability
- margin by deployment model
- margin by model/runtime
- infrastructure/provider efficiency

Do not make agent count the core billing assumption in the data model.

## Admin Plane requirement
Newneo needs an internal-only operating console for the full customer estate.

It should be designed around one canonical Customer 360 record containing commercial, technical and financial context.

V1 should establish the data model and initial views for:
- Customers
- Subscriptions
- Usage
- Contracts
- Infrastructure / deployment status
- Incidents
- FinOps
- Analytics

## Reusable intelligence requirement
Support reusable skills and versioned enterprise patterns, but do not architect the product as if owning a closed skill catalog is the primary moat.

Skill maturity should be able to evolve toward:
`Experimental → Validated → Production Ready → Proven at Scale`

## Future-compatible hierarchy
V1 customer hierarchy remains:
`Organization → Workspace → Agent → Task`

Do not implement a Service Provider layer now, but avoid structural assumptions that would make this impossible later:
`Provider (future optional) → Organization → Workspace → Agent → Task`

## V1 build priority
1. App foundation and canonical design system
2. Organization/workspace context
3. Agent Catalog
4. Agent/version lifecycle
5. Knowledge registry
6. Tools/MCP registry
7. Model registry
8. Governance and approval flow
9. Evaluation flow
10. Deployment lifecycle
11. Agent Detail
12. AgentOps
13. Customer FinOps foundation
14. Newneo Admin Plane foundation
15. Internal FinOps / Customer 360
16. Audit history and operational hardening

## First vertical slice
Customer Service Agent:
1. Select approved agent template
2. Define business use case
3. Connect one knowledge source
4. Connect one tool/action
5. Select approved model/runtime
6. Apply organization rules
7. Run evaluation suite
8. Deploy to Test
9. Approve and promote to Production
10. View production health, task outcomes and operating economics
11. Surface usage/cost in customer FinOps
12. Surface the same customer in Newneo Admin Customer 360
13. Create a new version and repeat safely

## Reference documents
Read before implementation:
- `NEWNEO_RESPONSIBILITY_CHARTER.md`
- `NEWNEO_PRODUCT_DECISIONS_ADDENDUM_2026-09-14.md`
- `NEWNEO_ENGINEERING_JOURNEY.md`
- `NEWNEO_PLATFORM_OPERATING_MODEL.md`
- `NEWNEO_ADMIN_PLANE_SPEC.md`
- `NEWNEO_FINOPS_SPEC.md`
- `NEWNEO_AI_PLATFORM_SPEC.md`
- `NEWNEO_AI_PLATFORM_V1_UX.md`
- `NEWNEO_AI_PLATFORM_DESIGN_MANIFESTO.md`
- `NEWNEO_PRODUCT_DESIGN_SYSTEM.md`
- `NEWNEO_EMPLOYEE_STUDY_GUIDE.md`
- `NEWNEO_COMMERCIAL_MODEL.md`
- `NEWNEO_SKILLS_STRATEGY.md`
- `NEWNEO_IP_AND_CONTRACT_PRINCIPLES.md`
- `CODEX_HANDOFF.md`
- `SALES_ENGAGEMENT_PLAYBOOK.md`

## Recommended technical baseline
- Next.js + TypeScript frontend
- TypeScript modular backend
- PostgreSQL as primary platform database
- OIDC identity abstraction
- S3-compatible object storage abstraction
- OpenTelemetry for traces and metrics
- PostgreSQL-backed background jobs for V1 where practical
- containerized packaging from the beginning
- runtime adapter boundary around the first agent runtime/framework

The implementation should avoid mandatory cloud-only dependencies so the same product can support SaaS and customer-controlled deployments.

## Handoff rule
Codex should optimize for implementation quality, maintainability, tests and working end-to-end behavior. Product scope, UX principles, visual design system, commercial positioning, IP boundaries, Admin Plane boundaries, FinOps semantics, support boundaries and pricing architecture should not be reinterpreted without an explicit product decision.
