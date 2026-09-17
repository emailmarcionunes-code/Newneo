# NEWNEO AWS pilot deployment status

The user prioritized low initial cost and authorized AWS deployment. The prepared Lightsail configuration is one Ubuntu 24.04 LTS instance in us-east-1a with 4 GB RAM, 2 vCPUs, 80 GB SSD and the USD 24/month Linux dual-stack bundle, verified in the AWS console on 2026-09-16. The instance `newneo-app-pilot` is running at static IPv4 `100.24.77.220`. Backups, model usage, taxes, DNS registration, egress overage and identity-provider charges are separate. This bundle is not an enforced total spending limit.

## Packaging

`ai-platform/Dockerfile` builds an unprivileged Node standalone application. `compose.production.yml` defines PostgreSQL 18 (private Docker network), the app, Caddy HTTPS proxy, an opt-in maintenance container and an opt-in cost notification worker. Only ports 80 and 443 are published. No Docker socket or database port is exposed by the production compose file. Memory limits target a small pilot; capacity and load testing remain required. Prefer building images on CI or a development machine to avoid build-time memory pressure on the host.

Docker and Compose are installed on the AWS host. The app and tooling images built successfully there. PostgreSQL is healthy and the application and Caddy containers are running. On 2026-09-16, both public domains returned HTTP 200 over HTTPS through Cloudflare. Migrations 001–004 and restricted application/notifier database roles were provisioned; the PostgreSQL integration test passed.

## Deployment sequence

1. Set up a Lightsail VM and DNS record, allow HTTP/HTTPS, and restrict administrative SSH access.
2. Install Docker/Compose and securely transfer the environment file. DATABASE_URL uses `newneo_app` and hostname `database`; MIGRATION_DATABASE_URL uses the setup owner and hostname `database`. Database passwords in URLs must be URL-encoded. PUBLIC_HOST is the DNS hostname; APP_ORIGIN is its HTTPS origin.
3. Configure an OIDC client and its callback; set the issuer, client ID/secret, session key and trusted bootstrap fields as described in NEWNEO_BACKEND_FOUNDATION.md.
4. Run from `ai-platform`:

```sh
docker compose -f compose.production.yml up -d database
docker compose -f compose.production.yml run --rm tooling npm run db:migrate
docker compose -f compose.production.yml run --rm tooling npm run db:provision
docker compose -f compose.production.yml run --rm tooling npm run db:bootstrap
docker compose -f compose.production.yml up -d app proxy
```

5. Verify TLS, login/logout, read-only/write memberships and server draft round-trip. Live runtime routes remain disabled; launching the web application does not launch AI agents.

The maintenance image includes development dependencies for migrations; it is not the web runtime. Bootstrap needs a trusted administrative connection that can provision rows under forced RLS. It does not infer grants from email addresses. Never commit `.env` or copy its contents to logs.

## Backup and recovery

`scripts/backup.sh` creates a private custom-format pg_dump using the database container. It publishes the dump only after success. Dumps contain customer data; protect the host and encrypt/copy them to separate storage with a retention policy. The helper is not scheduled and does not yet transfer backups off-host. Restore into a separate database with pg_restore and verify application data before a pilot goes live; do not restore over the only working database.

## External dependencies still needed

An authenticated AWS console session is available. The account-wide USD 1,000 monthly budget and its actual/forecast email notifications are configured. The SNS topic `newneo-cost-approvals` has a confirmed email subscription, and the user confirmed receipt of a test message. See NEWNEO_COST_GUARDRAILS.md for the distinction between these deployed resources and the local cost enforcement implementation.

## Verified deployment (2026-09-16)

- AWS Lightsail Ubuntu 24.04, us-east-1a; automatic daily instance snapshots enabled.
- SSH restricted to the setup operator's IPv4 and Lightsail browser SSH. HTTP 80 and HTTPS 443 are available for web traffic; PostgreSQL remains private.
- Namecheap nameservers changed to `albert.ns.cloudflare.com` and `kay.ns.cloudflare.com`.
- Cloudflare Free: apex and app A records point to the static AWS address; www CNAME points to the apex, all proxied. SSL Full (Strict) was saved and verified in the Cloudflare overview.
- Caddy serves the exported institutional site at `www.newneo.ai`, redirects the apex to www, and proxies the platform at `app.newneo.ai`. Public TLS checks passed for site and app.
- Institutional site: static build completed (32 pages); dependency audit reported zero vulnerabilities after updates.
- Cognito pool `us-east-1_t6oX2JsmX`, confidential web client `3lk48239c097jj0jh77hgl65c4`, callback `https://app.newneo.ai/api/auth/callback`. Self-registration disabled.
- First local database backup created at `backups/newneo-20260916T214234Z.dump` on the AWS host. Restore succeeded into isolated database `newneo_restore_verification_20260916` with `pg_restore --exit-on-error`; 13 non-system tables were found. This verifies dump restoration, not application-level recovery of future customer data.

## Remaining work / release boundary

The user explicitly authorized Cognito secret installation. The existing client secret was decrypted only in process memory and installed through SSH into the server private `.env` (0600); the app container was recreated. The browser flow from `/api/auth/login` successfully reached Cognito Sign-in with PKCE after enabling the requested `profile` scope. The user confirmed successful first sign-in and arrival at `/settings` on 2026-09-16. After explicit user approval, Cognito successfully created `adm@gawservices.com` with email invitation and an AWS-generated temporary password; status is FORCE_CHANGE_PASSWORD. The verified Cognito subject was provisioned into organization NEWNEO, workspace Principal, with `can_edit_agents=true`. Bootstrap committed successfully. This is the current workspace editing capability, not an AWS administrator grant. The user completed initial sign-in successfully. SNS worker deployment, automatic accounting reconciliation, scheduled off-host backups, and capacity testing are still pending. The site's `hello@newneo.ai` contact mailbox has not been provisioned or validated.

The published platform remains an interactive pilot. Paid/live agent execution is disabled and deployment routes fail closed. AWS Budget notifications are alerts, not an instantaneous spending cap. The cost-control code is not yet integrated with a real paid runtime. Do not describe this release as a complete production agent service.

The SSH private key and configuration files stay in ignored `.deployment` / server `.env` paths and must never be committed or logged.

## First customer (2026-09-16)

The user requested GAW DIGITAL SERVICES as the first customer. The existing provisioned organization was renamed in place (UUID b25d2a69-9dce-41f3-88dd-3c26bd0d9534), preserving its Principal workspace and memberships. The verified identity display name is adm@gawservices.com. Customer admission through the cost-control CLI succeeded; registered customer count is 1. Migration 005 adds an identity display label and membership-scoped organization RLS (requires the previously provisioned newneo_app role). A restricted-role SQL check showed the GAW organization for the member and zero organizations for an unrelated identity. The session API now returns the real organization and display name; authenticated settings show real account/workspace data instead of Acme preview details. Production build/type checks passed. Browser verification confirmed GAW in sidebar/header and successful selection of Principal. Other product dashboards remain demonstration data.

## Public demo access

The public login page does not advertise the demo. The seller entry URL www.newneo.ai/demo redirects to app.newneo.ai/demo, a noindex page with a Start demo button. This unlisted URL is not access control; anyone with the link can use the synthetic demo. POST /api/demo enforces same-origin, clears real authentication/login cookies, and sets an HTTP-only demo marker for 24 hours. The marker can only deny real access: getSession returns null while it is present. /api/session returns the synthetic Acme / Ana identity with authenticated=false and no workspaces. Successful real authentication clears the demo marker. No Cognito user, database membership, or customer registration is created for the demo. Preview state, launch drafts, and resource previews use separate browser storage keys in public demo mode. The interface displays a demo notice and an exit link. Returning to a real workspace requires sign-in.

### SEO baseline — 2026-09-16
Published www canonical metadata and matching sitemap (27 pages including FinOps). Added self-canonicals for homepage/FinOps and consistent trailing slashes. Published platform root noindex/nofollow metadata and Caddy X-Robots-Tag across app responses and www demo redirect. Public curl verified robots sitemap declaration, sitemap contents, FinOps canonical, login meta/header, and demo 302/noindex. Static build and remote platform build passed; Caddy config validated and proxy recreated. See NEWNEO_SEO.md for Brazil/US localization plan and pending Search Console setup.
