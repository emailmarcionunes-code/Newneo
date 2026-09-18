# Newneo

> **Current reference: 2026-09-17.** The `main` branch contains the consolidated website and hosted platform source. Start with [Reference baseline](docs/REFERENCE_BASELINE.md) before reusing screens, tokens or architecture.

**Enterprise AI Engineering**

Newneo builds and operates enterprise AI — from AI infrastructure and accelerated compute to production agents and AgentOps.

## Positioning

The public website is organized around three ways customers enter the conversation:

1. **Technology** — AI Infrastructure, AI Compute, Agent Factory, AgentOps.
2. **Business problem** — Customer Service, Finance, IT Operations, HR, Procurement.
3. **Industry** — Financial Services, Manufacturing, Healthcare, Public Sector, Retail.

The communication rule across the site is simple: a visitor should understand the purpose of each page within five seconds. Technical depth comes later through progressive disclosure.

## Core architecture

- **AI Infrastructure** — networking, storage, connectivity and data center foundations.
- **AI Compute** — GPU clusters, Kubernetes/OpenShift, model runtimes, training and inference.
- **Agent Factory** — enterprise knowledge, RAG, MCP/tools, governance, evaluation and production agents.
- **AgentOps** — quality, reliability, security, economics and continuous improvement.

## Capabilities

- Enterprise RAG
- MCP & Enterprise Actions
- AI Security
- Private & Hybrid AI

## Engagement model

**Assess → Prove → Deploy → Operate**

Start with one measurable business process, prove value with a bounded POC, productionize what works, then operate and improve it continuously.

## Technology baseline

- Next.js 15
- React 19
- TypeScript
- App Router
- Native Next.js metadata, sitemap and robots routes

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```

A GitHub Actions build workflow is included in `.github/workflows/build.yml`. If no workflow runs appear, enable GitHub Actions for the repository before relying on CI.

## Domain

`newneo.ai`

## Deployment

The current website implementation lives on branch `newneo-site-v1` and is reviewed through PR #1 before merging into `main`.

Recommended deployment flow:

1. Review the PR and visual experience.
2. Ensure GitHub Actions or the chosen hosting provider completes a successful Next.js build.
3. Merge `newneo-site-v1` into `main`.
4. Connect `newneo.ai` to the deployment provider.
5. Validate canonical URLs, sitemap, favicon and responsive behavior in production.

## Language

English is the canonical website language. Portuguese, Spanish and French are planned as optional localized experiences.
