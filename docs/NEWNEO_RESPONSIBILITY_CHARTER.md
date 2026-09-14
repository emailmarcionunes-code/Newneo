# Newneo Responsibility Charter

## Purpose
Prevent product, UX and engineering responsibilities from overlapping or silently changing ownership.

## Final decision authority
Marcio is the final decision-maker for Newneo product direction, positioning, scope, priorities, UX direction and commercial strategy.

## Product / Strategy / UX ownership
Owned by the product strategy side of the project.

Responsibilities:
- product vision and positioning
- commercial model and packaging
- customer journey
- product scope and prioritization
- UX principles and information hierarchy
- screen intent and user flows
- product terminology and messaging
- feature acceptance from a product perspective
- deployment-model strategy: SaaS, Dedicated, BYOC, Private and Hybrid
- IP/product boundary decisions
- architecture decisions that materially change the product experience or commercial model

Engineering must not independently reinterpret these decisions.

## Codex / Engineering ownership
Codex owns implementation within approved product boundaries.

Responsibilities:
- repository structure
- code architecture and module boundaries
- database schema and migrations
- APIs and backend implementation
- frontend implementation of approved UX
- authentication and authorization implementation
- adapters and integrations
- MCP and connector implementation
- model/runtime integration
- evaluation engine implementation
- deployment implementation
- telemetry implementation
- tests and test automation
- CI/CD
- code quality and refactoring
- performance, reliability and security engineering
- debugging and build validation
- technical documentation needed to maintain the implementation

Codex should prefer the simplest maintainable implementation that satisfies the approved product requirements.

## Decisions Codex may make autonomously
Codex may choose or change implementation details when they do not alter product behavior, UX intent, commercial commitments, IP boundaries or deployment capabilities.

Examples:
- internal function names
- folder organization
- library selection between equivalent options
- database indexing
- caching strategy
- test structure
- refactoring
- error handling implementation
- component decomposition
- internal API design

## Decisions Codex must escalate
Codex must not independently make changes that affect:
- product scope
- user journey
- navigation model
- terminology visible to customers
- pricing or packaging
- commercial promises
- customer/Newneo IP boundaries
- task and usage economics
- removal of SaaS, BYOC, private or hybrid capability
- security/governance behavior visible to customers
- production approval rules
- role definitions or material permission semantics
- canonical Newneo domain objects
- AgentOps product dimensions
- evaluation requirements
- major UI redesign
- new top-level product pillars
- customer-facing workflow changes

When one of these questions appears, Codex should stop that decision path, state the tradeoff clearly and request a product decision.

## Review loop
Preferred operating model:

`Product decision → Codex implementation → Product/UX review → Codex adjustment → Acceptance`

Engineering feedback may challenge a product decision when there is a technical, security, reliability or cost concern. It should explain the constraint and alternatives rather than silently changing the product.

## Source-of-truth priority
When instructions conflict, use this order:
1. explicit latest decision from Marcio
2. this Responsibility Charter
3. NEWNEO_PRODUCT_DECISIONS_ADDENDUM_2026-09-14.md
4. NEWNEO_AI_PLATFORM_DESIGN_MANIFESTO.md
5. NEWNEO_AI_PLATFORM_V1_UX.md
6. NEWNEO_AI_PLATFORM_SPEC.md
7. CODEX_READY_CHECKLIST.md
8. NEWNEO_COMMERCIAL_MODEL.md
9. NEWNEO_SKILLS_STRATEGY.md
10. NEWNEO_IP_AND_CONTRACT_PRINCIPLES.md
11. CODEX_HANDOFF.md
12. existing prototype code

Prototype code is never authority over an explicit product specification.

## Working principle
Product owns **what and why**.
Codex owns **how**.
Marcio owns the final decision.

Neither side should silently take over the other's role.
