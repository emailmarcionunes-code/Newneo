# Newneo AI Platform — Design Manifesto

## Purpose
Define the product-design rules that keep Newneo AI Platform clear, calm and intelligent as capabilities expand.

Core principle:
**Less noise. More clarity. Intelligence without clutter.**

The platform may be technically complex underneath, but the user experience should feel simple, guided and trustworthy.

## 1. One screen, one primary intention
Every screen must answer one main question.

Examples:
- Overview: Is our enterprise AI healthy and creating value?
- Agent Catalog: Which approved AI capability should we launch?
- Configure Agent: What does this agent need to work safely?
- AgentOps: Which agents need attention and why?

If a screen tries to answer many unrelated questions, split the experience.

## 2. Five-second comprehension
A user should understand the purpose and current state of a screen within approximately five seconds.

The first visual hierarchy should communicate:
- where the user is
- what matters now
- whether anything needs attention
- the primary next action

## 3. Summary first, depth on demand
Default views show the minimum information required for a correct decision.

Technical depth appears progressively through:
- expanders
- drawers
- secondary tabs
- advanced settings
- drill-down pages

Do not expose implementation details merely because they exist.

## 4. Always make the next action obvious
Each important workflow should have one visually dominant next action.

Examples:
- Browse Agent Catalog
- Connect Knowledge
- Add Tool
- Run Evaluation
- Deploy to Test
- Promote to Production

Avoid multiple equal-weight CTAs competing for attention.

## 5. Business language before technical language
Prefer language such as:
- Business Objective
- Expected Outcome
- Agent Health
- Approval Required
- Sensitive Data
- Business Impact

Technical terms such as embeddings, vector indexes, inference parameters or orchestration internals belong in advanced views unless the user role requires them.

## 6. Intelligence should reduce work
AI-assisted UX should help prioritize and recommend, not create visual noise.

Useful intelligence includes:
- Needs Attention
- Ready for Deployment
- Blocked by Policy
- Evaluation Failed
- Recommended Next Action
- Likely Cause
- Cost Anomaly

Recommendations must always explain the reason and remain reviewable by the user.

## 7. Fewer metrics, stronger metrics
Do not fill dashboards with every available measurement.

Overview metrics should focus on:
- production adoption
- task success
- evaluation quality
- human escalation
- cost
- security
- incidents
- business outcome

More detailed telemetry belongs in AgentOps drill-down views.

## 8. Role-aware density
The same platform serves different users, but they should not all receive the same information density.

Executive / Business Owner:
- outcome
- health
- cost
- risks
- decisions

Operator:
- incidents
- reliability
- evaluations
- changes

AI Engineer:
- configuration
- models
- tools
- traces
- versions
- technical diagnostics

Use role-aware defaults rather than duplicating separate products.

## 9. Production safety should feel natural
Governance should not appear as bureaucracy bolted onto the product.

The experience should naturally guide users through:
`Configure → Evaluate → Review → Deploy`

Blocked actions should clearly state:
- what is blocking the action
- why it matters
- what must be done next

## 10. Calm enterprise visual design
The visual language should feel premium, modern and operationally trustworthy.

Principles:
- generous whitespace
- strong typography
- restrained use of color
- consistent spacing
- soft borders and surfaces
- minimal decorative elements
- status colors used semantically
- Newneo green reserved for health, success and primary brand moments

Do not use dense cyberpunk dashboards or excessive technical decoration.

## 11. Progressive complexity by maturity
A new customer should be able to launch a first governed use case without understanding the entire platform.

The experience should progress from:
`Guided → Co-managed → Advanced / Self-service`

Advanced functionality should become available as customer maturity and permissions increase.

## 12. Reuse should be visible
The platform should show users when approved assets already exist.

Examples:
- Existing knowledge source available
- Approved Salesforce connector already configured
- Organization policy inherited
- Evaluation suite reused
- Existing production model approved

This reinforces the platform value proposition: the next use case should be easier than the first.

## 13. Hide infrastructure until it matters
Deployment architecture is important, but it should not dominate daily workflows.

Most users should see simple choices such as:
- Organization Default
- Managed AI
- Customer Cloud
- Private AI
- Hybrid

Detailed runtime, region, cluster, networking and infrastructure configuration appears only for authorized advanced users.

## 14. No dead-end screens
Every empty, error or blocked state must explain what to do next.

Examples:
- No agents yet → Browse Agent Catalog
- No knowledge sources → Connect Knowledge
- Evaluation failed → Review Failed Tests
- Production blocked → Complete Required Approval

## 15. Design for global use
The product must not assume one country, language, currency, regulatory framework or cloud provider.

Default product copy should remain globally applicable.

Localization, currency, regional data residency and compliance rules should be configuration concerns rather than hard-coded assumptions.

# Screen design checklist
Before approving any screen, ask:

1. What should the user understand in five seconds?
2. What decision is being made here?
3. What is the single primary action?
4. Which information can be hidden until requested?
5. Is anything shown only because the system has the data?
6. Is business language used before technical jargon?
7. Does the screen explain risk or blocked states clearly?
8. Can a first-time user proceed without training?
9. Does the screen remain useful for an advanced user through drill-down?
10. Does the interface feel calm rather than busy?

# Design north star
**The sophistication should live in the system, not in the user's cognitive load.**
