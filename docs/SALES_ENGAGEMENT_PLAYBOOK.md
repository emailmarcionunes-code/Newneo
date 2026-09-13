# Newneo Sales & Engagement Playbook

## Purpose
Create a repeatable commercial process that reduces friction, protects engineering time and produces proposals only from validated information.

Public engagement model:
`Discover → Assess → Prove → Deploy → Operate`

Internal pipeline:
`New Lead → Qualified → Discovery Complete → Assessment Sold → Assessment Complete → Solution Review → Scope & Commercial Review → Proposal Ready → Proposal → Won/Lost → Delivery → AgentOps`

## Operating principles
- Discovery is conversational; Assessment is engineering.
- Assessment is paid.
- No implementation proposal without a Newneo Assessment or an equivalent assessment validated by Newneo.
- The proposal is the last pre-sales artifact.
- Meet for decisions, not for information transfer.
- Enter once. Reuse everywhere.
- Reuse what the customer already has; add infrastructure only when the workload requires it.
- Do not commoditize complex enterprise AI with an instant price calculator.
- The public Newneo HTML journey is the canonical presentation used by customers and Newneo teams.

## Canonical public presentation
The standard Newneo engagement presentation is public and belongs to the website.

It must:
- explain Discover → Assess → Prove → Deploy → Operate
- be usable without a seller
- be the default presentation used by Sales, SREs and architects
- be suitable for screen sharing
- be version-controlled in HTML
- avoid customer-specific or confidential information

A website visitor should be able to navigate the journey and understand Newneo's method, maturity and delivery model before speaking with the company.

## Personalized opportunity presentation
When a seller presents to a specific customer, the system generates a personalized version based on the canonical public presentation.

It may add:
- customer name and approved logo
- customer objective
- what Newneo understood
- current engagement stage
- completed steps
- approved findings
- recommended architecture or path
- next decision
- POC scope/results when applicable
- proposal status

The essence, sequence, language and methodology remain the same as the public version.

Internal-only data must never appear in the customer presentation.

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

## Stage 7 — Scope & Commercial Review
Goal: convert validated technical and business decisions into a proposal-ready commercial package.

Required, when applicable:
- final recommended path
- scope
- deliverables
- responsibilities
- assumptions
- exclusions
- dependencies
- risks
- acceptance/success criteria
- effort
- timeline
- pricing
- approvals
- legal/commercial terms
- optional enablement/training

Only fields relevant to the engagement are mandatory.

## Stage 8 — Proposal Readiness
The system displays readiness by domain.

Example:
- Customer / Sponsor ✓
- Business Case ✓
- Assessment ✓
- Recommended Approach ✓
- Architecture ✓
- Scope ✓
- Risks ✓
- Effort Estimate ✓
- Pricing ✓
- Commercial Approval ✓
- Legal Terms ✓

`Generate Proposal` remains disabled until all required gates are complete.

## Stage 9 — Proposal
The proposal is the final pre-sales artifact and is generated from the opportunity source of truth.

It should be concise by default.

Seller may edit controlled narrative fields, but should not recreate known data manually.

Recommended proposal sections:
- Executive Summary
- What We Understood
- Recommended Engagement / Solution
- Scope & Deliverables
- Customer / Newneo Responsibilities
- Assumptions & Key Dependencies
- Success / Acceptance Criteria
- Timeline
- Commercials
- Optional Training / Enablement
- Next Steps

Detailed assessment findings, HLD/LLD, technical reports and test evidence should be linked or attached rather than duplicated.

## Stage 10 — POC / Prove
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

## Stage 11 — Production Readiness
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

## Stage 12 — Deploy
Convert validated design into a production system.

Output:
- production environment
- documented architecture
- tests
- acceptance evidence
- operational runbooks
- handoff

## Stage 13 — Operate / AgentOps
Operate:
- quality
- reliability
- security
- economics
- business outcomes

Recurring service should include baseline, SLOs, continuous evaluation and improvement backlog.

## Meeting policy
Default principle: **Meet for decisions, not for information transfer.**

Use public presentations, personalized engagement views and portal content for status, findings and context. Use meetings for:
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
