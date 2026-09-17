# Operational health

The application health endpoint runs a bounded database connectivity probe. Its public response contains only a ready boolean and HTTP 200/503, not tenant data or internal error details. It does not certify model, connector or billing readiness.

Docker checks the application every 30 seconds, with a startup grace period and three failed attempts before unhealthy status. This status alone does not restart a container. The existing restart policy handles exited containers; no automatic destructive remediation is added. Application JSON logs rotate at 10 MB with three files.

A root-owned systemd oneshot/timer runs every five minutes. It inspects the fixed production application/database/proxy containers, available disk space, the latest nonempty local backup and the backup unit's last result. It atomically writes a small sanitized status JSON. No credentials, account identifiers or customer content are included. The application mounts the status directory read-only.

AgentOps shows this evidence only to the platform owner, authorized by the same verified-identity allowlist as FinOps. The owner authorization helper is centralized in migration 015. Tenant administrators cannot view host status. The page refreshes this evidence once per minute. Evidence older than 15 minutes, invalid fields or future timestamps cannot produce a healthy status. A backup older than 30 hours or less than 4 GiB free disk requires attention. A failed backup unit is surfaced even if an older backup file exists.

Monitoring is local. It records attention states but does not deliver external notifications, verify inbox delivery, or replace off-host backups/disaster recovery. A host outage requires an independent external monitor, not this local timer.
