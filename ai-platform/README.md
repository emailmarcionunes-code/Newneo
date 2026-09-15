# Newneo Customer AI Platform

This independent Next.js application contains the Customer AI Platform. The repository root remains the public website.

## Run

Requires Node.js 22 and npm.

```sh
cd ai-platform
npm ci
npm run dev -- --port 3100
```

Open `http://localhost:3100/agents` for the canonical Agent Catalog. Use `/agents/launch?template=customer-service` for the Launch Guide.

## Verify

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests start the production build on `127.0.0.1:3100`, exercise all seven launch steps and the success preview, and run axe checks and capture screenshots at 1180px, 768px and 390px. Results are written to `test-results/` and `playwright-report/`. CI installs Chromium and runs the same checks.

## Current scope

Issue #3, milestone 1: canonical application shell, six-template catalog, reusable seven-step Launch Guide skeleton, and Use Case / Knowledge / Tools & MCP. See `../docs/ISSUE_3_MILESTONE_1.md` for the source-of-truth references, architecture, validation and remaining scope.

This is a frontend preview backed by an explicit demo registry. `Acme Corp` and its approved resources are fixture data. Source attachment does not authenticate to providers or ingest documents, and tool selection does not execute actions. Saved drafts are versioned and scoped to the demo organization/workspace/template in browser storage. They are local to the device, not a server-side persistence or authorization system.

Model & Runtime and Governance are now implemented; see `../docs/ISSUE_3_MILESTONE_2.md`. Evaluate, Deploy and Success now complete the explicit demonstration flow; see `../docs/ISSUE_3_MILESTONE_3.md`. Reference results are not measurements of the draft, and simulated confirmations never deploy a live agent. The real deployment endpoint fails closed.

## Backend foundation

The PostgreSQL schema, OIDC session flow and authenticated server draft copies are implemented. They require a configured database and identity provider; dashboards and runtime operations remain demonstrative. See [backend setup and boundaries](../docs/NEWNEO_BACKEND_FOUNDATION.md).

All sidebar routes now have frontend coverage, including AgentOps and FinOps. See [workspace surface status](../docs/NEWNEO_WORKSPACE_SURFACES.md) for what is implemented versus demonstrative, [backend configuration](../docs/NEWNEO_BACKEND_FOUNDATION.md) for authenticated server draft copies, and [pilot deployment](../docs/NEWNEO_PILOT_DEPLOYMENT.md) for container packaging. `npm run start` serves the standalone build; use `-- --port 3100` to override its local port.
