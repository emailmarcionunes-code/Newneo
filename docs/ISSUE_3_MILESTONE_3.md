# Issue #3 — Evaluate, Deploy and Success preview

## Source of truth

Figma `DmYoatzciQTR67GWU9zI98`: Evaluate `14:341`, Deploy `14:417`, Success
`14:493`. Design context and screenshots were read before implementation, together
with the Launch Guide handoff and design-system evaluation/deployment rules.
Existing shell, stepper, buttons, EnvironmentOption, ProgressRing and AssetIcon
components are reused. The prior user-approved card/layout refinements remain.

## Delivered behavior

- Evaluate includes Test Chat and Evaluation Results tabs, keyboard navigation,
  the canonical continuous progress ring, four metric bars and case counts.
- Loading the reference evaluation displays the exact design fixture: 92 overall,
  relevance 96, groundedness 90, safety 98, tool success 88; 46 passed, 3 needing
  review and 1 failed case. It does not run an AI model or evaluate the draft.
- The reference chat is identified as a Customer Service example. Sending the
  reference order question returns the supplied fixture; other questions receive
  an explicit demo response. No order lookup, provider request or real tracking
  link is fabricated. Messages remain in component memory and are not logged.
- The results tab shows the supplied aggregate statuses. Individual case evidence
  was not provided by Figma and is explicitly unavailable rather than invented.
- Next requires a loaded reference evaluation. Editing configuration invalidates
  it; returning without changes preserves it. Loading failures can be retried.
- Deploy summarizes the actual draft and requires deliberate environment
  selection. None is preselected. Development, Staging and Production use the
  existing EnvironmentOption component and canonical copy.
- The final CTA retains `Deploy to <environment>` within a persistent, explicit
  demo banner. It calls only the preview endpoint and cannot deploy a live agent.
- Success uses the canonical headline, exact exported assets and next actions.
  Its visible subtitle states that no live deployment occurred and identifies
  the selected environment. The overview action shows the current draft's name
  and description, explicitly marking live performance/feedback unavailable.
  It does not redirect another template to the hard-coded Customer Service
  prototype. Iterate retains the configuration and clears evaluation; catalog
  and AgentOps links retain their existing routes.

## Server boundary

`POST /api/launch/preview` accepts only `mode: preview` and the evaluate, chat,
and deploy actions. It validates organization/workspace, template, configuration,
approved endpoint and resource IDs. A reference receipt is HMAC-signed, bound to
the normalized configuration and valid for ten minutes. Changing step, save time
or selected environment does not change the evaluated configuration. Expired,
altered, absent or stale receipts reject the simulated deployment with HTTP 409.
Every successful simulated deployment returns `deployed: false` and `mode: preview`.

The random signing key lives only in the server process. A server restart or a
request handled by another instance invalidates these preview receipts; reload
reference results to recover. This is intentionally a local, single-process demo
adapter, not a production authorization or persistence design.

`POST /api/launch/deploy` always fails closed with HTTP 503. Client-supplied scores,
approval flags, environments and preview receipts cannot activate real deployment.
Real deployment needs identity, actual configuration-bound evaluation evidence,
organization policy, authorized approval, persistence and a runtime adapter.
The reference's failed/review cases are never represented as production approval.

## Draft compatibility

The existing storage key and additive schema-v1 migration are retained. Environment
selection is persisted. Evaluation receipts and success are not persisted or
accepted from localStorage. A saved Deploy step restores to Evaluate, preserving
configuration and environment while requiring a fresh reference receipt.

## Validation

Domain tests cover tampered/expired/stale receipts, configuration validation,
unsupported live mode, fail-closed real deployment and storage restoration.
Browser tests cover loading retry, chat, results tabs, environment choice,
confirmation/overview/iteration, configuration invalidation and real deployment
rejection. Visual/axe coverage now includes all nine canonical screens at 1180,
768 and 390 px. Existing approved-palette contrast debt remains explicit.
Screenshots are generated in Playwright artifacts; no global axe exemption was
introduced.

## Remaining work

The visual demonstration journey is complete, but live model evaluation, execution,
authorized production promotion, durable agent versions and operational screens
are not implemented. Issue #3 remains open for product acceptance. This milestone
must not be described as production-ready or as a deployed customer agent.

Final local validation: production build, 13 domain tests and 10 browser tests
passed. The mobile stepper also scrolls its active step into view without scrolling
the document. No new dependencies were added.
