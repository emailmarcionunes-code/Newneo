'use client';
import { useState } from 'react';
import Link from 'next/link';
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
  const [edit, setEdit] = useState(false);
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
    <div className="surfacePage hybridPage">
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
            rows={hybridAgents.map((a, i) => [
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
              `${a.score}%`,
              `${Math.round(a.score / 2)}/50`,
              <Status key="s">
                {a.score >= 90
                  ? 'Passed'
                  : a.score >= 80
                    ? 'Warning'
                    : 'Failed'}
              </Status>,
            ])}
          />
        </section>
        <section className="panel">
          <h2>Scenario categories</h2>
          <Bars items={scenarios} />
        </section>
      </div>
      <DataNote />
    </div>
  );
}
export function Deployments() {
  const [environment, setEnvironment] = useState('All');
  const [edit, setEdit] = useState(false);
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
    <div className="surfacePage hybridPage">
      <PageTitle
        title="Versions & Releases"
        description="Manage environments, releases, failures and rollback history."
      >
        <Button onClick={() => setEdit(true)}>Request promotion</Button>
      </PageTitle>
      <Metrics
        items={[
          ['Production', '4 healthy · 1 degraded', '5 agents · Latest v2.4'],
          ['Staging', '2 healthy', '2 agents · Latest v0.9'],
          ['Development', '1 healthy', '1 agent · Latest v1.0'],
        ]}
      />
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
            'customer-service',
            'it-support',
            'sales-assistant',
            'sales-assistant',
            'knowledge-assistant',
            'customer-service',
          ]
            .map((id, i) => [
              <DetailLink key={i} href={`/deployments/${id}`}>
                {hybridAgents.find((a) => a.id === id)?.name}
              </DetailLink>,
              ['v2.4', 'v1.8', 'v1.3', 'v1.2', 'v3.1', 'v2.3'][i],
              i === 2 ? 'Staging' : 'Production',
              ['j.silva', 't.ferreira', 'a.costa', 'a.costa', 'r.lima', 'auto'][
                i
              ],
              ['Today 12:04', 'Aug 28', 'Sep 14', 'Sep 5', 'Jul 15', 'Aug 20'][
                i
              ],
              ['1m12s', '0m58s', '2m04s', '1m08s', '0m45s', '0m40s'][i],
              <Status key="s">
                {i === 2 ? 'Failed' : i === 5 ? 'Rolled back' : 'Success'}
              </Status>,
            ])
            .filter((row) => environment === 'All' || row[2] === environment)}
        />
      </section>
      <DataNote />
    </div>
  );
}
export function AgentOps() {
  const [incidentStatus, setIncidentStatus] = useState('Open');
  const names = ['Health', 'Incidents', 'Logs'];
  const [tab, setTab] = useState('Health');
  return (
    <div className="surfacePage hybridPage">
      <PageTitle
        title="Operational Health"
        description="Live view of task success, latency, incidents and execution signals."
      />
      <Metrics
        items={[
          ['Tasks today', '6,912', 'across all agents'],
          ['Success rate', '96.8%', 'last 1h average'],
          ['Avg P95 latency', '1.4s', 'vs 1.6s yesterday'],
          ['Active incidents', '2', 'open right now'],
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
                    ['Error', a.status === 'Degraded' ? '18.8%' : '0.2%'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                {a.status === 'Degraded' && (
                  <p className="hybridDanger">
                    High latency & error rate · 2 open incidents
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
              emptyMessage="No incidents match this status. There are no resolved incidents in the reference window."
              caption="Incidents"
              headers={['Incident', 'Agent', 'Severity', 'Status']}
              rows={
                incidentStatus === 'Resolved'
                  ? []
                  : [
                      [
                        <DetailLink
                          key="incident"
                          href="/agentops/incidents/inc-001"
                        >
                          INC-001 · High latency detected
                        </DetailLink>,
                        'Sales Assistant',
                        <Status key="s">High</Status>,
                        'Open',
                      ],
                      [
                        <DetailLink
                          key="incident"
                          href="/agentops/incidents/inc-002"
                        >
                          INC-002 · Tool execution failed
                        </DetailLink>,
                        'Sales Assistant',
                        'Medium',
                        'Investigating',
                      ],
                    ]
              }
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
  const [budget, setBudget] = useState(false);
  return (
    <div className="surfacePage hybridPage">
      <PageTitle
        title="AI Economics"
        description="Understand cost per task, budgets, model spend and optimization opportunities."
      />
      <Metrics
        items={[
          ['Spend this month', '$2,140', 'of $2,800 budget'],
          ['Cost per task', '$0.08', 'avg across all agents'],
          ['vs. baseline', '−34%', 'savings vs manual'],
          ['Sales Agent overage', '$48', 'above budget'],
        ]}
      />
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
            items={[...hybridAgents]
              .sort((a, b) => b.cost - a.cost)
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
            <dl className="surfaceFacts">
              {[
                ['Azure GPT-4o', '$841'],
                ['Claude 3.5', '$541'],
                ['Managed GPT-4o', '$389'],
                ['Hybrid AI', '$247'],
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
            <ul>
              <li>Switch Sales Assistant to Managed AI · $94/mo</li>
              <li>Cache Knowledge Assistant responses · $68/mo</li>
              <li>Right-size IT Agent to GPT-4o-mini · $42/mo</li>
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
  const names = ['Policies', 'Violations', 'Audit'];
  const [tab, setTab] = useState('Policies');
  const [edit, setEdit] = useState(false);
  const [enabled, setEnabled] = useState([true, true, true, true, true, false]);
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
    <div className="surfacePage hybridPage">
      <PageTitle
        title="Policies & Controls"
        description="Manage organization policy, violations and auditability."
      >
        <Button onClick={() => setEdit(true)}>Review approvals</Button>
      </PageTitle>
      <Metrics
        items={[
          ['Compliance score', '78%', 'SOC 2 Type II'],
          ['Active policies', '7', '2 inactive'],
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
                  {p}
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
                  {
                    [
                      'Every agent action logged with context.',
                      'Detect, mask and handle personal data.',
                      'Restrict interaction to authorized roles.',
                      'Require approval for sensitive actions.',
                      'Processing and storage remain in EU.',
                      'Cap usage per user and department.',
                    ][i]
                  }
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
