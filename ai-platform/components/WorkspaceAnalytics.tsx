'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount } from './AccountContext';
import { Metrics, Table, IconLabel } from './hybrid/UI';
import WorkspaceCostConsole from './WorkspaceCostConsole';
import './BusinessWorkspace.css';
import { Activity, ChartNoAxesCombined, UsersRound } from 'lucide-react';
type AgentUsage = {
  id: string;
  name: string;
  searches: number;
  matched: number;
  latency: number;
  users: number;
  latest: string;
};
type Analytics = {
  scope: string;
  period: string;
  agents: AgentUsage[];
  trend: { day: string; searches: number }[];
  users: { id: string; searches: number; agents: number; latest: string }[];
};
export default function WorkspaceAnalytics({
  agentId,
  embedded = false,
  company = false,
}: {
  agentId?: string;
  embedded?: boolean;
  company?: boolean;
}) {
  const account = useAccount();
  const [loadedData, setData] = useState<Analytics>();
  const data = account.mode === 'demo' ? { scope: 'personal', period: '30d', agents: [], trend: [], users: [] } as Analytics : loadedData;
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [controls, setControls] = useState(false);
  useEffect(() => {
    setData(undefined);
    setError('');
    if (account.mode === 'demo') return;
    const controller = new AbortController();
    fetch(`/api/analytics?scope=${company ? 'workspace' : 'personal'}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        return d;
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      });
    return () => controller.abort();
  }, [account.mode, account.workspaceId, company, revision]);
  const agents = (data?.agents ?? []).filter(
    (a) => !agentId || a.id === agentId,
  );
  const total = agents.reduce((n, a) => n + a.searches, 0),
    matched = agents.reduce((n, a) => n + a.matched, 0);
  const latency = total
    ? Math.round(agents.reduce((n, a) => n + a.latency * a.searches, 0) / total)
    : null;
  const title = company
    ? 'FinOps'
    : agentId
      ? 'Your Agent analytics'
      : 'My Analytics';
  return (
    <section className="workspaceAnalytics">
      {!embedded && (
        <header className="pageHead">
          <div>
            <h1>{title}</h1>
            <p>
              {company
                ? 'Company oversight · current workspace'
                : 'Your activity across your Agents'}{' '}
              · Last 30 days
            </p>
          </div>
          <button
            className="button secondary"
            onClick={() => setRevision((n) => n + 1)}
          >
            Refresh
          </button>
        </header>
      )}
      {embedded && (
        <>
          <h2>{title}</h2>
          <p>Your work with this Agent · Last 30 days</p>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      {account.mode === 'demo' ? (
        <p className="businessNotice">
          Demo preview. Personal usage analytics appear after recorded workspace
          activity.
        </p>
      ) : !data && !error ? (
        <p role="status">Loading analytics…</p>
      ) : null}
      {data && (
        <>
          <Metrics
            items={[
              ['Document searches', String(total)],
              ['Agents used', String(agents.length)],
              [
                'Searches with matches',
                total ? `${Math.round((matched / total) * 100)}%` : '—',
              ],
              ['Avg search time', latency === null ? '—' : `${latency} ms`],
              ...(company
                ? [
                    ['Active users', String(data.users.length)] as [string,string],
                    ['Attributed cost', '—'] as [string,string],
                  ]
                : []),
            ]}
          />
          <div className="analyticsPanels">
            <article className="panel">
              <h2><ChartNoAxesCombined size={18}/>{agentId ? 'Work summary' : 'Usage by Agent'}</h2>
              <Table
                caption="Recorded document searches by Agent"
                headers={[
                  'Agent',
                  'Searches',
                  'With matches',
                  'Search time',
                  ...(company ? ['Users', 'Cost'] : []),
                ]}
                rows={agents.map((a) => [
                  <Link key={a.id} href={`/workspace/agents/${a.id}`}>
                    <IconLabel identity={a.id}>{a.name}</IconLabel>
                  </Link>,
                  String(a.searches),
                  String(a.matched),
                  `${a.latency} ms`,
                  ...(company ? [String(a.users), 'Unavailable'] : []),
                ])}
                emptyMessage="No document searches recorded in this period."
              />
            </article>
            {company ? (
              <article className="panel">
                <h2><UsersRound size={18}/>Most active users</h2>
                <p>Workspace member references · ordered by searches</p>
                <Table
                  caption="Usage by workspace member"
                  headers={['Member', 'Searches', 'Agents']}
                  rows={data.users.map((u) => [
                    <span key={u.id} title={u.id}>
                      Member {u.id.slice(0, 8)}
                    </span>,
                    String(u.searches),
                    String(u.agents),
                  ])}
                  emptyMessage="No usage recorded."
                />
              </article>
            ) : (
              <article className="panel">
                <h2><Activity size={18}/>{agentId ? 'Latest work' : 'Activity over time'}</h2>
                {agentId ? (
                  <>
                    <p>
                      {agents[0]
                        ? new Date(agents[0].latest).toLocaleString()
                        : 'No work recorded yet.'}
                    </p>
                    <Link href="/workspace/work">
                      View your work and results →
                    </Link>
                  </>
                ) : (
                  <div className="analyticsTrend">
                    {data.trend.length ? (
                      data.trend.map((day) => (
                        <div key={day.day}>
                          <span>{day.day}</span>
                          <meter
                            min={0}
                            max={Math.max(
                              ...data.trend.map((t) => t.searches),
                              1,
                            )}
                            value={day.searches}
                          />
                          <strong>{day.searches}</strong>
                        </div>
                      ))
                    ) : (
                      <p>Your daily activity will appear here.</p>
                    )}
                  </div>
                )}
              </article>
            )}
          </div>
          <p className="hybridDataNote">
            Recorded document searches only. A matching source is not a
            task-success score.{' '}
            {company
              ? 'Costs per Agent are unavailable until billing attribution is connected.'
              : 'This view includes only your own activity.'}
          </p>
        </>
      )}
      {company && (
        <details onToggle={(e) => setControls(e.currentTarget.open)}>
          <summary>Platform cost controls — platform owners only</summary>
          <p>
            Separate platform-wide controls retain their existing owner
            authorization.
          </p>
          {controls && <WorkspaceCostConsole />}
        </details>
      )}
    </section>
  );
}
