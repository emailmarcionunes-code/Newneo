# Newneo AI Platform — Product Specification

## Product thesis
Newneo AI Platform is the customer-facing control plane for enterprise AI.

Newneo remains the end-to-end integrator, but infrastructure and cloud are treated as deployment choices rather than the primary product story.

Public positioning:
**Enterprise AI Platform + Deployment Engineering + AI Operations**

Core promise:
**Newneo brings enterprise AI into production and gives the customer one place to build, govern, deploy and operate it.**

## Product boundary
The platform does not replace AWS, Azure, GCP, OpenAI, Anthropic, Google, NVIDIA, OpenShift, Kubernetes, Cisco, customer databases or enterprise applications.

It sits above them as a vendor-neutral operating and control layer.

Conceptual architecture:

`Business Workflows`
`↓`
`Newneo AI Platform`
`↓`
`Agents / Knowledge / Tools / Models / Policies / Evaluations / Deployments / AgentOps`
`↓`
`Cloud AI / Customer Cloud / Private AI / Hybrid AI`
`↓`
`Customer Infrastructure and Enterprise Systems`

## Product pillars
1. **Build** — agents, reusable skills and workflows.
2. **Knowledge** — enterprise knowledge, RAG, context and data sources.
3. **Connect** — APIs, MCP servers, enterprise systems and actions.
4. **Intelligence** — model catalog, private models and future model routing.
5. **Govern** — identity, RBAC, policies, approvals, audit and guardrails.
6. **Evaluate & Deploy** — evaluations, regression tests, versions, environments, promotion and rollback.
7. **Operate** — AgentOps across quality, reliability, security, economics and business outcomes.

Infrastructure and compute remain a horizontal deployment capability, not a top-level product pillar.

## Customer hierarchy
Suggested hierarchy:

`Organization → Workspace → Use Case / Agent → Environment`

Example:

- ACME Corporation
  - Customer Service
  - Finance
  - HR
  - IT Operations
  - Procurement

Each workspace can contain its own agents, knowledge, tools, policies, evaluations, users and costs while still sharing approved organization-level components.

## V1 navigation
1. Overview
2. Workspaces
3. Agent Catalog
4. Agent Builder
5. Knowledge
6. Tools & MCP
7. Models
8. Evaluations
9. Security & Governance
10. Deployments
11. AgentOps
12. Settings / Administration

## Overview
The homepage should answer: **Is enterprise AI healthy and creating value?**

Primary metrics:
- agents in production
- task success rate
- evaluation score
- human escalation rate
- monthly AI cost
- business value / outcome metrics
- security events
- critical incidents

The dashboard should combine technical health with business outcomes. It must not look only like a developer console.

## Agent Catalog
The catalog should allow Newneo and authorized customers to launch approved agent patterns.

Initial examples:
- Customer Service Agent
- IT Support Agent
- HR Assistant
- Procurement Agent
- Finance Operations Agent
- Enterprise Knowledge Assistant

Deployment wizard:
`Use Case → Knowledge → Tools → Model → Permissions → Workflow → Evaluation → Review → Deploy`

Self-service does not mean uncontrolled production access. Production deployment remains subject to policies and approvals.

## Agent Builder
Agent definition should be modular rather than a single prompt.

Reference model:
**Agent = Instructions + Skills + Knowledge + Tools + Memory + Workflow + Policies**

Capabilities:
- instructions
- reusable skills
- knowledge selection
- tool selection
- memory configuration
- model selection
- approval rules
- policies
- environment variables / secrets references
- evaluation suite assignment

## Knowledge
Support enterprise knowledge sources through connectors and retrieval configurations.

Examples:
- SharePoint
- Google Drive
- Confluence
- ServiceNow
- Salesforce
- SQL databases
- S3 / object storage
- Azure Blob
- websites
- file uploads
- custom APIs

For each source track:
- connection status
- last sync
- freshness
- document count
- permission model
- indexing status
- retrieval quality

Knowledge access must inherit identity and authorization rules when possible.

## Tools & MCP
Provide an enterprise tool registry and MCP registry.

Examples:
- Salesforce
- SAP
- ServiceNow
- Workday
- Microsoft 365
- Slack
- Teams
- Jira
- GitHub
- Cisco APIs
- custom APIs
- custom MCP servers

Each tool/action should support:
- authentication method
- permissions
- allowed actions
- approval requirements
- rate limits
- audit logs
- environment mapping

## Models
The platform should remain model-agnostic.

Initial provider model:
- OpenAI
- Azure OpenAI
- Anthropic
- Google Gemini
- AWS Bedrock
- NVIDIA NIM
- private/self-hosted models
- custom endpoints

Track:
- provider
- model
- region/location
- latency
- cost
- privacy classification
- context window
- approved use cases

Future capability: policy-aware model router based on quality, latency, cost, privacy and location.

## Security & Governance
Governance is cross-cutting and mandatory.

Capabilities:
- enterprise identity integration
- RBAC
- workspace permissions
- agent permissions
- knowledge permissions
- tool/action permissions
- model policies
- PII/data policies
- approval workflows
- guardrails
- audit trail
- policy exceptions

Example policy:
`Finance Agent can read invoice data but cannot execute a payment above the approved threshold without human approval.`

## Evaluations
Every production agent must be attached to an evaluation suite.

Metrics may include:
- task success
- accuracy
- groundedness
- hallucination rate
- tool success
- policy compliance
- safety/security checks
- latency
- cost per task
- business KPI

Changes to prompts, skills, models, knowledge or tools should be able to trigger regression evaluations before promotion.

## Deployments
Use a software-delivery model.

Environments:
- Development
- Test / Staging
- Production

Capabilities:
- version history
- compare versions
- promote
- deploy
- rollback
- approvals
- deployment status
- release notes

## AgentOps
AgentOps is a core recurring service and product layer.

Five operating dimensions:
1. Quality
2. Reliability
3. Security
4. Economics
5. Business Outcome

Per agent, expose:
- health
- task success
- availability
- evaluation score
- cost per interaction/task
- human escalation
- incidents
- business KPI

Operational views:
- interactions
- traces
- tool calls
- errors
- evaluations
- costs
- security events
- incidents
- improvement backlog

## Runtime & deployment architecture
Newneo AI Platform must support multiple execution patterns without changing the customer experience.

Supported target models:
- Newneo-managed SaaS
- customer AWS
- customer Azure
- customer GCP
- private Kubernetes / OpenShift
- private NVIDIA infrastructure
- hybrid combinations

The platform should know where each workload runs, but should not attempt to become a full data-center management product.

Infrastructure, GPU, networking and storage are handled by Newneo Deployment Engineering when the workload requires them.

## Service model
Three operating modes:

### Managed by Newneo
Newneo designs, configures, deploys and operates most of the environment.

### Co-managed
Customer teams configure approved components while Newneo maintains architecture, governance and production controls.

### Self-service within guardrails
Customer teams can launch additional approved agents and reusable components without requiring Newneo engineers for every change.

## Commercial model direction
Potential revenue layers:
- paid Assessment
- paid POC / first use case
- implementation / deployment engineering
- Newneo AI Platform subscription
- consumption / usage where appropriate
- AgentOps recurring service
- training / Academy

The platform should make the first deployment valuable while creating reusable foundations for account expansion.

Commercial flywheel:
`First Use Case → Reusable Knowledge/Tools/Policies → Faster Next Agent → More Platform Usage → More AgentOps Value`

## Product principle
**Land with one use case. Expand across the enterprise.**

The first successful deployment should establish reusable identity, integration, knowledge, governance and evaluation assets so subsequent agents require less effort.

## V1 scope
Do not attempt to recreate every mature enterprise AI platform immediately.

V1 should prioritize:
- multi-tenant organization/workspace model
- authentication and RBAC
- Overview
- Agent Catalog
- basic Agent Builder
- Knowledge registry
- Tools/MCP registry
- Model registry
- Evaluation suites
- Deployments / environments
- basic AgentOps
- audit events

V1 can initially integrate external agent runtimes instead of implementing every execution capability itself.

## Later roadmap
- visual workflow builder
- reusable skill marketplace
- model router
- advanced evaluation and A/B testing
- agent-to-agent orchestration
- BYOC deployment controller
- on-prem controller
- advanced FinOps
- automated remediation
- enterprise marketplace
- Academy integration

## Relationship with Newneo Business Platform
Keep these products conceptually separate.

**Newneo Business Platform**
Internal operating system for CRM, sales, assessments, proposal, delivery and commercial workflows.

**Newneo AI Platform**
Customer-facing product for building, governing, deploying and operating enterprise AI.

Integration point:
When an opportunity becomes a deployment, the Business Platform can provision a customer organization/workspace in Newneo AI Platform and pass approved engagement metadata without duplicating business data.
