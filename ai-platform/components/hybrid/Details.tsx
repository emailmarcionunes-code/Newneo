'use client';
import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { hybridAgents, sourceRows, actionRows } from '@/lib/hybrid-data';
import { Button, FormField } from '../UI';
import { Tabs, Panel, Feedback } from '../journeys/Shared';
import { usePreview } from '../journeys/PreviewState';
import { PageTitle, Metrics, Table, Status, DataNote, Bars } from './UI';
export default function HybridDetail({
  kind,
  id,
}: {
  kind: string;
  id: string;
}) {
  const { update } = usePreview();
  const [tab, setTab] = useState('Overview');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('Success');
  const policyNames: Record<string, string> = {
    '0': 'Audit Logging',
    pii: 'PII Data Protection',
    '2': 'Role-Based Access',
    '3': 'Human-in-the-Loop',
    '4': 'Data Residency (EU)',
    '5': 'Rate Limiting',
  };
  const [policy, setPolicy] = useState(policyNames[id] ?? '');
  const [description, setDescription] = useState(
    'Detect, mask and handle personal data according to GDPR / LGPD policy.',
  );
  const [mode, setMode] = useState('Enforce');
  if (
    (['agents', 'evaluations', 'deployments'].includes(kind) &&
      !hybridAgents.some((a) => a.id === id)) ||
    (kind === 'knowledge' && !sourceRows.some((r) => r[0] === id)) ||
    (kind === 'tools' && !actionRows.some((r) => r[0] === id)) ||
    (kind === 'policies' && !policyNames[id]) ||
    (kind === 'incidents' && !['inc-001', 'inc-002'].includes(id))
  )
    notFound();
  const agent = hybridAgents.find((a) => a.id === id) ?? hybridAgents[0];
  function act(text: string) {
    setMessage(`${text} · preview only.`);
    update((s) => ({ ...s, audit: [`${text} · preview`, ...s.audit] }));
  }
  if (kind === 'agents') {
    const names = [
      'Overview',
      'Knowledge',
      'Tools',
      'Governance',
      'Evaluations',
      'Deployments',
      'Logs',
    ];
    return (
      <div className="surfacePage hybridPage">
        <PageTitle
          title={agent.name}
          description={`${agent.model} · CX Operations · Deployed Sep 14, 2026`}
        />
        <Tabs names={names} current={tab} onChange={setTab} />
        <Panel names={names} current={tab}>
          {tab === 'Overview' ? (
            <>
              <Metrics
                items={[
                  ['Tasks today', agent.tasks],
                  ['Success rate', agent.success],
                  ['Latency P95', agent.latency],
                  ['Cost today', '$22.4'],
                ]}
              />
              <div className="hybridSplit">
                <section className="panel">
                  <h2>Task volume — last 7 days</h2>
                  <div className="hybridChart">
                    {[60, 72, 68, 84, 76, 88, 88].map((n, i) => (
                      <div key={i}>
                        <span style={{ height: n }} />
                        <small>
                          {
                            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'][
                              i
                            ]
                          }
                        </small>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="panel">
                  <h2>Configuration</h2>
                  <dl className="surfaceFacts">
                    {[
                      ['Model', agent.model],
                      ['Owner', 'CX Operations'],
                      ['Knowledge', '2 sources'],
                      ['Tools', '3 actions'],
                      ['Policies', '4 active'],
                      ['Eval score', `${agent.score}%`],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </div>
              <section className="panel">
                <h2>Recent tasks</h2>
                <Table
                  caption="Recent tasks"
                  headers={['Task', 'When', 'Result']}
                  rows={[
                    'Resolved refund question',
                    'Created ServiceNow ticket #4832',
                    'Escalated billing dispute',
                    'Answered order-status request',
                  ].map((v, i) => [
                    v,
                    `${2 + i * 6} min ago`,
                    <Status key="s">
                      {i === 2 ? 'Escalated' : 'Success'}
                    </Status>,
                  ])}
                />
              </section>
            </>
          ) : (
            <section className="panel">
              <h2>{tab}</h2>
              {tab === 'Knowledge' ? (
                <>
                  <p>Confluence · SharePoint</p>
                  <Link href="/knowledge/confluence">
                    Open connected source →
                  </Link>
                </>
              ) : tab === 'Tools' ? (
                <>
                  <p>Create ServiceNow Ticket · Search Knowledge Base</p>
                  <Link href="/tools/servicenow">
                    Inspect tool permissions →
                  </Link>
                </>
              ) : tab === 'Governance' ? (
                <Link href="/governance/policies/pii">
                  Review PII Data Protection →
                </Link>
              ) : tab === 'Evaluations' ? (
                <Link href={`/evaluations/${agent.id}`}>
                  Open evaluation run →
                </Link>
              ) : tab === 'Deployments' ? (
                <Link href={`/deployments/${agent.id}`}>
                  Open deployment detail →
                </Link>
              ) : (
                <Link href="/audit-log">Open Audit Log →</Link>
              )}
            </section>
          )}
        </Panel>
        <DataNote />
      </div>
    );
  }
  if (kind === 'knowledge') {
    const r = sourceRows.find((r) => r[0] === id) ?? sourceRows[0];
    const names = ['Overview', 'Documents', 'Sync'];
    return (
      <div className="surfacePage hybridPage">
        <PageTitle
          title={r[1]}
          description={`Last synced ${r[4]} · ${r[3]} documents · 2 agents`}
        >
          <Status>{r[5]}</Status>
        </PageTitle>
        <Tabs names={names} current={tab} onChange={setTab} />
        <Feedback message={message} />
        <Panel names={names} current={tab}>
          {tab === 'Overview' ? (
            <>
              <Metrics
                items={[
                  ['Documents indexed', r[3]],
                  ['Knowledge coverage', r[7]],
                  ['Agents using', '2'],
                  ['Sync frequency', '15 min'],
                ]}
              />
              <div className="hybridSplit equal">
                <section className="panel">
                  <h2>Source details</h2>
                  <dl className="surfaceFacts">
                    {[
                      [
                        'Description',
                        'Enterprise wiki with product docs and SOPs',
                      ],
                      ['Auth type', 'OAuth 2.0'],
                      ['Region', 'EU (Frankfurt)'],
                      ['Sync freq.', 'Every 15 min'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <section className="panel">
                  <h2>Agents using this source</h2>
                  <p>
                    <Link href="/agents/customer-service">
                      Customer Service Agent →
                    </Link>
                  </p>
                  <p>
                    <Link href="/agents/knowledge-assistant">
                      Knowledge Assistant →
                    </Link>
                  </p>
                </section>
              </div>
              <section className="panel">
                <Bars
                  items={[
                    ['Index coverage for connected agents', parseInt(r[7])],
                  ]}
                />
                <p>
                  Healthy coverage. Review freshness and source permissions.
                </p>
              </section>
            </>
          ) : tab === 'Documents' ? (
            <Table
              caption="Indexed documents"
              headers={['Document', 'Status', 'Updated']}
              rows={[
                'Support policy',
                'Product handbook',
                'Escalation procedure',
              ].map((d) => [d, 'Indexed', 'Today'])}
            />
          ) : (
            <section className="panel">
              <h2>Sync history</h2>
              <p>
                Last sync: {r[4]} · {r[5]}
              </p>
              <Button onClick={() => act(`${r[1]} synchronization completed`)}>
                Run sync preview
              </Button>
            </section>
          )}
        </Panel>
        <DataNote />
      </div>
    );
  }
  if (kind === 'tools') {
    const r = actionRows.find((r) => r[0] === id) ?? actionRows[0];
    return (
      <div className="surfacePage hybridPage">
        <PageTitle
          title={r[1]}
          description={`${r[3]} · ${r[4]} risk · ITSM · acme.service-now.com/api/incident`}
        >
          <Button
            onClick={() =>
              act('Tool test succeeded; no external action executed')
            }
          >
            Test tool
          </Button>
        </PageTitle>
        <Feedback message={message} />
        <Metrics
          items={[
            ['Calls today', '287'],
            ['Success rate', '99%'],
            ['Avg latency', '0.8s'],
            ['Agents using', r[5]],
          ]}
        />
        <div className="hybridSplit">
          <section className="panel">
            <h2>Description</h2>
            <p>
              Creates incident or request tickets with field mapping for
              priority, category and assignment group.
            </p>
            <dl className="surfaceFacts">
              <div>
                <dt>Permission</dt>
                <dd>{r[3]}</dd>
              </div>
              <div>
                <dt>Risk</dt>
                <dd>{r[4]}</dd>
              </div>
            </dl>
          </section>
          <section className="panel">
            <h2>Agents using this action</h2>
            {hybridAgents.slice(0, 3).map((a) => (
              <p key={a.id}>
                <Link href={`/agents/${a.id}`}>{a.name}</Link>
              </p>
            ))}
          </section>
        </div>
        <section className="panel">
          <h2>Recent calls</h2>
          <Table
            caption="Recent tool calls"
            headers={['Time', 'Agent', 'Parameters', 'Result', 'Latency']}
            rows={[
              [
                '14:35:02',
                'Customer Service Agent',
                'priority=P3 · billing',
                'Success',
                '0.8s',
              ],
              [
                '14:34:50',
                'IT Support Agent',
                'priority=P2 · access',
                'Success',
                '0.7s',
              ],
              [
                '14:12:10',
                'Customer Service Agent',
                'priority=P3 · shipping',
                'Failed',
                '30.0s',
              ],
            ]}
          />
        </section>
        <DataNote />
      </div>
    );
  }
  if (kind === 'evaluations')
    return (
      <div className="surfacePage hybridPage">
        <PageTitle
          title={
            id === 'customer-service'
              ? 'Tier-1 Support Suite'
              : `${agent.name} evaluation`
          }
          description={`${agent.name} · Today 14:00 · 4m 12s · GPT-4o`}
        >
          <Status>{agent.score >= 90 ? 'Passed' : 'Warning'}</Status>
        </PageTitle>
        <Metrics
          items={[
            ['Readiness score', `${agent.score}%`],
            ['Scenarios passed', `${Math.round(agent.score / 2)}/50`],
            ['Failed scenarios', agent.score >= 90 ? '0' : '3'],
            ['Duration', '4m 12s'],
          ]}
        />
        <section className="panel">
          <h2>Scenario results</h2>
          <Bars
            items={[
              ['Task completion', 96],
              ['Answer accuracy', 91],
              ['Hallucination resistance', 94],
              ['Safety & policy', 78],
              ['Tool execution', 97],
              ['Latency P95', 91],
              ['Edge cases', 72],
            ]}
          />
        </section>
        <Link className="button outline" href="/evaluations">
          Compare evaluation runs →
        </Link>
        <DataNote />
      </div>
    );
  if (kind === 'deployments')
    return (
      <div className="surfacePage hybridPage">
        <PageTitle
          title={`${agent.name} — v2.4`}
          description="Production · Today 12:04 · 2m 14s · Deployed by j.silva"
        >
          <Button
            variant="outline"
            disabled={status === 'Rolled back'}
            onClick={() => {
              setStatus('Rolled back');
              act('Deployment rolled back to baseline');
            }}
          >
            Rollback
          </Button>
        </PageTitle>
        <Feedback message={message} />
        <Metrics
          items={[
            ['Environment', 'Production'],
            ['Duration', '2m 14s'],
            ['Deployed by', 'j.silva'],
            ['Status', status],
          ]}
        />
        <div className="hybridSplit">
          <section className="panel">
            <h2>Deploy timeline</h2>
            <ol className="hybridTimeline">
              {[
                'Deploy triggered',
                'Pre-flight checks',
                'Container build',
                'Health check',
                'Traffic cutover',
                'Deploy complete',
              ].map((v, i) => (
                <li key={v}>
                  <strong>{v}</strong>
                  <small>
                    {
                      [
                        'By j.silva',
                        'Config validation passed',
                        'Image built and pushed',
                        'All endpoints healthy',
                        '100% traffic on new version',
                        'Monitoring active',
                      ][i]
                    }
                  </small>
                </li>
              ))}
            </ol>
          </section>
          <section className="panel">
            <h2>Config changes</h2>
            <dl className="surfaceFacts">
              {[
                ['max_tokens', '2048 → 4096'],
                ['temperature', '0.7 → 0.4'],
                ['pii_filter', 'added: enabled'],
                ['knowledge_sources', 'confluence → + zendesk'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
        <DataNote />
      </div>
    );
  if (kind === 'incidents')
    return (
      <div className="surfacePage hybridPage">
        <PageTitle
          title={`${id.toUpperCase()} · ${id === 'inc-002' ? 'Tool execution failed' : 'High latency detected'}`}
          description="Sales Assistant · Started 14:30 · 45 min ongoing"
        >
          <div className="resourceFooter">
            <Button variant="outline" onClick={() => act('Incident escalated')}>
              Escalate
            </Button>
            <Button
              onClick={() => {
                setStatus('Resolved');
                act('Incident resolved');
              }}
              disabled={status === 'Resolved'}
            >
              {status === 'Resolved' ? 'Resolved' : 'Resolve'}
            </Button>
          </div>
        </PageTitle>
        <Feedback message={message} />
        <Metrics
          items={[
            ['Tasks affected', '54'],
            ['Users impacted', '~40'],
            ['SLA breach risk', 'Yes'],
            ['Duration', '45 min'],
          ]}
        />
        <div className="hybridSplit">
          <section className="panel">
            <h2>Incident timeline</h2>
            <ol className="hybridTimeline">
              {[
                'Latency threshold exceeded — P95 crossed 3s limit',
                'Incident auto-created by monitoring',
                'Alert sent to #ops-alerts Slack channel',
                'On-call engineer acknowledged incident',
                'Root cause identified: Salesforce CRM API degraded',
                'Circuit breaker enabled on CRM',
                'P95 improving — 5.1s → 3.8s',
              ].map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ol>
          </section>
          <section className="panel">
            <h2>Incident context</h2>
            <p>Agent: Sales Assistant</p>
            <p>Severity: High</p>
            <h3>Root cause</h3>
            <p>Salesforce CRM API degraded</p>
            <h3>Recommended action</h3>
            <p>
              Keep circuit breaker enabled and fail over reads to cached CRM
              snapshot until provider recovers.
            </p>
          </section>
        </div>
        <DataNote />
      </div>
    );
  return (
    <div className="surfacePage hybridPage">
      <PageTitle
        title={`Edit: ${policy}`}
        description="Last modified Sep 12, 2026 · Actively enforced"
      />
      <Feedback message={message} />
      <div className="hybridSplit">
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            act(`Policy saved: ${policy}`);
          }}
        >
          <h2>Basic information</h2>
          <FormField
            id="policy-name"
            label="Policy name"
            value={policy}
            required
            onChange={(e) => setPolicy(e.target.value)}
          />
          <label className="journeyField">
            Description
            <textarea
              value={description}
              required
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="tags">
            <span className="tag">Privacy</span>
            <span className="tag">Required</span>
            <span className="tag">All agents</span>
          </div>
          <fieldset className="policyModes">
            <legend>Enforcement mode</legend>
            {['Enforce', 'Warn', 'Audit only'].map((m) => (
              <label key={m}>
                <input
                  type="radio"
                  name="mode"
                  value={m}
                  checked={mode === m}
                  onChange={() => setMode(m)}
                />
                <strong>{m}</strong>
                <small>
                  {m === 'Enforce'
                    ? 'Block + alert'
                    : m === 'Warn'
                      ? 'Log + allow'
                      : 'Log silently'}
                </small>
              </label>
            ))}
          </fieldset>
          <Button type="submit">Save changes</Button>
        </form>
        <section className="panel">
          <h2>Policy status</h2>
          <Status>Enforced</Status>
          <p className="hybridDanger">3 active violations</p>
          <ul className="hybridActivity">
            {[
              'Customer Service Agent — email exposed',
              'Sales Assistant — phone exposed',
              'Customer Service Agent — CPF detected',
            ].map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </section>
      </div>
      <DataNote />
    </div>
  );
}
