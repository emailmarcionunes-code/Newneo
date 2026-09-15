# Newneo FinOps — Product Specification

## Purpose
FinOps is a cross-cutting capability for both Newneo and its customers.

Customer FinOps answers:
**What is our enterprise AI costing, what value is it creating and where can we optimize?**

Newneo Internal FinOps answers:
**What does each customer, workload and task cost Newneo, what revenue does it generate and what margin are we achieving?**

## Customer FinOps
Expose clear business-facing economics without forcing customers to understand tokens or low-level provider billing.

Core views:
- AI Units consumed
- tasks completed
- cost per task
- cost per successful task
- spend by workspace
- spend by agent
- spend by model/runtime
- spend by environment
- usage trend
- forecast
- budget consumption
- business KPI / estimated value where measurable

## Internal FinOps
Track fully loaded unit economics by customer and workload.

Cost categories may include:
- model inference
- embeddings / retrieval
- external APIs and tools
- compute
- GPU consumption
- storage
- databases
- networking where material
- telemetry
- platform operations
- support allocation
- managed AgentOps allocation

Revenue categories may include:
- platform subscription
- usage / AI Units
- managed AgentOps
- deployment engineering
- other recurring services

Core internal metrics:
- revenue per customer
- recurring revenue
- variable revenue
- direct cost
- gross profit
- gross margin
- cost per task
- cost per successful task
- margin per AI Unit
- margin by deployment model
- margin by model/provider
- margin by customer

## Task economics
Tasks are the preferred economic object for business measurement.

A task can contain multiple model calls, retrievals, tool actions, approvals and retries.

Newneo should attribute the underlying cost to the task and then to:
`Task → Agent → Workspace → Customer → Newneo`

## AI Units
AI Units provide a normalized customer-facing consumption model.

The platform should maintain a mapping between underlying resource cost and AI Unit consumption so Newneo can change provider/runtime architecture without exposing infrastructure complexity to customers.

AI Unit policy must be versioned and auditable.

## Budgets and controls
Customer capabilities should evolve toward:
- monthly/annual budget
- AI Unit allowance
- usage alerts
- forecast to period end
- workspace budgets
- agent budgets
- soft limits
- hard limits when appropriate
- approval for exceptional spend

Internal capabilities should include:
- cost anomaly detection
- margin anomaly detection
- customer profitability alerts
- model/runtime cost comparison
- infrastructure efficiency
- unused committed capacity

## Optimization
FinOps should recommend actions, not only report spend.

Examples:
- lower-cost approved model for a workload
- reduce unnecessary tool/model calls
- improve retrieval to reduce repeated inference
- batch appropriate workloads
- move workloads between execution environments when policy allows
- adjust reserved/committed infrastructure
- identify low-value high-cost agents

Optimization must respect quality, governance, privacy and data-residency constraints.

Cheapest is not automatically best.

## Relationship with AgentOps
AgentOps and FinOps overlap but are not identical.

AgentOps answers:
**Is the AI working well?**

FinOps answers:
**Is the AI economically efficient?**

Together they should expose:
`Quality + Reliability + Governance + Economics + Business Outcome`

## Principle
**Every production task should eventually be measurable in both operational and economic terms.**
