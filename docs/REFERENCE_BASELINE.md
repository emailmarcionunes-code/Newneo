# NEWNEO reference baseline — 2026-09-17

This repository is the source reference for the public website and the NEWNEO platform. Use `main` for new integrations; historical branches are not the current reference.

## Project map

- Root `app/`, `lib/`, `public/`: public website, positioning, SEO and presentations.
- `ai-platform/`: app.newneo.ai platform, catalog, eight-stage Agent journey, Skills portfolio, official workspace screens, demo adapters, authentication, backend services, migrations and tests.
- `docs/NEWNEO_PRODUCT_DESIGN_SYSTEM.md`: canonical approved Hybrid v4 rules and current product principles.
- `docs/NEWNEO_BRAND.md`: branding reference. Current application accent is solid blue; older petroleum-blue explorations are history, not a direction to restore.
- `docs/NEWNEO_DESKTOP_DENSITY.md`: desktop layout hierarchy and viewport use.
- `docs/NEWNEO_PLATFORM_ARCHITECTURE.md`: boundaries and provider abstraction.
- `docs/repairs/`: dated implementation notes and validation history.

## Current customer journey

**Add Agent → Agent Catalog → Agent Introduction → Use this Agent / Customize → review the eight stages.** Catalog uses four columns at desktop widths, filters and internal scrolling. Introductions expose outcomes, core/optional capabilities, sources, actions and recommended intelligence. Request a New Agent records a separate business brief for manual review rather than creating a definition automatically.

Canonical architecture: **One Neo. Many Agents. Reusable Skills.** The internal stages remain Use Case, Knowledge, Tools & MCP, Infrastructure, Model, Governance, Evaluate and Deploy. Profile recommendations are editable, while permissions and activation require actual validation.

## Visual reuse

Reuse the shared shell, components and styles from `ai-platform`, including `desktop-density.css`, the Hybrid v4 foundations, `WorkspaceAgentWizard.css` and `AgentPortfolio.css`. Keep compact KPI strips, horizontally composed operational panels, consistent controls and responsive layouts. Do not copy mock data into real workspace views or fork demo styling as the production design system.

## Operational truth

Demo and authenticated workspaces have distinct data adapters. The real workspace persists versioned Agent/Skill configurations, document bindings, requests and review data. Missing integrations, model approvals, runtime execution and production evaluations remain explicitly gated. A blueprint save is not activation. Requests have a pending-review queue; automatic product-team routing/review is not implemented.

## Reproduce

Use Node 22 and `npm ci` independently in the repository root and `ai-platform`. Root: `npm run build`. Platform: `npm test`, `npm run typecheck`, `npm run build`; browser tests use `npm run test:e2e`. Configure environment values from the example and platform deployment documentation. Apply migrations using the migration-owner connection and run the app under the restricted runtime role. The Agent request migration is included in the migration runner.

No production credentials, environment files, database backups, uploaded customer documents or build output are part of this baseline. Deployment-specific secrets are supplied separately. Publishing source does not redeploy the live environment.

## Consolidation provenance

Platform code was reconciled against the hosted `/home/ubuntu/platform` source on 2026-09-17. Website source and product documentation include previously unpushed local changes. Migration runner registration, request migration replay safety and main-branch CI triggers were corrected during repository consolidation. No force-push or history rewrite is required.
