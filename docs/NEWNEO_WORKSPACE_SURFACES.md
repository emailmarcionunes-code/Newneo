# Workspace surfaces and implementation status

## Frontend

All eleven sidebar destinations now render useful content: Overview, Agents, Knowledge, Tools & MCP, Models, Evaluations, Deployments, AgentOps, FinOps, Governance and Settings. Agent Detail has eight navigable tabs. The Launch Guide still supports the complete seven-step demonstration flow.

The non-Launch-Guide surfaces remain prototypes because their final Figma treatment is pending. They reuse the existing Golden Reference shell, tokens and components and implement content from NEWNEO_AI_PLATFORM_V1_UX.md and NEWNEO_FINOPS_SPEC.md. No final visual approval is implied.

Registry views provide search, category filtering, clear-filter empty states, resource details and explicit connection/readiness information. AgentOps includes a health-prioritized fleet, filtering/sorting, agent inspection and incident evidence/recommended actions. FinOps calculates cost per task and successful task from a consistent sample fleet and offers a local budget calculator. The calculator does not create a budget or enforce spending. AI Unit conversion and forecasts show unconfigured states rather than fabricated calculations.

Governance separates policies, product role names, approvals, data classifications and audit references. No frontend action grants permissions. Settings is connected to the actual session and workspace endpoints when configured.

## Backend

See NEWNEO_BACKEND_FOUNDATION.md for OIDC login, restricted PostgreSQL access and version-checked server draft copies. See NEWNEO_PILOT_DEPLOYMENT.md for container packaging and the low-cost deployment sequence.

## What is not complete

This is not a complete production AI platform. No real source ingestion, connector authentication, MCP execution, model invocation, evaluation runner, production release controller, operational telemetry pipeline, central session revocation or enforced FinOps spending control is implemented. These need backend integrations as well as external service configuration. The deployment endpoint intentionally refuses real deployments. Sample dashboards must never be treated as production evidence.

## Verification

Browser tests cover all sidebar routes at 1180, 768 and 390px, interaction flows and new-content accessibility. Existing documented shell/avatar and Golden Reference contrast exceptions remain tracked separately. Domain tests exercise configuration, preview receipts, encrypted sessions and database isolation. The GitHub workflow adds native PostgreSQL integration and a container smoke test. Generated screenshots and traces are CI artifacts.
