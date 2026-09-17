# Newneo Product Model: Workspace vs Operations

## Product principle

**Expose the job, not the technology.**

Newneo should let business users get work done with AI without requiring them to understand AI infrastructure. Technical complexity should increase only with the user's responsibility for operating the platform.

## Workspace

Workspace is the default product experience for employees and business users.

A user should be able to:

- find an approved agent;
- give the agent a task;
- provide or connect the source material it should use;
- review the result;
- continue the work.

The user should not need to understand Skills, MCP, RAG, embeddings, vector stores, tool calling, model routing or orchestration.

Example: a Procurement employee opens **RFP Analyst**, asks it to compare vendor proposals, selects SharePoint or uploads files, and receives the analysis. The underlying retrieval and tool architecture remains invisible.

Preferred user-facing language:

- Sources / Company Knowledge instead of RAG
- Connections instead of MCP
- Capabilities instead of implementation-level Skills when business explanation is needed
- Agents as digital workers for specific jobs

## Operations

Operations is an advanced surface for AI, IT and platform administrators.

It may expose:

- Agents
- Skills
- Knowledge
- Connections
- Governance
- Evaluations
- Deployments
- AgentOps
- FinOps
- Playground
- Audit Log
- Models and advanced platform configuration

Operations access should be controlled by RBAC. Business users should not see these controls in their default navigation.

## Personas

### Employee

Needs the simplest experience: agents, work and results.

### Department Owner

May configure approved agents, business sources, policies and department-specific behavior without needing low-level AI concepts.

### AI / IT Administrator

Can access Operations and manage agents, skills, retrieval, integrations, policies, evaluations, observability and deployment controls.

### Platform Engineer

Has the deepest technical access, including implementation-level configuration where required.

## Progressive disclosure

Complexity should increase with responsibility:

Employee → Department Owner → AI / IT Administrator → Platform Engineer

Technical controls must not leak into the default employee experience merely because the platform supports them.

## UX rule

A Newneo business user should be able to understand what an agent does within seconds and use it without learning how the agent is built.

The product should feel like **a place where work happens with agents**, not a toolkit that requires every employee to become an AI engineer.
