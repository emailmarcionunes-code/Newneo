# Newneo AI Platform — V1 Product & UX Definition

## Product goal
Create the smallest serious enterprise AI platform that lets a customer launch a governed AI use case and then operate it continuously.

V1 must prove this customer promise:

**Choose an approved agent pattern → connect knowledge and tools → select a model/runtime → apply governance → evaluate → deploy → operate.**

The product must work across Newneo SaaS, dedicated instance, customer cloud and on-prem/private deployment models.

## V1 design principle
Do not start by building a generic no-code AI playground.

Start with a governed enterprise flow where Newneo can deploy the first use case and progressively give the customer more autonomy.

Primary UX principles:
- business-first language
- progressive disclosure
- one clear next action per screen
- hide infrastructure complexity until needed
- reuse approved components
- production gates before deployment
- executive and technical visibility in the same product without mixing their views

## Primary navigation
Left navigation:

1. Overview
2. Workspaces
3. Agents
4. Knowledge
5. Tools & MCP
6. Models
7. Evaluations
8. Deployments
9. AgentOps
10. Governance
11. Settings

Admin-only areas should appear only for authorized users.

## Global header
Always show:
- Organization selector
- Workspace selector
- Environment selector when relevant
- Global search
- Notifications
- Help
- User profile

For customer environments, show deployment mode in a subtle status element:
- Newneo SaaS
- Dedicated
- Customer Cloud
- Private / On-Prem
- Air-Gapped

Do not make deployment architecture visually dominant in everyday use.

# 1. Overview

## Purpose
Answer in under 10 seconds:

**Is our enterprise AI healthy, useful and under control?**

## Primary cards
- Agents in Production
- Successful Tasks
- Evaluation Score
- Human Escalation Rate
- AI Cost This Month
- Business Outcome
- Security Events
- Critical Incidents

## Main sections
### Enterprise AI Health
One composite health indicator with drill-down into:
- Quality
- Reliability
- Security
- Economics
- Business Outcome

### Agents requiring attention
Ranked list of agents with:
- health
- issue
- impact
- recommended action

### Business outcomes
Examples:
- support cases resolved
- hours saved
- cycle time reduced
- revenue influenced
- tickets avoided

### Recent changes
- agent deployed
- model changed
- knowledge source updated
- policy modified
- evaluation failed
- incident opened/resolved

## Empty state
When no agent exists:

Headline:
**Launch your first enterprise AI use case.**

CTA:
**Browse Agent Catalog**

# 2. Workspaces

## Purpose
Separate AI initiatives by business unit, use case family, geography or team.

Example:
- Customer Service
- Finance
- HR
- IT Operations

## Workspace card
Show:
- name
- owner
- agents
- users
- monthly cost
- health
- environment

## Workspace detail tabs
- Overview
- Agents
- Knowledge
- Tools
- Policies
- Users
- Costs

Organization-level components may be shared into multiple workspaces only when explicitly approved.

# 3. Agents

## Two entry modes
### Agent Catalog
For approved reusable patterns.

### Custom Agent
For authorized Newneo engineers / advanced customer teams.

Default V1 experience should prioritize Agent Catalog.

## Initial Agent Catalog
- Enterprise Knowledge Assistant
- Customer Service Agent
- IT Support Agent
- HR Assistant
- Procurement Agent
- Finance Operations Agent

Each catalog card contains:
- business outcome
- typical systems
- typical knowledge
- required permissions
- estimated complexity: Low / Medium / High
- supported deployment patterns
- status: Newneo Managed / Co-Managed / Self-Service Ready

Primary CTA:
**Configure Agent**

# 4. Agent Configuration Wizard

The wizard is the heart of V1.

Persistent progress bar:

`Use Case → Knowledge → Tools → Model → Governance → Evaluate → Deploy`

Users can save draft and return later.

## Step 1 — Use Case
Capture:
- agent name
- business objective
- owner
- intended users
- expected outcome
- business KPI
- environment: Dev initially

If agent came from catalog, pre-fill recommended configuration.

## Step 2 — Knowledge
Show approved sources first.

Actions:
- attach existing knowledge source
- add new source
- configure retrieval policy

For each source show:
- status
- freshness
- authorization mode
- indexing state

Do not expose vector database implementation unless an advanced user opens technical details.

## Step 3 — Tools & Actions
Select tools from approved registry.

Each tool lists actions separately.

Example:
ServiceNow
- Search Incident
- Create Incident
- Update Incident
- Close Incident

Each action shows:
- Read / Write
- approval required
- permission scope

User should grant only the actions required by the use case.

## Step 4 — Model & Runtime
Default screen should ask:

**Where should this AI run?**

Options:
- Use organization default
- Managed AI
- Customer Cloud
- Private AI
- Hybrid / Advanced

Then show approved models available under that runtime.

Advanced details:
- provider
- model
- region
- privacy classification
- latency baseline
- cost baseline

Do not expose model choice as the first decision for ordinary business users.

## Step 5 — Governance
Configure:
- who can use the agent
- what data it can access
- allowed actions
- human approval rules
- sensitive data policy
- prohibited actions
- rate/usage limits
- audit level

The platform should generate a concise summary:

**This agent can read X, execute Y, and requires approval for Z.**

## Step 6 — Evaluate
Before Production, run an assigned evaluation suite.

Display:
- Task Success
- Groundedness
- Tool Success
- Policy Compliance
- Safety / Security
- Latency
- Cost per Task
- Business KPI test where available

Results:
- Pass
- Pass with warning
- Fail

Production deployment is blocked on failed mandatory controls.

CTA after passing:
**Review for Deployment**

## Step 7 — Deploy
Review screen:
- use case
- knowledge
- tools/actions
- model/runtime
- policies
- evaluation results
- owner
- estimated cost range if available

Deployment actions:
- Deploy to Test
- Promote to Production

Production may require approval based on organization policy.

# 5. Agent Detail

Header:
- Agent name
- status
- current version
- environment
- owner
- health

Tabs:
1. Overview
2. Configuration
3. Knowledge
4. Tools
5. Evaluations
6. Versions
7. Activity
8. AgentOps

Primary actions:
- Test
- Create New Version
- Promote
- Rollback
- Pause

Do not allow direct editing of the production version. Changes create a new version.

# 6. Knowledge

## Knowledge registry
List all available sources.

Columns:
- Name
- Type
- Scope
- Status
- Freshness
- Permissions
- Agents using it

Source detail:
- connection
- sync history
- indexed content
- access rules
- quality checks
- usage

V1 should focus on registry + connector lifecycle, not building a full enterprise content management system.

# 7. Tools & MCP

## Registry
Two categories:
- Enterprise Integrations
- MCP Servers

For each connector:
- status
- authentication
- owner
- environment
- available actions
- agents using it
- last health check

Tool detail includes action-level permission configuration.

V1 must separate:
- connector exists
- action is technically available
- action is approved for a workspace/agent

# 8. Models

## Model Registry
Approved models available to the organization.

Fields:
- Provider
- Model
- Runtime
- Region
- Status
- Approved Data Classifications
- Cost profile
- Performance profile

The platform should allow organization defaults and workspace overrides.

V1 does not need automatic model routing.

# 9. Evaluations

## Evaluation Suites
Reusable tests that can be assigned to agents.

Suite types:
- Functional
- RAG / Groundedness
- Tool execution
- Governance
- Security
- Regression
- Business KPI

Evaluation run view:
- overall result
- score by category
- failed tests
- compare to previous version
- recommended action

Regression comparison is important even in V1.

# 10. Deployments

## Environment model
- Development
- Test
- Production

Deployment list:
- agent
- version
- source environment
- target environment
- status
- requested by
- approved by
- deployed at

Capabilities:
- promote
- approve
- reject
- rollback

For customer-cloud/private installations, the UI remains the same even if the underlying deployment mechanism differs.

# 11. AgentOps

## Purpose
Turn production AI into an operated service.

Primary dimensions:
- Quality
- Reliability
- Security
- Economics
- Business Outcome

## Fleet view
Rank agents by health and business impact.

Columns:
- Agent
- Health
- Task Success
- Evaluation Score
- Incidents
- Cost
- Business KPI

## AgentOps detail
Sections:
- Health trend
- Volume
- Success/failure
- Latency
- Cost
- Human escalations
- Evaluation trend
- Security events
- Incidents
- Business KPI

## Incident model
AgentOps incident includes:
- severity
- affected agent
- customer/business impact
- likely cause
- evidence
- recommended action
- owner
- status

V1 can generate recommended actions without automated remediation.

# 12. Governance

Organization-level views:
- Users & Roles
- Policies
- Approvals
- Data Classifications
- Audit Log

V1 roles:
- Organization Admin
- AI Platform Admin
- AI Engineer
- Business Owner
- Operator
- Reviewer / Approver
- Read Only

Permissions must be enforced server-side.

# Deployment architecture requirement

The UX must not depend on Newneo Cloud.

Supported architecture targets:

## Newneo SaaS
Newneo hosts control plane and applicable runtime services.

## Dedicated
Isolated customer instance managed by Newneo.

## Customer Cloud / BYOC
Platform components run in customer AWS/Azure/GCP account.

## Private / On-Prem
Platform runs in customer VM, Kubernetes or OpenShift environment.

## Air-Gapped
No external runtime dependency is required after installation. Updates are delivered as signed versioned packages/images through an approved process.

For small deployments/POCs, a single VM packaging may be supported.

For production enterprise deployments, prefer containerized services on Kubernetes/OpenShift or equivalent orchestration.

# V1 technical architecture direction

Logical services:
- Web UI
- API / Backend
- Auth / Identity adapter
- Organization & Workspace service
- Agent Configuration service
- Connector Registry
- Model Registry
- Evaluation service
- Deployment service
- AgentOps / Telemetry service
- Audit service
- PostgreSQL
- Object storage
- secrets integration

Prefer a modular monolith for V1 unless scale or deployment constraints force service separation.

Do not start with microservices only because the product may become large later.

# Runtime strategy for V1

Newneo AI Platform does not need to invent an agent runtime on day one.

V1 may integrate one or more existing agent/runtime frameworks behind a Newneo abstraction layer.

Critical requirement:
The customer-facing data model must not depend directly on one runtime vendor/framework.

Newneo objects remain canonical:
- Agent
- Skill
- Knowledge Source
- Tool
- Model
- Policy
- Evaluation
- Deployment
- Incident

Runtime adapters translate these objects into execution environments.

# V1 non-goals

Do not prioritize initially:
- generic drag-and-drop workflow builder
- public marketplace
- automated model router
- full A2A orchestration
- autonomous remediation
- complex billing engine
- hundreds of connectors
- custom foundation-model training
- infrastructure monitoring replacement
- full SIEM/SOC functionality
- full data catalog

# First demo scenario

Use one complete demo instead of many shallow mockups.

Customer: ACME
Workspace: Customer Service
Agent: Customer Service Agent
Knowledge: SharePoint / Demo Knowledge Base
Tool: ServiceNow or equivalent demo connector
Model: one approved cloud model
Governance: read knowledge + create ticket; ticket closure requires human approval
Evaluation: functional + groundedness + tool + policy suite
Deployment: Dev → Test → Production
AgentOps: health, task success, cost, escalation and incident view

The same demo architecture must later be able to run with a private model/runtime without redesigning the UI or domain model.

# V1 success criteria

V1 is successful when a user can demonstrate, end to end:

1. Sign in to a customer organization.
2. Create/select a workspace.
3. Choose an approved agent from the catalog.
4. Configure its business objective.
5. Connect approved knowledge.
6. Connect an approved tool/action.
7. Select an approved model/runtime.
8. Apply permissions and approval rules.
9. Run evaluations.
10. Deploy to Test.
11. Promote to Production with approval.
12. Observe health, cost, quality and business outcome in AgentOps.
13. Create a new version and roll back if needed.

If this works cleanly, Newneo has the foundation of a real enterprise AI platform rather than a collection of demos.
