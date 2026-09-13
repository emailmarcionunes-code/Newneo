# Newneo Platform — Product Specification

## Purpose
Newneo Platform is the internal operating system for the commercial and delivery lifecycle of enterprise AI engagements.

Core principle: **Enter once. Reuse everywhere.**

The opportunity is the source of truth. CRM views, sales playbooks, assessments, customer presentations, proposals and delivery handoff all render from the same structured opportunity data.

## Repository strategy
Public website and internal platform must be separate applications and repositories.

- `newneo-website`: public website, SEO, lead generation, public assessment intake.
- `newneo-platform`: authenticated internal application, CRM, playbooks, assessments, proposals, customer portal, admin and future learning modules.

The platform should run on a separate authenticated domain such as `platform.newneo.ai`. Customer-facing engagement links can later use `engage.newneo.ai`.

## Initial modules
1. CRM
2. Lead Qualification
3. Sales & Engagement Playbook
4. Assessment Engine
5. Live Engagement Presentation
6. Proposal Engine
7. Admin & User Management
8. Customer Portal

Future modules:
9. Delivery Workspace
10. AgentOps Customer Workspace
11. Newneo Academy / Learning Factory

## Core customer lifecycle
`Lead → Qualification → Discovery → Paid Assessment → Solution Review → Proposal → POC / Deploy → Production → AgentOps`

Public engagement language:
`Discover → Assess → Prove → Deploy → Operate`

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
- architecture recommendation
- risks
- success criteria
- recommended next step

### Solution Review → Proposal Ready
Required:
- approved architecture
- defined scope
- assumptions
- exclusions
- delivery estimate
- pricing
- approval status
- legal/commercial terms

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

## Live Engagement Presentation
Every opportunity automatically gets a presentation view generated from live opportunity data.

Two modes:

### Internal View
May show:
- probability
- margin
- pricing assumptions
- internal risks
- competition
- internal notes
- decision makers
- approvals

### Customer View
May show:
- customer challenge
- current understanding
- Newneo engagement process
- engagement progress
- current stage highlighted
- assessment findings
- recommended architecture
- recommended next step
- POC scope/results when relevant
- proposal status

The customer-facing process bar must always show:
`Discover → Assess → Prove → Deploy → Operate`

Completed stages use a completed state, current stage is highlighted in Newneo green, future stages are neutral.

The presentation stores no duplicate business data. It renders opportunity data.

Internal principle: **Meet for decisions, not for information transfer.**

## Proposal Engine
The proposal must be generated from structured opportunity and assessment data, not written from scratch.

Default proposal sections:
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
