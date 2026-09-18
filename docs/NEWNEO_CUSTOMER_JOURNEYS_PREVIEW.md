# Customer journeys — interactive frontend preview

These screens extend the existing product shell and card system. They are customer-experience prototypes; final design acceptance and real integrations remain separate work.

## Routes and flow

- `/models`: add/edit an endpoint, review configuration, simulate connection success/failure, choose organization defaults and workspace overrides. No API keys collected.
- `/evaluations`: create/edit suites, simulate pass/fail, inspect evidence and compare consecutive runs. Runs preserve their original question, category and expected result.
- `/deployments`: request promotion from a passed run, review release history, pause/resume and simulate rollback to baseline. Production requires the same evaluation run active in Test. Duplicate pending/active requests are blocked.
- `/governance`: approval queue with required decision note, simulated invitations, editable roles and policies, illustrative classifications and preview audit. Policy edits do not modify enforcement; all preview promotions require approval. Invitations never send email.
- `/agentops`: inspect a sample task trace, investigate incidents, change local investigation status and view release activity.
- `/finops`: save a sample budget/alert, explore a transparent linear forecast and review optimization evidence. No real alerts, billing, spending enforcement or measured savings.

Shared state uses `newneo:customer-journeys:v1` in sessionStorage within the current browser tab. Invalid/unavailable storage falls back to a usable session. Knowledge/Tools and Launch Guide retain their separate preview stores. These changes are not database records.

## Validation

Production build and 31 Playwright tests passed, covering existing journeys, new interactions, responsive layouts and automated accessibility. The two new journey tests also passed after evaluation snapshot and promotion dependency refinements. Coverage includes failed evaluations, approval, pause/resume, rollback, endpoint creation, simulated invitations, task trace, incident status and budget persistence.

No cloud resources, providers, customer messages or deployments are triggered. Existing static fleet metrics are reference fixtures, independent of the interactive incident/release exercise.
