# Three product access levels and daily Operations

Public membership choices are User, AI Operator and Administrator. User uses Workspace (including personal analytics and agent work); AI Operator also uses daily Operations; Administrator additionally accesses organization settings and FinOps.

Operations navigation: Overview, Agents, Skills, Knowledge, Evaluations, Deployments, AgentOps, Reports and Playground. Administrative destinations are grouped in Settings: People & access, Connections, Models, Governance, Audit Log and FinOps. Settings remains a footer destination available only to Administrators.

Both server layout and client/demo shell restrict administrative routes, including direct URLs. Existing API authorization remains in force: membership changes and company FinOps require Org Admin. Operational APIs that consume configuration or activity are not reclassified as administrator-only just because their administrative page moved.

## Compatibility

The three public names map to existing stored role identifiers: User → Operator; AI Operator → AI Platform Admin; Administrator → Org Admin. This avoids rewriting membership records or changing database authorization predicates. Existing legacy role assignments retain their capabilities and appear as legacy options when editing; new assignments offer only the three product roles. No existing membership is upgraded automatically.

Demo personas use the same product access policy. A User has no Operations navigation; an AI Operator has no Settings destination; an Administrator has both.

## Validation

Production compilation and TypeScript validation; product-access regression coverage for all administrative roots and their nested routes, operational routes, unknown roles, and membership/configuration capabilities. Existing workspace-member authorization tests remain in the suite.

## Profile and role-aware help

Profile is accessed from the header avatar/name menu, not a separate sidebar item. Help stays in the sidebar in Workspace and Operations for every role. The header Help preview and the full Help page share the same role-aware component: workspace guidance for everyone, daily Operations guidance for AI Operators and Administrators, and organization settings guidance for Administrators. Help content does not confer any additional permission.

## Neo Help entry point

Help is now a persistent lower-right Neo face button, replacing the sidebar Help item and the header question-mark popup. It opens a dismissible, keyboard-accessible panel with role-aware guidance and a link to the full help page. Profile remains in the avatar menu. The launcher reuses the approved standing Neo asset through CSS framing; no new mascot artwork was introduced.

Settings → Configure Help is administrator-only and previews the three role-specific guides, linking to membership management to change the assigned access that controls help. This is guidance and navigation, not a live AI conversation or a help-content editor. No user role or permissions are changed by previewing guidance.

## Inline guided conversation

Neo now opens its help panel on mouse pointer entry, without taking keyboard focus or closing when the pointer moves from the launcher into the panel. Click/tap still opens it and focuses the composer; Escape, close and outside click dismiss it. The initial message is “How can I help you?”. Users can type questions and receive in-panel guidance, with no forced page navigation.

This is a deterministic product-guide assistant, not an LLM integration. It recognizes supported English/Portuguese help topics, handles topic follow-ups and admits unsupported questions. It does not inspect workspace data, transmit chat text to an external provider or execute account actions. Messages stay in component memory and reset when workspace, demo mode or role changes. Topic guidance is restricted to the relevant access level. Regression tests cover specific-topic precedence, access-limited guidance, truthful billing limitations and unknown questions.

## Collapse and question history

The Neo popup collapses after the mouse leaves the combined launcher/panel area (180 ms grace to cross the gap). Re-entry cancels collapse; touch and keyboard retain click, close and Escape controls. Closing does not discard the draft or conversation in the mounted page.

Chat shows the latest question and answer. History keeps the latest 20 exchanges in component memory, newest first, with each question as a collapsed expandable title. Changing workspace/role or reloading the page clears this in-memory history; it is not a persistent database archive.

## Daily hidden memory (replaces visible History)

The visible History tab was removed. A fresh page opens on “Como posso ajudar?” without replaying past questions. The last 20 exchanges are stored locally in the browser under a key scoped by mode, workspace, account display identifier and role, and are used for topic continuity and explicit recall requests. No cross-device or server-side memory is provided.

Memory is valid only for the current browser-local calendar date. A next-midnight timer and focus/visibility checks reset the visible exchange, draft, topic and stored daily memory at rollover; submission also rejects stale-day context. Invalid local data and unavailable browser storage are handled without preventing chat use. Tests cover same-day restoration, stale-day rejection, invalid storage and month-boundary local midnight.
