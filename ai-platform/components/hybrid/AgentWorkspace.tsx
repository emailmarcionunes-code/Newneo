'use client';
import { useState } from 'react';
import Link from 'next/link';
import { hybridAgents, sourceRows, actionRows } from '@/lib/hybrid-data';
import { Button, FormField } from '../UI';
import { Tabs, Panel, Feedback } from '../journeys/Shared';
import { PageTitle, Metrics, Table, Status, DataNote, Bars } from './UI';
export default function AgentWorkspace({
  agent,
}: {
  agent: (typeof hybridAgents)[number];
}) {
  const names = [
    'Overview',
    'Configuration',
    'Knowledge',
    'Tools',
    'Evaluations',
    'Versions',
    'Activity',
    'AgentOps',
  ];
  const [tab, setTab] = useState('Overview');
  const [draft, setDraft] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mission, setMission] = useState(
    `Operate ${agent.name.toLowerCase()} within approved enterprise policies.`,
  );
  const [model, setModel] = useState(agent.model);
  const [owner, setOwner] = useState('CX Operations');
  const [message, setMessage] = useState('');
  const [events, setEvents] = useState([
    'v2.4 promoted to Production after approval',
    'Evaluation suite completed: 94% readiness',
    'Knowledge configuration reviewed',
    'PII policy applied to version v2.4',
  ]);
  function newVersion() {
    setDraft(true);
    setSaved(false);
    setTab('Configuration');
    setMessage(
      'Draft v2.5 created from Production v2.4. Production is unchanged.',
    );
    setEvents((e) => ['Draft v2.5 created from Production v2.4', ...e]);
  }
  return (
    <div className="surfacePage hybridPage agentWorkspace">
      <PageTitle
        title={agent.name}
        description={`${agent.model} · ${agent.status} · Version v2.4`}
      >
        <Button onClick={newVersion} disabled={draft}>
          Create New Version
        </Button>
      </PageTitle>
      <Feedback message={message} />
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
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'][i]}
                      </small>
                    </div>
                  ))}
                </div>
              </section>
              <section className="panel">
                <h2>Production configuration</h2>
                <dl className="surfaceFacts">
                  {[
                    ['Infrastructure', 'Cloud'],
                    ['Model', agent.model],
                    ['Knowledge', '2 sources'],
                    ['Tools', '3 approved actions'],
                    ['Policies', '4 active'],
                    ['Eval score', `${agent.score}%`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  className="button link"
                  onClick={() => setTab('Configuration')}
                >
                  View configuration
                </button>
              </section>
            </div>
            <section className="panel">
              <h2>Recent tasks</h2>
              <Table
                caption="Recent agent tasks"
                headers={['Task', 'When', 'Result']}
                rows={[
                  ['Resolved refund question', '2 min ago', 'Success'],
                  ['Created ServiceNow Ticket #4832', '8 min ago', 'Success'],
                  ['Escalated billing dispute', '14 min ago', 'Escalated'],
                  ['Answered order-status request', '18 min ago', 'Success'],
                ].map(([task, time, result]) => [
                  task,
                  time,
                  <Status key={task}>{result}</Status>,
                ])}
              />
            </section>
          </>
        ) : tab === 'Configuration' ? (
          <section className="panel">
            <h2>{draft ? 'Draft version v2.5' : 'Production version v2.4'}</h2>
            <p className="intelligenceNote">
              Never edit Production directly. Changes are saved in a new Agent
              Version and require evaluation and promotion.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSaved(true);
                setMessage(
                  'Draft v2.5 saved. Evaluate this version before promotion.',
                );
                setEvents((v) => ['Configuration saved in draft v2.5', ...v]);
              }}
            >
              <fieldset disabled={!draft}>
                <legend>Version configuration</legend>
                <FormField
                  id="agent-mission"
                  label="Business mission"
                  value={mission}
                  required
                  onChange={(e) => setMission(e.target.value)}
                />
                <label className="journeyField">
                  Foundation model
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option>{agent.model}</option>
                    <option>Claude 3.5 Sonnet</option>
                    <option>Gemini 1.5 Pro</option>
                  </select>
                </label>
                <FormField
                  id="agent-owner"
                  label="Business owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  required
                />
                <Button type="submit">Save draft version</Button>
              </fieldset>
            </form>
            {saved && (
              <Link
                className="button secondary"
                href={`/evaluations/${agent.id}`}
              >
                Review evaluation requirements
              </Link>
            )}
          </section>
        ) : tab === 'Knowledge' ? (
          <section className="panel">
            <h2>Knowledge bound to v2.4</h2>
            <Table
              caption="Agent knowledge"
              headers={['Source', 'Type', 'Documents', 'Status', 'Permissions']}
              rows={sourceRows.slice(0, 2).map((r) => [
                <Link key={r[0]} href={`/knowledge/${r[0]}`}>
                  {r[1]} →
                </Link>,
                r[2],
                r[3],
                <Status key="s">{r[5]}</Status>,
                'Source ACLs enforced',
              ])}
            />
            <p>Source selection changes belong to a new version.</p>
          </section>
        ) : tab === 'Tools' ? (
          <section className="panel">
            <h2>Approved actions</h2>
            <Table
              caption="Agent tools"
              headers={['Action', 'System', 'Permission', 'Risk', 'Approval']}
              rows={actionRows.slice(0, 3).map((r) => [
                <Link key={r[0]} href={`/tools/${r[0]}`}>
                  {r[1]} →
                </Link>,
                r[2],
                r[3],
                r[4],
                r[4] === 'High' ? 'Required' : 'Policy enforced',
              ])}
            />
          </section>
        ) : tab === 'Evaluations' ? (
          <section className="panel">
            <div className="surfaceHeading">
              <h2>Evaluation history</h2>
              <Link href="/evaluations">Run evaluation</Link>
            </div>
            <Table
              caption="Agent evaluation history"
              headers={[
                'Run',
                'Version',
                'Scenarios',
                'Readiness',
                'Result',
                'When',
              ]}
              rows={[
                ['EV-204', 'v2.4', '50 / 50', '94%', 'Passed', 'Today 10:42'],
                [
                  'EV-198',
                  'v2.4-rc1',
                  '47 / 50',
                  '78%',
                  'Needs review',
                  'Yesterday',
                ],
                ['EV-181', 'v2.3', '49 / 50', '91%', 'Passed', 'Sep 10'],
              ].map((r) => [
                <Link key={r[0]} href={`/evaluations/${agent.id}`}>
                  {r[0]} →
                </Link>,
                ...r.slice(1, 4),
                <Status key="s">{r[4]}</Status>,
                r[5],
              ])}
            />
            <Bars
              items={[
                ['Task success', 94],
                ['Groundedness', 91],
                ['Policy compliance', 98],
              ]}
            />
          </section>
        ) : tab === 'Versions' ? (
          <section className="panel">
            <h2>Agent Versions</h2>
            <p>
              Production v2.4 is immutable. Evaluate and promote a reviewed
              version to change it.
            </p>
            <Table
              caption="Agent versions"
              headers={['Version', 'State', 'Change', 'Evaluation', 'Action']}
              rows={[
                ...(draft
                  ? [
                      [
                        'v2.5',
                        saved ? 'Draft saved' : 'Draft',
                        'Mission/configuration update',
                        'Pending',
                        <Button
                          key="edit"
                          variant="link"
                          onClick={() => setTab('Configuration')}
                        >
                          Edit draft
                        </Button>,
                      ],
                    ]
                  : []),
                [
                  'v2.4',
                  <Status key="s">Production</Status>,
                  'PII rules and knowledge refresh',
                  '94%',
                  <Link key="deploy" href={`/deployments/${agent.id}`}>
                    View deployment →
                  </Link>,
                ],
                [
                  'v2.3',
                  'Archived',
                  'Tool timeout handling',
                  '91%',
                  'Retained for rollback',
                ],
                [
                  'v2.2',
                  'Archived',
                  'Initial approved configuration',
                  '89%',
                  'Audit retained',
                ],
              ]}
            />
          </section>
        ) : tab === 'Activity' ? (
          <section className="panel">
            <h2>Version and operational activity</h2>
            <ol className="hybridTimeline">
              {events.map((e, i) => (
                <li key={`${e}-${i}`}>
                  <strong>{e}</strong>
                  <small>
                    {i === 0 ? 'Most recent' : 'Earlier'} · Ana Martinez · audit
                    recorded in preview
                  </small>
                </li>
              ))}
            </ol>
            <Link href="/audit-log">Open Audit Log →</Link>
          </section>
        ) : (
          <>
            <Metrics
              items={[
                ['Health', agent.status],
                ['Success', agent.success],
                ['Latency', agent.latency],
                ['Open incidents', agent.status === 'Degraded' ? '1' : '0'],
              ]}
            />
            <section className="panel">
              <h2>Operational signals</h2>
              {agent.status === 'Degraded' ? (
                <Link href="/agentops/incidents/inc-001">
                  INC-001 · High latency detected →
                </Link>
              ) : (
                <p className="hybridEmpty">
                  No open incidents for this agent. Health checks are passing.
                </p>
              )}
              <Link className="button secondary" href="/agentops">
                Open AgentOps
              </Link>
            </section>
          </>
        )}
      </Panel>
      <DataNote />
    </div>
  );
}
