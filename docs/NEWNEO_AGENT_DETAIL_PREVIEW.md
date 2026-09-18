# Agent Detail preview

Implements section 5 of NEWNEO_AI_PLATFORM_V1_UX.md in the existing `/agents/customer-service` route. Final Figma treatment remains pending per NEWNEO_PRODUCT_SURFACE_ROADMAP.md. This is a reviewable prototype using the existing Golden Reference shell, card sizing and buttons, not a final approved Figma screen.

Eight functional tabs: Overview, Configuration, Knowledge, Tools, Evaluations, Versions, Activity and AgentOps. Header includes owner, version, environment, status and health. Knowledge and Tools use three card columns and a top-sticky fourth summary on desktop, stacking on smaller screens. The Customer Service attention card in Overview links here.

All data is illustrative. Production configuration is read-only. Create New Version prepares an in-memory preview row without modifying the production reference; reload clears it. Test opens a native modal with a fixed sample conversation and no network calls. Promote, Rollback and Pause are disabled with an explanation until runtime authorization is available. AgentOps has an explicit unconnected state. Knowledge and tool lists do not assert live connections. This preview does not import or overwrite Launch Guide drafts.

Validation: production build with TypeScript checking; browser coverage for all tabs at 1180/768/390px, new-content accessibility, overflow, keyboard tab navigation, modal dismissal, local version lifecycle and navigation from Overview. Existing shell avatar contrast debt is excluded from the new-content accessibility check.
