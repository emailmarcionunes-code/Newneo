# Authenticated visual regression repair

The real-workspace wrappers had replaced the approved Hybrid compositions with generic registry markup. The demo retained its styling, while live screens lost density, hierarchy, icons and panel structure.

Changes:
- Scope Hybrid v4 spacing, petroleum accent, compact metrics, panel headings, tabs, forms and table styling to `.registry` authenticated surfaces.
- Restore full available desktop width, with two-column/tablet and stacked/mobile layouts.
- Recompose real Overview with icon metrics, agent portfolio, readiness rows and timeline activity. Active counts exclude archived configurations. No fabricated operational metrics.
- Agent/Skill list resource icons, status badges and row navigation; detail overview uses structured configuration rows.
- Restore List/Pipeline/Matrix/Intelligence views for the real skill registry. Derived views use saved domain and version references, not demo maturity or synthetic evaluations.
- Preserve existing real APIs, roles, immutable versions, source operations and cost gates. No database migration.

This repairs presentation of existing live capabilities. It does not activate model execution or recreate demo-only analytics as real results. Full feature parity between demo and live remains separate backend work.

Verification: production Next.js build and authenticated hosted browser review (results recorded after deployment).

Hosted review confirmed Overview, Agent Detail, Skills list, Knowledge, FinOps, Governance, Evaluations and AgentOps render authenticated GAW records. Health endpoint returned ready:true. Final portfolio tab interaction checks follow the final build.
