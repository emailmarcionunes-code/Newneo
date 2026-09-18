# Launch journey refinement — 16 September 2026

The ten journey screenshots supplied by the user on 16 September are the visual reference for this pass. The Hybrid v4 Design remains the broader visual authority; Figma Make `YMlofUTw6w1GY4PasnJ0MD`, `src/screens/AgentCreate.tsx`, was consulted for interaction/composition context.

## Delivered

- All eight existing stages remain in the original order. The top map now uses compact Lucide circles, labels below, green completion connectors and a blue current-stage halo.
- Use Case has separate Identity and Business Context cards, mission suggestion chips and an expandable Mission Control explanation.
- Knowledge and Tools use two-column selection cards with source identities, connected state, coverage, risk and approval indicators.
- Infrastructure and Model use two-column comparison cards with visible configuration details.
- Governance displays control state and severity together. Controls remain editable and production requirements remain enforced.
- Evaluate has a large actual preview score, compact metric rows with percentages and semantic outcomes, plus expandable scenario details. Reload, error recovery, remediation and Test Chat remain available.
- Deploy starts with the configuration summary, followed by environment selection, configuration checks and the existing explicit preview approval.
- Agent Assembly is a vertical timeline with selection summaries. The separate Readiness card uses validated completion, not fixed screenshot percentages.
- Completion shows a friendly saluting robot with “Ready for the mission”. Agent details, AgentOps, deployment details, new version, persisted agent and release history remain reachable.

## Data and behavior boundaries

Existing source, action and approved-model registries were retained, including their additional options. Screenshot sample names, totals and percentages do not overwrite workspace data or approval rules. Consequently this pass aligns visual structure rather than replacing the working catalogs with the smaller static screenshot lists. Evaluation remains the actual reference result (78 initially, 96 after remediation), not a hardcoded 94. Percent completion is calculated out of eight stages. No AWS provisioning, credentials, live inference or production deployment was added.

The style changes are scoped to the launch flow in `ai-platform/app/launch-reference.css`; the approved main sidebar and logo are unchanged. Mobile layouts stack cards and the assembly panel, while the stepper scrolls horizontally. Motion respects reduced-motion preferences.

## Robot asset

Saved at `ai-platform/public/assets/agent-ready-salute.png`, generated with the built-in image-generation tool. Original preserved in the Codex generated-images directory. The app serves a resized optimized image through Next Image.

Generation prompt:

> Use case: stylized-concept. Asset type: small success illustration for NEWNEO enterprise AI app. Create one premium friendly robot head and shoulders, facing viewer, with one robotic hand clearly raised in a salute touching its temple, conveying 'ready for the mission'. White ceramic shell, navy face display, two bright blue friendly eyes, subtle blue trim matching #2563eb. Clean polished soft 3D illustration, simple confident silhouette readable at 150px. Transparent background with actual alpha, centered square composition, no floor, no text, no logo, no hat, no military uniform, no weapons, no extra objects. Entire hand and robot fit comfortably in frame.

## Verification

Production build passed. The browser launch suite exercises all eight stages at 1440, 1180, 768 and 390 pixels with accessibility checks, persistence, approval gates, evaluation failure/retry, remediation and completion. Success additionally checks that the robot image is visible and fully loaded. Screenshots were inspected for every desktop stage and completion. Unit tests: 25 passed, one optional external PostgreSQL test skipped.

A pre-existing telemetry test seeded an incomplete session before PreviewState hydration finished. Its setup now waits for a valid persisted state before adding its sample agent; product behavior was not changed for that test.

Final full browser regression: **51 passed** (49.4 seconds). The corrected telemetry setup also passed three consecutive isolated runs. Production preview refreshed at `http://127.0.0.1:3117`; mobile verification found no horizontal page overflow.
