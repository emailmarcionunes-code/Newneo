# Add Agent from Catalog

Customer CTAs changed to Add Agent across official inventory, demo, shell and onboarding. Catalog cards expose outcomes, core capabilities, expected systems, typical use, complexity and honest blueprint maturity. New /agents/catalog/[id] introduction links available Skill Library entries and marks missing bindings. Use this Agent and Customize enter the existing eight-stage prefilled journey. Legacy custom launch entry redirects to /agents/request. Template/blueprint source and existing version authoring remain intact.

Request a New Agent collects outcome, department, users, systems, volume and sensitivity; suggests catalog candidates by business category. Submission stores a separate tenant/workspace-scoped pending request, with author authorization, verified session identity, same-origin protection, bounded input and RLS. Does not create an Agent, enable tools, grant approval or claim activation. Demo request only previews. Workspace requests remain visible in request page. Product review workflow/notification automation is not implemented; status is explicitly Pending review.

Agent context now persists expected volume and data restrictions. Model/infra recommendations remain blueprint defaults; not a live provider catalog or adaptive optimization service. Runtime/evaluation/activation gates remain closed until integrations and approvals exist. Missing library capabilities are explicit; no production Skills were fabricated.

Backup on deployment host: /tmp/newneo-before-add-agent.tgz. New schema: db/migrations/021_agent_requests.sql. Production build log: /tmp/newneo-add-agent-build.log.

Verification: 17 focused tests passed. Added real SQL/RLS assertions in isolated PGlite for request persistence, tenant isolation, reader denial and forged actor rejection; these passed too. Production build/typecheck passed after correcting the request route response union type. GAW UI verified Add Agent, four-column catalog, IT introduction, Use this Agent with prefilled context, and Request form with existing-profile suggestions. No new production test Agent/request was submitted in this turn.

Live visual checks: introduction panels align at equal height and end above viewport bottom; internal scrolling preserves all detail. Mobile 390×844 has no horizontal overflow. Legacy /agents/launch?template=custom redirects to /agents/request. Latest CSS removes the inherited desktop content maximum for the introduction. Temporary browser viewport overrides reset.
