# FinOps control-plane visibility

Migrations 013–014 add read-only platform-owner access to the existing private financial controls. It does not activate a model, a connector, AWS accounting, or email delivery, and cannot raise any limit.

The private console-owner allowlist is provisioned through trusted maintenance only. Being an Org Admin in a tenant workspace does not grant platform financial access. The read function independently verifies the identity ID against the authenticated issuer and subject. Its search path is fixed, its tables are fully qualified and public execution is revoked. Tenant/runtime roles still cannot read or write the private schema directly.

FinOps presents actual admitted-customer count and cap, current UTC monthly accounting state and validity, baseline plus reservations/settlements, pending reservations, top ten recorded service drivers, latest 25 application alert records (provider acceptance, not inbox delivery) and latest ten approved increases. No customer identities, alert recipient or raw event payload is returned. No browser write endpoint exists.

A missing monthly ledger produces unavailable totals/limit, never fabricated zero cloud spending. A stale ledger remains visible as stale evidence. The reservation gate also identifies prior-period unsettled operations and exhausted allowance. Even fresh accounting does not mean runtime execution is enabled; individual reservations must remain bounded and admitted-customer checks still apply.

An empty notification queue does not establish that the notifier worker is active. AWS account-level billing and application reservations are separate; the application console is not a cloud invoice or an AWS account kill switch.

Tests exercise allowlist enforcement, mismatched identity context, missing/fresh/stale/exhausted accounting, reservation exposure, pending alerts and denial of direct schema access or limit changes. Production initialization grants only the existing verified GAW owner, adm@gawservices.com, read access.
