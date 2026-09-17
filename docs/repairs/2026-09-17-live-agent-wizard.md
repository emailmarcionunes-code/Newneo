# Live agent creation — eight stages

Replaces the authenticated account's single long RegistryEditor agent form with the eight-stage journey. Demo continues using LaunchGuide; live uses the shared LaunchStepper and NeoMascot plus scoped approved visual tokens.

Stages: Use Case, Knowledge, Tools & MCP, Infrastructure, Model, Governance, Evaluate, Deploy. Real document and skill-version bindings preserved. Optional infrastructure/model preferences and governance notes are now validated and persisted by registryInput. These are preferences, not runtime activation. Configuration checks are not model evaluations. Final action saves an immutable configuration, not a production deployment. Existing skill editor is unchanged.

Desktop layout reserves navigation and footer space, uses the remaining height for the active stage and readiness card, and allows internal overflow for longer content. Small screens stack naturally. Saluting Neo appears only after a successful API response.

Verification: Next build/typecheck passed for initial deployment; registry.test.ts passed both validation and tenant/role/version isolation tests. Production record writes were not performed for visual testing. Browser GAW session expired; authenticated visual verification is pending re-login. Final CSS deployment log: /tmp/newneo-live-wizard-build.log.

Authoritative source: /home/ubuntu/platform. Backup: /tmp/newneo-before-live-wizard.tgz. Changed components/WorkspaceRegistry.tsx, new components/WorkspaceAgentWizard.css, server/registry.ts. Staging copies: /tmp/newneo-next-groups.
