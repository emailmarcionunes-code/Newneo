'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SignOutControl } from './SignOutControl';
import { Bot, ArrowRight, BookOpen, CheckCircle, Search } from 'lucide-react';
import { useAccount } from './AccountContext';
import {
  usePreview,
  usePreviewValue,
  identifier,
} from './journeys/PreviewState';
import { useWorkspaceAgents } from './journeys/WorkspaceAgents';
import { agentTemplates } from '@/lib/catalog';
import { demoProductRole, productCapabilities } from '@/lib/product-access';
import './BusinessWorkspace.css';
type Agent = {
  id: string;
  name: string;
  purpose: string;
  capabilities: string[];
  sources: { id: string; title: string }[];
  versionId: string | null;
  status: string;
  canSearch: boolean;
};
type Work = {
  id: string;
  query: string;
  agent_id: string;
  agent_name: string;
  created_at: string;
  result: { id: string; title: string; excerpt: string }[];
};
type Data = {
  agents: Agent[];
  work: Work[];
  requests: { id: string; status: string; created_at: string }[];
  capabilities: readonly string[];
};
export default function BusinessWorkspace({
  view = 'home',
  id,
}: {
  view?: string;
  id?: string;
}) {
  const account = useAccount(),
    demo = account.mode === 'demo',
    previewAgents = useWorkspaceAgents(),
    { update } = usePreview();
  const [role] = usePreviewValue('demo:role', 'Administrator');
  const [data, setData] = useState<Data>(),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [query, setQuery] = useState(''),
    [term, setTerm] = useState(''),
    [tab, setTab] = useState('Overview'),
    [result, setResult] = useState<Work>(),
    [stage, setStage] = useState(1),
    [accepted, setAccepted] = useState(false),
    [name, setName] = useState(''),
    [saved, setSaved] = useState('');
  const [brief, setBrief] = useState('');
  async function load() {
    if (demo) return;
    setError('');
    try {
      const r = await fetch('/api/business', { cache: 'no-store' }),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      setData(d);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to load your workspace.',
      );
    }
  }
  useEffect(() => {
    void load();
  }, [demo, account.workspaceId]);
  const demoData: Data = {
    agents: previewAgents.map((a) => {
      const t = agentTemplates.find((t) => t.id === a.id);
      return {
        id: a.id,
        name: a.name,
        purpose: t?.defaultMission ?? 'Your AI specialist for business tasks.',
        capabilities:
          t?.recommendedSkills.filter((s) => !s.optional).map((s) => s.name) ??
          [],
        sources: [],
        versionId: null,
        status: 'Demo example',
        canSearch: false,
      };
    }),
    work: [],
    requests: [],
    capabilities: productCapabilities(demoProductRole(role)),
  };
  const d = demo ? demoData : data;
  const agent = d?.agents.find((a) => a.id === id),
    template = agentTemplates.find((t) => t.id === id);
  async function post(body: Record<string, unknown>) {
    const r = await fetch('/api/business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, workspaceId: account.workspaceId }),
    });
    const v = await r.json();
    if (!r.ok) throw Error(v.error || 'Unable to complete this action.');
    return v;
  }
  async function action(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to complete this action.',
      );
    } finally {
      setBusy(false);
    }
  }
  const request = (outcome: string) =>
    action(async () => {
      if (demo) {
        setMessage(
          'Demo request recorded for this preview. No request was sent.',
        );
        return;
      }
      await post({
        action: 'request',
        brief: {
          outcome,
          department: 'Workspace',
          targetUsers: 'Workspace members',
          systems: 'Administrator to review required connections',
          volume: 'To be agreed',
          sensitivity: 'Administrator review required',
        },
      });
      setMessage(
        'Request submitted for review. Your administrator must review it before anything changes.',
      );
      setBrief('');
      await load();
    });
  const cards = (agents: Agent[]) => (
    <div className="businessCards">
      {agents.map((a) => (
        <Link
          className="businessCard"
          href={`/workspace/agents/${a.id}`}
          key={a.id}
        >
          <span className="businessIcon">
            <Bot size={22} />
          </span>
          <h2>{a.name}</h2>
          <p>{a.purpose}</p>
          <small>{a.canSearch ? 'Document search available' : a.status}</small>
          <span className="businessCardAction">
            Open Agent <ArrowRight size={15} />
          </span>
        </Link>
      ))}
    </div>
  );
  const history = (items: Work[]) => (
    <div className="businessHistory">
      {items.length ? (
        items.map((w) => (
          <details key={w.id}>
            <summary>
              <strong>{w.query}</strong>
              <span>
                {w.agent_name} · {new Date(w.created_at).toLocaleString()}
              </span>
              <small>{w.result.length} matching sources</small>
            </summary>
            {w.result.map((hit) => (
              <article key={hit.id}>
                <h3>{hit.title}</h3>
                <p>{hit.excerpt}</p>
              </article>
            ))}
            {!w.result.length && <p>No matching passages found.</p>}
          </details>
        ))
      ) : (
        <p className="businessEmpty">
          Your completed document searches will appear here.
        </p>
      )}
    </div>
  );
  if (!d)
    return (
      <section className="businessWorkspace">
        <h1>Your workspace</h1>
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button onClick={load}>Retry</button>
          </>
        ) : (
          <p role="status">Loading your agents…</p>
        )}
      </section>
    );
  const own = agent ? d.work.filter((w) => w.agent_id === agent.id) : d.work;
  return (
    <section className="businessWorkspace">
      {error && (
        <p className="businessNotice" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="businessNotice" role="status">
          {message}
        </p>
      )}
      {view === 'home' && (
        <>
          <header className="pageHead">
            <div>
              <h1>Your work, with AI specialists</h1>
              <p>Find the right Agent and get help with your next task.</p>
            </div>
            <Link className="button primary" href="/workspace/discover">
              Discover Agents <ArrowRight size={16} />
            </Link>
          </header>
          <div className="businessSummary">
            <div>
              <strong>{d.agents.length}</strong>
              <span>Agents in your workspace</span>
            </div>
            <div>
              <strong>{d.work.length}</strong>
              <span>Your recent searches</span>
            </div>
            <div>
              <strong>
                {d.requests.filter((r) => r.status === 'Pending review').length}
              </strong>
              <span>Your pending requests</span>
            </div>
          </div>
          <div className="businessMain">
            <article className="panel">
              <div className="businessPanelHead">
                <h2>My Agents</h2>
                <Link href="/workspace/agents">View all →</Link>
              </div>
              {d.agents.length ? (
                cards(d.agents.slice(0, 4))
              ) : (
                <p>Start in Discover to choose a specialist for your team.</p>
              )}
            </article>
            <article className="panel">
              <h2>Recent work</h2>
              {history(d.work.slice(0, 5))}
              <Link href="/workspace/work">View your work →</Link>
            </article>
          </div>
        </>
      )}
      {view === 'agents' && !id && (
        <>
          <header className="pageHead">
            <div>
              <h1>My Agents</h1>
              <p>
                Specialists available in your workspace. Open an Agent to see
                what it can help with.
              </p>
            </div>
            <Link className="button primary" href="/workspace/discover">
              Discover Agents
            </Link>
          </header>
          <label className="businessSearch">
            Find an Agent
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Name or task"
            />
          </label>
          {cards(
            d.agents.filter((a) =>
              (a.name + ' ' + a.purpose)
                .toLowerCase()
                .includes(term.toLowerCase()),
            ),
          )}
          {!d.agents.length && (
            <p>
              No Agents have been added yet. Choose one from Discover or ask
              your administrator.
            </p>
          )}
        </>
      )}
      {view === 'agents' &&
        id &&
        (agent ? (
          <>
            <Link href="/workspace/agents">← My Agents</Link>
            <header className="pageHead">
              <div>
                <h1>{agent.name}</h1>
                <p>{agent.purpose}</p>
              </div>
              <button className="button primary" onClick={() => setTab('Work')}>
                Use Agent <ArrowRight size={16} />
              </button>
            </header>
            <nav className="businessTabs" aria-label="Agent details">
              {['Overview', 'Capabilities', 'Sources', 'Work', 'Results'].map(
                (t) => (
                  <button
                    key={t}
                    aria-current={tab === t ? 'page' : undefined}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ),
              )}
            </nav>
            <article className="panel businessDetail">
              {tab === 'Overview' && (
                <>
                  <h2>How this Agent helps</h2>
                  <p>{agent.purpose}</p>
                  <div className="businessSummary">
                    <div>
                      <strong>{agent.capabilities.length}</strong>
                      <span>Planned capabilities</span>
                    </div>
                    <div>
                      <strong>{agent.sources.length}</strong>
                      <span>Connected sources</span>
                    </div>
                    <div>
                      <strong>
                        {agent.canSearch ? 'Search ready' : agent.status}
                      </strong>
                      <span>Current availability</span>
                    </div>
                  </div>
                  <p>
                    {agent.canSearch
                      ? 'Search the connected documents below. Broader AI tasks are not yet activated.'
                      : 'Your administrator needs to connect sources and activate the Agent before you can work with it.'}
                  </p>
                  {d.capabilities.includes('business:propose') && (
                    <details>
                      <summary>Request a business adjustment</summary>
                      <label>
                        Describe the outcome, rules or team needs
                        <textarea
                          maxLength={1500}
                          value={brief}
                          onChange={(e) => setBrief(e.target.value)}
                        />
                      </label>
                      <button
                        className="button secondary"
                        disabled={busy || !brief.trim()}
                        onClick={() =>
                          request(
                            `Business adjustment for ${agent.name} (${agent.id}): ${brief}`,
                          )
                        }
                      >
                        Submit for review
                      </button>
                    </details>
                  )}
                  {d.capabilities.includes('operations:view') && (
                    <Link href={`/agents/${agent.id}`}>
                      Open in Operations →
                    </Link>
                  )}
                </>
              )}
              {tab === 'Capabilities' && (
                <>
                  <h2>What it is designed to do</h2>
                  <p>
                    These capabilities describe the Agent’s intended work.
                    Availability depends on your team’s setup and approval.
                  </p>
                  {agent.capabilities.length ? (
                    <ul className="businessFeatures">
                      {agent.capabilities.map((c, i) => (
                        <li key={i}>
                          <CheckCircle size={16} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      Your administrator has not defined the capabilities yet.
                    </p>
                  )}
                </>
              )}
              {tab === 'Sources' && (
                <>
                  <h2>Sources this Agent can use</h2>
                  {agent.sources.length ? (
                    <ul className="businessFeatures">
                      {agent.sources.map((s) => (
                        <li key={s.id}>
                          <BookOpen size={18} />
                          {s.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      No sources are connected yet. Ask your administrator to
                      connect the approved documents.
                    </p>
                  )}
                </>
              )}
              {tab === 'Work' && (
                <>
                  <h2>Find information in your documents</h2>
                  <p>
                    Enter a few keywords to find matching passages in the
                    connected sources. This is document search, not an
                    AI-generated answer.
                  </p>
                  {!demo &&
                  agent.canSearch &&
                  d.capabilities.includes('work:search') ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void action(async () => {
                          const w = await post({
                            action: 'search',
                            id: crypto.randomUUID(),
                            agentVersionId: agent.versionId,
                            query,
                          });
                          setResult(w);
                          await load();
                        });
                      }}
                    >
                      <label>
                        What are you looking for?
                        <input
                          required
                          maxLength={200}
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="For example: travel policy"
                        />
                      </label>
                      <button
                        className="button primary"
                        disabled={busy || !query.trim()}
                      >
                        <Search size={16} />
                        {busy ? 'Searching…' : 'Search sources'}
                      </button>
                    </form>
                  ) : (
                    <>
                      <p>
                        {demo
                          ? 'This preview does not execute live tasks.'
                          : !agent.canSearch
                            ? 'This Agent has no connected sources yet.'
                            : 'Your current role does not include document search access.'}
                      </p>
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={() =>
                          request(
                            `Request access and readiness review to use ${agent.name} (${agent.id}).`,
                          )
                        }
                      >
                        Request assistance
                      </button>
                    </>
                  )}
                  {result && (
                    <div className="businessResults">
                      <h3>{result.result.length} matching sources</h3>
                      {result.result.map((hit) => (
                        <article key={hit.id}>
                          <h3>{hit.title}</h3>
                          <p>{hit.excerpt}</p>
                        </article>
                      ))}
                      {!result.result.length && (
                        <p>No matching passages. Try different keywords.</p>
                      )}
                    </div>
                  )}
                </>
              )}
              {tab === 'Results' && (
                <>
                  <h2>Your results</h2>
                  {history(own)}
                </>
              )}
            </article>
          </>
        ) : (
          <>
            <h1>Agent unavailable</h1>
            <p>This Agent is not available in your workspace.</p>
            <Link href="/workspace/agents">Return to My Agents</Link>
          </>
        ))}
      {view === 'discover' && !id && (
        <>
          <header className="pageHead">
            <div>
              <h1>Discover</h1>
              <p>Choose a specialist by the job you need done.</p>
            </div>
          </header>
          <label className="businessSearch">
            Find a specialist
            <input
              placeholder="Search by name or purpose"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </label>
          <div className="businessCards businessCatalog">
            {agentTemplates
              .filter((t) =>
                (t.name + ' ' + t.description)
                  .toLowerCase()
                  .includes(term.toLowerCase()),
              )
              .map((t) => (
                <Link
                  className="businessCard"
                  key={t.id}
                  href={`/workspace/discover/${t.id}`}
                >
                  <span className="businessIcon">
                    <Bot size={22} />
                  </span>
                  <small>{t.categories.join(' · ')}</small>
                  <h2>{t.name}</h2>
                  <p>{t.description}</p>
                  <span className="businessCardAction">
                    Learn more <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
          </div>
        </>
      )}
      {view === 'discover' &&
        id &&
        (template ? (
          <>
            <Link href="/workspace/discover">← Discover</Link>
            <ol className="businessSteps">
              <li>Select</li>
              <li aria-current={stage === 1 ? 'step' : undefined}>
                Understand
              </li>
              <li aria-current={stage === 2 ? 'step' : undefined}>
                Accept & add
              </li>
            </ol>
            {saved ? (
              <article className="panel">
                <h1>Agent added</h1>
                <p>
                  {name || template.name} is in your workspace. Your
                  administrator can complete its setup before use.
                </p>
                <Link
                  className="button primary"
                  href={`/workspace/agents/${saved}`}
                >
                  Open Agent
                </Link>
              </article>
            ) : (
              <>
                <header className="pageHead">
                  <div>
                    <h1>{template.name}</h1>
                    <p>{template.description}</p>
                  </div>
                </header>
                {stage === 1 ? (
                  <div className="businessProfile">
                    <article className="panel">
                      <h2>What it helps you do</h2>
                      <p>{template.defaultMission}</p>
                      <ul className="businessFeatures">
                        {template.recommendedSkills
                          .filter((s) => !s.optional)
                          .map((s) => (
                            <li key={s.id}>
                              <CheckCircle size={16} />
                              {s.name}
                            </li>
                          ))}
                      </ul>
                    </article>
                    <article className="panel">
                      <h2>For your team</h2>
                      <p>{template.defaultTargetUsers}</p>
                      <h3>Expected outcomes</h3>
                      <ul>
                        {template.outcomes.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </article>
                    <article className="panel">
                      <h2>Before you start</h2>
                      <p>
                        Your administrator connects the approved sources and
                        services, reviews permissions and confirms the Agent is
                        ready.
                      </p>
                      <p>Adding an Agent does not automatically start tasks.</p>
                      <button
                        className="button primary"
                        onClick={() => setStage(2)}
                      >
                        Continue →
                      </button>
                    </article>
                  </div>
                ) : (
                  <article className="panel businessConfirm">
                    <h2>Add this specialist</h2>
                    <label>
                      Agent name
                      <input
                        maxLength={120}
                        value={name || template.name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </label>
                    <label className="businessAccept">
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                      />
                      I have reviewed this Agent’s purpose and want it in my
                      workspace.
                    </label>
                    <div className="businessActions">
                      <button
                        className="button secondary"
                        onClick={() => setStage(1)}
                      >
                        Back
                      </button>
                      <button
                        className="button primary"
                        disabled={busy || !accepted}
                        onClick={() =>
                          d.capabilities.includes('agents:configure')
                            ? action(async () => {
                                if (demo) {
                                  const newId = `preview-${identifier()}`;
                                  update((s) => ({
                                    ...s,
                                    ui: {
                                      ...s.ui,
                                      'workspace:agents': [
                                        ...(Array.isArray(
                                          s.ui?.['workspace:agents'],
                                        )
                                          ? s.ui['workspace:agents']
                                          : []),
                                        {
                                          id: newId,
                                          name: name || template.name,
                                          model: 'Not selected',
                                          status: 'Staging',
                                          tasks: '—',
                                          success: '—',
                                          latency: '—',
                                          cost: 0,
                                          budget: 100,
                                          score: 0,
                                        },
                                      ],
                                    },
                                  }));
                                  setSaved(newId);
                                } else {
                                  const r = await post({
                                    action: 'add',
                                    templateId: template.id,
                                    name: name || template.name,
                                    accepted,
                                  });
                                  setSaved(r.id);
                                }
                              })
                            : request(
                                `Please add ${name || template.name} from Discover (${template.id}). ${template.defaultMission}`,
                              )
                        }
                      >
                        {busy
                          ? 'Saving…'
                          : d.capabilities.includes('agents:configure')
                            ? 'Accept & Add Agent'
                            : 'Request this Agent'}
                      </button>
                    </div>
                  </article>
                )}
              </>
            )}
          </>
        ) : (
          <h1>Specialist not found</h1>
        ))}
      {view === 'work' && (
        <>
          <header className="pageHead">
            <div>
              <h1>Work</h1>
              <p>Your latest 50 document searches and saved results.</p>
            </div>
            <Link href="/workspace/agents" className="button primary">
              Start with an Agent
            </Link>
          </header>
          <article className="panel">{history(d.work)}</article>
          {d.requests.length > 0 && (
            <article className="panel">
              <h2>Your requests</h2>
              {d.requests.map((r) => (
                <p key={r.id}>
                  {r.status} · {new Date(r.created_at).toLocaleDateString()}
                </p>
              ))}
            </article>
          )}
        </>
      )}
      {view === 'reports' && (
        <>
          <header className="pageHead">
            <div>
              <h1>Reports</h1>
              <p>A summary of your latest 50 document searches.</p>
            </div>
          </header>
          <div className="businessSummary">
            <div>
              <strong>{d.work.length}</strong>
              <span>Searches completed</span>
            </div>
            <div>
              <strong>
                {d.work.filter((w) => w.result.length > 0).length}
              </strong>
              <span>Searches with matches</span>
            </div>
            <div>
              <strong>{new Set(d.work.map((w) => w.agent_id)).size}</strong>
              <span>Agents used</span>
            </div>
          </div>
          <article className="panel">
            <h2>Results by Agent</h2>
            {d.agents.map((a) => {
              const runs = d.work.filter((w) => w.agent_id === a.id);
              return (
                <p key={a.id}>
                  <Link href={`/workspace/agents/${a.id}`}>{a.name}</Link> ·{' '}
                  {runs.length} searches
                </p>
              );
            })}
            <p>
              These counts describe document searches, not AI task completion or
              business impact.
            </p>
          </article>
        </>
      )}
      {view === 'profile' && (
        <article className="panel">
          <h1>Your account</h1>
          <p>{demo ? 'Ana Martinez' : account.displayName}</p>
          <p>{demo ? 'Acme Corp' : account.workspace?.organization_name}</p>
          <p>Access: {demo ? role : account.workspace?.role}</p>
          <Link href="/">Return to Workspace</Link>
          <p>
            <SignOutControl />
          </p>
        </article>
      )}
      {view === 'help' && (
        <article className="panel">
          <h1>Getting started</h1>
          <ol>
            <li>Browse Discover to find a specialist for your task.</li>
            <li>
              Open My Agents to see its capabilities and connected sources.
            </li>
            <li>Choose Use Agent when document search is available.</li>
            <li>Find your searches and results in Work.</li>
          </ol>
          <p>
            Need another capability or access? Request assistance from the
            Agent’s Work tab. Your administrator reviews requests and completes
            setup in Operations.
          </p>
          <p>
            AI-generated conversations and automated business actions are not
            yet activated in the live workspace.
          </p>
        </article>
      )}
    </section>
  );
}
