# Three product access levels and daily Operations

Public membership choices are User, AI Operator and Administrator. User uses Workspace (including personal analytics and agent work); AI Operator also uses daily Operations; Administrator additionally accesses organization settings and FinOps.

Operations navigation: Overview, Agents, Skills, Knowledge, Evaluations, Deployments, AgentOps, Reports and Playground. Administrative destinations are grouped in Settings: People & access, Connections, Models, Governance, Audit Log and FinOps. Settings remains a footer destination available only to Administrators.

Both server layout and client/demo shell restrict administrative routes, including direct URLs. Existing API authorization remains in force: membership changes and company FinOps require Org Admin. Operational APIs that consume configuration or activity are not reclassified as administrator-only just because their administrative page moved.

## Compatibility

The three public names map to existing stored role identifiers: User → Operator; AI Operator → AI Platform Admin; Administrator → Org Admin. This avoids rewriting membership records or changing database authorization predicates. Existing legacy role assignments retain their capabilities and appear as legacy options when editing; new assignments offer only the three product roles. No existing membership is upgraded automatically.

Demo personas use the same product access policy. A User has no Operations navigation; an AI Operator has no Settings destination; an Administrator has both.

## Validation

Production compilation and TypeScript validation; product-access regression coverage for all administrative roots and their nested routes, operational routes, unknown roles, and membership/configuration capabilities. Existing workspace-member authorization tests remain in the suite.
