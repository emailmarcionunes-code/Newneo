# Supporting screen visual refinement

The twelve screenshots supplied on September 16 are the reference for this revision. The Hybrid v4 Design context (file `7NFyk2kxLzbWsFWF8zWKNO`, node `47:502`) was also retrieved. Existing Make sources were inspected for supporting screen composition.

## Changes

- Agents: nine-column inventory, pale icon tiles, model tags, version/deployment metadata and compact status filters.
- Knowledge: source icon tiles, type tags, blue coverage bars with visible percentages, region, and a synchronization shortcut to the existing Sync sub-screen.
- Tools & MCP: full-width tools table and a separate MCP Servers view, server/version/status cards and the reference warning banner.
- Governance: policy table with scope, severity, enforcement, violations and editing. Existing permission-aware switches and approval flow remain available.
- Evaluations: full-width run table with date, readiness bars and scenario results; detailed scenario categories remain available in a disclosure.
- Deployments: compact environment summaries, segmented filtering and deployment icon tiles.
- AgentOps: incidents open first, with a health summary, incident context and status filtering. Health cards and logs remain accessible.
- FinOps: six summary cards, equal-width agent/model spend panels and visible bar percentages. Cost/task and cost/success derive from the sample workspace.
- Reports: period selector, custom dates, CSV and browser print-to-PDF, performance bars and compliance summary. Existing report scheduling remains available below.
- Playground: large conversation area, right-hand parameters, empty-state suggestions, agent selection, clear conversation and send controls.
- Audit Log: compact search/action filters, additional filters in a disclosure, role/action tags and CSV export.
- Shared: compact breadcrumb and journey stepper; consistent table borders, spacing, semantic pills, icon tiles and accessible percentage bars.

## Data and interaction boundaries

This is still a local interactive preview. Existing workspace records, created agents, permissions, configuration, releases, reports and source state remain in use. Therefore displayed record names, sample values and row counts are not a literal replacement with the historical screenshot dataset. MCP reference cards are illustrative, not connected infrastructure.

Report period totals are explicitly marked as simulations from daily sample volume; spend is the current workspace snapshot. Export PDF opens the browser print dialog, where the user can save as PDF. No email, model, cloud or external MCP connection is executed.

The approved official logo and manual-only static sidebar behavior were retained. New table labels and the AgentOps default tab were reflected in existing interaction tests.

## Validation

- Production build and TypeScript checks.
- Browser suite covering the existing lifecycle, roles, persistence, source flows, sidebar behavior, accessibility and layouts from 390 to 1440 pixels.
- Added browser coverage for MCP tab switching, visible coverage percentage, source Sync shortcut, report period calculation/CSV download and Playground suggestion/clear behavior.
- Desktop screenshots inspected for the supporting surfaces; the tests also check horizontal page overflow and accessibility at mobile widths.

This records visual and functional refinement, not a pixel-diff certification against the supplied raster images.

Final results: production build passed; 23 unit tests passed and one optional PostgreSQL integration test skipped. All 50 browser cases passed (49 in the final full run, then the environment-filter case passed after updating its selector for the intentional select-to-buttons change). Preview routes on port 3117 returned HTTP 200. No infrastructure integration was added.
