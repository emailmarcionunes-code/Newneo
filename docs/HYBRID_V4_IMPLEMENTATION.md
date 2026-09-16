# Hybrid v4 implementation — Issue #3

Status: **FUNCTIONAL FRONTEND COMPLETE — SHARED VISUAL REFINEMENT READY FOR REVIEW** for the visual, navigable customer frontend. See the [final visual audit](VISUAL_FIDELITY_AUDIT.md) for reference mapping, corrections, rendered review, test evidence and integration boundaries.

## Authority and scope

[Issue #3](https://github.com/emailmarcionunes-code/Newneo/issues/3) approves Hybrid v4. Visual authority is [Newneo Product Design — Hybrid Exploration](https://www.figma.com/design/7NFyk2kxLzbWsFWF8zWKNO/?node-id=47-502). The [Interactive v4 Make](https://www.figma.com/make/YMlofUTw6w1GY4PasnJ0MD/Sem-t%C3%ADtulo) is a behavior reference only. Its demo login, inventory-to-catalog entry, category filtering and template navigation were inspected separately from visual frames.

This delivery implements the customer-facing, navigable frontend. Reference metrics, model profiles, infrastructure scores, evaluations, chat, resource tests, promotions and rollback are explicitly preview data. No provider credentials, cloud resources, external messages or actual deployments are created. Existing authenticated API boundaries remain intact. Customer UI does not expose the internal Admin Plane.

## Canonical mapping

| Surface | Hybrid node | Implementation |
| --- | --- | --- |
| Use Case / Mission Control | 47:2 | LaunchGuide, AgentAssembly |
| Infrastructure | 47:144 | ModelRuntimeStep |
| Model | 47:325 | ProviderModelStep, hybrid-models |
| Journey candidate | 47:502 | LaunchGuide, LaunchStepper |
| Sidebar | 47:657 | ApplicationShell / ApplicationSidebar / Topbar |
| Agent Catalog | 4:2 | AgentCatalog |
| Knowledge / Tools journey | 5:2 / 5:265 | HybridResourcesStep |
| Governance / Evaluate | 10:2 / 10:137 | GovernanceStep / EvaluateStep |
| Deploy / Success | 12:2 / 12:142 | DeployStep / LaunchSuccess |
| Other supporting screens | Hybrid file supporting frames | components/hybrid |

The current v4 shell and eight-stage journey override the obsolete shell and seven-stage labels inside older supporting frames. The official N component and favicon from the branch are reused; its SVG geometry is unchanged. Gradient identifiers are unique per rendered instance.

## Routes and interactions

- `/`: overview, health and activity drill-downs.
- `/agents`: agent inventory with status/search filters; `/agents/catalog`: searchable, filterable reusable card grid and custom entry.
- `/agents/launch`: eight-stage draft, selectable knowledge and approved tool actions, four infrastructure choices, six provider/model profiles, governance controls, retriable reference evaluation and deliberate environment selection.
- `/agents/[id]`: agent detail and contextual tabs.
- `/knowledge`, `/knowledge/[id]`: inventory, source details, sync preview and configuration editor.
- `/tools`, `/tools/[id]`: action inventory, MCP context, action details, test preview and connector editor.
- `/governance`, `/governance/policies/[id]`: policy controls, editor, violations and approval review.
- `/evaluations`, `/evaluations/[id]`: reference runs, scenario results and local run editor.
- `/deployments`, `/deployments/[id]`: environments, history, promotion editor, deployment timeline and rollback preview.
- `/agentops`, `/agentops/incidents/[id]`: health, incidents, logs, incident resolution/escalation preview.
- `/finops`, `/reports`: costs, budgets, reference usage/compliance and exports.
- `/playground`: sample conversations and adjustable model parameters.
- `/audit-log`: search/filter and CSV export.
- `/settings`: Organization, Team & Roles, API & Webhooks, Integrations, Notifications and Getting Started; local preview interactions remain separate from live access changes.
- `/login`: official brand, SSO entry, email form and explicit workspace preview entry. Actual SSO needs configured OIDC.

Sidebar is manually collapsible (224/60px) with custom tooltips and no hover expansion. Groups and ordering follow Issue #3. Models are contextual under Settings, not a top-level navigation item. Small screens use the existing dismissible navigation drawer and an internally scrollable horizontal stepper.

## State and safety boundaries

Launch drafts store independent `infrastructure.kind` and `model.modelId` selections; a legacy runtime adapter migrates existing drafts. Readiness combines validated and reviewed stages, evaluation outcomes and manifest approval rather than current step position. Changes invalidate evaluation receipts; API validation still rejects invalid resources, unavailable actions and stale receipts. Loading/error/retry states do not strand users in Evaluate. New role-based-access and retention controls have distinct keys; older drafts migrate those additions to defaults rather than conflating them with unrelated controls.

Model profiles and infrastructure choices describe the approved visual reference, not live availability, pricing or an execution compatibility guarantee. Actual provisioning, provider routing and enforcement remain backend integration work. Operations UI previews use local state and the existing preview store; reference inventory is not a production database.

## Visual and accessibility verification

The brand uses navy, silver and blue. Blue represents action, selection and intelligence; green represents completion or health. Darker text variants of success and muted neutrals provide readable contrast while preserving the semantic hierarchy. The stepper remains horizontal, infrastructure is a 2×2 choice grid and model selection is a six-row comparison with progressively disclosed details. The Agent Assembly rail remains aligned to the top and grows with stage summaries.

Browser tests exercise all eight stages, draft reload, template identity, selection state, unavailable actions, evaluation recovery, sidebar width/collapse, resource editing, details, approval/promotion flow, Playground and CSV download. Responsive checks cover 390, 768, 1180 and 1440px. Automated accessibility checks and screenshots are emitted into ignored `ai-platform/test-results`; the screenshot review must accompany test execution.

Commands from `ai-platform`:

```sh
npm test
npm run build
PLAYWRIGHT_PORT=3115 npm run test:e2e -- --workers=2
```

Code Connect is intentionally not registered against whole-screen frames: only component-level 1:1 mappings should be published when matching reusable Figma component nodes exist. No speculative mapping has been created.

Validation result: production build passed; 32 browser tests passed, including accessibility/responsive checks. Unit suite: 23 passed; the optional PostgreSQL integration test is skipped without `TEST_DATABASE_URL`. Backend integration was not provisioned as part of this frontend delivery.
