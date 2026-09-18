# Newneo AI Platform — Design Manifesto

> **Current implementation authority — Issue #3 / Hybrid v4.** The approved Hybrid file `7NFyk2kxLzbWsFWF8zWKNO` supersedes earlier visual references, navigation and seven-stage journey definitions in this document. The journey is now Use Case → Knowledge → Tools & MCP → Infrastructure → Model → Governance → Evaluate → Deploy. Existing commercial, security and product boundaries remain in force. See [Hybrid v4 implementation](HYBRID_V4_IMPLEMENTATION.md) for node mappings and verification.

## Purpose
Define the product-design rules that keep Newneo AI Platform clear, calm and intelligent as capabilities expand.

Core principle:
**Less noise. More clarity. Intelligence without clutter.**

The platform may be technically complex underneath, but the user experience should feel simple, guided and trustworthy.

## Visual source of truth
The approved Agent Catalog / Agent Launch Guide visual reference is the primary visual north star for the Newneo product UI.

It should be treated as the reference for:
- sidebar density and proportions
- simple Newneo wordmark treatment
- topbar restraint
- white canvas
- thin borders
- compact typography
- light cards
- stepper behavior
- form density
- tabs
- contextual side panels
- restrained use of blue, green, violet and amber
- high information density without visual heaviness

The goal is not to decorate beyond this reference. The goal is to reproduce its precision consistently across the product.

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

## 10. Product visual language
The customer-facing product should feel like a mature enterprise SaaS application, not a marketing website and not a decorative executive dashboard.

Use:
- predominantly white working canvas
- dark navy sidebar
- simple wordmark at the top of the sidebar
- compact topbar
- thin neutral borders
- light or almost-flat cards
- small, consistent radii
- minimal shadows
- compact iconography
- generous whitespace between logical groups
- blue as the dominant interaction color
- green for success and healthy states
- amber for attention
- red for critical states
- violet only for limited secondary semantics

Avoid:
- oversized hero cards inside the application
- decorative background waves in ordinary product workflows
- excessive gradients
- large rounded containers everywhere
- glow effects
- heavy shadows
- multiple competing accent colors
- oversized icon tiles
- ornamental UI that does not help a decision

The more operational the screen, the more the interface should disappear behind the task.

## 11. Sidebar rule
The sidebar should remain visually simple and easy to scan.

Default product navigation should favor a flat primary list rather than exposing the full internal architecture.

Examples:
- Overview
- Agents
- Knowledge
- Tools & MCP
- Models
- Evaluations
- Deployments
- AgentOps
- FinOps
- Governance
- Team / Access when applicable
- Settings

Subcategories such as Agent Catalog, templates, versions or runtime details should normally live inside their parent domain rather than becoming permanent top-level navigation items.

Section labels such as Build / Release / Operate / Control may exist in internal information architecture, but should not be visually prominent unless usability evidence shows they improve navigation.

Active navigation should be clear but restrained: one soft highlighted row is preferable to multiple indicators, glow or decorative states.

## 12. Brand treatment inside the product
The application shell should use the Newneo wordmark simply and confidently.

Do not place the product wordmark inside an unnecessary badge, tile or decorative logo container unless the final brand identity explicitly requires it.

The application is a working surface. Brand presence should be strong through consistency, typography and color rather than ornamentation.

## 13. Topbar rule
The topbar should feel almost invisible.

It may contain:
- search
- notifications
- help
- environment/context when needed
- user profile

Avoid large pills, heavy cards, large shadows or decorative controls that compete with page content.

## 14. Cards and surfaces
Cards should organize information without making every block feel isolated.

Use:
- thin borders
- white surfaces
- subtle background changes
- small or very soft shadows only when hierarchy requires them

Prefer flatter compositions for tables, lists and forms.

A user should perceive the content before perceiving the container.

## 15. Typography and density
Typography should be compact, highly legible and hierarchical.

Typical hierarchy:
- page title: strong but not oversized
- section title: compact and clear
- descriptive text: short and muted
- labels: small but readable
- helper text: secondary

The product should feel information-rich without feeling dense.

## 16. Real integrations should look real
Where the product exposes enterprise systems, prefer recognizable provider identities and real connector branding when legally and technically appropriate.

Examples:
- SharePoint
- Google Drive
- Confluence
- OneDrive
- ServiceNow
- Salesforce
- SAP
- Microsoft Teams
- Slack
- Custom API

Generic initials may be used in early prototypes, but final production UI should not rely on placeholder iconography when a real integration identity is available.

## 17. Guided workflow stepper
The launch/deployment stepper is a core interaction pattern.

Use a clear linear progression for workflows such as:
`Use Case → Knowledge → Tools → Model → Governance → Evaluate → Deploy`

Rules:
- current step clearly highlighted
- completed steps visibly complete but quiet
- future steps available for orientation without competing for attention
- primary Next action consistently placed
- Back action visually secondary
- no unnecessary wizard chrome

## 18. Forms
Forms should feel light and operational.

Use:
- short labels
- thin borders
- compact field heights
- restrained helper text
- clear grouping
- contextual examples
- right-side guidance only when useful

Do not expose advanced technical parameters by default.

## 19. Contextual side panels
Side panels should support the current decision, not create a second dashboard.

Good examples:
- Expected Outcomes
- Connected Sources
- Selected Tools
- Evaluation Summary
- Deployment Readiness

They should remain visually lighter than the primary form or task area.

## 20. Success states
Completion should feel clear and calm.

After a major action such as production deployment:
- confirm success immediately
- state what changed
- present a small number of relevant next actions

Example:
**Your agent is live.**

Possible next actions:
- Monitor performance
- Review user feedback
- Iterate and improve
- Launch another agent

Avoid ending a business workflow with only a technical identifier or raw deployment message.

## 21. Progressive complexity by maturity
A new customer should be able to launch a first governed use case without understanding the entire platform.

The experience should progress from:
`Guided → Co-managed → Advanced / Self-service`

Advanced functionality should become available as customer maturity and permissions increase.

## 22. Reuse should be visible
The platform should show users when approved assets already exist.

Examples:
- Existing knowledge source available
- Approved Salesforce connector already configured
- Organization policy inherited
- Evaluation suite reused
- Existing production model approved

This reinforces the platform value proposition: the next use case should be easier than the first.

## 23. Hide infrastructure until it matters
Deployment architecture is important, but it should not dominate daily workflows.

Most users should see simple choices such as:
- Organization Default
- Managed AI
- Customer Cloud
- Private AI
- Hybrid

Detailed runtime, region, cluster, networking and infrastructure configuration appears only for authorized advanced users.

## 24. No dead-end screens
Every empty, error or blocked state must explain what to do next.

Examples:
- No agents yet → Browse Agent Catalog
- No knowledge sources → Connect Knowledge
- Evaluation failed → Review Failed Tests
- Production blocked → Complete Required Approval

## 25. Design for global use
The product must not assume one country, language, currency, regulatory framework or cloud provider.

Default product copy should remain globally applicable.

Localization, currency, regional data residency and compliance rules should be configuration concerns rather than hard-coded assumptions.

# Surface-specific density

## Newneo AI Platform
Use the approved Agent Catalog / Launch Guide reference most literally.

Characteristics:
- white canvas
- compact sidebar
- minimal topbar
- flat cards
- strong stepper
- real connectors
- forms and contextual side panels
- strong progressive disclosure

## Newneo Business Platform
Use the same shell and visual language with moderately higher data density for:
- pipeline
- assessments
- proposals
- handoff
- renewals

Do not turn it into a separate visual product.

## Newneo Admin Plane
Use the same shell and components with the highest analytical density of the three surfaces.

It may contain more tables, metrics and operational status, but should still avoid heavy dashboard decoration.

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
11. Does the screen look like the same product family as the approved Agent Launch Guide reference?
12. Has decoration been added that does not improve comprehension or action?

# Design north star
**The sophistication should live in the system, not in the user's cognitive load.**

# Visual north star
**A mature product should feel more sophisticated by removing friction and visual noise, not by adding decoration.**
