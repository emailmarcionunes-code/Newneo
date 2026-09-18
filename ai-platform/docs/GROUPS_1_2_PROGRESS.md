# Hosted foundation milestone — 2026-09-17 UTC

## Published
- Role-aware authoring, retaining existing edit/read permissions. The schema names seven roles; this release implements configuration-authoring permission, not every future role capability.
- Agent and Skill records scoped to the verified selected workspace.
- Immutable configuration snapshots, optimistic revision conflicts and explicit Skill-version bindings.
- Atomic resource/version/binding/audit writes. Runtime database role cannot update/delete version history or audit events.
- Real authenticated workspace lists/editors/detail tabs. Demo screens retain their separate sample state.
- Standalone Skill creation and new Agent versions adopting chosen Skill versions.
- Saved configurations are not evaluated, deployed or executing.

## Validation
- 41 unit/database tests passed; 1 existing PostgreSQL integration test skipped for missing optional test URL.
- Production build and TypeScript validation passed.
- Production PostgreSQL smoke test using SET LOCAL ROLE newneo_app: create Skill, create Agent/version/binding, read and audit; transaction rolled back, no smoke records retained.
- Public API rejects anonymous and demo access (401), foreign-origin mutation (403).
- Real-user browser end-to-end awaits GAW sign-in; do not claim this check completed.
- Pre-migration database backup: /home/ubuntu/backups/pre-registry-20260917.dump (permissions restricted).
- Source backup: /tmp/newneo-before-registry.tgz.

## Remaining before closing groups 1 and 2
- Complete role-specific administration, invitations, member lifecycle and revocation acceptance checks.
- Custom authentication domain and full sign-in/recovery/MFA branding review. Managed login wordmark, neutral background #f5f7f9 and primary color #164e63 were saved in Cognito and visually verified on the actual sign-in page. Authentication still uses the existing Cognito hostname.
- Connect complete Agent/Skill guided builders to persisted validated configuration contracts (current production editor supports core identity/mission/instructions and version bindings).
- Lifecycle states, evaluations, approval, release/publish, rollback, archive and full filtered audit history; no simulated result may count as production approval.
- Pagination and aggregate queries for large portfolios; current pilot loads workspace registry.
- Knowledge/tools/governance configuration and real operational surfaces need corresponding services; this milestone is not a finished runtime.

## Next sequence
3. Knowledge ingestion and one approved GAW integration.
4. Task execution with source citations, tool contracts and measured model usage.
5. Real evaluation and approval gates.
6. Connect measured cost reservations/settlement and customer thresholds to execution.
7. Real operational telemetry and incident workflows.
8. Recovery, security and load acceptance.
9. GAW pilot and onboarding.
