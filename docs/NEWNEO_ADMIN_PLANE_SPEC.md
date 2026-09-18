# Newneo Admin Plane — Product Specification

## Purpose
The Newneo Admin Plane is the internal operating console used by Newneo to manage the full customer base across commercial, technical and financial dimensions.

It is separate from the customer-facing Newneo AI Platform.

Customer Platform answers:
**How is my enterprise AI performing?**

Newneo Admin Plane answers:
**How is the entire Newneo customer estate performing technically, commercially and financially?**

## Operating hierarchy
Internal operating hierarchy:
`Newneo Admin Plane → Customer Organization → Workspace → Agent → Task`

Future-compatible hierarchy:
`Provider (optional) → Customer Organization → Workspace → Agent → Task`

The optional Provider layer must not be required in V1, but the architecture should not prevent it later.

## Admin navigation
Recommended V1 navigation:
1. Overview
2. Customers
3. Subscriptions
4. Usage
5. Contracts
6. Infrastructure
7. Incidents
8. FinOps
9. Analytics
10. Platform Operations
11. Administration

## Overview
The internal overview should summarize the business and technical estate.

Core metrics:
- active customer organizations
- production agents
- tasks this month
- task success rate
- platform MRR / ARR
- usage revenue
- gross margin
- infrastructure cost
- AI/model cost
- customers requiring attention
- open critical incidents
- renewals due

## Customer 360
Each customer organization must have one canonical operational-commercial profile.

Suggested fields:
- legal/customer name
- customer status
- customer owner
- deployment model
- region / data boundary
- plan / subscription
- platform fee
- contracted AI Units
- consumed AI Units
- overage
- contract start/end
- renewal date
- environments
- production agents
- tasks
- task success
- current cost
- current revenue
- gross margin
- incidents
- support status
- implementation status
- risk / attention status

Newneo should be able to answer for any customer:
**Who are they, what did they buy, where are they running, how much do they use, what do they cost, what do they pay, when do they renew and are they healthy?**

## Subscriptions
Track:
- platform edition
- subscription status
- billing cadence
- platform fee
- included AI Units
- usage tier
- overage rules
- managed AgentOps
- support entitlement
- renewal date
- commercial exceptions

V1 can maintain subscription data internally even if invoicing remains external.

## Contracts
The Admin Plane should link commercial records to contracts without becoming a full contract-authoring system.

Track:
- MSA status
- order form
- SOWs
- DPA
- security schedule
- SLA
- jurisdiction schedules
- effective date
- renewal / termination date
- contract owner
- document references

## Usage
Usage should be traceable from customer to workspace, agent and task.

Track:
- tasks
- AI Units
- model usage
- retrieval usage
- tool usage
- compute allocation
- storage
- telemetry
- usage trends
- forecast

## Infrastructure
The Admin Plane should know enough about each deployment to operate it without becoming a data-center management platform.

Track:
- deployment model
- region
- runtime type
- current platform version
- environment health
- connectivity status
- upgrade status
- backup status
- deployment boundary
- capacity summary where Newneo is responsible

## Incidents
Internal operations should aggregate incidents across customers.

Track:
- severity
- customer
- affected agent/workspace
- business impact
- likely cause
- owner
- status
- time to acknowledge
- time to recover
- post-incident action

## Analytics
Cross-customer analytics should support:
- revenue growth
- usage growth
- margin trend
- agent adoption
- task volume
- task success
- cost per successful task
- expansion signals
- renewal risk
- incident trends
- support load
- deployment mix

## Access model
The Admin Plane is internal and must not be exposed to customer users.

Example internal roles:
- Newneo Super Admin
- Customer Operations
- Finance
- FinOps
- Support / SRE
- Deployment Engineering
- Sales / Account Management
- Executive Read Only

Role-based access must prevent unnecessary exposure of customer commercial or operational data.

## Product principle
**One customer record. One operational truth.**

Commercial, technical and financial views should reconcile around the same customer organization rather than living in unrelated spreadsheets and tools.
