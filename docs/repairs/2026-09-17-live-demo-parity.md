# Live / demo visual parity repair

Confirmed structural divergence, not cache: live Skills used four unrelated KPI cards, filters before tabs, a separate table schema and vertical pipeline columns; demo used six KPIs, tabs before the single-line toolbar, a scrollable inventory panel and horizontal pipeline lanes. Knowledge lacked the demo KPI strip. Skill detail lacked its enclosing tab panel and fifth KPI.

Implemented a shared SkillInventoryLayout consumed by GlobalSkills (demo) and WorkspaceSkillPortfolio (authenticated workspace). Both share header, metric strip, view tabs, panel and style classes. Live skills use canonical inventory columns, seven-control single-line toolbar, horizontal scrollable pipeline cards, and real resource links. Agent usage counts unique agents rather than version references.

Live Knowledge uses approved knowledgePage styling, four KPI cards and source inventory columns, retaining import, detail, archive, search and pagination. Size and creation date are retained in document detail. External sync, region and coverage remain unavailable.

Live skill detail uses five KPI cards above skillDetailPanel, with existing tabs/actions retained. Agent detail uses the approved seven-field configuration panel; version/status move into the header instead of duplicate rows. Shared density CSS governs header/KPI spacing.

No account data, binding, approval, execution or permissions changed. Pipeline stage labels remain configuration-based because live maturity evidence is not implemented. Matrix/intelligence retain live metadata coverage rather than invented capability-core relationships. Other operation-specific data and empty states are not equivalent to populated demo data; no claim of complete functional parity.

Validation: production builds; authenticated GAW screenshots for Skills inventory, skill detail, agent detail and Knowledge; search empty state and clearing; status filter; Matrix and Intelligence tabs. Backup: /tmp/newneo-before-live-parity.tgz and /tmp/newneo-knowledge-before-parity.tsx on server.
