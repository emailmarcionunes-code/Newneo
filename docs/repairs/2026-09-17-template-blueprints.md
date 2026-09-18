# Template-driven review journey

20 catalog templates now expose reusable enterprise blueprint defaults via lib/agent-blueprints.ts and enriched AgentTemplate. Live creation uses AgentBlueprintWizard: prepopulated business context, editable plans for skills/knowledge/tools/policies/evaluations, safe exact-name matching to active workspace resources, infrastructure recommendations, provider-neutral model profiles/preferences, customized-stage tracking, and production gate summary. Custom missions generate category-specific proposals using explicit deterministic rules; no claim of model-based generation.

Optional high-risk recommendations remain unchecked. Planned tool actions grant no permissions. Model registry/approvals and runtime evaluation are not yet connected in the real account: concrete approved model selection, Run Recommended Evaluation and fast confirmation remain gated. Model requirement cards are requirements, not benchmarks. Saving creates an immutable blueprint, never a deployment. Existing roles, tenant checks, archive checks and optimistic locking remain in force.

Demo createDraft uses shared template business/infrastructure defaults and long-context sample model selection; knowledge and safe tool selections vary by template category. Existing preview evaluation/deployment controls retained. Demo preview and live guided authoring remain different UI adapters; the shared blueprint is the source of recommendations.

Server registry persists bounded typed plan strings and strips client-supplied approval/runtime claims. Tests cover full template coverage, custom proposals, model filtering, conservative matching, plan validation and existing tenant/version safeguards. Backups: /tmp/newneo-before-blueprints.tgz, /tmp/newneo-before-blueprint-demo.tgz. Build log /tmp/newneo-blueprints-build.log.

## Verification
- 15 focused tests passed: blueprint, registry and launch suites; production Docker build/typecheck passed.
- Authenticated GAW browser verification traversed all eight stages. IT defaults and custom financial mission proposals checked, including Private Cloud, high criticality and finance-specific knowledge/evaluation plans.
- Confirm & Continue reached final review without submitting after fixing React button reuse with distinct keys and preventDefault. Saving now requires its own explicit click.
- At 1366×768 the footer remains within the viewport; long stage content scrolls internally. At 390×844 body width equals viewport width (no horizontal overflow), with stacked content.
- QA initially exposed an accidental save during transition to stage eight. Test blueprint f43e7fdc-35e0-420a-95ce-e424c6c16cba was reversibly archived with a matching audit event. No deployment occurred and the existing GAW document agent was preserved.
- Custom proposal regeneration updates an unchanged suggested owner while preserving an explicit user override.
