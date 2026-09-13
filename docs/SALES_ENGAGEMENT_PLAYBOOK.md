# Newneo Sales & Engagement Playbook

## Purpose
Create a repeatable commercial process that reduces friction, protects engineering time and produces proposals only from validated information.

Public engagement model:
`Discover → Assess → Prove → Deploy → Operate`

Internal pipeline:
`New Lead → Qualified → Discovery Complete → Assessment Sold → Assessment Complete → Solution Review → Proposal → Won/Lost → Delivery → AgentOps`

## Operating principles
- Discovery is conversational; Assessment is engineering.
- Assessment is paid.
- No implementation proposal without a Newneo Assessment or an equivalent assessment validated by Newneo.
- Meet for decisions, not for information transfer.
- Enter once. Reuse everywhere.
- Reuse what the customer already has; add infrastructure only when the workload requires it.
- Do not commoditize complex enterprise AI with an instant price calculator.

## Stage 1 — New Lead
Goal: capture enough information to decide whether a human follow-up is warranted.

Sources:
- website Start an Assessment form
- seller-created lead
- referral
- partner
- event
- inbound email

Required information:
- company
- contact
- business objective
- current AI stage
- systems involved if known
- expected outcome
- owner

Output:
- qualified or disqualified lead
- initial opportunity classification

## Stage 2 — Qualification
Goal: determine fit, urgency and likely engagement path.

Seller captures:
- business problem
- current stage: idea / experiment / POC / production
- sponsor or business owner
- urgency
- budget signal if available
- business process
- knowledge/RAG requirement
- tool/API/MCP requirement
- cloud/private/hybrid expectations
- local compute state
- security/regulatory constraints
- expected scale

System should suggest a likely assessment path.

Do not produce an implementation proposal here.

## Stage 3 — Discovery
Goal: understand the process well enough to scope engineering work.

Business discovery:
- What process are we improving?
- Who owns it?
- How does it work today?
- What is slow, costly, inconsistent or risky?
- What decisions are made today?
- What actions are taken today?
- What result should improve?
- How will success be measured?

Technology discovery:
- Systems involved
- Data sources
- Existing AI use
- Cloud services
- Local infrastructure
- AI compute availability
- Identity model
- Security constraints
- Regulatory constraints
- Integration methods

Discovery exit criteria:
- business process defined
- owner/sponsor identified
- expected outcome defined
- systems identified
- key constraints identified
- assessment path recommended

## Stage 4 — Assessment Proposal
Goal: sell the engineering work required to make the next decision responsibly.

Assessment proposal must include:
- objective
- scope
- activities
- inputs required from customer
- deliverables
- schedule
- price
- commercial terms
- assessment credit rule if applicable

Assessment families:
- Business & AI Opportunity
- Infrastructure Readiness
- AI Compute
- Knowledge & RAG
- Integration & MCP
- AI Security & Governance
- Production Readiness
- AgentOps Baseline

## Stage 5 — Assessment Execution
Goal: produce a decision-ready engineering baseline.

Typical outputs:
- current state
- gap analysis
- architecture recommendation
- execution model recommendation
- risks
- assumptions
- dependencies
- success criteria
- recommended next step

For AI Compute, recommendation must select or compare:
- Cloud AI
- Compute Starter
- Private AI Cluster
- Hybrid AI

using:
- privacy
- performance
- scale
- cost
- control

## Stage 6 — Internal Solution Review
Participants:
- Sales
- AI Architect
- relevant SME/SRE
- commercial approver when needed

Review dimensions:
- business value
- technical feasibility
- infrastructure readiness
- compute readiness
- data/knowledge readiness
- integration complexity
- security/governance risk
- delivery effort
- commercial model
- expected customer outcome

Allowed decisions:
- No-Go
- More Discovery
- Additional Assessment
- POC
- Production Deployment

## Stage 7 — Proposal Readiness
The system displays readiness by domain.

Example:
- Business Case ✓
- Sponsor ✓
- Assessment ✓
- Architecture ✓
- Scope ✓
- Risks ✓
- Effort Estimate ✓
- Pricing ✓
- Commercial Approval ✓
- Legal Terms ✓

`Generate Proposal` remains disabled until all required gates are complete.

## Stage 8 — Proposal
Proposal is generated from the opportunity source of truth.

Seller may edit controlled narrative fields, but should not recreate known data manually.

Proposal sections:
- Executive Summary
- Customer Challenge
- Current State
- Proposed Solution
- Architecture
- Scope
- Deliverables
- Responsibilities
- Assumptions
- Exclusions
- Timeline
- Acceptance Criteria
- Pricing
- Commercial Terms
- Enablement / Training Options
- Next Steps

## Stage 9 — POC / Prove
POC is paid.

POC must define before execution:
- hypothesis
- bounded scope
- inputs
- success criteria
- evaluation method
- Go / No-Go decision rule

Outputs:
- working POC
- Evaluation Report
- lessons learned
- production recommendation

## Stage 10 — Production Readiness
Before production, validate the difference between the POC and supportable production.

Review:
- security
- identity
- integrations
- HA/resilience
- observability
- evaluation
- data lifecycle
- versioning
- CI/CD
- rollback
- support model
- SLOs

## Stage 11 — Deploy
Convert validated design into a production system.

Output:
- production environment
- documented architecture
- tests
- acceptance evidence
- operational runbooks
- handoff

## Stage 12 — Operate / AgentOps
Operate:
- quality
- reliability
- security
- economics
- business outcomes

Recurring service should include baseline, SLOs, continuous evaluation and improvement backlog.

## Live Engagement Presentation
Every active opportunity must have an always-current HTML presentation.

Purpose:
- reduce repetitive meetings
- help the customer understand the full journey
- show current position clearly
- keep seller/SRE messaging consistent
- avoid deck recreation

Permanent engagement bar:
`Discover → Assess → Prove → Deploy → Operate`

Presentation sections appear progressively as data becomes available:
- Customer Challenge
- Newneo Process
- Where We Are
- What We Understood
- Current State
- Findings
- Recommended Architecture
- Recommended Path
- POC Scope / Results
- Proposal Status
- Next Decision

## Meeting policy
Default principle: **Meet for decisions, not for information transfer.**

Use portal/presentation for status, findings and context. Use meetings for:
- clarification
- architecture decisions
- tradeoffs
- approvals
- negotiation
- executive alignment

## Training cross-sell
The proposal engine should recommend training/enablement based on project scope.

Examples:
- AI Infrastructure Foundations
- AI Compute & Runtime Fundamentals
- Enterprise RAG Design
- MCP & Enterprise Actions
- Enterprise Agent Engineering
- AI Security & Governance
- AI Evaluation & Testing
- Production AI Deployment
- Operating AI in Production
