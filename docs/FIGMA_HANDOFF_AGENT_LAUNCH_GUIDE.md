# Newneo AI Platform — Figma Handoff: Agent Launch Guide

## Status
**APPROVED FOR IMPLEMENTATION.**

Canonical visual handoff for the Newneo Customer AI Platform Agent Catalog + Agent Launch Guide.

Engineering may begin now. Final third-party logo assets and a small number of icon-polish items are still pending and should be treated as replaceable visual assets, not implementation blockers.

## Visual source of truth
Figma file: `Newneo Product Design`

File key: `DmYoatzciQTR67GWU9zI98`

Primary page: `Customer Platform`

Canonical screens / node IDs:

- Agent Catalog — `4:18`
- Use Case — `7:123`
- Knowledge — `7:199`
- Tools & MCP — `7:275`
- Model & Runtime — `14:189`
- Governance — `14:265`
- Evaluate — `14:341`
- Deploy — `14:417`
- Success — `14:493`

## Canonical design system
Read `docs/NEWNEO_PRODUCT_DESIGN_SYSTEM.md` before implementation.
Also read `docs/NEWNEO_PRODUCT_SURFACE_ROADMAP.md` for approved/pending surface status.

Visual foundations are also implemented directly in Figma as:

- `Newneo Primitives`
- `Newneo Semantics`
- Inter text styles
- `Newneo/Card Shadow`

Important application shell tokens:

- Sidebar: 220px
- Topbar: 56px
- Canvas: #F8FAFC
- Sidebar: #0B1220
- Primary: #2563EB
- Border: #E2E8F0
- Card radius: 12px
- Control radius: 8px
- Grid: 8px based
- Icons: Lucide-style 18–20px / ~1.5–1.6 stroke

## Existing Figma components
The Figma design already contains reusable component assets, including:

- Button — Primary / Secondary / Outline
- Sidebar Item — Default / Active
- Filter Chip — Default / Active
- Agent Card
- Application Sidebar / Agents Active
- Launch Stepper variants

Do not recreate visually similar alternatives in code when a canonical product pattern already exists.

## Customer navigation
The customer-facing sidebar is:

1. Overview
2. Agents
3. Knowledge
4. Tools & MCP
5. Models
6. Evaluations
7. Deployments
8. AgentOps
9. FinOps
10. Governance
11. Settings

`Team` is not a top-level navigation item.

## Important product decisions represented in Figma

### Agent Launch Guide
Canonical flow:

`Use Case → Knowledge → Tools → Model → Governance → Evaluate → Deploy`

Use the same horizontal stepper and shell across all steps.

Stepper states:
- completed = green success state + white check
- current = primary blue + white number
- future = neutral border / muted label
- completed connector segment = green

### Knowledge
Use credible provider identity for enterprise data sources. The canonical screen currently includes:

- SharePoint
- Google Drive
- Confluence
- OneDrive
- Notion
- Salesforce
- ServiceNow
- Custom API

Connected resources are summarized in the contextual right panel.

### Tools & MCP
Use the product label `Tools & MCP`.

The canonical screen includes:

- ServiceNow
- Salesforce
- SAP
- Microsoft Teams
- Slack
- Custom API / MCP

The first-level UX stays simple. Permissions and approval detail must be progressively disclosed.

### Model & Runtime
The first option is:

**Organization Default · Recommended**

Then allow the user to change execution model between:

- Managed AI
- Customer Cloud
- Private AI
- Hybrid AI

Show only approved model endpoints by default. Endpoint internals and infrastructure details belong in Advanced Settings.

### Governance
Keep governance business-readable:

- Access & Permissions
- Policies
- Data Controls
- Compliance
- Approvals where relevant

Do not turn this screen into a security-engineering console.

### Evaluate
Present production confidence, not raw telemetry.

Canonical concepts:

- overall evaluation score
- relevance
- groundedness
- safety
- tool success
- passed / needs review / failed test cases
- test chat

The overall score must use a clean continuous progress ring, not a visually segmented/broken ring.

### Deploy
The user deliberately selects:

- Development
- Staging
- Production

Before production, summarize Agent, Runtime, Model, Knowledge, Tools, Access, Governance and Evaluation Score.

### Success
Do not end on technical deployment metadata.

Primary message:

**Your agent is live!**

Next actions:

- Go to Agent Overview
- Monitor performance in AgentOps
- Review user feedback
- Iterate and improve
- Explore additional agents

## Asset polish pending — does not block implementation
The following are intentionally classified as **visual polish pending**:

- final official third-party provider logo SVGs
- final optical sizing/normalization of provider logos
- final Launch rocket icon asset
- selected semantic icon refinements

Codex must not hard-code these as custom one-off drawings inside screens.

Implement reusable replaceable boundaries such as:

```tsx
<AgentIcon type="research" />
<ProviderLogo provider="salesforce" />
<LaunchIcon />
```

Names may follow project conventions; the architectural principle is mandatory.

Agent Catalog icon semantics should remain distinct:
- Customer Service → headset
- IT Support → monitor
- Knowledge → book/open book
- Sales → chart / trending
- Process Automation → gear/workflow
- Research → flask

## Current code gap
The current `ai-platform/components/AppShell.tsx` predates the canonical Figma shell.

Known mismatches include:

- old `newneo•` branding instead of the current lowercase wordmark treatment
- search-dominant topbar instead of the restrained canonical topbar
- no canonical sidebar icons
- `FinOps` missing from current code navigation
- current shell is too monolithic for reliable Code Connect

The implementation must follow Figma + product docs, not the old prototype shell.

## Codex implementation sequence

### 1. Refactor application shell
Create reusable code components that mirror Figma responsibilities, for example:

- `ApplicationShell`
- `ApplicationSidebar`
- `Topbar`
- `NavItem`

Preserve routing semantics from the current app, but update visual and information architecture to the canonical Figma version.

### 2. Create reusable UI primitives
Implement code counterparts for the canonical Figma components before composing screens:

- Button
- FilterChip
- AgentCard
- AgentIcon
- ProviderLogo
- LaunchIcon
- IntegrationTile
- Stepper
- FormField / SelectField
- ContextPanel
- Callout
- EnvironmentOption
- ProgressRing

Use existing project conventions where they already exist; do not introduce a second component system.

### 3. Implement Agent Catalog
Use Figma node `4:18` as the canonical visual source.

### 4. Implement Agent Launch Guide skeleton
Build one reusable wizard layout and reuse it across all seven configuration steps.

### 5. Implement the seven steps
In order:

1. Use Case — `7:123`
2. Knowledge — `7:199`
3. Tools & MCP — `7:275`
4. Model & Runtime — `14:189`
5. Governance — `14:265`
6. Evaluate — `14:341`
7. Deploy — `14:417`

Then implement Success — `14:493`.

### 6. Add Code Connect only after refactor
Do not map a Figma component to an unrelated or overly broad code component merely to create a mapping.

Once code components exist 1:1, map at minimum:

- Figma Button ↔ code Button
- Figma Filter Chip ↔ code FilterChip
- Figma Agent Card ↔ code AgentCard
- Figma Application Sidebar ↔ code ApplicationSidebar
- Launch Stepper ↔ code Stepper
- later: IntegrationTile, ContextPanel, EnvironmentOption, ProviderLogo and ProgressRing

## Acceptance rules
A screen is not complete only because it compiles.

For each screen compare the implementation with its Figma node and verify:

- spacing and hierarchy
- typography
- sidebar / topbar proportions
- correct navigation labels
- one dominant primary CTA
- correct border/radius/shadow treatment
- progressive disclosure
- connector identity
- stepper state
- responsive behavior
- product terminology

The final implementation should look like the Figma product, not a reinterpretation of it.

Minor logo/icon asset differences are acceptable during initial engineering only when components are replaceable and clearly marked for final visual QA.

## Ownership
- Product / Strategy / UX Architecture: ChatGPT + Marcio final decision
- Visual Source of Truth: Figma
- Engineering / Implementation / Tests / CI: Codex

Workflow:

`Product decision → Figma → Product approval → Codex → Product acceptance → Release`
