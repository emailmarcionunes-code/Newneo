'use client';
import { workspaceSummary, percent } from '@/lib/workspace-summary';
import { useWorkspaceAgents } from '../journeys/WorkspaceAgents';
import Link from 'next/link';
import { hybridAgents } from '@/lib/hybrid-data';
import {
  incidentRecords,
  workspaceSpend,
  workspaceTasks,
  workspaceReadiness,
} from '@/lib/preview-records';
import { usePreview, usePreviewValue } from '../journeys/PreviewState';
import { useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  Clock3,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

const events = [
  ['Sales Assistant degraded — latency spike', '09:42', 'danger', '/agentops'],
  [
    'IT Support Agent v1.8 deployed to production',
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
    'Confluence sync completed — 8,247 docs indexed',
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
  const hybridAgents = useWorkspaceAgents();
  const summary = workspaceSummary(hybridAgents);
  const workspaceTasks = summary.tasks;
  const workspaceSpend = summary.spend;
  const workspaceReadiness = Math.round(summary.readiness ?? 0);
  // Overview snapshot supplied by the user on 2026-09-16 supersedes frame 2:2.
  const agents = hybridAgents
    .filter((a) => a.status !== 'Staging' || a.id.startsWith('preview-'))
    .map((a) => [
      a.id,
      a.name,
      a.model,
      a.tasks,
      a.success,
      a.latency,
      a.status === 'Degraded' ? 'warning' : 'healthy',
    ]);
  const { state } = usePreview();
  const [enabled] = usePreviewValue('policies:enabled', [
    true,
    true,
    true,
    true,
    true,
    false,
  ]);
  const [org] = usePreviewValue('settings:org', 'Acme Corp');
  const incidents = incidentRecords.filter(
    (r) => (state.incidentStates[r.id] || r.status) !== 'Resolved',
  ).length;
  const [refreshed, setRefreshed] = useState(0);
  return (
    <div
      className="overviewFidelity"
      data-reference="user-command-center-2026-09-16"
    >
      <header className="overviewTitle">
        <div>
          <h1>Command Center</h1>
          <p>Platform health · {org} · Preview workspace</p>
        </div>
        <button
          className="overviewRefresh"
          onClick={() => setRefreshed((v) => v + 1)}
        >
          <RefreshCw size={15} aria-hidden="true" />
          Refresh
        </button>
      </header>
      <span className={refreshed ? 'refreshFeedback' : 'srOnly'} role="status">
        {refreshed
          ? `Preview refreshed (${refreshed}). Demo data is up to date.`
          : ''}
      </span>
      <section className="overviewReferenceMetrics" aria-label="Key metrics">
        {[
          [
            'Agents live',
            String(hybridAgents.filter((a) => a.status === 'Live').length),
            `of ${hybridAgents.length} total`,
            'blue',
          ],
          [
            'Tasks today',
            workspaceTasks.toLocaleString('en-US'),
            'Workspace sample',
            'neutral',
          ],
          [
            'Success rate',
            percent(summary.successRate),
            'Task-weighted sample',
            'healthy',
          ],
          ['Avg latency', '1.4s', 'P95: 3.2s', 'neutral'],
          [
            'AI spend',
            `$${workspaceSpend.toLocaleString('en-US')}`,
            `${(state.budget / 1000).toFixed(1)}k budget · ${Math.round((workspaceSpend / state.budget) * 100)}% used`,
            'neutral',
          ],
          [
            'Incidents',
            String(incidents),
            `${incidents} active, 0 critical`,
            incidents ? 'danger' : 'healthy',
          ],
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
                  className={`overviewHealthDot ${id === 'sales-assistant' ? 'warning' : 'healthy'}`}
                  aria-label={id === 'sales-assistant' ? 'Degraded' : 'Healthy'}
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
            <strong className="healthy">78%</strong>
          </div>
          <progress
            aria-label="Compliance score"
            value={78}
            max={100}
            className="healthy"
          />
          <div className="overviewProgressFoot">
            <span>{enabled.filter(Boolean).length} active policies</span>
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
            <strong className="blue">{workspaceReadiness}%</strong>
          </div>
          <progress
            aria-label="Average readiness"
            value={workspaceReadiness}
            max={100}
            className="blue"
          />
          <div className="overviewProgressFoot">
            <span>{hybridAgents.length + state.runs.length} preview runs</span>
            <span>
              {hybridAgents.reduce(
                (sum, a) => sum + 50 - Math.round(a.score / 2),
                0,
              ) + state.runs.filter((r) => !r.passed).length}{' '}
              failing cases
            </span>
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
              Sales Assistant latency spike may be linked to Confluence
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
