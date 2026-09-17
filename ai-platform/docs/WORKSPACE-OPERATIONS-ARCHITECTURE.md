# NEWNEO: Workspace + Operations

Status: September 17, 2026. Product architecture baseline.

**Expose the job, not the technology. Complexity increases with responsibility.**

## Audit before the transition

The existing shell exposed Skills, tools/MCP, governance, evaluations, deployments and operational analytics alongside everyday agent usage. Live tenants already had versioned Agent and Skill records, document bindings, workspace membership, source searches and configuration reviews. The richer demo used a preview store, not the production database. Simply renaming the sidebar would not provide an employee experience or prevent direct API access.

Membership roles already separated authors, operators, reviewers and readers. There was no department-scoped assignment, customizable permission editor, end-user conversation store or general AI task runtime. These are not invented by this change.

## Information architecture

Workspace is the landing experience at `/` (also `/workspace`). Its navigation is Home, My Agents, Discover, Work, Reports, Help and Profile. Agent pages expose Overview, Capabilities, Sources, Work and Results. Discover presents business-purpose profiles and the three-step Select → Understand → Accept & add journey. Members without author permission submit a request instead of creating configuration.

Operations retains the existing modules and their URLs. `/operations` contains the prior operational overview. The existing `/agents`, `/skills`, `/knowledge`, `/tools`, `/models`, `/governance`, `/evaluations`, `/deployments`, `/agentops`, `/finops`, `/reports`, `/playground`, `/audit-log` and `/settings` remain technical routes. This avoids breaking existing references and duplicating modules. The shell identifies the environment from the route; authorized users can switch between environments.

| Business term | Existing platform object / Operations surface |
| --- | --- |
| Agent / specialist | The same versioned Agent ID |
| Capabilities | Planned capabilities and pinned Skill bindings |
| Sources | Bound knowledge documents |
| Connections | Existing Tools & MCP module |
| Work / results | Personal source-run history and returned passages |
| Request a business adjustment | Pending Agent request; no immediate configuration write |
| Reports | Personal search counts; not fabricated business impact |

Separate Tasks, Conversations and Files modules are deliberately not added: the live product has document search, not a general task/chat/file execution lifecycle. Work can grow around those real objects when implemented.

## Access contract

Capabilities are centralized in `lib/product-access.ts`. Product personas do not rewrite database roles.

| Existing role | Workspace | Operations | Author Agent config | Run document search | Propose business changes |
| --- | --- | --- | --- | --- | --- |
| Read Only (employee mapping) | Yes | No | No | No | Access / Agent requests only |
| Business Owner (department-owner mapping) | Yes | No | No | No | Pending review request |
| Operator | Yes | Yes | No | Yes | Access / Agent requests |
| Reviewer / Approver | Yes | Yes | No | Yes | Existing configuration review permissions |
| AI Engineer | Yes | Yes | Yes | Yes | Yes |
| AI Platform Admin | Yes | Yes | Yes | Yes | Yes |
| Org Admin | Yes | Yes | Yes | Yes | Yes |

Member administration remains Org Admin-only in the existing database policy. Platform ownership remains a separate privileged DB authorization; being Org Admin does not confer platform-owner access. Unknown roles fail closed. Demo Employee and Department Owner profiles are visual previews, never live authorization.

Technical pages are gated at the server entry and in the client shell. Technical workspace API handlers use the verified identity + membership capability gate independently. Existing SQL RLS and write permissions still apply. The business API uses verified session scope, same-origin writes and workspace consistency checks. Its add action reuses the existing `agentAddition` and `saveRegistry` operations; no second Agent table exists. The business projection excludes model, infrastructure, prompts and raw tool configuration. Work and requests are filtered by the current actor as well as workspace and organization.

Migration 022 allows verified active members to insert a pending request. It does not grant Agent editing, search execution, approval, deployment, or permission changes. Administrators can see requests through the existing Operations Agent request screen at `/agents/request`.

## What works now

- Workspace home, Agent directory, Discover, shared-ID Agent profile, personal Work, Reports, Help and Profile.
- Existing author roles add catalog Agents through a business-facing confirmation.
- Other members request an Agent or access. Department Owners submit a bounded business adjustment for review.
- Authorized roles search already-connected documents and inspect source passages. Search history is personal in Workspace, workspace-wide in authorized Operations.
- Existing technical modules remain available with their established permissions and design language.

## Gaps and ordered next steps

1. Define employee execution permission and per-Agent/department assignments before granting broader runtime use. Current Read Only/Business Owner permissions are preserved, not silently expanded.
2. Add a structured business configuration schema (approved business rules, outcomes, ownership) with a review/apply workflow and department boundaries. Current requests are recorded, not applied or emailed automatically; administrative triage uses the existing request screen.
3. Implement the actual task/conversation lifecycle, execution readiness, safe file ingestion and approved connectors. Only then introduce natural-language task execution and the corresponding Work tabs.
4. Unify demo and live view adapters incrementally. Workspace uses a shared business presentation; Operations still contains legacy demo/live components. Do not claim complete parity or substitute demo telemetry in production.
5. Add role-capability administration backed by audited server policy, rather than assuming fixed persona labels are sufficient forever.
6. Add measured business outcome reporting when the task runtime supplies evidence. Current counts cover the latest 50 personal document searches only.

No new cloud resource, model execution, external connector or spending limit is enabled by this transition.

## Validation and release notes

- 60 automated tests passed, 0 failed, 1 pre-existing environment-dependent test skipped.
- Type checking and production build passed.
- Hosted GAW verification: existing Agents and sources are visible in Workspace; a document search returned the real pilot source; authorized Operations overview still loads the original workspace data.
- Demo Employee profile hides the Operations switch and blocks a direct Operations page. Live APIs enforce the capability independently of demo controls.
- Source and database backups were created before publication. Migration history was reconciled for the existing request table (021), then 022 applied transactionally with checksums. The container migration command failed without a detailed error; the migration was applied through the database owner connection after comparing all historical checksums. The maintenance command still needs separate environment diagnosis.
