'use client';
import { workspaceSummary, percent } from '@/lib/workspace-summary';
import { Progress, Tag } from './UI';
import { Terminal, Trash2, Send } from 'lucide-react';
import { useWorkspaceAgents } from '../journeys/WorkspaceAgents';
import ReportSchedule from './ReportSchedule';
import { useState } from 'react';
import Link from 'next/link';
import { hybridAgents, auditRows } from '@/lib/hybrid-data';
import { Button } from '../UI';
import { usePreview } from '../journeys/PreviewState';
import { PageTitle, Metrics, Table, Status, DataNote, exportCsv } from './UI';
export function Reports() {
  const agents = useWorkspaceAgents();
  const summary = workspaceSummary(agents);
  const [period, setPeriod] = useState('Last 7 days');
  const [start, setStart] = useState('2026-09-01');
  const [end, setEnd] = useState('2026-09-16');
  const days =
    period === 'Last 7 days'
      ? 7
      : period === 'Last 30 days'
        ? 30
        : period === 'Last 90 days'
          ? 90
          : Math.max(
              1,
              Math.floor((Date.parse(end) - Date.parse(start)) / 86400000) + 1,
            );
  const rows = agents.map((a) => ({
    ...a,
    total: (Number(a.tasks.replaceAll(',', '')) || 0) * days,
  }));
  const avg = (values: number[]) =>
    (values.reduce((s, v) => s + v, 0) / Math.max(1, values.length)).toFixed(1);
  return (
    <div className="surfacePage hybridPage reportsPage">
      <PageTitle
        title="Reports"
        description="Aggregated performance, cost, and compliance summaries"
      >
        <div className="referenceActions">
          <Button
            variant="outline"
            onClick={() =>
              exportCsv('newneo-performance-preview.csv', [
                [
                  'Agent',
                  'Total tasks',
                  'Success rate',
                  'AI spend',
                  'Eval score',
                ],
                ...rows.map((a) => [
                  a.name,
                  String(a.total),
                  a.success,
                  String(a.cost),
                  String(a.score),
                ]),
              ])
            }
          >
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            Export PDF
          </Button>
        </div>
      </PageTitle>
      <div className="referenceSegments" aria-label="Report period">
        {['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom'].map((p) => (
          <button
            key={p}
            aria-pressed={p === period}
            onClick={() => setPeriod(p)}
          >
            {p}
          </button>
        ))}
      </div>
      {period === 'Custom' && (
        <div className="referenceActions">
          <label>
            From{' '}
            <input
              type="date"
              value={start}
              max={end}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            To{' '}
            <input
              type="date"
              value={end}
              min={start}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
      )}
      <Metrics
        items={[
          [
            'Total Tasks',
            rows.reduce((sum, a) => sum + a.total, 0).toLocaleString('en-US'),
          ],
          ['Avg Success Rate', percent(summary.successRate)],
          [
            'Total AI Spend',
            `$${agents.reduce((sum, a) => sum + a.cost, 0).toLocaleString('en-US')}`,
          ],
          ['Avg Eval Score', `${avg(agents.map((a) => a.score))}%`],
        ]}
      />
      <section className="panel">
        <h2>Agent Performance</h2>
        <Table
          caption="Agent performance breakdown"
          headers={[
            'Agent',
            'Total Tasks',
            'Success Rate',
            'AI Spend',
            'Eval Score',
          ]}
          rows={rows.map((a) => [
            <Link key="agent" href={`/agents/${a.id}`}>
              {a.name}
            </Link>,
            a.total.toLocaleString('en-US'),
            <Progress
              key="success"
              label={`${a.name} success rate`}
              value={parseFloat(a.success)}
              tone={parseFloat(a.success) >= 95 ? 'green' : 'amber'}
            />,
            `$${a.cost}`,
            <Progress
              key="score"
              label={`${a.name} evaluation score`}
              value={a.score}
              tone={a.score >= 90 ? 'green' : 'amber'}
            />,
          ])}
        />
      </section>
      <section className="panel">
        <h2>Compliance Summary</h2>
        <div className="referenceCompliance">
          <div>
            <strong>78%</strong>
            <span>Average Compliance Score</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Open Policy Violations</span>
          </div>
          <div>
            <strong>5 / 6</strong>
            <span>Agents Compliant</span>
          </div>
        </div>
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
        description="Full platform activity trail with search and export"
      >
        {' '}
        <Button
          variant="outline"
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
      </PageTitle>
      <section className="panel">
        <div className="hybridControls">
          <input
            aria-label="Search audit events"
            placeholder="Search events, users, resources…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="referenceSegments" aria-label="Audit action">
            {[
              ['All', 'All'],
              ['Create', 'create'],
              ['Update', 'policy.edit'],
              ['Delete', 'delete'],
              ['Deploy', 'deploy'],
              ['Login', 'login'],
            ].map(([label, value]) => (
              <button
                key={value}
                aria-pressed={action === value}
                onClick={() => setAction(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <details className="referenceAuditFilters">
            <summary>More filters</summary>
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
          </details>
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
            <span key="time" className="referenceMono">
              {r[0]}
            </span>,
            <span key="user" className="referenceMono">
              {r[1]}
            </span>,
            <Tag key="role">{r[2]}</Tag>,
            <Tag key="action">{r[3]}</Tag>,
            r[4],
            r[5],
            <Status key="s">{r[6]}</Status>,
          ])}
        />
      </section>
      <DataNote />
    </div>
  );
}
export function Playground() {
  const [agent, setAgent] = useState(hybridAgents[0].id);
  const [temperature, setTemperature] = useState('0.2');
  const [tokens, setTokens] = useState('2048');
  const [show, setShow] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    [],
  );
  return (
    <div className="surfacePage hybridPage playgroundPage">
      <PageTitle
        title="Playground"
        description="Interactive agent sandbox — no production actions"
      />
      <div className="playgroundLayout">
        <section className="panel">
          <h2>PARAMETERS</h2>
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
          <div className="intelligenceNote">
            <strong>Sandbox mode</strong>No real production actions are
            executed. Test any flow with sample responses.
          </div>
        </section>
        <section className="panel playgroundChat">
          <div className="referenceChatHeader">
            <Terminal size={17} aria-hidden="true" />
            <select
              aria-label="Agent"
              value={agent}
              onChange={(e) => {
                setAgent(e.target.value);
                setMessages([]);
              }}
            >
              {hybridAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <Status>
              {hybridAgents.find((a) => a.id === agent)?.status ?? 'Sandbox'}
            </Status>
            <Button variant="link" onClick={() => setMessages([])}>
              <Trash2 size={15} aria-hidden="true" /> Clear
            </Button>
          </div>
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
              <div className="referenceChatEmpty">
                <span>
                  <Terminal size={24} aria-hidden="true" />
                </span>
                <h2>{hybridAgents.find((a) => a.id === agent)?.name}</h2>
                <p>Send a message to start testing</p>
                <div>
                  {[
                    'Reset my password',
                    'VPN not working',
                    'Request software access',
                  ].map((prompt) => (
                    <button key={prompt} onClick={() => setInput(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
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
              <Send size={18} aria-hidden="true" />
            </Button>
          </form>
        </section>
      </div>
      <DataNote />
    </div>
  );
}
export { default as Settings } from './SettingsWorkspace';
