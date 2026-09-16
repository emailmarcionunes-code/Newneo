'use client';
import { useWorkspaceAgents } from '../journeys/WorkspaceAgents';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePreview, usePreviewValue } from '../journeys/PreviewState';
import {
  deploymentRecords,
  incidentRecords,
  workspaceSpend,
} from '@/lib/preview-records';
import { hybridAgents, activity } from '@/lib/hybrid-data';
import { Button } from '../UI';
import { Tabs, Panel } from '../journeys/Shared';
import EvaluationEditor from '../journeys/Evaluations';
import ReleaseEditor from '../journeys/Deployments';
import GovernanceEditor from '../journeys/Governance';
import BudgetEditor from '../journeys/Operations';
import {
  PageTitle,
  Metrics,
  Table,
  Status,
  DetailLink,
  DataNote,
  Bars,
  exportCsv,
} from './UI';
const scenarios: [string, number][] = [
  ['Task completion', 92],
  ['Answer accuracy', 89],
  ['Safety & policy', 76],
  ['Tool execution', 94],
  ['Hallucination resistance', 85],
  ['Edge case handling', 68],
  ['Latency P95', 91],
];
export function Evaluations() {
  const hybridAgents = useWorkspaceAgents();
  const { state } = usePreview();
  const query = useSearchParams();
  const [edit, setEdit] = useState(query.get('edit') === '1');
  if (edit)
    return (
      <>
        <Button variant="secondary" onClick={() => setEdit(false)}>
          ← Evaluation runs
        </Button>
        <EvaluationEditor />
      </>
    );
  return (
    <div className="surfacePage hybridPage evaluationsPage">
      <PageTitle
        title="Production Confidence"
        description="Run evaluation suites and compare readiness across agents."
      />
      <Metrics
        items={[
          ['Avg readiness score', '89%', 'across all agents'],
          ['Runs this month', '142', '16 scheduled'],
          ['Pass rate', '50%', 'of evaluation suites'],
          ['Failing scenarios', '8', 'across 3 agents'],
        ]}
      />
      <div className="hybridSplit">
        <section className="panel">
          <div className="surfaceHeading">
            <h2>Evaluation runs</h2>
            <Button onClick={() => setEdit(true)}>Run evaluation</Button>
          </div>
          <Table
            caption="Evaluation runs"
            headers={['Agent', 'Suite', 'Score', 'Passed', 'Status']}
            rows={[
              ...state.runs.map((r) => [
                <DetailLink
                  key={r.id}
                  href={`/evaluations/${r.agentId || 'customer-service'}?run=${r.id}`}
                >
                  {
                    hybridAgents.find(
                      (a) => a.id === (r.agentId || 'customer-service'),
                    )?.name
                  }{' '}
                  · {r.version}
                </DetailLink>,
                r.name,
                `${r.score}%`,
                r.passed ? '1/1' : '0/1',
                <Status key="s">{r.passed ? 'Passed' : 'Failed'}</Status>,
              ]),
              ...hybridAgents.map((a, i) => [
                <DetailLink key={a.id} href={`/evaluations/${a.id}`}>
                  {a.name}
                </DetailLink>,
                [
                  'Tier-1 Support Suite',
                  'IT Automation Suite',
                  'RAG Quality Suite',
                  'CRM Interaction Suite',
                  'Workflow Orchestration',
                  'Intelligence Synthesis',
                ][i],
                <strong
                  key="score"
                  className={
                    a.score >= 90
                      ? 'successText'
                      : a.score >= 80
                        ? 'hybridWarning'
                        : 'hybridDanger'
                  }
                >
                  {a.score}%
                </strong>,
                `${Math.round(a.score / 2)}/50`,
                <Status key="s">
                  {a.score >= 90
                    ? 'Passed'
                    : a.score >= 80
                      ? 'Warning'
                      : 'Failed'}
                </Status>,
              ]),
            ]}
          />
        </section>
        <section className="panel">
          <h2>Scenario categories</h2>
          <Bars items={scenarios} semantics="quality" />
        </section>
      </div>
      <DataNote />
    </div>
  );
}
export function Deployments() {
  const hybridAgents = useWorkspaceAgents();
  const { state } = usePreview();
  const query = useSearchParams();
  const [environment, setEnvironment] = useState('All');
  const [edit, setEdit] = useState(query.get('edit') === '1');
  if (edit)
    return (
      <>
        <Button variant="secondary" onClick={() => setEdit(false)}>
          ← Versions & Releases
        </Button>
        <ReleaseEditor />
      </>
    );
  return (
    <div className="surfacePage hybridPage deploymentsPage">
      <PageTitle
        title="Versions & Releases"
        description="Manage environments, releases, failures and rollback history."
      >
        <Button onClick={() => setEdit(true)}>Request promotion</Button>
      </PageTitle>
      <div className="environmentSummaryGrid">
        {[
          ['Production', '5 agents', '4', '1', 'v2.4', 'Updated 2 hr ago'],
          ['Staging', '2 agents', '2', '0', 'v0.9', 'Updated 1 day ago'],
          ['Development', '1 agent', '1', '0', 'v1.0', 'Updated 3 hr ago'],
        ].map(([name, count, healthy, degraded, version, when]) => (
          <article key={name}>
            <header>
              <h2>{name}</h2>
              <span>{count}</span>
            </header>
            <div className="environmentHealth">
              <div>
                <strong>{healthy}</strong>
                <small>Healthy</small>
              </div>
              {degraded !== '0' && (
                <div className="danger">
                  <strong>{degraded}</strong>
                  <small>Degraded</small>
                </div>
              )}
            </div>
            <footer>
              <span>Latest: {version}</span>
              <span>{when}</span>
            </footer>
          </article>
        ))}
      </div>
      <section className="panel">
        <div className="surfaceHeading">
          <h2>Deployment history</h2>
          <label>
            Environment
            <select
              aria-label="Environment"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
            >
              {['All', 'Production', 'Staging', 'Development'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        <Table
          caption="Deployment history"
          emptyMessage="No deployments in this environment. Request a promotion when an evaluated version is ready."
          headers={[
            'Agent',
            'Version',
            'Environment',
            'By',
            'When',
            'Duration',
            'Status',
          ]}
          rows={[
            ...state.releases.map((r) => ({
              id: r.id,
              agentId: r.agentId || 'customer-service',
              version: r.version,
              environment: r.target,
              by: 'You',
              when: 'This session',
              duration: 'Preview',
              status: r.state,
            })),
            ...deploymentRecords.map((r) => ({
              ...r,
              status: String(
                state.ui?.[`deployment:${r.id}:status`] ?? r.status,
              ),
            })),
          ]
            .filter(
              (r) => environment === 'All' || r.environment === environment,
            )
            .map((r) => [
              <DetailLink
                key={r.id}
                href={`/deployments/${r.agentId}?release=${r.id}`}
              >
                {hybridAgents.find((a) => a.id === r.agentId)?.name}
              </DetailLink>,
              r.version,
              r.environment,
              r.by,
              r.when,
              r.duration,
              <Status key="status">{r.status}</Status>,
            ])}
        />
      </section>
      <DataNote />
    </div>
  );
}
export function AgentOps() {
  const hybridAgents = useWorkspaceAgents();
  const { state } = usePreview();
  const [incidentStatus, setIncidentStatus] = useState('Open');
  const names = ['Health', 'Incidents', 'Logs'];
  const [tab, setTab] = useState('Health');
  return (
    <div className="surfacePage hybridPage agentOpsPage">
      <PageTitle
        title="Operational Health"
        description="Live view of task success, latency, incidents and execution signals."
      />
      <Metrics
        items={[
          ['Tasks today', '6,912', 'across all agents'],
          ['Success rate', '96.8%', 'last 1h average'],
          ['Avg P95 latency', '1.4s', 'vs 1.6s yesterday'],
          [
            'Active incidents',
            String(
              incidentRecords.filter(
                (r) => state.incidentStates[r.id] !== 'Resolved',
              ).length,
            ),
            'open right now',
          ],
        ]}
      />
      <Tabs names={names} current={tab} onChange={setTab} />
      <Panel names={names} current={tab}>
        {tab === 'Health' ? (
          <div className="surfaceCards">
            {hybridAgents.map((a) => (
              <Link
                className={`panel hybridHealth ${a.status === 'Degraded' ? 'degraded' : ''}`}
                key={a.id}
                href={
                  a.status === 'Degraded'
                    ? '/agentops/incidents/inc-001'
                    : `/agents/${a.id}`
                }
              >
                <div className="surfaceHeading">
                  <h2>{a.name}</h2>
                  <Status>{a.status}</Status>
                </div>
                <dl>
                  {[
                    ['Tasks', a.tasks],
                    ['Success', a.success],
                    ['Latency', a.latency],
                    [
                      'Error',
                      a.status === 'Degraded'
                        ? '18.8%'
                        : a.status === 'Staging'
                          ? '—'
                          : a.id === 'it-support'
                            ? '0.0%'
                            : a.id === 'process-automation'
                              ? '0.3%'
                              : '0.2%',
                    ],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                {a.status === 'Degraded' && (
                  <p className="hybridDanger">
                    High latency & error rate ·{' '}
                    {
                      incidentRecords.filter(
                        (r) =>
                          r.agentId === a.id &&
                          state.incidentStates[r.id] !== 'Resolved',
                      ).length
                    }{' '}
                    open incidents
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : tab === 'Incidents' ? (
          <>
            <label className="journeyField">
              Incident status
              <select
                value={incidentStatus}
                onChange={(e) => setIncidentStatus(e.target.value)}
              >
                <option>Open</option>
                <option>Resolved</option>
              </select>
            </label>
            <Table
              emptyMessage="No incidents match this status."
              caption="Incidents"
              headers={['Incident', 'Agent', 'Severity', 'Status']}
              rows={incidentRecords
                .map((r) => ({
                  ...r,
                  status: state.incidentStates[r.id] || r.status,
                }))
                .filter((r) =>
                  incidentStatus === 'Resolved'
                    ? r.status === 'Resolved'
                    : r.status !== 'Resolved',
                )
                .map((r) => [
                  <DetailLink key={r.id} href={`/agentops/incidents/${r.id}`}>
                    {r.id.toUpperCase()} · {r.title}
                  </DetailLink>,
                  hybridAgents.find((a) => a.id === r.agentId)?.name,
                  <Status key="severity">{r.severity}</Status>,
                  <Status key="status">{r.status}</Status>,
                ])}
            />
          </>
        ) : (
          <section className="panel">
            <h2>Execution log</h2>
            <ul className="hybridActivity">
              {activity.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <Link href="/audit-log">Open Audit Log →</Link>
          </section>
        )}
      </Panel>
      <DataNote />
    </div>
  );
}
export function FinOps() {
  const hybridAgents = useWorkspaceAgents();
  const { state } = usePreview();
  const [budget, setBudget] = useState(false);
  return (
    <div className="surfacePage hybridPage finOpsPage">
      <PageTitle
        title="AI Economics"
        description="Understand cost per task, budgets, model spend and optimization opportunities."
      />
      <Metrics
        items={[
          [
            'Spend this month',
            `$${workspaceSpend.toLocaleString('en-US')}`,
            `of $${state.budget.toLocaleString('en-US')} budget`,
          ],
          ['Cost per task', '$0.08', 'avg across all agents'],
          ['vs. baseline', '−34%', 'savings vs manual'],
          ['Sales Agent overage', '$48', 'above budget'],
        ]}
      />
      {workspaceSpend > state.budget && (
        <section className="panel" role="status">
          <h2>Workspace budget exceeded</h2>
          <p>
            Sample spend exceeds the budget by $
            {(workspaceSpend - state.budget).toLocaleString('en-US')}. No real
            spending limit was applied.
          </p>
          <Button variant="outline" onClick={() => setBudget(true)}>
            Review budget and recommendations
          </Button>
        </section>
      )}
      <div className="hybridSplit">
        <section className="panel">
          <div className="surfaceHeading">
            <h2>Cost by agent · September 2026</h2>
            <Button
              variant="link"
              onClick={() =>
                exportCsv('newneo-cost-preview.csv', [
                  ['Agent', 'Cost', 'Budget'],
                  ...hybridAgents.map((a) => [
                    a.name,
                    String(a.cost),
                    String(a.budget),
                  ]),
                ])
              }
            >
              Export
            </Button>
          </div>
          <Bars
            semantics="budget"
            items={[...hybridAgents]
              .sort(
                (a, b) =>
                  [
                    'customer-service',
                    'knowledge-assistant',
                    'process-automation',
                    'it-support',
                    'sales-assistant',
                    'research-assistant',
                  ].indexOf(a.id) -
                  [
                    'customer-service',
                    'knowledge-assistant',
                    'process-automation',
                    'it-support',
                    'sales-assistant',
                    'research-assistant',
                  ].indexOf(b.id),
              )
              .map((a) => [
                a.name,
                Math.min(100, (100 * a.cost) / a.budget),
                `$${a.cost} / $${a.budget}`,
              ])}
          />
          <Button variant="outline" onClick={() => setBudget(!budget)}>
            Budget planning
          </Button>
        </section>
        <aside>
          <section className="panel">
            <h2>Cost by model</h2>
            <dl className="surfaceFacts modelCostFacts">
              {[
                ['Azure GPT-4o', '$1,030'],
                ['Claude 3.5', '$541'],
                ['Managed GPT-4o', '$247'],
                ['Hybrid AI', '$389'],
                ['Private Llama 3', '$83'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <div className="intelligenceNote">
            <strong>COST RECOMMENDATIONS</strong>
            <ul className="costRecommendations">
              <li>
                <span>Switch Sales Assistant to Managed AI</span>
                <strong>$94/mo</strong>
              </li>
              <li>
                <span>Cache Knowledge Assistant responses</span>
                <strong>$68/mo</strong>
              </li>
              <li>
                <span>Right-size IT Agent to GPT-4o-mini</span>
                <strong>$42/mo</strong>
              </li>
            </ul>
            <Link href="/evaluations">
              Validate quality before changing models →
            </Link>
          </div>
        </aside>
      </div>
      {budget && <BudgetEditor finops />}
      <DataNote />
    </div>
  );
}
export function Governance() {
  const hybridAgents = useWorkspaceAgents();
  const { state } = usePreview();
  const names = ['Policies', 'Violations', 'Audit'];
  const [tab, setTab] = useState('Policies');
  const [edit, setEdit] = useState(false);
  const [enabled, setEnabled] = usePreviewValue('policies:enabled', [
    true,
    true,
    true,
    true,
    true,
    false,
  ]);
  const policies = [
    'Audit Logging',
    'PII Data Protection',
    'Role-Based Access',
    'Human-in-the-Loop',
    'Data Residency (EU)',
    'Rate Limiting',
  ];
  if (edit)
    return (
      <>
        <Button variant="secondary" onClick={() => setEdit(false)}>
          ← Policies & Controls
        </Button>
        <GovernanceEditor />
      </>
    );
  return (
    <div className="surfacePage hybridPage governancePage">
      <PageTitle
        title="Policies & Controls"
        description="Manage organization policy, violations and auditability."
      >
        <Button onClick={() => setEdit(true)}>Review approvals</Button>
      </PageTitle>
      <Metrics
        items={[
          ['Compliance score', '78%', 'SOC 2 Type II'],
          [
            'Active policies',
            String(enabled.filter(Boolean).length),
            `${enabled.filter((v) => !v).length} inactive`,
          ],
          ['Open violations', '2', 'require resolution'],
          ['Agents compliant', '5 / 6', 'Sales Assistant at risk'],
        ]}
      />
      <Tabs names={names} current={tab} onChange={setTab} />
      <Panel names={names} current={tab}>
        {tab === 'Policies' ? (
          <div className="hybridPolicyList">
            {policies.map((p, i) => (
              <div key={p}>
                <input
                  type="checkbox"
                  role="switch"
                  aria-label={p}
                  checked={enabled[i]}
                  onChange={(e) =>
                    setEnabled((v) =>
                      v.map((b, j) => (j === i ? e.target.checked : b)),
                    )
                  }
                />
                <DetailLink
                  href={`/governance/policies/${i === 1 ? 'pii' : i}`}
                >
                  {String(
                    state.ui?.[`policy:${i === 1 ? 'pii' : i}:name`] ?? p,
                  )}
                </DetailLink>
                <span>
                  {
                    [
                      'Compliance',
                      'Privacy',
                      'Access',
                      'Safety',
                      'Compliance',
                      'Operations',
                    ][i]
                  }
                </span>
                <small>
                  {String(
                    state.ui?.[`policy:${i === 1 ? 'pii' : i}:description`] ??
                      [
                        'Every agent action logged with context.',
                        'Detect, mask and handle personal data.',
                        'Restrict interaction to authorized roles.',
                        'Require approval for sensitive actions.',
                        'Processing and storage remain in EU.',
                        'Cap usage per user and department.',
                      ][i],
                  )}
                </small>
                <small className="policyAudience">
                  {i === 3
                    ? 'High-risk tools'
                    : i === 4
                      ? '2 agents'
                      : 'All agents'}
                </small>
                <Status>
                  {i < 3 ? 'Required' : i === 5 ? 'Optional' : 'Recommended'}
                </Status>
              </div>
            ))}
          </div>
        ) : tab === 'Violations' ? (
          <section className="panel">
            <h2>Open violations</h2>
            <p>Customer Service Agent — email exposed</p>
            <p>Sales Assistant — phone exposed</p>
            <Link href="/governance/policies/pii">
              Review PII Data Protection →
            </Link>
          </section>
        ) : (
          <section className="panel">
            <h2>Policy audit history</h2>
            <Link href="/audit-log">Open Audit Log →</Link>
          </section>
        )}
      </Panel>
      <DataNote />
    </div>
  );
}
