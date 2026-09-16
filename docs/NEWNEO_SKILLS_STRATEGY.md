# Newneo Skills Strategy

> **Canonical architecture — ADR-001 (accepted).** [Neo, Agents and reusable Skills](decisions/ADR-001-NEO-AGENTS-SKILLS.md) governs the Agent/Skill/Neo model and resolves older conceptual ambiguity. **One Neo. Many Agents. Reusable Skills.** Neo orchestrates bounded specialized Agents; Skills are reusable versioned capabilities distinct from Tools. Production changes require a new evaluated and approved Agent Version. Hybrid v4 and its eight-stage journey remain unchanged. See the ADR for the current-code audit and unimplemented prerequisites.

## Thesis
A large skill library alone is not a durable differentiator because skills, MCP components and agent patterns can be shared across ecosystems.

Newneo should treat public and third-party skills as inputs, not as the moat.

## Value stack
`Public Skill → Newneo Hardened Skill → Enterprise Pattern → Proven Intelligence → Operational System`

## Hardened Skill
A Newneo hardened skill adds enterprise behavior around a capability:
- validation
- permissions
- approval rules
- failure handling
- auditability
- observability
- evaluation cases
- versioning

## Enterprise Pattern
An enterprise pattern combines multiple skills, tools, policies and approvals into a reusable business workflow.

The value is knowing not only how to call a tool, but when, in what order, under which conditions and with what controls.

## Proven Intelligence
As deployments accumulate, Newneo can improve reusable assets using generalized evidence such as failure modes, evaluation results, operating patterns and task economics without transferring customer confidential information between customers.

## Skill Factory
Each Newneo skill should eventually carry:
- business purpose
- inputs and outputs
- preconditions
- required systems
- required permissions
- actions
- validation rules
- approval rules
- failure handling
- security controls
- expected outcome
- evaluation suite
- version
- maturity level

Suggested maturity states:
`Experimental → Validated → Production Ready → Proven at Scale`

## Long-term asset
The long-term asset is broader than the skill library:

**Newneo Enterprise AI Operating Intelligence = skills + enterprise patterns + evaluations + governance + deployment knowledge + operational history + economics.**

Principle:
**Skills are ingredients. Newneo is the operating system.**

## Skill lifecycle milestone

[ADR-002: Skill lifecycle](decisions/ADR-002-SKILL-LIFECYCLE.md) defines the implemented demo Skills tab, reusable library, four-step Add Skill flow, version gates and restrained Neo confirmation. Create Skill remains a separate builder scaffold. Live persistence, execution and evidence are future prerequisites.
