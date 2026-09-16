# Newneo Engineering Journey

> **Current implementation authority — Issue #3 / Hybrid v4.** The approved Hybrid file `7NFyk2kxLzbWsFWF8zWKNO` supersedes earlier visual references, navigation and seven-stage journey definitions in this document. The journey is now Use Case → Knowledge → Tools & MCP → Infrastructure → Model → Governance → Evaluate → Deploy. Existing commercial, security and product boundaries remain in force. See [Hybrid v4 implementation](HYBRID_V4_IMPLEMENTATION.md) for node mappings and verification.

## Purpose
This is the technical counterpart to the commercial customer journey.

The commercial story explains how a customer adopts enterprise AI. The engineering story explains how business intent becomes governed production execution and measurable results.

Reference flow:
`Business Outcome → Identity → Knowledge → Tools/MCP → Skills → Model & Runtime → Governance → Agent Version → Evaluate → Test → Approve → Production → AgentOps → FinOps → Business Outcome`

The journey must stay connected to business value from beginning to end.

## Reference scenario
Customer: Bank XYZ
Workspace: IT Operations
Agent: IT Support Agent

Objective: provide trusted internal IT support, answer approved questions and create ServiceNow incidents when required.

Expected outcomes:
- reduce mean time to resolution
- reduce repetitive support workload
- improve service consistency
- preserve approvals, security and auditability

## 1. Use Case
Engineering starts with the functional contract, not with the model or infrastructure.

Define purpose, owner, users, expected outcome, success criteria, KPI and default environment.

Principle: **define what the system must accomplish before selecting how it will accomplish it.**

## 2. Identity and Access
Connect enterprise identity before granting access to knowledge or actions.

Define who can use the agent, what each identity may access, which actions are allowed and who can approve sensitive operations.

Identity context should flow through retrieval, tool execution, approvals and audit whenever possible.

## 3. Knowledge
Connect trusted enterprise information such as SharePoint, knowledge bases, runbooks and internal policies.

Conceptual retrieval path:
`Source → Connector → Ingestion → Parsing → Chunking → Index → Retrieval → Reranking → Context`

The default experience should expose readiness rather than implementation complexity. Advanced users may inspect retrieval strategy, chunking, embeddings, filters, permissions, freshness and quality.

Principle: **the sophistication should live in the system, not in the user's cognitive load.**

## 4. Tools and MCP
Knowledge lets the agent understand. Tools let the agent act.

Example ServiceNow actions:
- Search Incident
- Get Incident
- Create Incident
- Update Incident
- Close Incident

Access remains layered:
`Connector Exists → Action Exists → Organization Approves Action → Agent Version Receives Action → Execution Approval if Required`

Connecting a system must never automatically grant every action to every agent.

## 5. Skills
Skills turn technical capabilities into reusable business behavior.

Example Incident Creation Skill:
`Understand Request → Check Existing Incidents → Collect Missing Fields → Classify → Determine Priority → Create Incident → Validate Result → Return Ticket Number`

A production skill may include validation, permissions, approvals, failure handling, policies, evaluations, telemetry and versioning.

## 6. Model and Runtime
The first engineering question is: **Where should this AI run?**

Possible answers:
- Organization Default
- Managed AI
- Customer Cloud
- Private AI
- Hybrid AI

Model choices should already respect quality, cost, latency, privacy, data residency and approved-use constraints.

## 7. Governance
Governance combines identity, data boundaries, model policy, tool permissions and approvals into enforceable rules.

Example summary:
- Employees may use the IT Support Agent.
- The agent may access approved IT knowledge.
- It may search and create incidents.
- Closing incidents requires approval.
- Sensitive information may not be exposed.
- All actions are audited.

The same policy should be understandable by the business owner, engineer and auditor at different depths.

## 8. Agent Version
A production agent is not a single prompt.

Reference composition:
`Agent Version = Instructions + Skills + Knowledge Bindings + Tool Bindings + Model Endpoint + Policies + Evaluation Suite + Runtime Configuration`

Production must not be edited directly. Changes create a new version so they can be tested, approved, compared and rolled back.

## 9. Evaluate
Every production candidate must be evaluated before promotion.

Core categories:
- Functional success
- Groundedness
- Tool success
- Policy compliance
- Security / safety
- Latency
- Economics

Mandatory failures should block production.

## 10. Test
Promote the candidate into a controlled Test environment and collect traces, task outcomes, tool calls, evaluation results, latency, cost, exceptions and human feedback.

## 11. Production Approval
Production readiness must be evidence-based.

The platform should verify mandatory evaluations, governance, action readiness, approvals, rollback readiness and relevant economics before allowing promotion.

The production gate must be enforced in the backend, not only in the interface.

## 12. Production Runtime
Once live, one business request becomes one Newneo Task even if multiple technical operations occur internally.

Example path:
`User → Identity → Agent → Intent → Knowledge → Skill → Model → Decision → Tool → Enterprise System → Result`

A task may contain multiple model calls, retrievals, actions, retries and approval waits while remaining one business task.

## 13. AgentOps
AgentOps answers: **Is the AI working well?**

It combines quality, reliability, governance/security, economics and business outcomes.

Incident investigation should connect:
`Affected Tasks → Trace → Model Behavior → Retrieved Knowledge → Tool Execution → Likely Cause → Recommended Action`

The objective is not only to report failure, but to help determine what happened and what to do next.

## 14. FinOps
FinOps answers: **Is the AI economically efficient?**

Track AI Units, task volume, cost per task, cost per successful task, model spend, retrieval spend, tool spend, compute spend, budgets and forecast.

Optimization can recommend a more efficient approved model, fewer unnecessary calls, better retrieval or a more appropriate runtime, but must never override quality, privacy, governance or residency requirements.

## 15. Business Outcome
The engineering journey returns to the original KPI.

End-to-end value chain:
`Infrastructure / Runtime → Model → Knowledge → Agent → Skill → Task → Outcome → Business KPI`

Technical teams and business owners should be able to view the same system from different depths.

## Customer self-service model
Newneo should be deeply involved during onboarding and the first production use cases: organization setup, identity, deployment architecture, connectors, knowledge patterns, policies, evaluation standards, first agents and operating model.

After this foundation is established, authorized customer teams should be able to create, configure, evaluate and deploy additional agents without requiring a Newneo engineer for every change.

Self-service remains subject to governance, evaluation and production approval rules.

## Support and AgentOps boundary
The recurring Newneo AI Platform subscription should include the platform software, AgentOps product capabilities, FinOps product capabilities and Platform Support according to the contracted support level.

Platform Support includes product incidents, defects, upgrades, documentation, standard configuration assistance and lifecycle support.

Managed AgentOps is a separate optional recurring service in which Newneo personnel actively monitor, analyze, recommend and operate alongside the customer.

Therefore:
- AgentOps software capability: included in platform
- FinOps software capability: included in platform
- Platform Support: included according to support tier
- Managed AgentOps service: optional premium service

## Engineering principle
Newneo is not merely an agent builder.

Newneo transforms:
**enterprise information + models + systems + policies**

into:
**governed business execution**

and measures:
**quality + reliability + governance + economics + business outcome**

## Related official references
- `NEWNEO_AI_PLATFORM_SPEC.md`
- `NEWNEO_AI_PLATFORM_V1_UX.md`
- `NEWNEO_ADMIN_PLANE_SPEC.md`
- `NEWNEO_FINOPS_SPEC.md`
- `NEWNEO_COMMERCIAL_MODEL.md`
- `NEWNEO_PLATFORM_OPERATING_MODEL.md`
- `NEWNEO_RESPONSIBILITY_CHARTER.md`
- `CODEX_READY_CHECKLIST.md`
