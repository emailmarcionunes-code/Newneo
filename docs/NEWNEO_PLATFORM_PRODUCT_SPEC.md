# Newneo Platform — Product Specification

## Purpose
Newneo Platform is the internal operating system for the commercial and delivery lifecycle of enterprise AI engagements.

Core principle: **Enter once. Reuse everywhere.**

The opportunity is the source of truth. CRM views, sales playbooks, assessments, customer presentations, proposals and delivery handoff all render from the same structured opportunity data.

## Repository strategy
Public website and internal platform must be separate applications and repositories.

- `newneo-website`: public website, SEO, lead generation, public assessment intake and canonical public HTML presentations.
- `newneo-platform`: authenticated internal application, CRM, playbooks, assessments, personalized customer presentations, proposals, admin and future learning modules.

The platform should run on a separate authenticated domain such as `platform.newneo.ai`. Customer-facing engagement links can later use `engage.newneo.ai`.

## Initial modules
1. CRM
2. Lead Qualification
3. Sales & Engagement Playbook
4. Assessment Engine
5. Personalized Live Engagement Presentation
6. Proposal Readiness
7. Proposal Engine
8. Admin & User Management
9. Customer Portal / Secure Share Links

Future modules:
10. Delivery Workspace
11. AgentOps Customer Workspace
12. Newneo Academy / Learning Factory

## Core customer lifecycle
`Lead → Qualification → Discovery → Paid Assessment → Solution Review → Scope & Commercial Review → Proposal Ready → Proposal → POC / Deploy → Production → AgentOps`

Public engagement language:
`Discover → Assess → Prove → Deploy → Operate`

## Public presentation model
The canonical Newneo journey presentation is public website content, not CRM content.

The website owns the generic, public presentation of:
`Discover → Assess → Prove → Deploy → Operate`

This presentation must be usable by:
- public website visitors
- customers independently
- Sales during meetings
- SREs and architects during technical/commercial conversations
- internal Newneo teams as the canonical methodology reference

The internal platform does not recreate this narrative from scratch. It reuses the same presentation structure and design language for customer-specific opportunity presentations.

## Personalized customer presentation
Every active opportunity may receive a customer-safe HTML presentation generated from live opportunity data.

It should inherit the canonical public journey and add only approved customer-specific data such as:
- customer name and approved logo
- customer challenge
- what Newneo understood
- current engagement stage
- completed steps
- assessment findings approved for customer visibility
- recommended architecture
- recommended path
- POC scope/results when relevant
- next decision
- proposal status

The essence, sequence and methodology must remain consistent with the public presentation.

The presentation stores no duplicate business data. It renders opportunity data.

Internal-only information must never be visible in customer mode.

## Core entities
At minimum:
- users
- roles
- teams
- companies
- contacts
- leads
- opportunities
- opportunity_members
- activities
- discovery_answers
- opportunity_requirements
- assessments
- assessment_types
- assessment_findings
- architectures
- risks
- success_criteria
- proposal_versions
- proposal_sections
- approvals
- documents
- customer_links
- audit_events

Future learning entities:
- courses
- course_modules
- lessons
- learning_paths
- customer_enrollments
- project_training_packages

## Roles
Initial roles:
- Admin
- Sales
- Sales Manager
- AI Architect
- SME / SRE
- Delivery Manager
- Delivery Engineer
- Finance / Commercial Approver

Customer access is separate and should never expose internal-only fields.

## Opportunity as source of truth
An opportunity should hold or reference:
- company and contacts
- business objective
- current process
- target process
- current AI maturity
- expected business outcome
- systems involved
- knowledge/data requirements
- actions/integrations required
- security/regulatory constraints
- expected scale
- infrastructure state
- compute state
- recommended execution model
- assessment requirements
- architecture
- risks
- success criteria
- effort estimate
- commercial model
- proposal readiness

Every downstream artifact should reuse this data.

## Stage gates
The system must prevent stage advancement when required information is missing.

Requirements should be conditional by engagement type so the system covers necessary pre-sales work without creating unnecessary administrative friction.

### Lead → Qualified
Required:
- company
- primary contact
- business problem
- current stage
- source
- owner

### Qualified → Discovery Complete
Required:
- business process
- business owner / sponsor
- expected outcome
- systems involved
- AI maturity
- constraints
- assessment path recommendation

### Discovery Complete → Assessment Proposed
Required:
- assessment type
- assessment objective
- assessment scope
- expected deliverables
- commercial owner

### Assessment Complete → Solution Review
Required:
- findings
- architecture recommendation when applicable
- risks
- success criteria
- recommended next step

### Solution Review → Scope & Commercial Review
Required when applicable:
- approved recommended approach
- scope
- deliverables
- responsibilities
- assumptions
- exclusions
- dependencies
- delivery estimate
- timeline
- pricing model

### Scope & Commercial Review → Proposal Ready
Required when applicable:
- pricing
- commercial approval
- legal/commercial terms
- acceptance criteria
- training/enablement option reviewed

Proposal generation must remain disabled until Proposal Readiness is 100%.

## Assessment model
Assessments are mandatory engineering work unless Newneo validates an equivalent existing assessment.

Assessment families:
- Business & AI Opportunity Assessment
- Infrastructure Readiness Assessment
- AI Compute Assessment
- Knowledge & RAG Assessment
- Integration & MCP Assessment
- AI Security & Governance Assessment
- Production Readiness Assessment
- AgentOps Baseline Assessment

Commercial principle:
Assessment is paid. Under agreed commercial terms, assessment fees may be credited toward the subsequent Newneo implementation.

## AI Compute decision model
Never assume local AI infrastructure.

Execution options:
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

Infrastructure changes should be recommended only when the workload requires them.

## Engagement progress model
Customer-facing journey always uses:
`Discover → Assess → Prove → Deploy → Operate`

Visual state:
- completed = completed/check state
- current = Newneo green `#60d394`
- future = neutral

This visual model must be shared by the public presentation and personalized customer presentation.

## Proposal Engine
The formal proposal is the **last pre-sales artifact**.

The proposal must be generated from structured opportunity and assessment data, not written from scratch.

The proposal should be concise by default.

Recommended sections:
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

Detailed assessment reports, HLD/LLD, architecture documents and test evidence should be linked or attached rather than duplicated in the commercial proposal.

Proposal versioning is mandatory.

Generated output:
- responsive HTML
- print-ready PDF

## Public lead intake integration
The public website `Start an Assessment` form should create a lead directly in Newneo Platform.

Suggested fields:
- name
- company
- email
- phone optional
- country
- industry
- business objective
- current AI stage
- company knowledge required? yes/no/not sure
- actions in enterprise systems? yes/no/not sure
- expected execution model: cloud/private/hybrid/not sure
- existing local AI compute: yes/limited/no/not sure
- sensitive or regulated data: yes/no/not sure
- systems involved
- expected users / transaction volume
- success outcome
- free-text context

Do not expose automated pricing in v1.

## Technical direction
Preferred baseline:
- Next.js
- TypeScript
- PostgreSQL / Supabase
- Supabase Auth initially, enterprise SSO later
- role-based authorization
- object storage for generated files
- HTML-to-PDF proposal generation
- event/audit log
- state-machine-driven opportunity stages

The public site must remain independent from the authenticated platform.
