# Low-cost single-VM pilot preparation

The user prioritized low initial cost and accepted a Lightsail pilot direction. Target one 2 GB Linux instance, approximately USD 12/month for compute at the quoted bundle rate, plus variable backup/storage and other usage. This is a planning estimate, not an enforced total or a provisioned service. Model usage, taxes, DNS registration, egress overage and identity-provider charges are separate. Confirm current region pricing before creating resources.

## Packaging

`ai-platform/Dockerfile` builds an unprivileged Node standalone application. `compose.production.yml` defines PostgreSQL 18 (private Docker network), the app, Caddy HTTPS proxy and an opt-in maintenance container. Only ports 80 and 443 are published. No Docker socket or database port is exposed by the production compose file. Memory limits target a small pilot; capacity and load testing remain required. Build images on CI or a development machine to avoid build-time memory pressure on the 2 GB host.

Docker is not installed on the implementation machine. CI builds and smoke-tests the runner image. The full Compose/HTTPS deployment and backup restore must still be verified on a Docker host.

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

An authenticated AWS session, selected region, DNS hostname, OIDC client, secrets and runtime/provider credentials are not present. No AWS resource has been created. Cost alarms and backup scheduling are not activated. This packaging supports a pilot, not high availability or a complete production agent service.
