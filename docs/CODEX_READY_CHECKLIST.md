# Newneo AI Platform — Codex Ready Checklist

## Product decisions complete
- Positioning: Enterprise AI Platform + Deployment Engineering + AI Operations
- Primary promise: We bring enterprise AI into production
- Global, vendor-neutral product language
- Business-first sales and product experience
- Infrastructure and compute treated as deployment choices, not headline products

## UX decisions complete
- Design Manifesto approved
- Overview defined and prototyped
- Agent Catalog defined and prototyped
- Agent Launch Guide defined and prototyped
- Agent Detail defined and prototyped
- AgentOps fully defined in product/UX specification
- Governance defined and prototyped
- Progressive disclosure required
- One primary intention per screen
- Business language before technical language

## Core customer flow
`Overview → Agent Catalog → Use Case → Knowledge → Tools → Model & Runtime → Governance → Evaluate → Deploy → Agent Detail → AgentOps`

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

## Production lifecycle
`Draft → Configure → Evaluate → Test → Approve → Production → Operate → New Version`

Production changes create a new version rather than editing the live version directly.

## V1 build priority
1. App foundation and design system
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
13. Audit history and operational hardening

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
10. View production health and outcomes
11. Create a new version and repeat safely

## Reference documents
Read before implementation:
- `NEWNEO_AI_PLATFORM_SPEC.md`
- `NEWNEO_AI_PLATFORM_V1_UX.md`
- `NEWNEO_AI_PLATFORM_DESIGN_MANIFESTO.md`
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
Codex should now optimize for implementation quality, maintainability, tests and working end-to-end behavior. Product scope, UX principles and commercial positioning should not be reinterpreted without an explicit product decision.
