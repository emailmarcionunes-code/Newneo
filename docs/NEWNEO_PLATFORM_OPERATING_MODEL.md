# Newneo Platform Operating Model

## Product surfaces
Newneo operates four distinct product surfaces:

1. Newneo Website — public positioning and lead generation.
2. Newneo Business Platform — internal CRM, assessments, proposals and delivery handoff.
3. Newneo AI Platform — customer-facing control plane for enterprise AI.
4. Newneo Admin Plane — internal operations console for managing the full customer estate.

## Newneo Admin Plane
The Admin Plane is not visible to customer users.

Hierarchy:
`Newneo Admin Plane → Customer Organization → Workspace → Agent → Task`

It should manage customer organizations, subscriptions, usage, contracts, renewals, deployment model, region, instance health, incidents, infrastructure summary, revenue, cost, margin and cross-customer analytics.

Principle:
**One customer record. One operational truth.**

## FinOps
FinOps is a shared capability across customer and internal experiences.

Customer FinOps should show AI Units, spend, forecast, budgets, cost per task, cost per successful task and cost by workspace, agent, model or runtime.

Internal FinOps should show direct cost, revenue, gross profit, gross margin, margin by customer, margin by deployment model, task economics and provider/infrastructure efficiency.

Principle:
**Every production task should eventually be measurable in both operational and economic terms.**

## Hosting direction
Newneo SaaS should use AWS as the initial primary hosting environment while preserving cloud-neutral product architecture.

Core product design should favor portable primitives:
- containers
- PostgreSQL
- OIDC
- S3-compatible object storage
- OpenTelemetry
- portable job and runtime abstractions

Execution may occur in Newneo AWS, customer cloud, private infrastructure or hybrid environments.

## Public Sector and Sovereign AI
Public Sector is a strategic vertical of the same core platform, not a separate codebase.

The architecture should support data sovereignty, private execution, customer-controlled models, strong approvals, auditability, data residency and future disconnected environments where required.

A future Sovereign AI edition may package these capabilities commercially without forking the core product.

## Future Service Provider Edition
GPU centers, AI factories, data centers, telcos and regional clouds may later use Newneo to serve their own customer organizations.

Future-compatible hierarchy:
`Provider → Customer Organization → Workspace → Agent → Task`

Possible future capabilities include provider console, tenant provisioning, white label or co-branding, quotas, provider analytics and provider billing.

This is not V1 scope. Architecture should preserve the option without implementing it now.

Principle:
**One core platform. Multiple future commercial editions.**
