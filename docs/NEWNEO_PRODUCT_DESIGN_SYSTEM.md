# Newneo Product Design System v2

## Status
**Approved family-wide design standard.**

This document is the canonical visual and interaction reference for:
- Newneo AI Platform
- Newneo Business Platform
- Newneo Admin Plane
- Newneo Website where application patterns are reused
- future Newneo product surfaces
- other products that intentionally adopt the Newneo visual system

Primary principle: **More sophistication through precision, not decoration.**
North star / Golden Reference UI: the approved **Agent Catalog + Agent Launch Guide** sequence in the `Newneo Product Design` Figma file.

The approved Golden Reference is the default benchmark for spacing, hierarchy, typography, density, component treatment and interaction quality. New screens should extend this system rather than invent a new visual language.

## 0. Product-family rule
**One design language. Different information density.**

- Customer AI Platform: cleanest and lowest cognitive load.
- Business Platform: same language, more workflow and commercial density.
- Admin Plane: same language, highest analytical and operational density.
- Website: same brand foundations, but more freedom for storytelling, hero sections, motion and visual expression.

Application surfaces should not use website-style visual decoration as a substitute for product hierarchy.

## 1. Core visual language
Newneo product surfaces should feel premium, calm, precise, enterprise-grade and easy to understand.

Use:
- compact dark sidebar
- simple lowercase `newneo` wordmark
- white / near-white working canvas
- light topbar
- thin borders
- nearly flat cards
- modest page titles
- compact but readable controls
- blue as the single primary action color
- green for success / healthy states
- contextual right-side assistance
- progressive disclosure
- real integration identities

Avoid:
- hero cards inside the application
- decorative waves or gradients
- heavy shadows
- excessive rounding
- cyberpunk treatment
- oversized marketing headlines
- too many accent colors

## 2. Design tokens

### Colors
| Token | Value |
|---|---|
| primary | `#2563EB` |
| primary-hover | `#1D4ED8` |
| primary-light | `#3B82F6` |
| primary-tint | `#EFF6FF` |
| primary-tint-strong | `#DBEAFE` |
| navy | `#0B1220` |
| navy-soft / text-primary | `#0F172A` |
| text-secondary | `#64748B` |
| text-muted | `#94A3B8` |
| border | `#E2E8F0` |
| surface | `#FFFFFF` |
| canvas | `#F8FAFC` |
| chip-bg | `#F1F5F9` |
| success | `#16A34A` |
| success-light | `#10B981` |
| success-tint | `#ECFDF5` |
| warning | `#F59E0B` |
| danger | `#EF4444` |
| accent-purple | `#7C3AED` |
| accent-purple-tint | `#F3E8FF` |
| accent-green | `#059669` |
| accent-green-tint | `#D1FAE5` |

Color rule: blue = action, green = confirmation, amber/red = attention/failure, violet = limited secondary use.

### Typography
Font: `Inter, system-ui, -apple-system, sans-serif`.

- page title: 24–28px / 700 / 1.2
- section title: 18–20px / 600
- card title: 15–16px / 600
- body: 14px / 400 / 1.5
- label: 13px / 500
- caption: 12–13px / 400
- button: 14px / 500
- sidebar item: 14px / 500
- stepper label: 12px / 500
- metric large: 32–36px / 700

Do not reduce body/sidebar text to tiny sizes merely to fit more information.

### Spacing
Use an 8px-based system:
`4 / 8 / 12 / 16 / 24 / 32px`.

Defaults:
- card padding: 16–24px
- card gap: 16px
- canvas padding: 32px
- section gap: 24–32px

### Radius
- small: 6px
- medium: 8px
- large: 12px
- full: 9999px

### Borders and elevation
Default border: `1px solid #E2E8F0`.
Default card shadow: `0 1px 2px rgba(15,23,42,0.04)`.

Hierarchy comes from spacing, border and background before shadow.

Selected card: `2px solid #3B82F6` + `#EFF6FF`.
Selected success state: `2px solid #16A34A` + `#ECFDF5`.

## 3. Application shell

### Sidebar
Canonical width: **220px**.
Background: `#0B1220`.

Wordmark: `newneo`, all lowercase, no symbol.
- on dark: `new` white, `neo` `#3B82F6`
- reference height ~24px

Sidebar item:
- 40px height
- 8px 12px padding
- 18px Lucide icon
- 14px label
- active = primary blue background + white icon/text
- radius 8px

Customer navigation:
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
- Settings

`Team / Access` stays under Governance or Settings unless a future requirement justifies top-level navigation.

Workspace / organization switcher belongs at the bottom.

### Topbar
Canonical height: **56px**.
Background white, border-bottom `#E2E8F0`, horizontal padding 24px.

Preferred contents:
- breadcrumb left
- notification
- help
- avatar
- user / organization
- chevron

Search is optional and should not visually dominate.

### Canvas
Background `#F8FAFC`, padding **32px**, max width about 1280px.

Normal page order:
1. optional breadcrumb
2. page title
3. short subtitle
4. one primary action
5. optional stepper
6. content

## 4. Icons and third-party logos
Canonical UI icon library: **Lucide**.

- stroke 1.5px
- 18–20px standard UI size
- monochrome menu/action icons
- category icons may sit in same-family tint tiles
- agent categories should use distinct semantic icons, not repeated placeholders
- third-party integrations must use credible official brand logos / supplied SVG assets where licensing and availability allow

Suggested agent mapping:
- Customer Service Agent → headset
- IT Support Agent → monitor
- Knowledge Assistant → book-open
- Sales Assistant → chart / trending-up
- Process Automation → settings / workflow
- Research Assistant → flask

Suggested platform mapping:
Agent `bot`; Knowledge `database/book-open`; Tools & MCP `plug/wrench`; Model `cpu`; Governance `shield-check`; Evaluation `clipboard-check`; Deploy `rocket`; Success `check-circle`; API `code`.

**Asset rule:** icon/logo polish is replaceable and must not block engineering. Code must reference reusable `AgentIcon`, `ProviderLogo`, `LaunchIcon` or equivalent components/assets rather than hard-coded drawings.

## 5. Buttons
Primary: blue background, white text, 14px/500, 8px 16px, radius 8px.
Secondary: white + neutral border + dark text.
Outline blue: white + primary border/text; used for `Connect`.
Add action: dashed light-blue border, primary text, plus icon.
Link action: primary text + optional arrow-right.

One dominant primary CTA per screen.

## 6. Chips and tags
Filter chips: pill, 6px 14px, 13px/500. Active = primary blue/white. Inactive = white/border/secondary text.

Tags: `#F1F5F9`, secondary text, 12px, 2px 8px, radius 6px.

## 7. Agent Catalog
Card:
- white surface
- neutral border
- radius 12px
- padding 20px
- 40px icon tile with 22px icon
- unique semantic icon per agent type
- concise title and one-line description
- short tags
- clear Launch / Use This Agent action

Grid generally 3 columns, gap 16px.

Avoid oversized descriptions or cards.

## 8. Knowledge and Tools & MCP
Integration tile:
- white surface
- border
- radius 12px
- padding 16px
- official / approved provider logo ~28–32px
- provider name 13px/600
- short caption
- full-width outline-blue `Connect`

Examples:
SharePoint, Google Drive, Confluence, OneDrive, Notion, Salesforce, ServiceNow, SAP, Microsoft Teams, Slack, Custom API.

Connected / selected resources may appear in a contextual right-side panel. These panels must preserve comfortable horizontal padding, row spacing, status alignment and readable two-line labels; do not compress the content merely to preserve a rigid 2/3 split.

## 9. Forms
Label: 13px/500.
Input/select: 40px height, white, border, radius 8px, padding 0 12px, 14px text.
Focus: primary border + 2px primary-tint-strong ring.
Textarea: minimum 80px.
Checkbox: 18px, radius 6px, primary blue when checked.

Advanced engineering controls live behind `Advanced settings`, drawers, expanders or secondary tabs.

## 10. Canonical Agent Launch Guide
Flow:
`Use Case → Knowledge → Tools → Model → Governance → Evaluate → Deploy`

Stepper:
- horizontal desktop
- 7 steps
- 28px circles
- 1px connector
- active = primary blue + white number
- completed = success green + white check
- completed connector segment = success green
- pending = neutral border / muted text
- 12px labels

Wizard desktop layout:
- primary task area approximately 2/3
- contextual panel approximately 1/3
- 24px gap
- proportions may flex when readability requires more room in contextual panels

Bottom navigation:
`← Back` left and `Next →` right.

Every wizard page must reuse this same skeleton.

## 11. Contextual side panel
Radius 12px, padding 20px.

Only current-decision context belongs here:
- expected outcomes
- connected sources
- selected tools
- estimated impact
- cost / latency
- evaluation score
- readiness

Connected source pattern: 24px logo + name + detail/domain + 8px green status dot.

## 12. Model & Runtime
First question: **Where should this AI run?**

If the organization has a default, show it first as recommended with `Change execution model`.

Choices:
- Organization Default
- Managed AI
- Customer Cloud
- Private AI
- Hybrid AI

Then show only approved model endpoints.

Hide endpoint internals, inference settings, region, cluster, GPU and networking until advanced view.

## 13. Governance
Business-readable groups:
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

Technical policy-engine detail remains advanced.

## 14. Test & Evaluate
Show production confidence rather than raw telemetry.

Core evaluation dimensions:
- relevance
- groundedness
- safety
- tool success
- task success
- failed/warning cases

Donut: **continuous** green progress ring, neutral trail, large central value. Do not use visually chopped or segmented progress rings unless explicitly required.
Metric bars: 6px, fully rounded, green fill.
Status: Passed / Needs Review / Failed.

Test chat uses 28px avatars, light bordered message bubbles and 40px input with blue Send button.

## 15. Deployment
Environments:
- Development
- Staging / Test
- Production

Before Production summarize:
- Agent
- Model / runtime
- Knowledge sources
- Tools
- Access
- Governance
- Evaluation score

Final CTA: **Deploy to Production**.

## 16. Success state
Centered, simple confirmation.

- 64px success-tint circle
- 32px green check
- short headline: `Your agent is live!`
- short subtitle
- primary: `Go to Agent Overview →`
- secondary: `Create Another Agent`

`What's next?` may show:
Monitor performance, Review user feedback, Iterate and improve, Explore additional agents.

## 17. Dashboard rules
Operational dashboards should use:
- 3–5 top metrics
- one or two primary charts
- ranked lists
- lightweight tables
- explicit recommendations

Avoid giant hero cards, decorative waves, large colored backgrounds, heavy shadows and excessive metrics.

## 18. AgentOps
Prioritize:
- what needs attention
- affected agents/tasks
- business impact
- likely cause
- evidence
- recommended action

## 19. FinOps
Prioritize:
- AI Units
- total spend
- cost per task
- cost per successful task
- budget vs actual
- forecast
- optimization opportunities

Raw token accounting is not the default customer view.

## 20. Business Platform adaptation
Use the same shell and components.
Higher density is acceptable for pipeline, accounts, assessments, proposal readiness, handoff and renewals.
It must still look like Newneo, not a separate CRM product.

## 21. Admin Plane adaptation
Use the same shell and design language.
Admin Plane may have the highest density.
Prioritize Customer 360, subscriptions, contracts, usage, infrastructure, incidents, FinOps, profitability and renewals.
Dense tables are acceptable, but the UI stays flat and calm.

## 22. Website adaptation
The Website shares brand foundations, typography, color discipline and component DNA, but may be more expressive.

Allowed on Website when useful:
- hero storytelling
- larger typography
- background motion / subtle waves
- richer illustration
- marketing narrative sections

Do not copy marketing decoration into ordinary product screens.

## 23. Reuse across other products
The Newneo foundations may be reused by other products when intentionally adopted.

Reusable layers include:
- tokens
- typography
- spacing
- radius
- icon system
- cards
- forms
- tables
- navigation patterns
- status patterns
- charts
- progressive disclosure

Brand accent, wordmark, domain terminology and product-specific IA may change. The core UX philosophy remains reusable.

## 24. Implementation tokens
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT:'#2563EB', hover:'#1D4ED8', light:'#3B82F6', tint:'#EFF6FF', 'tint-strong':'#DBEAFE' },
        navy: { DEFAULT:'#0B1220', soft:'#0F172A' },
        surface:'#FFFFFF', canvas:'#F8FAFC', chip:'#F1F5F9', line:'#E2E8F0',
        ink: { DEFAULT:'#0F172A', secondary:'#64748B', muted:'#94A3B8' },
        success: { DEFAULT:'#16A34A', light:'#10B981', tint:'#ECFDF5' },
        warning:'#F59E0B', danger:'#EF4444',
        accent: { purple:'#7C3AED', 'purple-tint':'#F3E8FF', green:'#059669', 'green-tint':'#D1FAE5' }
      },
      fontFamily: { sans:['Inter','system-ui','sans-serif'] },
      borderRadius: { sm:'6px', md:'8px', lg:'12px' },
      boxShadow: { card:'0 1px 2px rgba(15,23,42,0.04)' },
      spacing: { sidebar:'220px', topbar:'56px' }
    }
  }
}
```

## 25. Acceptance checklist
Before approving a screen:
1. Does it match the approved Golden Reference UI visual language?
2. Is the shell quieter than the content?
3. Can the user understand the screen within five seconds?
4. Is there one primary action?
5. Is body/sidebar text readable without miniaturization?
6. Is color semantic rather than decorative?
7. Are borders doing more work than shadows?
8. Are advanced technical details progressively disclosed?
9. Are third-party integrations represented with credible identity?
10. Is spacing consistent with the 8px system?
11. Could any visual element be removed without losing meaning?
12. Does it look like a production product rather than a concept dashboard?
13. Does it reuse an existing pattern before inventing a new one?

## Golden Reference UI
**Agent Catalog + Agent Launch Guide** in Figma are the approved Golden Reference UI for the Newneo product family.

The sophistication should live in the system, not in the user's cognitive load.

**More sophistication through precision, not decoration.**
