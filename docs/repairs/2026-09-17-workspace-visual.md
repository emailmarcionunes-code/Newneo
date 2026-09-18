# Official workspace visual refinement

Cause: authenticated routes render WorkspaceRegistry / WorkspaceSourceOps rather than demo components. Prior demo styling did not supply the same hierarchy to the connected workspace.

Changes: agent and skill directories have compact real-data KPI strips, counted configuration filters, a bounded scrollable directory, version bindings and explicit row links. Detail pages use four KPIs and mission/configuration/activity panels. Knowledge receives a KPI strip and titled document/activity panels. Shared registry styles align spacing, tables, cards and responsive behavior across Governance, Evaluations, AgentOps, FinOps, Reports and Audit. Unconnected service surfaces retain explicit pending states with structured panels.

No fake operational metrics, membership changes, execution activation or data migrations. Existing creation, archive/restore, versioning and references preserved.

Remote backup: /tmp/newneo-before-workspace-visual.tgz
Source staging: /tmp/newneo-next-groups/components/Workspace{Registry,Knowledge,Overview}; authoritative source /home/ubuntu/platform.

Verification: production Next build including types passed; app container healthy and monitor successful. In authenticated GAW browser, confirmed real KPI values and expanded directory columns, Archived filter empty state, restoring All, and row-click navigation to the three-panel agent detail.
