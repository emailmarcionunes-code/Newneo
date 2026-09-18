# PostgreSQL and identity foundation

> **Current Skills surface:** [ADR-003 — Global Skills](decisions/ADR-003-GLOBAL-SKILLS.md) supersedes earlier Agent-only entry points. Skills are created globally and consumed through versioned Agent bindings. `/skills` owns discovery, analytics, creation and versioning; Agent Detail owns Add Skill and binding. Production gates and the eight-stage Agent journey remain unchanged.


> **Canonical architecture — ADR-001 (accepted).** [Neo, Agents and reusable Skills](decisions/ADR-001-NEO-AGENTS-SKILLS.md) governs the Agent/Skill/Neo model and resolves older conceptual ambiguity. **One Neo. Many Agents. Reusable Skills.** Neo orchestrates bounded specialized Agents; Skills are reusable versioned capabilities distinct from Tools. Production changes require a new evaluated and approved Agent Version. Hybrid v4 and its eight-stage journey remain unchanged. See the ADR for the current-code audit and unimplemented prerequisites.

Implements the portable PostgreSQL/OIDC direction in CODEX_READY_CHECKLIST.md and NEWNEO_PLATFORM_OPERATING_MODEL.md. This is a foundation for authenticated draft storage, not a live agent runtime.

## Implemented

- Organizations, external identities (exact issuer + stable subject), workspaces, explicit read/write memberships, agent metadata and draft configurations.
- Row-level security isolates workspace memberships, identities, workspaces, agents and drafts. The application role has no grants to organization administration tables. Queries bind parameters; workspace access is never derived from email domains or browser role claims.
- OIDC authorization-code login with PKCE S256, state, nonce and required ID token validation through `openid-client`. Only HTTPS issuers are accepted. The exact callback is `APP_ORIGIN/api/auth/callback`.
- AES-256-GCM encrypted, HTTP-only, SameSite=Lax cookies. Secure cookies are required outside localhost. Sessions expire at the earlier of one hour or the ID token expiry; workspace selection does not extend expiry. Login transactions expire after ten minutes. Logout clears local cookies. There is no refresh token storage, provider-wide logout or central session revocation yet; removing a membership revokes data access on subsequent requests, and rotating SESSION_SECRET invalidates all sessions.
- Verified issuer/subject lookup occurs inside a transaction. Tenant context uses transaction-local PostgreSQL settings. Connections with owner, superuser, BYPASSRLS or inherited privileged roles are rejected by the authenticated transaction helper.
- Settings supports sign-in/out and selecting provisioned workspaces. The Launch Guide exposes server-copy save/load only to signed-in users with a selected workspace. Local demo drafts still work independently.
- Server draft writes require a same-origin request and the expected workspace, sanitize the configuration, cap request bodies at 32 KiB and use optimistic revision checks. Template changes cannot overwrite an unrelated draft. Read-only members cannot write. Stored preview configuration does not convey live resource permissions or deployment approval.

## Development configuration

Copy `ai-platform/.env.example` to an ignored `.env`, supply distinct owner/runtime credentials, and generate SESSION_SECRET with `openssl rand -hex 32`. Do not put secrets in source control or conversation messages.

With Docker available, from `ai-platform`:

```sh
docker compose -f compose.backend.yml up -d
node --env-file=.env --import tsx scripts/migrate.ts
node --env-file=.env --import tsx scripts/provision.ts
node --env-file=.env --import tsx scripts/bootstrap-workspace.ts
```

The migration runner applies 001 and 002 transactionally with checksums and an advisory lock. Register future migration files explicitly; never modify applied migrations. `db:provision` creates a restricted `newneo_app` role and sets APP_DATABASE_PASSWORD, which must match the runtime DATABASE_URL. It rejects an existing privileged application role.

`db:bootstrap` is an administrator-only command to create one new organization and workspace for BOOTSTRAP_SUBJECT at OIDC_ISSUER_URL. It deliberately refuses an existing organization name, rather than guessing a tenant. BOOTSTRAP_CAN_EDIT defaults to false. Additional memberships must be provisioned explicitly by UUID through a trusted administrative process. Local PostgreSQL's owner account is the privileged setup account; never use it as DATABASE_URL.

The local database binds to localhost port 5434. Export variables before npm scripts or use the Node environment-file commands above. Match APP_ORIGIN exactly to the browser origin (including port). Configure the OIDC client callback, sign in through Settings, select a workspace, then use Server drafts in the Launch Guide.

## Verification and remaining boundaries

PGlite tests exercise SQL policies, transaction-local reset, cross-tenant writes, read-only users and stale updates. Native PostgreSQL integration runs in CI against PostgreSQL 18 with the actual connection pool; it is skipped locally when TEST_DATABASE_URL is absent. Tests also cover cookie tampering/expiry, request size and unauthenticated API rejection.

No real OIDC provider, PostgreSQL service, Docker host or cloud account was available locally during this increment. Provider login and a real signed-in browser session still require environment integration testing. CI adds native database and container smoke checks; inspect their results before deployment.

The runtime, source ingestion, actual evaluations, production deployment/approval/rollback, operational telemetry and enforced spend limits remain unimplemented integrations. Existing dashboards and registries are explicitly demonstrations. Agent metadata and draft persistence do not constitute those services.

References: [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [node-postgres transactions](https://node-postgres.com/features/transactions), [openid-client](https://github.com/panva/openid-client), [PGlite](https://pglite.dev/docs/).
