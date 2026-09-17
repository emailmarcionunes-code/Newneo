# Workspace entry after login — 2026-09-17

Published to app.newneo.ai on existing AWS host.

## Cause
Successful authentication redirected to /settings with no workspace selected in the new signed session. Organization display alone did not establish workspace context.

## Change
- Successful auth callback now redirects to /welcome.
- One authorized workspace is selected automatically using the existing verified /api/workspace/select endpoint, then redirects to Overview.
- Multiple workspaces show a chooser; no workspace shows access guidance.
- Settings renamed Account & workspace, with explicit continuation/Open Overview action. Manual workspace selection also opens Overview.
- Overview missing-workspace link leads to the same entry flow.
- No membership or permission changes.

## Verification
Production Docker build passed. App container healthy and existing monitor completed successfully. In the authenticated GAW browser session with no selected workspace, opening /welcome automatically reached / and loaded the real workspace Overview: 1 agent, 1 skill, 1 knowledge document and recent activity. A new credential login was not repeated during this verification.

Source staging: /tmp/newneo-next-groups. Authoritative deployed source: /home/ubuntu/platform.
Remote pre-change backup: /tmp/newneo-before-welcome.tgz.
