'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  Clock3,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

// Overview snapshot supplied by the user on 2026-09-16 supersedes frame 2:2.
const agents = [
  [
    'customer-service',
    'Customer Service Agent',
    'GPT-4o',
    '4.821',
    '97.3%',
    '1.2s',
    'healthy',
  ],
  [
    'it-support',
    'IT Support Agent',
    'Claude 3.5',
    '2.103',
    '99.1%',
    '0.9s',
    'healthy',
  ],
  [
    'sales-assistant',
    'Sales Assistant',
    'GPT-4o',
    '1.284',
    '94.8%',
    '1.8s',
    'warning',
  ],
  [
    'knowledge-assistant',
    'Knowledge Assistant',
    'Gemini Pro',
    '832',
    '88.2%',
    '3.1s',
    'danger',
  ],
  [
    'research-assistant',
    'Research Assistant',
    'Claude 3.5',
    '541',
    '96.5%',
    '2.1s',
    'healthy',
  ],
];
const events = [
  [
    'Knowledge Assistant degraded — latency spike',
    '09:42',
    'danger',
    '/agentops',
  ],
  [
    'IT Support Agent v2.3 deployed to production',
    '09:18',
    'blue',
    '/deployments/it-support',
  ],
  [
    'Tier-1 Eval Suite completed — 94% readiness',
    '08:55',
    'warning',
    '/evaluations',
  ],
  [
    'Confluence sync completed — 2,841 docs updated',
    '08:30',
    'healthy',
    '/knowledge/confluence',
  ],
  [
    'PII policy applied to Sales Assistant',
    '07:45',
    'healthy',
    '/governance/policies/pii',
  ],
  [
    'Customer Service Agent processed 1,000th task',
    '07:12',
    'healthy',
    '/agents/customer-service',
  ],
];
export default function OverviewFidelity() {
  const [refreshed, setRefreshed] = useState(false);
  return (
    <div
      className="overviewFidelity"
      data-reference="user-command-center-2026-09-16"
    >
      <header className="overviewTitle">
        <div>
          <h1>Command Center</h1>
          <p>Live platform health · Acme Corp · Mon 15 Sep 2025</p>
        </div>
        <button className="overviewRefresh" onClick={() => setRefreshed(true)}>
          <RefreshCw size={15} aria-hidden="true" />
          Refresh
        </button>
      </header>
      <span className="srOnly" role="status">
        {refreshed
          ? 'Reference workspace refreshed. Demo data is up to date.'
          : ''}
      </span>
      <section className="overviewReferenceMetrics" aria-label="Key metrics">
        {[
          ['Agents live', '24', 'of 26 total', 'blue'],
          ['Tasks today', '14,302', '+12% vs yesterday', 'neutral'],
          ['Success rate', '99.2%', 'last 24h', 'healthy'],
          ['Avg latency', '1.4s', 'P95: 3.2s', 'neutral'],
          ['AI spend', '$1,240', '$42k budget · 3% used', 'neutral'],
          ['Incidents', '1', '1 open, 0 critical', 'danger'],
        ].map(([label, value, note, tone]) => (
          <article key={label}>
            <h2>{label}</h2>
            <strong className={tone}>{value}</strong>
            <p>{note}</p>
          </article>
        ))}
      </section>
      <div className="overviewReferencePanels">
        <section
          className="overviewHealthPanel"
          aria-labelledby="overview-health-heading"
        >
          <header>
            <h2 id="overview-health-heading">
              <Bot aria-hidden="true" />
              Agent Health
            </h2>
            <Link href="/agents">View all →</Link>
          </header>
          <ul className="overviewAgentList">
            {agents.map(([id, name, model, tasks, success, latency, tone]) => (
              <li key={id}>
                <span
                  role="img"
                  className={`overviewHealthDot ${id === 'knowledge-assistant' ? 'warning' : 'healthy'}`}
                  aria-label={
                    id === 'knowledge-assistant' ? 'Degraded' : 'Healthy'
                  }
                />
                <Link className="overviewAgentIdentity" href={`/agents/${id}`}>
                  <strong>{name}</strong>
                  <small>{model}</small>
                </Link>
                <div>
                  <strong>{tasks}</strong>
                  <small>tasks</small>
                </div>
                <div>
                  <strong className={tone}>{success}</strong>
                  <small>success</small>
                </div>
                <div>
                  <strong>{latency}</strong>
                  <small>latency</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section
          className="overviewActivityPanel"
          aria-labelledby="overview-activity-heading"
        >
          <header>
            <h2 id="overview-activity-heading">
              <Activity aria-hidden="true" />
              Activity
            </h2>
          </header>
          <ul>
            {events.map(([text, time, tone, href]) => (
              <li key={text}>
                <span
                  className={`overviewEventDot ${tone}`}
                  aria-hidden="true"
                />
                <div>
                  <Link href={href}>{text}</Link>
                  <time>{time}</time>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="overviewSummaryPanels">
        <section>
          <h2>
            <CheckCircle2 className="healthy" aria-hidden="true" />
            Governance
          </h2>
          <div className="overviewProgressLabel">
            <span>Compliance score</span>
            <strong className="healthy">96%</strong>
          </div>
          <progress
            aria-label="Compliance score"
            value={96}
            max={100}
            className="healthy"
          />
          <div className="overviewProgressFoot">
            <span>18 active policies</span>
            <span>2 open violations</span>
          </div>
          <Link href="/governance">View governance →</Link>
        </section>
        <section>
          <h2>
            <TrendingUp className="blue" aria-hidden="true" />
            Evaluations
          </h2>
          <div className="overviewProgressLabel">
            <span>Avg readiness</span>
            <strong className="blue">91%</strong>
          </div>
          <progress
            aria-label="Average readiness"
            value={91}
            max={100}
            className="blue"
          />
          <div className="overviewProgressFoot">
            <span>42 runs this week</span>
            <span>3 failing scenarios</span>
          </div>
          <Link href="/evaluations">View evaluations →</Link>
        </section>
        <section>
          <h2>
            <Clock3 aria-hidden="true" />
            NEWNEO Insights
          </h2>
          <Link className="overviewInsight" href="/agentops">
            <span aria-hidden="true">N</span>
            <p>
              Knowledge Assistant latency spike may be linked to Confluence
              re-indexing. Review agent health and source sync.
            </p>
          </Link>
        </section>
      </div>
      <p className="overviewDemoNote">
        Reference workspace · interactive preview
      </p>
    </div>
  );
}
