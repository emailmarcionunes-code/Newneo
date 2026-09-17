# Desktop density refinement — 2026-09-16

Hybrid v4 colors, typography, routes and actions are preserved. Density overrides live in `ai-platform/app/desktop-density.css`, loaded last.

| Surface | Decision |
|---|---|
| Overview | Agent health, activity and compact governance/evaluation/intelligence column in one desktop row. |
| Agent Detail | 42/29/29 main row: performance, configuration (including skill count), recent tasks with time/result. |
| Skill Detail | KPI strip followed by capability, reuse and usage panels; long reuse details scroll internally. |
| Knowledge Detail | Existing two-panel source/agent composition retained; compact shared headers/KPIs. |
| Tool Detail | Description, linked agents and recent calls share a row; complete call table remains scrollable. |
| Evaluation Detail | Scenario results and expandable output evidence are side by side. |
| Deployment Detail | Existing timeline/configuration pair retained; compact shared spacing. |
| AgentOps | Existing health cards and incident/log tabs retained; compact KPIs/header. |
| FinOps | Agent costs, model costs and recommendations in one row; costs scroll internally. |
| Governance | Full policy tables and tabs retained; compact KPIs/header. |
| Reports | Full performance table retained; compact KPIs/header rather than squeezing table columns. |

Desktop three-column compositions begin at 1280px where needed. Tablet agent panels use two columns and activity below. Mobile stacks naturally. No content was removed or fabricated to fill whitespace. The sample recent-task history has four entries; no artificial extra entries or misleading View all link was added.

Validation: TypeScript; existing agent-detail and row-navigation browser tests; screenshots of all eleven listed routes at 1440×900; responsive checks of Overview, Agent Detail, Skill Detail and FinOps at 1440, 1024 and 390px with no document horizontal overflow. Preview/demo data only; this is not runtime validation.
