# Knowledge and Tools & MCP — navigable customer experience

The user's current priority is complete visual/navigable customer journeys before external integrations. This increment adds frontend flows only. No AWS, database, authentication or connector service changes are made.

## Knowledge

Provider selection → configuration → access review → save preview → source details. Details cover Overview, Connection, Content, Sync history, Permissions, Quality and Usage. A configurable simulation demonstrates successful synchronization, expired authorization, retry, resulting sample content and event history. Editing invalidates synchronization readiness. Disconnecting preserves configuration for reconnection.

## Tools & MCP

Enterprise Integrations and MCP Servers share a provider/configuration/access/review flow. Details cover Overview, Connection, Actions, Permissions, Health and Usage. Action selection distinguishes technical availability, sample approval and workspace selection. Unapproved actions remain disabled. Human approval is configurable in the preview, while mandatory action-level requirements remain displayed. The MCP configuration accepts an example URL but never requests it. No credentials are collected.

## Interaction and persistence

Three card columns plus a top-sticky fourth summary on desktop; stacked layouts on smaller screens. Native dialogs support Escape and focus trapping. Detail tabs support arrow keys/Home/End. Forms provide required-field validation and a review step. Preview data is scoped by surface in sessionStorage, survives reload in the same tab, and remains separate from the Launch Guide and server drafts. Invalid storage falls back to the registry; unavailable storage leaves the current session usable.

The registries include sample provider entries; configured copies appear in the summary. All statuses and content are explicitly illustrative. Navigation between registry and details is in-page; shareable detail URLs and live resources are not part of this increment. Final canonical Figma designs remain pending. Existing Golden Reference components and exact provider assets are reused.

## Validation

Production build/type checking; browser tests for source creation/editing, synchronization failure/retry, content, action permissions, disconnect, storage recovery, search/filter regression and accessibility at 1180/768/390px. All external-service operations remain simulated in memory.
