'use client';
import { workspaceSummary, percent } from '@/lib/workspace-summary';
import { Progress, IconLabel, Tag } from './UI';
import { useDemoAccess } from '../journeys/DemoExperience';
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
  const summary = workspaceSummary(hybridAgents);
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
        title="Evaluations"
        description="Production readiness assessments for all agents"
      >
        <Button onClick={() => setEdit(true)}>Run evaluation</Button>
      </PageTitle>
      <Metrics
        items={
          state.ui?.['demo:dataset'] === 'empty'
            ? [
                ['Agents', String(hybridAgents.length)],
                ['Evaluation runs', String(state.runs.length)],
                ['Releases', String(state.releases.length)],
              ]
            : [
                [
                  'Avg readiness score',
                  percent(summary.readiness),
                  'across all agents',
                ],
                [
                  'Evaluation runs',
                  String(hybridAgents.length + state.runs.length),
                  'displayed preview runs',
                ],
                [
                  'Pass rate',
                  percent(
                    ((hybridAgents.filter((a) => a.score >= 90).length +
                      state.runs.filter((r) => r.passed).length) /
                      Math.max(1, hybridAgents.length + state.runs.length)) *
                      100,
                  ),
                  'of displayed suites',
                ],
                [
                  'Failing scenarios',
                  String(
                    hybridAgents.reduce(
                      (sum, a) => sum + 50 - Math.round(a.score / 2),
                      0,
                    ) + state.runs.filter((r) => !r.passed).length,
                  ),
                  'displayed preview cases',
                ],
              ]
        }
      />
      <div className="referenceEvaluationLayout">
        <section className="panel">
          <div className="surfaceHeading">
            <h2>Evaluation runs</h2>
          </div>
          <Table
            caption="Evaluation runs"
            headers={[
              'Agent',
              'Eval Suite',
              'Date',
              'Readiness',
              'Pass',
              'Warning',
              'Fail',
              'Status',
            ]}
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
                <span key="date" className="referenceMono">
                  This session
                </span>,
                <Progress
                  key="score"
                  value={r.score}
                  label={`${r.name} readiness`}
                  tone={
                    r.score >= 90 ? 'green' : r.score >= 80 ? 'amber' : 'red'
                  }
                />,
                <span key="pass" className="successText">
                  {r.passed ? '1' : '0'}
                </span>,
                '—',
                <span key="fail" className="hybridDanger">
                  {r.passed ? '—' : '1'}
                </span>,
                <Status key="s">{r.passed ? 'Passed' : 'Failed'}</Status>,
              ]),
              ...hybridAgents.map((a, i) => [
                <DetailLink key={a.id} href={`/evaluations/${a.id}`}>
                  <IconLabel kind="evaluation">{a.name}</IconLabel>
                </DetailLink>,
                [
                  'Tier-1 Support Suite',
                  'IT Automation Suite',
                  'RAG Quality Suite',
                  'CRM Interaction Suite',
                  'Workflow Orchestration',
                  'Intelligence Synthesis',
                ][i] ?? 'Agent readiness suite',
                <span key="date" className="referenceMono">
                  Today 10:42
                </span>,
                <Progress
                  key="score"
                  value={a.score}
                  label={`${a.name} readiness`}
                  tone={
                    a.score >= 90 ? 'green' : a.score >= 80 ? 'amber' : 'red'
                  }
                />,
                <span key="pass" className="successText">
                  {Math.round(a.score / 2)}
                </span>,
                '—',
                <span key="fail" className="hybridDanger">
                  {50 - Math.round(a.score / 2)}
                </span>,
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
        <details className="panel referenceScenarioDetails">
          <summary>Scenario categories</summary>
          <Bars items={scenarios} semantics="quality" />
        </details>
      </div>
      <DataNote />
    </div>
  );
}
export function Deployments() {
  const hybridAgents = useWorkspaceAgents();
  const summary = workspaceSummary(hybridAgents);
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
        title="Deployments"
        description="Agent deployment history and environment status"
      >
        <Button onClick={() => setEdit(true)}>Request promotion</Button>
      </PageTitle>
      <div className="environmentSummaryGrid">
        {(state.ui?.['demo:dataset'] === 'empty'
          ? ['Production', 'Staging', 'Development'].map((env) => [
              env,
              `${state.releases.filter((r) => r.target === env && r.state === 'Active').length} agents`,
              String(
                state.releases.filter(
                  (r) => r.target === env && r.state === 'Active',
                ).length,
              ),
              '0',
              state.releases.find((r) => r.target === env)?.version || '—',
              'This session',
            ])
          : [
              ['Production', '5 agents', '4', '1', 'v2.4', 'Updated 2 hr ago'],
              ['Staging', '2 agents', '2', '0', 'v0.9', 'Updated 1 day ago'],
              ['Development', '1 agent', '1', '0', 'v1.0', 'Updated 3 hr ago'],
            ]
        ).map(([name, count, healthy, degraded, version, when]) => (
          <article key={name}>
            <header>
              <h2>{name}</h2>
              <span>{count}</span>
            </header>
            <p
              className={
                degraded === '0'
                  ? 'referenceEnvironmentHealthy'
                  : 'referenceEnvironmentWarning'
              }
            >
              {degraded === '0'
                ? '● All systems operational'
                : `● ${degraded} agent needs attention`}
            </p>
          </article>
        ))}
      </div>
      <section className="panel">
        <div className="surfaceHeading">
          <h2>Deployment history</h2>
          <div className="referenceSegments" aria-label="Environment">
            {['All', 'Production', 'Staging', 'Development'].map((env) => (
              <button
                key={env}
                aria-pressed={environment === env}
                onClick={() => setEnvironment(env)}
              >
                {env === 'Staging' ? 'Staging / Test' : env}
              </button>
            ))}
          </div>
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
            ...(state.ui?.['demo:dataset'] === 'empty'
              ? []
              : deploymentRecords
            ).map((r) => ({
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
                <IconLabel kind="deployment">
                  {hybridAgents.find((a) => a.id === r.agentId)?.name}
                </IconLabel>
              </DetailLink>,
              <span className="referenceMono" key="version">
                {r.version}
              </span>,
              <Tag key="environment">{r.environment}</Tag>,
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
  const summary = workspaceSummary(hybridAgents);
  const { state } = usePreview();
  const [incidentStatus, setIncidentStatus] = useState('All');
  const names = ['Incidents', 'Logs', 'Health'];
  const [tab, setTab] = useState('Incidents');
  return (
    <div className="surfacePage hybridPage agentOpsPage">
      <PageTitle
        title="AgentOps"
        description="Real-time operational health across all agents"
      />
      <Metrics
        items={
          state.ui?.['demo:dataset'] === 'empty'
            ? [
                ['Agents', String(hybridAgents.length)],
                ['Evaluation runs', String(state.runs.length)],
                ['Releases', String(state.releases.length)],
              ]
            : [
                [
                  'Tasks today',
                  summary.tasks.toLocaleString('en-US'),
                  'current preview snapshot',
                ],
                [
                  'Success rate',
                  percent(summary.successRate),
                  'task-weighted preview snapshot',
                ],
                ['Avg P95 latency', '1.4s', 'vs 1.6s yesterday'],
                [
                  'Error rate',
                  percent(
                    summary.successRate === null
                      ? null
                      : 100 - summary.successRate,
                  ),
                  'of measured sample tasks',
                ],
                [
                  'Degraded agents',
                  String(
                    hybridAgents.filter((a) => a.status === 'Degraded').length,
                  ),
                ],
                [
                  'Active incidents',
                  String(
                    (state.ui?.['demo:dataset'] === 'empty'
                      ? []
                      : incidentRecords
                    ).filter(
                      (r) =>
                        (state.incidentStates[r.id] ?? r.status) !== 'Resolved',
                    ).length,
                  ),
                  'open right now',
                ],
              ]
        }
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
                      (state.ui?.['demo:dataset'] === 'empty'
                        ? []
                        : incidentRecords
                      ).filter(
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
            <div className="intelligenceNote">
              <strong>NEWNEO</strong>
              {
                incidentRecords.filter(
                  (r) =>
                    (state.incidentStates[r.id] ?? r.status) !== 'Resolved',
                ).length
              }{' '}
              active incidents. Review degraded agents and affected tool
              executions before retrying.
            </div>
            <label className="journeyField referenceIncidentFilter">
              Incident status
              <select
                value={incidentStatus}
                onChange={(e) => setIncidentStatus(e.target.value)}
              >
                <option>All</option>
                <option>Open</option>
                <option>Resolved</option>
              </select>
            </label>
            <Table
              emptyMessage="No incidents match this status."
              caption="Incidents"
              headers={[
                'Incident',
                'Agent',
                'Severity',
                'Users affected',
                'Tasks affected',
                'Started',
                'SLA',
                'Status',
              ]}
              rows={(state.ui?.['demo:dataset'] === 'empty'
                ? []
                : incidentRecords
              )
                .map((r) => ({
                  ...r,
                  status: state.incidentStates[r.id] || r.status,
                }))
                .filter((r) =>
                  incidentStatus === 'All'
                    ? true
                    : incidentStatus === 'Resolved'
                      ? r.status === 'Resolved'
                      : r.status !== 'Resolved',
                )
                .map((r) => [
                  <DetailLink key={r.id} href={`/agentops/incidents/${r.id}`}>
                    {r.id.toUpperCase()} · {r.title}
                  </DetailLink>,
                  hybridAgents.find((a) => a.id === r.agentId)?.name,
                  <Status key="severity">{r.severity}</Status>,
                  '~40',
                  '54',
                  <span key="started" className="referenceMono">
                    14:30 today
                  </span>,
                  <span
                    key="sla"
                    className={
                      r.status === 'Resolved' ? 'successText' : 'hybridDanger'
                    }
                  >
                    {r.status === 'Resolved' ? 'Resolved' : 'At risk'}
                  </span>,
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
  const summary = workspaceSummary(hybridAgents);
  const { state } = usePreview();
  const workspaceSpend = summary.spend;
  const [budget, setBudget] = useState(false);
  return (
    <div className="surfacePage hybridPage finOpsPage">
      <PageTitle
        title="FinOps"
        description="Understand cost per task, budgets, model spend and optimization opportunities."
      />
      <Metrics
        items={
          state.ui?.['demo:dataset'] === 'empty'
            ? [
                ['Agents', String(hybridAgents.length)],
                ['Evaluation runs', String(state.runs.length)],
                ['Releases', String(state.releases.length)],
              ]
            : [
                [
                  'Spend this month',
                  `$${workspaceSpend.toLocaleString('en-US')}`,
                  `of $${state.budget.toLocaleString('en-US')} budget`,
                ],
                [
                  'Budget used',
                  `${Math.round((workspaceSpend / state.budget) * 100)}%`,
                ],
                [
                  'Cost per task',
                  `$${(
                    workspaceSpend /
                    Math.max(
                      1,
                      hybridAgents.reduce(
                        (sum, a) =>
                          sum + (Number(a.tasks.replaceAll(',', '')) || 0),
                        0,
                      ),
                    )
                  ).toFixed(3)}`,
                  'sample workspace',
                ],
                [
                  'Cost per success',
                  `$${(
                    workspaceSpend /
                    Math.max(
                      1,
                      hybridAgents.reduce(
                        (sum, a) =>
                          sum +
                          ((Number(a.tasks.replaceAll(',', '')) || 0) *
                            (parseFloat(a.success) || 0)) /
                            100,
                        0,
                      ),
                    )
                  ).toFixed(3)}`,
                ],
                ['vs. baseline', '−34%', 'savings vs manual'],
                ['Sales Agent overage', '$48', 'above budget'],
              ]
        }
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
                a.budget > 0 ? (100 * a.cost) / a.budget : 0,
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
            <Bars
              items={Object.entries(
                hybridAgents.reduce<Record<string, number>>((totals, a) => {
                  totals[a.model] = (totals[a.model] ?? 0) + a.cost;
                  return totals;
                }, {}),
              ).map(([name, cost]) => [
                name,
                (100 * cost) /
                  Math.max(
                    1,
                    hybridAgents.reduce((sum, a) => sum + a.cost, 0),
                  ),
                `$${cost}`,
              ])}
            />
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
  const { can } = useDemoAccess();
  const hybridAgents = useWorkspaceAgents();
  const summary = workspaceSummary(hybridAgents);
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
        title="Governance"
        description="Active policies protecting your enterprise AI agents"
      >
        <Button onClick={() => setEdit(true)}>Review approvals</Button>
      </PageTitle>
      <Metrics
        items={
          state.ui?.['demo:dataset'] === 'empty'
            ? [
                ['Agents', String(hybridAgents.length)],
                ['Evaluation runs', String(state.runs.length)],
                ['Releases', String(state.releases.length)],
              ]
            : [
                ['Compliance score', '78%', 'SOC 2 Type II'],
                [
                  'Active policies',
                  String(enabled.filter(Boolean).length),
                  `${enabled.filter((v) => !v).length} inactive`,
                ],
                ['Open violations', '2', 'require resolution'],
                ['Agents compliant', '5 / 6', 'Sales Assistant at risk'],
              ]
        }
      />
      <Tabs names={names} current={tab} onChange={setTab} />
      <Panel names={names} current={tab}>
        {tab === 'Policies' ? (
          <Table
            caption="Policies"
            headers={[
              'Policy',
              'Scope',
              'Severity',
              'Enforcement',
              'Violations',
              'Status',
              'Enabled',
              'Action',
            ]}
            rows={policies.map((p, i) => [
              <DetailLink
                key="name"
                href={`/governance/policies/${i === 1 ? 'pii' : i}`}
              >
                {String(state.ui?.[`policy:${i === 1 ? 'pii' : i}:name`] ?? p)}
              </DetailLink>,
              i === 3 ? 'High-risk tools' : i === 4 ? '2 agents' : 'All Agents',
              <Status key="severity">
                {i === 4 ? 'Medium' : i === 5 ? 'Low' : 'High'}
              </Status>,
              [
                'Log',
                'Block',
                'Enforce',
                'Require Approval',
                'Block',
                'Enforce',
              ][i],
              <span key="violations" className={i === 1 ? 'hybridWarning' : ''}>
                {i === 1 ? 2 : 0}
              </span>,
              <Status key="status">
                {enabled[i] ? 'Active' : 'Inactive'}
              </Status>,
              <input
                key="switch"
                type="checkbox"
                role="switch"
                aria-label={p}
                checked={enabled[i]}
                disabled={!can('admin')}
                onChange={(e) =>
                  setEnabled((v) =>
                    v.map((b, j) => (j === i ? e.target.checked : b)),
                  )
                }
              />,
              <DetailLink
                key="edit"
                href={`/governance/policies/${i === 1 ? 'pii' : i}`}
              >
                Edit
              </DetailLink>,
            ])}
          />
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
