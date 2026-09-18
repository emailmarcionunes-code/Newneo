'use client';
import { useAccount } from './AccountContext';
import { CapabilityNotice } from './journeys/DemoExperience';
import { useEffect, useRef, useState } from 'react';
import { surfaces, type SurfaceRecord } from '@/lib/surfaces';
import { knowledgeSources, toolConnectors } from '@/lib/launch';
import { Button, FilterChip } from './UI';
import { ProviderLogo } from './Assets';
import { usePreview } from './journeys/PreviewState';
import { sourceRows } from '@/lib/hybrid-data';

type Resource = SurfaceRecord & {
  provider: string;
  connected: boolean;
  owner: string;
  scope: string;
  environment: string;
  location: string;
  authentication: string;
  selectedActions: string[];
  approval: boolean;
  sync: 'Ready' | 'Needs attention' | 'Not synchronized';
  events: string[];
};
type Form = {
  provider: string;
  name: string;
  location: string;
  scope: string;
  owner: string;
  environment: string;
  authentication: string;
  selectedActions: string[];
  approval: boolean;
};
const steps = [
  'Choose provider',
  'Configuration',
  'Access & permissions',
  'Review',
];
function initialResources(surface: string): Resource[] {
  return surfaces[surface].records.map((record) => ({
    ...record,
    provider: record.id,
    connected:
      surface === 'knowledge' &&
      sourceRows.some((r) => r[0] === record.id && r[5] === 'Live'),
    owner: 'Ana Martinez',
    scope: 'Customer Service workspace',
    environment: 'Development',
    location: '',
    authentication: 'OAuth',
    selectedActions: [],
    approval: true,
    sync:
      surface === 'knowledge' &&
      sourceRows.some((r) => r[0] === record.id && r[5] === 'Live')
        ? 'Ready'
        : 'Not synchronized',
    events: [],
  }));
}
const blankForm = (): Form => ({
  provider: '',
  name: '',
  location: '',
  scope: 'Customer Service workspace',
  owner: 'Ana Martinez',
  environment: 'Development',
  authentication: 'OAuth',
  selectedActions: [],
  approval: true,
});

export default function ResourceExperience({
  surface,
}: {
  surface: 'knowledge' | 'tools';
}) {
  const { state, update, ready } = usePreview();
  const knowledge = surface === 'knowledge';
  const noun = knowledge ? 'source' : 'connector';
  const providers = knowledge ? knowledgeSources : toolConnectors;
  const [records, setRecords] = useState<Resource[]>(() =>
    state.ui?.['demo:dataset'] === 'empty' ? [] : initialResources(surface),
  );
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<string | null>(null);
  const [tab, setTab] = useState('Overview');
  const [notice, setNotice] = useState('');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(blankForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [outcome, setOutcome] = useState('success');
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const pageHeading = useRef<HTMLHeadingElement>(null);
  const modalHeading = useRef<HTMLHeadingElement>(null);
  const account = useAccount();
  const key = `newneo:resource-preview:v1:${surface}${account.mode === 'demo' ? ':public-demo' : ''}`;
  useEffect(() => {
    if (!ready) return;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        if (
          Array.isArray(saved) &&
          saved.length <= 100 &&
          new Set(saved.map((r) => r?.id)).size === saved.length &&
          saved.every(
            (r) =>
              r &&
              typeof r.id === 'string' &&
              typeof r.name === 'string' &&
              r.name.length <= 120 &&
              [
                'category',
                'description',
                'owner',
                'scope',
                'environment',
                'location',
                'authentication',
              ].every(
                (key) => typeof r[key] === 'string' && r[key].length <= 2048,
              ) &&
              typeof r.approval === 'boolean' &&
              ['Ready', 'Needs attention', 'Not synchronized'].includes(
                r.sync,
              ) &&
              typeof r.connected === 'boolean' &&
              Array.isArray(r.fields) &&
              Array.isArray(r.selectedActions) &&
              r.selectedActions.every(
                (action: unknown) => typeof action === 'string',
              ) &&
              Array.isArray(r.events) &&
              r.events.every((event: unknown) => typeof event === 'string') &&
              providers.some((p) => p.id === r.provider),
          )
        )
          setRecords(saved);
        else throw new Error('Invalid preview storage');
      } else
        setRecords(
          state.ui?.['demo:dataset'] === 'empty'
            ? []
            : initialResources(surface),
        );
    } catch {
      setNotice('Saved preview unavailable. You can continue in this tab.');
    }
    setLoaded(true);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [key, ready]);
  useEffect(() => {
    if (!loaded) return;
    update((s) => ({
      ...s,
      ui: { ...s.ui, [`resources:${surface}`]: records },
    }));
    try {
      sessionStorage.setItem(key, JSON.stringify(records));
    } catch {
      setNotice(
        'Changes remain in memory because browser storage is unavailable.',
      );
    }
  }, [records, loaded, key]);
  const detail = records.find((record) => record.id === (view ?? selected));
  const categories = [...new Set(records.map((record) => record.category))];
  const filtered = records.filter(
    (record) =>
      (category === 'All' || record.category === category) &&
      `${record.name} ${record.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const connected = records.filter((record) => record.connected);
  const provider = providers.find((value) => value.id === form.provider);
  const available =
    toolConnectors.find((value) => value.id === form.provider)?.actions ?? [];
  function open(record?: Resource) {
    setEditing(record?.id ?? null);
    setStep(record ? 1 : 0);
    setForm(
      record
        ? {
            provider: record.provider,
            name: record.name,
            location: record.location,
            scope: record.scope,
            owner: record.owner,
            environment: record.environment,
            authentication: record.authentication,
            selectedActions: record.selectedActions,
            approval: record.approval,
          }
        : blankForm(),
    );
    dialog.current?.showModal();
    requestAnimationFrame(() => modalHeading.current?.focus());
  }
  function navigate(id: string | null) {
    setView(id);
    setSelected(id);
    setTab('Overview');
    setNotice('');
    setOutcome('success');
    requestAnimationFrame(() => pageHeading.current?.focus());
  }
  function patch(id: string, changes: Partial<Resource>) {
    setRecords((current) =>
      current.map((record) =>
        record.id === id ? { ...record, ...changes } : record,
      ),
    );
  }
  function save() {
    if (!provider) return;
    const id = editing ?? `${form.provider}-${crypto.randomUUID()}`;
    const category = knowledge
      ? provider.categories[0]
      : provider.id === 'api'
        ? 'MCP Servers'
        : 'Enterprise Integrations';
    const item: Resource = {
      id,
      name: form.name.trim(),
      provider: form.provider,
      category,
      status: 'Connected · preview',
      description: knowledge
        ? 'Workspace knowledge source.'
        : 'Workspace integration with selected actions.',
      fields: [],
      connected: true,
      owner: form.owner,
      scope: form.scope,
      environment: form.environment,
      location: form.location,
      authentication: form.authentication,
      selectedActions: form.selectedActions,
      approval: form.approval,
      sync: 'Not synchronized',
      events: ['Configuration saved · preview'],
    };
    setRecords((current) =>
      editing
        ? current.map((record) =>
            record.id === editing
              ? {
                  ...item,
                  events: [...record.events, 'Configuration updated · preview'],
                }
              : record,
          )
        : [...current, item],
    );
    dialog.current?.close();
    navigate(id);
    setNotice(
      `${knowledge ? 'Source' : 'Connector'} configuration saved in this browser tab.`,
    );
  }
  function simulate() {
    if (!detail || pending) return;
    const id = detail.id;
    setPending(true);
    setNotice(
      knowledge
        ? 'Simulating synchronization…'
        : 'Simulating connection check…',
    );
    timer.current = setTimeout(() => {
      patch(id, {
        sync: outcome === 'success' ? 'Ready' : 'Needs attention',
        events: [
          ...detail.events,
          `${knowledge ? 'Synchronization' : 'Connection check'} ${outcome === 'success' ? 'completed' : 'failed'} · preview`,
        ],
      });
      setPending(false);
      setNotice(
        outcome === 'success'
          ? 'Preview completed successfully. No external system was contacted.'
          : 'Preview failed: authorization expired. Review the connection and try again.',
      );
    }, 650);
  }
  const tabs = knowledge
    ? [
        'Overview',
        'Connection',
        'Content',
        'Sync history',
        'Permissions',
        'Quality',
        'Usage',
      ]
    : ['Overview', 'Connection', 'Actions', 'Permissions', 'Health', 'Usage'];
  return (
    <CapabilityNotice cap="create">
      <div className="surfacePage resourceExperience">
        <div className="pageHead">
          <div>
            {view && (
              <Button variant="link" onClick={() => navigate(null)}>
                ← Back to {surfaces[surface].title}
              </Button>
            )}
            <h1 ref={pageHeading} tabIndex={-1}>
              {view && detail ? detail.name : surfaces[surface].title}
            </h1>
            <p>
              {view
                ? 'Configuration, readiness and workspace access.'
                : surfaces[surface].description}
            </p>
          </div>
          <Button
            disabled={!loaded || pending}
            onClick={() => open(view && detail ? detail : undefined)}
          >
            {view
              ? 'Edit configuration'
              : knowledge
                ? '+ Add source'
                : '+ Add connector'}
          </Button>
        </div>
        {notice && (
          <p role="status" className="resourceNotice">
            {notice}
          </p>
        )}
        {!view ? (
          <>
            <div className="surfaceSearch">
              <label htmlFor="resource-search">
                Search {surfaces[surface].title}
              </label>
              <input
                id="resource-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or description"
              />
            </div>
            <div className="filterRow" aria-label="Categories">
              {['All', ...categories].map((name) => (
                <FilterChip
                  key={name}
                  active={category === name}
                  onClick={() => setCategory(name)}
                >
                  {name}
                </FilterChip>
              ))}
            </div>
            <p role="status" className="surfaceMuted">
              {filtered.length} results
            </p>
            <div className="surfaceColumns">
              <div>
                {filtered.length ? (
                  <div className="surfaceCards">
                    {filtered.map((record) => (
                      <article className="agentCard" key={record.id}>
                        <ProviderLogo provider={record.provider} />
                        <h2>{record.name}</h2>
                        <p>{record.description}</p>
                        <span className="tag">
                          {record.connected
                            ? 'Configured · preview'
                            : record.category}
                        </span>
                        <Button
                          variant="link"
                          aria-expanded={selected === record.id}
                          aria-controls="registry-details"
                          onClick={() => setSelected(record.id)}
                        >
                          View {record.name} details →
                        </Button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <section className="panel">
                    <h2>No matching results</h2>
                    <p>Try another search or add a new {noun}.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearch('');
                        setCategory('All');
                      }}
                    >
                      Clear filters
                    </Button>
                  </section>
                )}
              </div>
              <aside
                className="panel surfaceAside"
                id="registry-details"
                aria-label="Selected resource details"
              >
                <h2>{knowledge ? 'Connected sources' : 'Connected tools'}</h2>
                <p>{connected.length} configured in this preview</p>
                {connected.length > 0 ? (
                  <ul className="resourceConnected">
                    {connected.map((record) => (
                      <li key={record.id}>
                        <Button
                          variant="link"
                          onClick={() => navigate(record.id)}
                        >
                          {record.name}
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    Your configured {knowledge ? 'sources' : 'connectors'} will
                    appear here.
                  </p>
                )}
                {detail && (
                  <>
                    <hr />
                    <div className="surfaceHeading">
                      <h2>{detail.name}</h2>
                      <Button
                        variant="secondary"
                        aria-label="Close resource details"
                        onClick={() => setSelected(null)}
                      >
                        ×
                      </Button>
                    </div>
                    <dl className="surfaceFacts">
                      <div>
                        <dt>Status</dt>
                        <dd>
                          {detail.connected
                            ? 'Configured · preview'
                            : 'Not connected'}
                        </dd>
                      </div>
                      <div>
                        <dt>{knowledge ? 'Permissions' : 'Authentication'}</dt>
                        <dd>
                          {knowledge ? detail.scope : detail.authentication}
                        </dd>
                      </div>
                    </dl>
                    <Button
                      variant="outline"
                      onClick={() => navigate(detail.id)}
                    >
                      Open {noun} details
                    </Button>
                    <Button onClick={() => open(detail)}>
                      {detail.connected
                        ? 'Edit configuration'
                        : 'Configure connection'}
                    </Button>
                  </>
                )}
              </aside>
            </div>
          </>
        ) : (
          detail && (
            <>
              <div
                className="resourceTabs"
                role="tablist"
                aria-label={`${knowledge ? 'Source' : 'Connector'} sections`}
              >
                {tabs.map((name, index) => (
                  <button
                    key={name}
                    role="tab"
                    id={`resource-tab-${index}`}
                    aria-selected={tab === name}
                    aria-controls="resource-panel"
                    tabIndex={tab === name ? 0 : -1}
                    onClick={() => setTab(name)}
                    onKeyDown={(e) => {
                      let next = index;
                      if (e.key === 'ArrowRight')
                        next = (index + 1) % tabs.length;
                      else if (e.key === 'ArrowLeft')
                        next = (index + tabs.length - 1) % tabs.length;
                      else if (e.key === 'Home') next = 0;
                      else if (e.key === 'End') next = tabs.length - 1;
                      else return;
                      e.preventDefault();
                      setTab(tabs[next]);
                      document.getElementById(`resource-tab-${next}`)?.focus();
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <section
                id="resource-panel"
                role="tabpanel"
                aria-labelledby={`resource-tab-${tabs.indexOf(tab)}`}
                tabIndex={0}
              >
                {tab === 'Overview' && (
                  <>
                    <div className="surfaceCards">
                      {[
                        [
                          'Status',
                          detail.connected
                            ? 'Configured · preview'
                            : 'Not connected',
                        ],
                        ['Readiness', detail.sync],
                        ['Scope', detail.scope],
                      ].map(([label, value]) => (
                        <article className="agentCard" key={label}>
                          <h2>{label}</h2>
                          <strong>{value}</strong>
                          <p>
                            {label === 'Readiness'
                              ? 'Preview state; no live health measurement.'
                              : `Owner: ${detail.owner}`}
                          </p>
                        </article>
                      ))}
                    </div>
                    <section className="panel resourceSection">
                      <h2>Next step</h2>
                      <p>
                        {detail.connected
                          ? knowledge
                            ? 'Review content and preview a synchronization.'
                            : 'Review the actions available to this workspace.'
                          : 'Configure this connection to explore the remaining steps.'}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          detail.connected
                            ? setTab(knowledge ? 'Content' : 'Actions')
                            : open(detail)
                        }
                      >
                        {detail.connected
                          ? 'Continue setup'
                          : 'Configure connection'}
                      </Button>
                    </section>
                  </>
                )}
                {tab === 'Connection' && (
                  <section className="panel">
                    <h2>Connection settings</h2>
                    <dl className="surfaceFacts">
                      {[
                        [
                          'Provider',
                          providers.find((p) => p.id === detail.provider)
                            ?.name ?? detail.provider,
                        ],
                        ['Location', detail.location || 'Not specified'],
                        ['Authentication', detail.authentication],
                        ['Owner', detail.owner],
                        ['Environment', detail.environment],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <Button onClick={() => open(detail)}>
                      Edit configuration
                    </Button>
                    {detail.connected && (
                      <Button
                        variant="secondary"
                        disabled={pending}
                        onClick={() => {
                          patch(detail.id, {
                            connected: false,
                            sync: 'Not synchronized',
                            events: [
                              ...detail.events,
                              'Disconnected · preview',
                            ],
                          });
                          setNotice(
                            'Connection disabled in this preview. Its configuration is retained for reconnection.',
                          );
                        }}
                      >
                        Disconnect preview
                      </Button>
                    )}
                    <p className="surfaceMuted">
                      No password, API key or OAuth token is collected in this
                      preview.
                    </p>
                  </section>
                )}
                {tab === 'Content' && (
                  <section className="panel">
                    <h2>Indexed content</h2>
                    {detail.sync === 'Ready' ? (
                      <>
                        <p>
                          Example content after a successful preview
                          synchronization.
                        </p>
                        <ul className="resourceContent">
                          {[
                            'Support handbook',
                            'Order support policy',
                            'Frequently asked questions',
                          ].map((name) => (
                            <li key={name}>
                              <strong>{name}</strong>
                              <span>Sample document · Ready</span>
                              <details>
                                <summary>Preview content</summary>
                                <p>
                                  This is an illustrative document entry. Your
                                  organization’s actual content will appear here
                                  after integration.
                                </p>
                              </details>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <>
                        <p>No indexed content in this preview yet.</p>
                        <Button
                          variant="outline"
                          disabled={!detail.connected}
                          onClick={() => setTab('Sync history')}
                        >
                          Preview first synchronization
                        </Button>
                        {!detail.connected && (
                          <p>Configure the connection first.</p>
                        )}
                      </>
                    )}
                  </section>
                )}
                {(tab === 'Sync history' || tab === 'Health') && (
                  <section className="panel">
                    <h2>
                      {knowledge
                        ? 'Synchronization history'
                        : 'Connection health'}
                    </h2>
                    <p>{detail.sync}</p>
                    <label className="resourceField">
                      Preview outcome
                      <select
                        value={outcome}
                        disabled={pending}
                        onChange={(e) => setOutcome(e.target.value)}
                      >
                        <option value="success">Successful</option>
                        <option value="failure">Authorization expired</option>
                      </select>
                    </label>
                    <Button
                      disabled={!detail.connected || pending}
                      onClick={simulate}
                    >
                      {pending
                        ? 'Running preview…'
                        : knowledge
                          ? 'Run sync preview'
                          : 'Test connection preview'}
                    </Button>
                    {!detail.connected && (
                      <p>Configure a connection before running the preview.</p>
                    )}
                    <ol className="resourceEvents">
                      {[...detail.events].reverse().map((event, index) => (
                        <li key={`${event}-${index}`}>{event}</li>
                      ))}
                    </ol>
                  </section>
                )}
                {tab === 'Actions' && (
                  <section>
                    <h2>Available actions</h2>
                    <p>
                      Technical availability and workspace selection are
                      separate. Selection here is a preview, not an execution
                      grant.
                    </p>
                    <div className="surfaceCards resourceSection">
                      {(
                        toolConnectors.find(
                          (tool) => tool.id === detail.provider,
                        )?.actions ?? []
                      ).map((action) => (
                        <article className="agentCard" key={action.id}>
                          <h3>{action.name}</h3>
                          <span className="tag">{action.access}</span>
                          <p>
                            {action.approved
                              ? 'Available in sample registry'
                              : 'Not approved in sample registry'}
                          </p>
                          <label className="resourceCheck">
                            <input
                              type="checkbox"
                              disabled={!detail.connected || !action.approved}
                              checked={detail.selectedActions.includes(
                                action.id,
                              )}
                              onChange={(e) =>
                                patch(detail.id, {
                                  selectedActions: e.target.checked
                                    ? [...detail.selectedActions, action.id]
                                    : detail.selectedActions.filter(
                                        (id) => id !== action.id,
                                      ),
                                })
                              }
                            />
                            Selected for workspace
                          </label>
                          <small>
                            {action.requiresApproval || detail.approval
                              ? 'Human approval required'
                              : 'Subject to agent governance'}
                          </small>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
                {tab === 'Permissions' && (
                  <section className="panel">
                    <h2>Access rules</h2>
                    <dl className="surfaceFacts">
                      <div>
                        <dt>Workspace scope</dt>
                        <dd>{detail.scope}</dd>
                      </div>
                      <div>
                        <dt>Authorization mode</dt>
                        <dd>
                          {knowledge
                            ? 'Source permissions must be respected.'
                            : 'Only selected, approved actions may be requested.'}
                        </dd>
                      </div>
                      <div>
                        <dt>Agents using this resource</dt>
                        <dd>No live assignments.</dd>
                      </div>
                    </dl>
                    {!knowledge && (
                      <label className="resourceCheck">
                        <input
                          type="checkbox"
                          checked={detail.approval}
                          disabled={!detail.connected}
                          onChange={(e) =>
                            patch(detail.id, { approval: e.target.checked })
                          }
                        />
                        Require human approval for selected actions
                      </label>
                    )}
                    <Button variant="outline" onClick={() => open(detail)}>
                      Review access configuration
                    </Button>
                  </section>
                )}
                {tab === 'Quality' && (
                  <section className="panel">
                    <h2>Quality checks</h2>
                    <p>
                      {detail.sync === 'Ready'
                        ? 'Sample content is ready for evaluation.'
                        : 'Synchronize content before reviewing quality.'}
                    </p>
                    <dl className="surfaceFacts">
                      <div>
                        <dt>Freshness</dt>
                        <dd>
                          {detail.sync === 'Ready'
                            ? 'Preview synchronization completed'
                            : 'Not measured'}
                        </dd>
                      </div>
                      <div>
                        <dt>Access validation</dt>
                        <dd>Requires source integration</dd>
                      </div>
                      <div>
                        <dt>Answer quality</dt>
                        <dd>
                          Requires evaluation against the connected content
                        </dd>
                      </div>
                    </dl>
                  </section>
                )}
                {tab === 'Usage' && (
                  <section className="panel">
                    <h2>Usage and agents</h2>
                    <p>No live agents use this {noun} yet.</p>
                    <p className="surfaceMuted">
                      Agent assignments and usage history will appear here. The
                      preview configuration is separate from your Launch Guide
                      selections.
                    </p>
                  </section>
                )}
              </section>
            </>
          )
        )}
        <dialog
          ref={dialog}
          className="resourceDialog"
          aria-labelledby="resource-wizard-title"
        >
          <div className="surfaceHeading">
            <div>
              <span className="eyebrow">
                {editing
                  ? 'EDIT CONFIGURATION'
                  : knowledge
                    ? 'ADD KNOWLEDGE SOURCE'
                    : 'ADD CONNECTOR'}
              </span>
              <h2 id="resource-wizard-title" ref={modalHeading} tabIndex={-1}>
                {steps[step]}
              </h2>
            </div>
            <Button
              variant="secondary"
              onClick={() => dialog.current?.close()}
              aria-label="Close configuration"
            >
              ×
            </Button>
          </div>
          <ol className="resourceSteps">
            {steps.map((name, index) => (
              <li key={name} aria-current={step === index ? 'step' : undefined}>
                {index + 1}. {name}
              </li>
            ))}
          </ol>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 3) save();
              else {
                setStep((value) => value + 1);
                requestAnimationFrame(() => modalHeading.current?.focus());
              }
            }}
          >
            {step === 0 && (
              <fieldset className="resourceProviders">
                <legend>Select a provider</legend>
                {providers.map((item) => (
                  <label
                    key={item.id}
                    className={form.provider === item.id ? 'chosen' : ''}
                  >
                    <input
                      type="radio"
                      name="provider"
                      required
                      value={item.id}
                      checked={form.provider === item.id}
                      onChange={() =>
                        setForm({
                          ...blankForm(),
                          provider: item.id,
                          name: item.name,
                        })
                      }
                    />
                    <ProviderLogo provider={item.id} />
                    <span>{item.name}</span>
                  </label>
                ))}
              </fieldset>
            )}
            {step === 1 && (
              <div className="resourceForm">
                <label className="resourceField">
                  {knowledge ? 'Source name' : 'Connector name'}
                  <input
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>
                <label className="resourceField">
                  {form.provider === 'api'
                    ? 'Server endpoint (example)'
                    : knowledge
                      ? 'Location or collection (optional)'
                      : 'Instance or workspace (optional)'}
                  <input
                    maxLength={2048}
                    type={form.provider === 'api' ? 'url' : 'text'}
                    placeholder={
                      form.provider === 'api'
                        ? 'https://example.com/mcp'
                        : knowledge
                          ? 'Support documents'
                          : 'acme.example.com'
                    }
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
                </label>
                <label className="resourceField">
                  Owner
                  <input
                    required
                    maxLength={120}
                    value={form.owner}
                    onChange={(e) =>
                      setForm({ ...form, owner: e.target.value })
                    }
                  />
                </label>
                <label className="resourceField">
                  Environment
                  <select
                    value={form.environment}
                    onChange={(e) =>
                      setForm({ ...form, environment: e.target.value })
                    }
                  >
                    {['Development', 'Test', 'Production'].map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </label>
                <p className="surfaceMuted">
                  Use example information. No connection will be made.
                </p>
              </div>
            )}
            {step === 2 && (
              <div className="resourceForm">
                <label className="resourceField">
                  Workspace scope
                  <select
                    value={form.scope}
                    onChange={(e) =>
                      setForm({ ...form, scope: e.target.value })
                    }
                  >
                    <option>Customer Service workspace</option>
                  </select>
                </label>
                <label className="resourceField">
                  Authentication method
                  <select
                    value={form.authentication}
                    onChange={(e) =>
                      setForm({ ...form, authentication: e.target.value })
                    }
                  >
                    <option>OAuth</option>
                    <option>Service account</option>
                    {form.provider === 'api' && <option>API token</option>}
                  </select>
                </label>
                <p>No credentials are required to explore this preview.</p>
                {knowledge ? (
                  <p>
                    Read-only source access. Existing source permissions must be
                    respected.
                  </p>
                ) : (
                  <fieldset>
                    <legend>Workspace actions</legend>
                    {available.map((action) => (
                      <label key={action.id} className="resourceCheck">
                        <input
                          type="checkbox"
                          disabled={!action.approved}
                          checked={form.selectedActions.includes(action.id)}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              selectedActions: e.target.checked
                                ? [...form.selectedActions, action.id]
                                : form.selectedActions.filter(
                                    (id) => id !== action.id,
                                  ),
                            })
                          }
                        />
                        {action.name} · {action.access}
                        {!action.approved ? ' · Not approved' : ''}
                      </label>
                    ))}
                    <label className="resourceCheck">
                      <input
                        type="checkbox"
                        checked={form.approval}
                        onChange={(e) =>
                          setForm({ ...form, approval: e.target.checked })
                        }
                      />
                      Require human approval
                    </label>
                  </fieldset>
                )}
              </div>
            )}
            {step === 3 && (
              <>
                <dl className="surfaceFacts">
                  {[
                    ['Name', form.name],
                    ['Provider', provider?.name ?? ''],
                    ['Workspace', form.scope],
                    ['Authentication', form.authentication],
                    ['Environment', form.environment],
                    [
                      'Access',
                      knowledge
                        ? 'Read-only'
                        : `${form.selectedActions.length} selected actions`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <p>
                  This saves a navigable preview in your current browser tab. It
                  does not connect a system or grant access.
                </p>
              </>
            )}
            <div className="resourceFooter">
              <Button
                variant="secondary"
                onClick={() =>
                  step > 0 ? setStep(step - 1) : dialog.current?.close()
                }
              >
                {step > 0 ? 'Back' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={
                  (step === 0 && !form.provider) ||
                  (step === 1 && (!form.name.trim() || !form.owner.trim()))
                }
              >
                {step === 3 ? 'Save preview' : 'Continue →'}
              </Button>
            </div>
          </form>
        </dialog>
      </div>
    </CapabilityNotice>
  );
}
