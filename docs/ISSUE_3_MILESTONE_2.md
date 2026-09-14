# Issue #3 — Model & Runtime and Governance

Implemented on `newneo-ai-platform-v1` after the user-approved card layout refinements.

## Sources and design decisions

Read the issue, readiness checklist, product design system, Launch Guide handoff,
product surface roadmap, design manifesto, engineering journey, and referenced
V1 UX/domain documentation. Figma `DmYoatzciQTR67GWU9zI98`, nodes `14:189` and
`14:265`, supplied the reference code, screenshots, copy and runtime icons.

The organization default remains first and recommended. The four execution modes
retain their approved names and descriptions. Endpoint selection follows runtime
selection; technical details remain inside Advanced settings. Governance retains
Access & Permissions, Policies, Data Controls and Compliance with the approved
labels and defaults, including HIPAA initially unchecked.

The user's subsequent card-size decision supersedes the shorter Figma cards:
execution and governance cards share the 220 px minimum height and 20 px padding.
Widths adapt to the screen and content: four execution choices, two governance
panels per row, with smaller-screen stacking. Existing Knowledge/Tools keep three
integration columns and a fourth sticky summary on desktop.

## Behavior

- Model and governance are controlled components backed by `LaunchDraft`.
- The default uses the design's Customer Cloud / GPT-4o approved endpoint fixture.
- Managed AI, Private AI and Hybrid AI can be selected, but their approved endpoint
  lists are empty in this demo. A clear empty state blocks Next until the user
  selects an available approved endpoint or restores the organization default.
  No unapproved provider or endpoint has been invented to fill those lists.
- Context window, cost and latency are static Figma reference values, not current
  provider pricing or measured performance. Advanced settings identifies this.
- Governance controls persist individually. The audience select contains the
  single organization-wide scope specified in Figma; real group/user choices
  await the organization identity adapter.
- A disclosed access/approval summary derives knowledge and actions from the
  selected resources. Action-level approval requirements are retained even if
  the draft preference for sensitive actions is cleared. With that preference
  enabled, write actions are conservatively listed as requiring approval.
- Compliance checkboxes express requested controls, not a compliance certification.
- Save/reload and Back preserve the new settings. Existing schema-v1 drafts migrate
  additively with their original storage keys and first-milestone selections.
- Restored runtime IDs and endpoints are validated against the scoped registry;
  incompatible endpoints return to Model. Invalid governance values return to
  Governance with defaults, without coercing strings into boolean selections.
- Next from Governance reaches an explicit Evaluate continuation boundary.
  Evaluation, Deploy and Success remain pending; there is no fabricated score,
  live execution or production deployment.

## Boundaries

This remains a local frontend preview. Production requires organization-scoped
identity, approved endpoint discovery, backend policy enforcement, persistence,
real evaluation runs and server-enforced deployment approval. UI preferences and
localStorage do not grant access or override organization policy.

The four runtime SVGs are exact Figma exports through the existing AssetIcon
boundary. Code Connect remains unavailable because the connected Figma account
requires an Organization/Enterprise Dev or Full seat; the previous limitation
is unchanged.

## Validation

Production build and eight domain tests pass. Domain coverage includes legacy
migration, runtime/governance round-trip, endpoint compatibility and invalid
boolean handling. Browser coverage exercises default and alternate runtime
selection, unavailable endpoints, progressive disclosure, settings persistence,
and the evaluation boundary. The visual/axe sweep now includes Model and
Governance at 1180, 768 and 390 px in addition to the existing four screens.

Known contrast debt from the approved Figma palette remains explicitly reported
by the existing tests; no general accessibility exemption was added.
