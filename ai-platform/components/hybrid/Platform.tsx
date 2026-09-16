'use client';
import ReportSchedule from './ReportSchedule';
import { useState } from 'react';
import Link from 'next/link';
import { hybridAgents, auditRows } from '@/lib/hybrid-data';
import { Button } from '../UI';
import { usePreview } from '../journeys/PreviewState';
import { PageTitle, Metrics, Table, Status, DataNote, exportCsv } from './UI';
export function Reports() {
  return (
    <div className="surfacePage hybridPage reportsPage">
      <PageTitle
        title="Reports"
        description="Executive trends across tasks, cost, quality and compliance."
      />
      <Metrics
        items={[
          ['Total tasks (6m)', '106K'],
          ['Total cost (6m)', '$10.2K'],
          ['Avg success rate', '94%'],
          ['Avg eval score', '80/100'],
        ]}
      />
      <div className="hybridSplit">
        <section className="panel">
          <h2>Task volume — Monthly</h2>
          <div
            className="hybridChart"
            aria-label="Monthly task volume: April 11K, May 13K, June 15K, July 17K, August 22K, September 28K"
          >
            {[11, 13, 15, 17, 22, 28].map((n, i) => (
              <div key={i}>
                <span style={{ height: n * 4 }} />
                <small>{['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][i]}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Compliance</h2>
          <dl className="surfaceFacts">
            {[
              ['Policy violations', '14'],
              ['Auto-resolved', '11'],
              ['Requiring action', '3'],
              ['HITL approvals', '28'],
              ['Audit events', '1.2K'],
            ].map(([k, v]) => (
              <div key={k} data-fact={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <section className="panel">
        <h2>Agent performance breakdown</h2>
        <Table
          caption="Agent performance breakdown"
          headers={[
            'Agent',
            'Tasks',
            'Success',
            'Latency',
            'Cost',
            'Eval',
            'Trend',
          ]}
          rows={[hybridAgents[0], hybridAgents[1], hybridAgents[3]].map(
            (a, i) => [
              <Link key={a.id} href={`/agents/${a.id}`}>
                {a.name}
              </Link>,
              ['18.4K', '6.3K', '4.1K'][i],
              <span
                key="success"
                className={
                  a.status === 'Degraded' ? 'hybridDanger' : 'successText'
                }
              >
                {a.success}
              </span>,
              a.latency,
              `$${a.cost}`,
              `${a.score}%`,
              <span
                key="trend"
                className={i === 2 ? 'hybridDanger' : 'successText'}
              >
                {['+4%', '+1%', '−6%'][i]}
              </span>,
            ],
          )}
        />
      </section>
      <ReportSchedule />
      <DataNote />
    </div>
  );
}
export function AuditLog() {
  const { state } = usePreview();
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('All');
  const [result, setResult] = useState('All');
  const [user, setUser] = useState('All');
  const rows = [
    ...state.audit.map((a) => [
      'This session',
      'You',
      'Preview',
      'preview.change',
      a,
      'Sandbox',
      'Info',
    ]),
    ...auditRows,
  ].filter(
    (r) =>
      r.join(' ').toLowerCase().includes(search.toLowerCase()) &&
      (action === 'All' || r[3] === action) &&
      (result === 'All' || r[6] === result) &&
      (user === 'All' || r[1] === user),
  );
  return (
    <div className="surfacePage hybridPage auditLogPage">
      <PageTitle
        title="Audit Log"
        description="Immutable record of deployments, policy changes and system events."
      />
      <Metrics
        items={[
          ['Events today', '15'],
          ['Deployments', '3'],
          ['Policy changes', '2'],
          ['Incidents', '4'],
        ]}
      />
      <section className="panel">
        <div className="hybridControls">
          <input
            aria-label="Search audit events"
            placeholder="Search events, users, resources…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {[
            [
              'User',
              user,
              setUser,
              ['j.silva', 'system', 'a.costa', 'r.lima', 'You'],
            ],
            [
              'Action',
              action,
              setAction,
              [
                'deploy',
                'incident.open',
                'policy.edit',
                'eval.run',
                'preview.change',
              ],
            ],
            ['Result', result, setResult, ['Success', 'Info', 'Rollback']],
          ].map(([label, val, set, options]) => (
            <label key={String(label)}>
              {String(label)}
              <select
                value={String(val)}
                onChange={(e) => (set as (v: string) => void)(e.target.value)}
              >
                {['All', ...(options as string[])].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          ))}
          <Button
            variant="link"
            onClick={() =>
              exportCsv('newneo-audit-preview.csv', [
                [
                  'Timestamp',
                  'User',
                  'Role',
                  'Action',
                  'Resource',
                  'Environment',
                  'Result',
                ],
                ...rows,
              ])
            }
          >
            Export CSV
          </Button>
        </div>
        <Table
          caption="Audit events"
          headers={[
            'Timestamp',
            'User',
            'Role',
            'Action',
            'Resource',
            'Environment',
            'Result',
          ]}
          rows={rows.map((r) => [
            ...r.slice(0, 6),
            <Status key="s">{r[6]}</Status>,
          ])}
        />
      </section>
      <DataNote />
      <p className="hybridDataNote">
        Preview records are local samples, not a production audit store.
      </p>
    </div>
  );
}
export function Playground() {
  const [agent, setAgent] = useState(hybridAgents[0].id);
  const [temperature, setTemperature] = useState('0.4');
  const [tokens, setTokens] = useState('2048');
  const [show, setShow] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'user', text: 'Preciso cancelar meu pedido #78234' },
    {
      role: 'assistant',
      text: 'Consultei seu pedido. Ele está em transporte. Posso criar um ticket de devolução quando chegar.',
    },
  ]);
  return (
    <div className="surfacePage hybridPage playgroundPage">
      <PageTitle
        title="Agent Playground"
        description="Test conversations and tool calls safely before production."
      />
      <div className="playgroundLayout">
        <section className="panel">
          <h2>AGENT</h2>
          <div className="playgroundAgents">
            {hybridAgents.map((a) => (
              <button
                aria-pressed={agent === a.id}
                key={a.id}
                onClick={() => {
                  setAgent(a.id);
                  setMessages([]);
                }}
              >
                {a.name}
              </button>
            ))}
          </div>
          <h3>PARAMETERS</h3>
          <label>
            Temperature · {temperature}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </label>
          <label>
            Max tokens · {tokens}
            <input
              type="range"
              min="256"
              max="8192"
              step="256"
              value={tokens}
              onChange={(e) => setTokens(e.target.value)}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
            />{' '}
            Show tool calls
          </label>
        </section>
        <section className="panel playgroundChat">
          <h2>{hybridAgents.find((a) => a.id === agent)?.name} · Sandbox</h2>
          <Status>Sandbox — no real actions are executed</Status>
          <div
            className="playgroundMessages"
            role="log"
            aria-label="Test conversation"
          >
            {messages.length ? (
              messages.map((m, i) => (
                <div key={i} className={m.role}>
                  <p>{m.text}</p>
                  {m.role === 'assistant' && show && (
                    <small>
                      → Tool call: Search Knowledge Base · simulated
                    </small>
                  )}
                </div>
              ))
            ) : (
              <p className="hybridDataNote">
                Type a test message to explore the sample conversation.
              </p>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim()) return;
              setMessages((v) => [
                ...v,
                { role: 'user', text: input.trim() },
                {
                  role: 'assistant',
                  text: 'Sample response: I found the relevant policy in the approved knowledge base. I can prepare a request for human review. No real tool or model was called.',
                },
              ]);
              setInput('');
            }}
          >
            <input
              aria-label="Test message"
              placeholder="Type a test message…"
              value={input}
              maxLength={2000}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send test message"
            >
              →
            </Button>
          </form>
        </section>
      </div>
      <DataNote />
    </div>
  );
}
export { default as Settings } from './SettingsWorkspace';
