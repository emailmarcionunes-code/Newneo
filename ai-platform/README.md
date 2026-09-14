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

Browser tests start the production build on `127.0.0.1:3100`, exercise the first five launch steps, and run axe checks and capture screenshots at 1180px, 768px and 390px. Results are written to `test-results/` and `playwright-report/`. CI installs Chromium and runs the same checks.

## Current scope

Issue #3, milestone 1: canonical application shell, six-template catalog, reusable seven-step Launch Guide skeleton, and Use Case / Knowledge / Tools & MCP. See `../docs/ISSUE_3_MILESTONE_1.md` for the source-of-truth references, architecture, validation and remaining scope.

This is a frontend preview backed by an explicit demo registry. `Acme Corp` and its approved resources are fixture data. Source attachment does not authenticate to providers or ingest documents, and tool selection does not execute actions. Saved drafts are versioned and scoped to the demo organization/workspace/template in browser storage. They are local to the device, not a server-side persistence or authorization system.

Model & Runtime and Governance are now implemented; see `../docs/ISSUE_3_MILESTONE_2.md`. The Evaluate stage provides a continuation boundary; Evaluate, Deploy and Success remain pending. No live evaluation result or production deployment is simulated by the new Launch Guide.
