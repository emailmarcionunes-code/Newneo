# Official workspace style-guide correction

Authority: Hybrid v4, the September 16 supporting-screen references, and the subsequent approved petroleum palette and desktop-density refinements. This is not a new visual system.

## Applied composition

- Overview: restore the operational KPI labels and compact agent health row; remove the invented setup callout and retain the guide’s panel alignment. Unmeasured operational values remain unavailable.
- Agents: retain the canonical shared nine-column inventory. Detail configuration exposes infrastructure, model, knowledge, skills, tools, policies and evaluation availability.
- Skills: retain List, Pipeline, Matrix and Intelligence; detail KPIs appear above tabs. Restore detail tab positions for tools, knowledge, governance and evaluations with truthful unavailable states.
- Knowledge: canonical source table with icon, type, status, size, date and view action. Import/read/archive and pagination remain.
- Tools & MCP: canonical metrics, Tools/MCP tabs and inventory headers, with disconnected state.
- Deployments: environment cards, environment filter and deployment history table, with no claimed deployments.
- Governance: review records use the canonical table and semantic decision status. Request/decision and independent-review controls retained.
- Evaluations: canonical tabs and metric strip; suite editing, running and recorded case results retained.
- AgentOps: Activity, Health and Incidents views. Recorded source searches and infrastructure health remain distinct from unconnected agent incident monitoring.
- FinOps: six metrics, paired spend panels, separate control/evidence and notification/approval tabs. All control records retained, no fabricated allocation or invoice totals.
- Reports: canonical history table and existing CSV export retained; data scope explicitly source-search records.
- Playground: main conversation/source-excerpt workspace and parameters rail, with bottom input and clear action; lexical retrieval behavior retained.
- Audit Log: canonical table, action tags and monospace references; export and pagination retained.

## Boundaries

No authentication, database, cost gates, membership authorization or service execution logic changed. No demo records copied into a live workspace. Existing backend coverage is narrower than the demo: unconnected model, tool, deployment and behavioral telemetry services remain explicit. This work does not claim those integrations are implemented.

Backup: `/tmp/newneo-before-style-guide-audit.tgz` on the application host. Production build passed before final navigation changes; final build and hosted visual verification recorded below after completion.

## Hosted verification

Authenticated GAW workspace inspected in Chrome: Overview, Agents navigation and Configuration tab, Skills list and Pipeline, Skill detail, Knowledge, Tools/MCP switching, Deployments, Governance, Evaluations/configuration-check switching, AgentOps/Health switching, FinOps/controls/alerts switching, Reports, Playground and Audit Log. No configuration writes, test runs or consumption-limit changes were performed.

Playground at 390 × 844: page width equals viewport width (390px), conversation and parameters stack naturally. Desktop checks at 1710px showed no page-level horizontal overflow in Skills, Playground and Audit Log. Temporary viewport restored.

Final visual findings corrected: four-column Skill metrics, official portfolio Tabs component, neutral disconnected environment status, equal-width FinOps panels and restored admitted-client count within Cost controls.

Final production build and TypeScript validation passed. App container recreated successfully and monitoring check completed. Final hosted checks confirmed equal FinOps panel widths (711px each at 1710px viewport) and four equal Skill KPI columns (350.5px each), with no document overflow. User browser returned to the authenticated Overview.
