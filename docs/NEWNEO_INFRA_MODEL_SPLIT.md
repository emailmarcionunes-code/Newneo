# Eight-step Launch Guide

User-requested revision: Use Case → Knowledge → Tools → Infra → Model → Governance → Evaluate → Deploy.

Infra contains execution choices. Model contains three provider cards (OpenAI, Anthropic/Claude, Google/Gemini), model selection, capability descriptions, context/cost/latency reference fields and a sticky configuration summary. Browsing a provider does not change the selected model; selecting a model invalidates the evaluation receipt.

The new Claude/Gemini endpoints are demonstration fixtures for Customer Cloud, not provisioned resources. Other runtimes show an unavailable model state and block advancing beyond Model. Exact prices/performance are not invented. Family descriptions link to official provider catalogs:
- https://platform.claude.com/docs/en/models/overview
- https://ai.google.dev/gemini-api/docs/models
- https://platform.openai.com/docs/models

Existing local storage keys and schemaVersion remain unchanged. An additive journeyVersion=2 distinguishes eight-step drafts. Older Governance/Evaluate/Deploy indexes migrate forward; Deploy resumes at Evaluate because evaluation receipts are session-only.

Validation: production build; unit tests for migration, invalid configuration and preview receipt safety; browser Launch Guide suite including provider selection/reload, evaluation/deployment and responsive accessibility at 1180, 768 and 390 pixels.
