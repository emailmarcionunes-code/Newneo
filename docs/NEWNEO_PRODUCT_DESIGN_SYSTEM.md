# Newneo Product Design System

## Status
Canonical product UI reference for:
- Newneo AI Platform
- Newneo Business Platform
- Newneo Admin Plane

This document complements the Design Manifesto and translates the approved Agent Catalog / Agent Launch Guide visual reference into reusable product rules.

## 1. Design objective
Newneo should feel:
- premium
- calm
- precise
- enterprise-grade
- modern
- operational
- easy to understand

It should not feel:
- decorative
- cyberpunk
- overly dashboard-heavy
- marketing-like inside the application
- visually noisy
- technically intimidating by default

Primary visual principle:
**Rich in useful detail, restrained in decoration.**

## 2. Approved visual reference
The approved Agent Catalog / Agent Launch Guide sequence is the primary visual reference for the customer-facing product.

Preserve its qualities:
- compact dark sidebar
- simple Newneo wordmark
- white working canvas
- very light topbar
- modest page titles
- thin borders
- flat or nearly flat cards
- compact form controls
- subtle status colors
- clear blue primary CTA
- contextual right-side assistance
- simple linear stepper
- real integration identities
- high information density with strong whitespace

## 3. Application shell

### Sidebar
Recommended width: approximately 200–230 px on desktop.

Visual characteristics:
- dark navy background
- simple Newneo wordmark near top
- compact icon + label rows
- no large logo tile
- minimal active state
- customer/workspace identity at bottom
- no decorative gradients required

Primary customer navigation:
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
- Team / Access where applicable
- Settings

Do not surface every product sub-object as permanent navigation.

### Topbar
Recommended height: approximately 56–64 px.

May contain:
- search
- notification
- help
- user profile
- optional environment context

The topbar should remain visually subordinate to page content.

## 4. Canvas
Default application background should be white or extremely light neutral.

Do not use large hero surfaces in ordinary operational pages.

Pages should generally begin with:
- optional breadcrumb
- page title
- short supporting sentence
- one primary action
- optional workflow stepper
- content

## 5. Typography
Use a modern sans-serif with compact enterprise proportions.

Suggested hierarchy:
- page title: 24–32 px
- section title: 15–20 px
- body: 12–14 px
- labels: 10–12 px
- helper text: 9–11 px

Rules:
- short headings
- short descriptive copy
- strong contrast
- muted secondary text
- avoid oversized marketing headlines inside the application

## 6. Color roles

### Navy
Application frame and sidebar.

### Blue
Primary action, selected state, current wizard step, links and focus.

### Green
Success, healthy, passed, connected, live.

### Amber
Needs attention, pending review, warning.

### Red
Critical, failed, blocked.

### Violet
Limited secondary category or technical state.

Do not use multiple accent colors merely for visual variety.

## 7. Borders, radius and shadow

### Borders
Use thin neutral borders as the primary method of separation.

### Radius
Moderate radius only.

Suggested:
- inputs: 6–9 px
- buttons: 6–9 px
- cards: 8–12 px
- pills: fully rounded when appropriate

Avoid excessive 16–24 px rounding throughout the app.

### Shadows
Use minimal shadows.

Default card should normally work with border only.

Shadow is reserved for:
- floating menus
- dialogs
- elevated overlays
- occasional hierarchy

## 8. Buttons

### Primary
- solid blue
- white text
- one dominant primary action per screen

### Secondary
- white background
- blue or dark text
- thin neutral or blue border

### Tertiary
- text/link treatment

Avoid large glossy buttons, gradients and multiple equal-weight CTAs.

## 9. Forms
Forms should remain compact and calm.

Characteristics:
- white background
- thin border
- compact field height
- short labels
- supporting copy only when necessary
- clear selected state
- error state close to the field

Advanced configuration belongs behind:
- Advanced Settings
- drawer
- expander
- secondary tab

## 10. Agent Launch Guide pattern
Canonical steps:
`Use Case → Knowledge → Tools → Model → Governance → Evaluate → Deploy`

### Stepper
- horizontal on desktop
- compact
- blue current step
- quiet completed/future states
- labels remain readable

### Page layout
Primary task area dominates.

A secondary contextual panel may contain:
- expected outcomes
- connected sources
- selected tools
- estimated impact
- evaluation score
- readiness

The side panel should support the current decision only.

## 11. Agent Catalog
Agent Catalog should prioritize scanability.

Use:
- category filters
- small icon tile
- agent name
- one-line purpose
- short tags
- clear Use This Agent / Launch action

Avoid long descriptions and oversized cards.

## 12. Knowledge and Tools
Connector cards should use recognizable real integration identity when possible.

Examples:
- SharePoint
- Google Drive
- Confluence
- OneDrive
- Notion
- Salesforce
- ServiceNow
- SAP
- Microsoft Teams
- Slack
- Custom API

Show:
- provider identity
- one-line purpose
- connection state
- primary Connect / Configure action

Selected/connected resources may appear in a compact right-side list.

## 13. Model & Runtime
Default first decision:
**Where should this AI run?**

Present simple options:
- Organization Default
- Managed AI
- Customer Cloud
- Private AI
- Hybrid AI

Then show the approved model selection.

Advanced details such as:
- provider endpoint
- context window
- inference settings
- region
- cluster
- GPU
- networking

remain hidden until requested or role-authorized.

## 14. Governance
Present governance in business-readable groups.

Recommended categories:
- Access & Permissions
- Policies
- Data Controls
- Compliance
- Approvals

Examples:
- Require approval for sensitive actions
- Log all interactions
- Do not store customer PII
- Respect data residency
- Mask sensitive data

Technical policy engine details remain advanced.

## 15. Evaluation
Evaluation should communicate production confidence.

Show:
- overall evaluation score
- relevance
- groundedness
- safety
- tool success
- task success
- failed / warning cases

Use green strongly only for passing states.

The screen should make the next action obvious:
- review failed cases
- rerun evaluation
- proceed to deployment

## 16. Deployment
Deployment should clearly communicate environments:
- Development
- Staging / Test
- Production

Production should appear as the deliberate final selection.

Before production, summarize:
- Agent
- Model / runtime
- Knowledge sources
- Tools
- Access
- Governance
- Evaluation score

The final CTA should be explicit, e.g.:
**Deploy to Production**

## 17. Success state
After deployment, use a clean confirmation screen.

Recommended content:
- success icon
- short confirmation
- agent name
- environment
- primary action: Go to Agent Overview
- secondary action: Create Another Agent

Next-step cards may include:
- Monitor performance
- Review user feedback
- Iterate and improve
- Explore additional agents

## 18. Dashboard rules
Dashboards should be operational, not decorative.

Use:
- 3–5 top metrics
- one or two main charts
- ranked lists
- lightweight tables
- explicit recommendations

Avoid:
- large hero cards
- decorative waves
- excessive shadows
- too many metric cards
- large colored backgrounds

## 19. AgentOps
AgentOps should emphasize:
- what needs attention
- affected agents/tasks
- business impact
- likely cause
- evidence
- recommended next action

Status colors must be semantic.

## 20. FinOps
FinOps should visually inherit AgentOps patterns.

Prioritize:
- AI Units
- total spend
- cost per task
- cost per successful task
- budget vs actual
- forecast
- optimization opportunities

Do not expose raw token accounting as the default customer view.

## 21. Business Platform adaptation
Use the same shell and component system.

Higher data density is acceptable for:
- pipeline
- accounts
- assessments
- proposal readiness
- handoff
- renewals

But avoid making it visually resemble a separate CRM product.

## 22. Admin Plane adaptation
Use the same shell and design language.

Admin Plane can have the highest density.

Prioritize:
- Customer 360
- subscriptions
- contracts
- usage
- infrastructure
- incidents
- FinOps
- profitability
- renewals

Tables may be denser, but the UI should remain flat and calm.

## 23. Component hierarchy
Preferred hierarchy:
1. Canvas
2. Page header
3. Primary task/content
4. Secondary context
5. Drill-down detail

Do not create visual hierarchy primarily by increasing decoration.

## 24. Real-product test
Before accepting a screen, ask:

- Does this look like a real product or a concept dashboard?
- Can the user identify the primary task immediately?
- Is the shell visually quieter than the content?
- Are integrations represented credibly?
- Are technical details progressively disclosed?
- Could one visual element be removed without losing meaning?
- Is the screen consistent with the approved Agent Launch Guide reference?

If the answer to the last question is no, the screen is not complete.

## 25. North star
**More sophistication through precision, not decoration.**
