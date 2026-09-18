# Shared visual identity audit — 18 September 2026

## Authority

NEWNEO Hybrid v4 (`docs/HYBRID_V4_IMPLEMENTATION.md` and Figma file
`7NFyk2kxLzbWsFWF8zWKNO`, catalog node `4:2`), with subsequent approved solid
blue `#1955a6` and Workspace/Operations architecture. This is not a redesign.

## Findings and corrections

- Workspace Home, My Agents and Discover repeated a generic Bot icon, bypassing
  the category identity already used by Operations. They now use one AgentIcon
  resolver, including template identity for renamed live agents. Six original
  Figma glyphs remain; the other catalog specialists use distinct Lucide glyphs.
- Shared category tints: service blue, IT violet, knowledge green, sales amber,
  automation cyan and research rose. Category is not an operational status.
- Workspace summary cards now use the shared Metrics component. Semantic icons,
  quiet tints and real status colors propagate to Operations dashboards/details.
  Unavailable values remain unavailable; zero pending items is not colored as an alert.
- Source, tool, evaluation and deployment table identities use the shared icon tiles.
- Models navigation has a processor icon rather than the Connections plug.
- Workspace headers, card actions, activity empty states and analytics panels follow
  the existing typography, borders, spacing and solid-blue action tokens.
- Discover uses the shared three-step progress indicator with `Request Agent` as
  the last step. Operations still prepares the agent. No activation is implied.
- Profile and progress styles load from the root layout so direct navigation does
  not depend on having previously loaded the Operations catalog stylesheet.
- Fixed the 1100–1200px profile grid conflict that left an empty third column.
- Desktop Home fills the remaining viewport below the demo notice, with internal
  list scrolling. Mobile stacks naturally. Discover remains four columns on wide
  desktop and one on mobile.
- Personal Analytics in demo now renders the same panel hierarchy in an honest
  empty state instead of only a notice. No sample execution metrics were invented.

## Review coverage and limitations

Hosted demo routes inspected: Home, Discover, agent profile, Agents and agent detail,
Operations overview, Skills, Knowledge, Connections, Models, Governance, Evaluations,
Deployments, AgentOps, FinOps, Reports, Playground, Audit Log and Settings. Shared
components and live WorkspaceRegistry/WorkspaceAnalytics wiring were reviewed in code.
Representative rendered checks: Home, catalog, profile, agent overview, Analytics,
Models, Playground and Settings. Desktop 1440×900, intermediate 1117px and mobile
390×844 checked; mobile Analytics had no document-level horizontal overflow.

The production GAW browser session expired. Authenticated visual verification is
still pending user sign-in; do not treat demo screenshots or source review as proof
that every GAW route has been visually verified. Changes are deployed in the same
application and shared components used by both modes.

## Validation

- Typecheck passed.
- Production build passed.
- Unit suite: 71 passed, 1 environment-dependent skip, 0 failed.
- No changes to API authorization, credentials, tenant isolation or billing.
- Reversible application-only deployment; server backup retained.
