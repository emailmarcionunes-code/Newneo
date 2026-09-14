# Issue #3 — milestone 1 implementation

## Delivery scope

Branch: `newneo-ai-platform-v1`. The existing pull request is #2, based on `newneo-site-v1`. This change implements the first milestone of #3; it does not close the whole issue.

The old shell is replaced by the canonical Application Shell. Agent Catalog and the Use Case, Knowledge, and Tools & MCP steps use the approved Figma layout and reusable components. A seven-step skeleton preserves the full sequence and stops at an explicit Model continuation boundary. Model & Runtime through Success remain subsequent work.

## Sources read before implementation

All six documents named in Issue #3 were read: `CODEX_READY_CHECKLIST.md`, `NEWNEO_PRODUCT_DESIGN_SYSTEM.md`, `FIGMA_HANDOFF_AGENT_LAUNCH_GUIDE.md`, `NEWNEO_AI_PLATFORM_DESIGN_MANIFESTO.md`, `NEWNEO_ENGINEERING_JOURNEY.md`, and `NEWNEO_PRODUCT_SURFACE_ROADMAP.md`.

The checklist's referenced responsibility, product-decision, operating-model, customer-platform, UX, Admin Plane, FinOps, commercial, skills, IP, employee guide and Codex handoff documents were also read, together with the handoff's business-platform, sales-playbook, presentation-flow and learning-roadmap references. The latest explicit Issue #3 / Figma handoff takes precedence over old prototype navigation and older UX descriptions.

Visual references in `Newneo Product Design`, file `DmYoatzciQTR67GWU9zI98`:

| Screen        | Canonical node | Implementation                         |
| ------------- | -------------- | -------------------------------------- |
| Agent Catalog | `4:18`         | `/agents`, `AgentCatalog`, `AgentCard` |
| Use Case      | `7:123`        | `/agents/launch`, first step           |
| Knowledge     | `7:199`        | Launch step 2                          |
| Tools & MCP   | `7:275`        | Launch step 3                          |

`get_design_context` and its screenshots were used before coding each of these screens. The Model & Runtime (`14:189`) and Governance (`14:265`) references were also inspected for the continuation boundary. Other remaining steps are not claimed as implemented or visually verified.

## Architecture and behavior

- The root website TypeScript project excludes `ai-platform`, so each application resolves its own aliases and dependencies.
- `ApplicationShell.tsx` exports `ApplicationShell`, `ApplicationSidebar`, `Topbar`, and `NavItem`. `AppShell.tsx` remains a compatibility import for existing routes.
- The sidebar has all 11 required labels, including FinOps, and no top-level Team item. Width is 220px; the topbar is 56px. The workspace stays at the bottom. Mobile navigation has an explicit close control, Escape dismissal and keyboard focus containment.
- `UI.tsx` contains Button, FilterChip, IntegrationTile, FormField, SelectField, ContextPanel, Callout, EnvironmentOption, and ProgressRing. The latter two are primitives for later steps, not evidence that Evaluate or Deploy is complete.
- `Assets.tsx` owns AgentIcon, ProviderLogo, LaunchIcon and the exported sidebar icons. Every asset is local. No page contains a hand-drawn brand mark or temporary Figma URL. Inter is locally bundled.
- Catalog filters use explicit template category assignments. Categories without an approved matching template show a recoverable empty state instead of inventing templates. Every card opens its own template; Custom Agent opens an empty use case.
- `LaunchGuide.tsx` owns controlled draft state, one shared stepper and footer, required-field validation, filters and current-decision context. Back and Next retain values. Completed steps use green circles and checks; the current step uses blue; future steps cannot bypass the current workflow.
- Knowledge selection and tool-action grants remain separate. The connection dialog exposes approved resource details and action permissions progressively. New connectors start with zero selected actions. Organization-unapproved actions cannot be selected. Removing a tool removes its action bindings.
- Save draft explicitly persists a schema-versioned record under organization/workspace/template-specific storage keys. Malformed, mismatched or unavailable storage produces a recoverable message. Restoration sanitizes resource IDs and action IDs.
- Existing Overview, Agent Detail and Governance content remains prototype content inside the canonical shell. Design-pending sidebar routes have only a neutral unavailable state and a return to the catalog; no registry design is presented as approved.

## Preview boundaries

This milestone uses the named Acme demo organization and an explicit in-memory approved resource registry. Selection attaches fixture references; it does not perform OAuth, ingest knowledge or call external systems. Draft storage is local to one browser/device. No secrets are collected.

Client-side draft validation is not an authorization boundary. The production implementation must enforce organization/workspace isolation, RBAC, approved action scopes and human approval requirements in the backend. Model/runtime execution, real evaluations, Test deployment, production approval and deployment execution are not implemented here. The previous hard-coded evaluation score and apparent production eligibility are not carried forward into the new guide.

## Visual QA

Desktop reference size: 1180 × 740. Responsive coverage: 768 × 1024 and 390 × 844. Captures of all four screens are available under `docs/implementation/issue-3/`.

Verified against the canonical frames:

- shell dimensions and navigation ordering;
- lowercase white/blue wordmark and quiet topbar;
- typography, compact forms, card radius, borders and low elevation;
- three-column catalog, four-column desktop knowledge grid, three-column desktop tools grid;
- blue Next / Create intent, secondary navigation and outline Connect controls;
- green completed stepper segments, current-step state and pending stages;
- contextual panels, two-line source details and explicit action summaries;
- usable layout without horizontal page overflow at tested widths; the narrow-screen stepper scrolls within its own region;
- native form labels, dialog dismissal and keyboard operation;
- local asset loading.

The handoff permits final provider-logo/semantic-icon optical polish to remain pending. The supplied provider exports are small PNGs and remain replaceable through ProviderLogo.

### Reference palette accessibility debt

The approved Figma colors contain known WCAG AA contrast failures. Tokens were preserved rather than silently redesigned. The automated report records only these known color pairs as explicit exceptions and fails on other accessibility violations or unexpected contrast pairs:

- white text on avatar `#6366F1` (4.46:1);
- secondary `#64748B` on `#EFF6FF` (4.37:1) and `#F1F5F9` (4.34:1);
- success `#16A34A` text on white / canvas, and white checks on success green.

Full AA compliance is **not** claimed. A product-approved accessible palette revision is a separate decision. Each browser run attaches the detailed reference-contrast JSON findings.

## Verification

- `npm run typecheck`
- `npm test`: four domain/draft validation tests.
- `npm run build`: production build of the independent AI Platform. The public website root build also passed after excluding the independent app from its TypeScript project.
- `npm run test:e2e`: seven Chromium workflow/visual/accessibility cases across three viewport sizes.
- `npm audit`: zero known vulnerabilities after updating to Next.js 15.5.25, compatible dependency fixes, and the patched PostCSS override. No Next.js major migration was introduced. This audit result applies to `ai-platform`; the existing public website still pins Next.js 15.5.2 and has pre-existing dependency advisories outside this milestone.
- GitHub Actions workflow `.github/workflows/ai-platform.yml` reproduces the app build and tests and retains browser evidence.

## Code Connect

Code Connect was attempted after the 1:1 components existed. Figma refused discovery for both `4:18` and `7:123`: “You need a Dev or Full seat on an Organization or Enterprise plan to use Code Connect.” No mapping was published and no unrelated component was mapped as a substitute.

The engineering counterparts are ready for subsequent mapping: Button, FilterChip, AgentCard, ApplicationSidebar and LaunchStepper. The blocked work is the Figma account capability, not the screen implementation.

## Remaining Issue #3 sequence

1. Finish Model & Runtime (`14:189`) starting with Organization Default · Recommended.
2. Governance (`14:265`), business-readable controls.
3. Evaluate (`14:341`) with genuine evaluation state and continuous ProgressRing.
4. Deploy (`14:417`), explicit environment and backend-enforced production gates.
5. Success (`14:493`) with next actions.
6. Publish Code Connect when the Figma account supports it.

The issue should remain open until the remaining scope is delivered.
