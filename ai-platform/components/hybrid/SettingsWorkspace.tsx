'use client';
import { CapabilityNotice } from '../journeys/DemoExperience';
import { useEffect, useState } from 'react';
import { usePreviewValue } from '../journeys/PreviewState';
import Link from 'next/link';
import { Button, FormField } from '../UI';
import { Tabs, Panel, Feedback } from '../journeys/Shared';
import AccountSettings from '../AccountSettings';
import { PageTitle, Metrics, Table, Status, DataNote } from './UI';
const names = [
  'Organization',
  'Team & Roles',
  'API & Webhooks',
  'Integrations',
  'Notifications',
  'Getting Started',
];
const hashes = [
  'organization',
  'team',
  'api',
  'integrations',
  'notifications',
  'getting-started',
];
export default function SettingsWorkspace() {
  const [tab, setTab] = useState(names[0]);
  const [message, setMessage] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [billing, setBilling] = usePreviewValue(
    'settings:billing',
    'billing@acme.example',
  );
  const [teamView, setTeamView] = useState('Members');
  const [apiView, setApiView] = useState('API Keys');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [org, setOrg] = usePreviewValue('settings:org', 'Acme Corp');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');
  const [users, setUsers] = usePreviewValue('settings:users', [
    ['Ana Martinez', 'ana@acme.example', 'Admin', 'Active'],
    ['João Silva', 'joao@acme.example', 'AI Engineer', 'Active'],
    ['Taylor Ferreira', 'taylor@acme.example', 'Reviewer', 'Active'],
    ['Ana Costa', 'ana.costa@acme.example', 'AI Engineer', 'Active'],
    ['Rafael Lima', 'rafael@acme.example', 'Viewer', 'Active'],
    ['Thiago Ferreira', 'thiago@acme.example', 'AI Engineer', 'Active'],
    ['Lucas Rodrigues', 'lucas@acme.example', 'Viewer', 'Pending'],
  ]);
  const [keys, setKeys] = usePreviewValue('settings:keys', [
    ['prod-key-001', 'Production', '•••• DEMO 4a2f', 'Active'],
    ['prod-key-002', 'Production', '•••• DEMO 9c8d', 'Active'],
    ['prod-key-003', 'Production', '•••• DEMO 3b1e', 'Active'],
    ['staging-key-01', 'Staging', '•••• DEMO 7d4a', 'Active'],
    ['dev-key-legacy', 'Development', '•••• DEMO a1b2', 'Revoked'],
  ]);
  const [keyName, setKeyName] = useState('');
  const [hook, setHook] = useState('');
  const [digest, setDigest] = usePreviewValue('settings:digest', 'Daily');
  const [hooks, setHooks] = usePreviewValue<string[]>('settings:hooks', []);
  const [alerts, setAlerts] = usePreviewValue('settings:alerts', [
    true,
    true,
    true,
    true,
    false,
    false,
    false,
  ]);
  const [tasks, setTasks] = usePreviewValue('settings:tasks', [
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
  ]);
  useEffect(() => {
    const read = () => {
      const i = hashes.indexOf(location.hash.slice(1));
      if (i >= 0) setTab(names[i]);
    };
    read();
    window.addEventListener('hashchange', read);
    window.addEventListener('popstate', read);
    return () => {
      window.removeEventListener('hashchange', read);
      window.removeEventListener('popstate', read);
    };
  }, []);
  function choose(n: string) {
    setTab(n);
    history.pushState(null, '', `#${hashes[names.indexOf(n)]}`);
    setMessage('');
  }
  return (
    <CapabilityNotice cap="admin">
      <div className="surfacePage hybridPage settingsWorkspace">
        <PageTitle
          title="Organization Settings"
          description="Manage organization, access, integrations and workspace preferences."
        />
        <Tabs names={names} current={tab} onChange={choose} />
        <Feedback message={message} />
        <Panel names={names} current={tab}>
          {tab === 'Organization' ? (
            <>
              <section className="panel">
                <div className="surfaceHeading">
                  <h2>Organization profile</h2>
                  <Button
                    variant="link"
                    onClick={() => setEditingProfile((v) => !v)}
                  >
                    {editingProfile ? 'Close editor' : 'Edit profile'}
                  </Button>
                </div>
                {!editingProfile ? (
                  <dl className="organizationFacts">
                    {[
                      ['Organization name', org],
                      ['Plan', 'Enterprise'],
                      ['Region', 'EU (Frankfurt)'],
                      ['Billing email', billing],
                      ['Organization ID', 'org_acme_prod_7f3c'],
                      ['Created', 'October 2025'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setMessage(
                        'Organization profile saved for this preview.',
                      );
                    }}
                  >
                    <div className="missionRow">
                      <FormField
                        id="org-name"
                        label="Organization name"
                        value={org}
                        required
                        onChange={(e) => setOrg(e.target.value)}
                      />
                      <FormField
                        id="billing-email"
                        label="Billing email"
                        type="email"
                        value={billing}
                        onChange={(e) => setBilling(e.target.value)}
                        required
                      />
                    </div>
                    <dl className="surfaceFacts">
                      {[
                        ['Plan', 'Enterprise'],
                        ['Region', 'EU (Frankfurt)'],
                        ['Created', 'October 2025'],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <Button type="submit">Save profile</Button>
                  </form>
                )}
              </section>
              <div className="hybridSplit equal">
                <section className="panel">
                  <h2>Plan & usage</h2>
                  {[
                    ['Agents deployed', 6, 20],
                    ['Monthly tasks', 6912, 50000],
                    ['Knowledge sources', 7, 25],
                    [
                      'Team members',
                      users.filter((u) => u[3] === 'Active').length,
                      50,
                    ],
                  ].map(([k, n, max]) => (
                    <label key={k} className="usageLine">
                      <span>
                        {k}
                        <small>
                          {Number(n).toLocaleString('en-US')} /{' '}
                          {Number(max).toLocaleString('en-US')}
                        </small>
                      </span>
                      <progress
                        aria-label={String(k)}
                        value={Number(n)}
                        max={Number(max)}
                      />
                    </label>
                  ))}
                </section>
                <section className="panel">
                  <h2>Notifications</h2>
                  {[
                    ['Agent incidents', 'Alert when an agent degrades', 0],
                    ['Governance alerts', 'Policy violations and breaches', 3],
                    ['Eval failures', 'When a test suite fails', 2],
                    ['Cost overruns', 'When budget threshold exceeded', 5],
                    ['Weekly digest', 'Summary email every Monday', 6],
                  ].map(([label, note, index]) => (
                    <label key={String(label)} className="notificationChoice">
                      <input
                        type="checkbox"
                        role="switch"
                        aria-label={String(label)}
                        checked={alerts[Number(index)]}
                        onChange={(e) =>
                          setAlerts((v) =>
                            v.map((x, j) =>
                              Number(index) === j ? e.target.checked : x,
                            ),
                          )
                        }
                      />
                      <span>{label}</span>
                      <small>{note}</small>
                    </label>
                  ))}
                  <Button
                    variant="link"
                    onClick={() => choose('Notifications')}
                  >
                    Notification preferences →
                  </Button>
                </section>
              </div>
            </>
          ) : tab === 'Team & Roles' ? (
            <>
              <div className="hybridControls">
                <div className="filterRow">
                  {['Members', 'Roles & permissions'].map((v) => (
                    <Button
                      key={v}
                      variant={teamView === v ? 'primary' : 'secondary'}
                      onClick={() => setTeamView(v)}
                      aria-pressed={teamView === v}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => setInviteOpen((v) => !v)}>
                  + Invite member
                </Button>
              </div>
              <Metrics
                items={[
                  ['Total members', String(users.length)],
                  [
                    'Active',
                    String(users.filter((u) => u[3] === 'Active').length),
                  ],
                  [
                    'Pending',
                    String(users.filter((u) => u[3] === 'Pending').length),
                  ],
                  [
                    'Admins',
                    String(users.filter((u) => u[2] === 'Admin').length),
                  ],
                ]}
              />
              <section className="panel">
                <h2>
                  {teamView === 'Members'
                    ? 'Team members'
                    : 'Roles & permissions'}
                </h2>
                {teamView === 'Members' ? (
                  <>
                    <Table
                      caption="Team members"
                      headers={[
                        'Member',
                        'Role',
                        'Status',
                        'Agents',
                        'Last seen',
                        'Joined',
                      ]}
                      rows={users.map((u, i) => [
                        <span key="member">
                          <strong>{u[0]}</strong>
                          <small className="tableSecondary">{u[1]}</small>
                        </span>,
                        <select
                          key="role"
                          aria-label={`Role for ${u[1]}`}
                          value={u[2]}
                          onChange={(e) => {
                            setUsers((v) =>
                              v.map((x, j) =>
                                j === i
                                  ? [x[0], x[1], e.target.value, x[3]]
                                  : x,
                              ),
                            );
                            setMessage(
                              'Role updated in preview only; no access granted.',
                            );
                          }}
                        >
                          {['Admin', 'AI Engineer', 'Reviewer', 'Viewer'].map(
                            (r) => (
                              <option key={r}>{r}</option>
                            ),
                          )}
                        </select>,
                        <Status key="s">{u[3]}</Status>,
                        u[3] === 'Pending'
                          ? '0'
                          : String([6, 3, 2, 3, 1, 2][i % 6]),
                        u[3] === 'Pending' ? '—' : 'Today 14:30',
                        i > 5 ? 'Sep 2026' : 'Jan 2025',
                      ])}
                    />
                  </>
                ) : (
                  <Table
                    caption="Roles and permissions"
                    headers={['Role', 'Access', 'Production changes']}
                    rows={[
                      [
                        'Admin',
                        'Organization, members and approved resources',
                        'Approve versions; never edit Production directly',
                      ],
                      [
                        'AI Engineer',
                        'Create agents, draft versions and evaluations',
                        'Submit for approval',
                      ],
                      [
                        'Reviewer',
                        'Inspect evaluation evidence and policies',
                        'Approve or reject a version',
                      ],
                      ['Viewer', 'Read approved operational data', 'Read only'],
                    ]}
                  />
                )}
                {inviteOpen && (
                  <>
                    <h3>Invite member preview</h3>
                    <form
                      className="settingsInlineForm"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setUsers((u) => [
                          ...u,
                          [email.split('@')[0], email, role, 'Pending'],
                        ]);
                        setEmail('');
                        setMessage(
                          'Invitation added to preview. No email was sent.',
                        );
                      }}
                    >
                      <FormField
                        id="invite-email"
                        type="email"
                        label="Work email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <label className="journeyField">
                        Role
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        >
                          {['AI Engineer', 'Reviewer', 'Viewer'].map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </label>
                      <Button type="submit">Add invitation preview</Button>
                    </form>
                  </>
                )}
                <p>
                  Admins manage the organization. AI Engineers create versions.
                  Reviewers approve changes. Viewers inspect approved data.
                </p>
              </section>
            </>
          ) : tab === 'API & Webhooks' ? (
            <>
              <div className="hybridControls">
                <div className="filterRow">
                  {['API Keys', 'Webhooks'].map((v) => (
                    <Button
                      key={v}
                      variant={apiView === v ? 'primary' : 'secondary'}
                      aria-pressed={apiView === v}
                      onClick={() => setApiView(v)}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    setApiView('API Keys');
                    setKeyOpen((v) => !v);
                  }}
                >
                  + New API key
                </Button>
              </div>
              <Metrics
                items={[
                  ['API calls today', '44.3K'],
                  [
                    'Active keys',
                    String(keys.filter((k) => k[3] === 'Active').length),
                  ],
                  [
                    'Production keys',
                    String(
                      keys.filter(
                        (k) => k[1] === 'Production' && k[3] === 'Active',
                      ).length,
                    ),
                  ],
                ]}
              />
              {apiView === 'API Keys' ? (
                <section className="panel">
                  <h2>API keys</h2>
                  <Table
                    caption="API keys"
                    headers={[
                      'Name',
                      'Environment',
                      'Key',
                      'Calls',
                      'Last used',
                      'Status',
                      'Action',
                    ]}
                    rows={keys.map((k, i) => [
                      ...k.slice(0, 3),
                      ['28,491', '15,820', '127', '4,210', '210'][i] ?? '0',
                      i < 3
                        ? 'Today 14:34'
                        : i === 3
                          ? 'Yesterday'
                          : i === 4
                            ? '30 days ago'
                            : 'Never',
                      <Status key="s">{k[3]}</Status>,
                      <Button
                        key="revoke"
                        variant="link"
                        disabled={k[3] === 'Revoked'}
                        onClick={() => {
                          if (
                            !window.confirm(`Revoke ${k[0]} in this preview?`)
                          )
                            return;
                          setKeys((v) =>
                            v.map((x, j) =>
                              j === i ? [x[0], x[1], x[2], 'Revoked'] : x,
                            ),
                          );
                          setMessage(
                            'Preview key revoked. No real credential existed.',
                          );
                        }}
                      >
                        Revoke preview
                      </Button>,
                    ])}
                  />
                  {keyOpen && (
                    <form
                      className="settingsInlineForm"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setKeys((v) => [
                          ...v,
                          [keyName, 'Development', '•••• DEMO', 'Active'],
                        ]);
                        setKeyName('');
                        setMessage(
                          'Nonfunctional preview key added; no credential generated.',
                        );
                      }}
                    >
                      <FormField
                        id="key-name"
                        label="Key name"
                        value={keyName}
                        required
                        onChange={(e) => setKeyName(e.target.value)}
                      />
                      <Button type="submit">Create key preview</Button>
                    </form>
                  )}
                </section>
              ) : (
                <section className="panel">
                  <h2>Webhooks</h2>
                  {hooks.length ? (
                    <ul>
                      {hooks.map((u) => (
                        <li key={u}>
                          {u} · deployment.completed, evaluation.completed ·
                          Preview
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="hybridEmpty">
                      No webhook destinations. Add a preview endpoint to review
                      event configuration.
                    </p>
                  )}
                  <form
                    className="settingsInlineForm"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setHooks((v) => [...v, hook]);
                      setHook('');
                      setMessage('Webhook saved locally. No request was sent.');
                    }}
                  >
                    <FormField
                      id="webhook-url"
                      label="HTTPS endpoint"
                      type="url"
                      pattern="https://.*"
                      placeholder="https://example.com/events"
                      value={hook}
                      required
                      onChange={(e) => setHook(e.target.value)}
                    />
                    <Button type="submit">Add webhook preview</Button>
                  </form>
                </section>
              )}
            </>
          ) : tab === 'Integrations' ? (
            <>
              <section className="panel">
                <h2>Enterprise integrations</h2>
                <Table
                  caption="Enterprise integrations"
                  headers={['Integration', 'State', 'Manage']}
                  rows={[
                    [
                      'Knowledge sources',
                      '7 reference sources',
                      <Link key="k" href="/knowledge">
                        Manage sources →
                      </Link>,
                    ],
                    [
                      'Tools & MCP',
                      'Approved action catalog',
                      <Link key="t" href="/tools">
                        Manage tools →
                      </Link>,
                    ],
                    [
                      'Foundation models',
                      '6 approved reference profiles',
                      <Link key="m" href="/models">
                        Model endpoints →
                      </Link>,
                    ],
                  ]}
                />
              </section>
              <AccountSettings />
            </>
          ) : tab === 'Notifications' ? (
            <section className="panel">
              <h2>Notification preferences</h2>
              <p>Choose which workspace events appear in your inbox.</p>
              {[
                'Incidents',
                'Deployments',
                'Evaluations',
                'Governance',
                'Knowledge sync',
                'Cost overruns',
                'Weekly digest',
              ].map((n, i) => (
                <label className="notificationChoice" key={n}>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={alerts[i]}
                    onChange={(e) =>
                      setAlerts((v) =>
                        v.map((x, j) => (j === i ? e.target.checked : x)),
                      )
                    }
                  />
                  {n}
                </label>
              ))}
              <label className="journeyField">
                Digest frequency
                <select
                  value={digest}
                  onChange={(e) => setDigest(e.target.value)}
                >
                  <option>Immediately</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                </select>
              </label>
              <Button
                onClick={() =>
                  setMessage(
                    'Notification preferences saved in preview; no notifications are sent.',
                  )
                }
              >
                Save preferences
              </Button>
            </section>
          ) : (
            <>
              <section className="onboardingBanner">
                <div>
                  <small>ACME CORP · ENTERPRISE PLAN</small>
                  <h2>Getting started with Newneo</h2>
                  <p>
                    Complete the checklist to fully activate your enterprise AI
                    platform.
                  </p>
                </div>
                <div>
                  <strong>
                    {Math.round(
                      (tasks.filter(Boolean).length / tasks.length) * 100,
                    )}
                    %
                  </strong>
                  <small>complete</small>
                </div>
              </section>
              <div className="hybridSplit">
                <section className="panel">
                  <h2>Setup checklist</h2>
                  <progress
                    className="srOnly"
                    aria-label="Onboarding progress"
                    max={tasks.length}
                    value={tasks.filter(Boolean).length}
                  />
                  {[
                    ['Workspace configured', 'organization'],
                    ['SSO configured', 'integrations'],
                    ['Connect a knowledge source', '/knowledge'],
                    ['Create your first agent', '/agents/catalog'],
                    ['Set a governance policy', '/governance'],
                    ['Run your first evaluation', '/evaluations'],
                    ['Deploy to production', '/deployments'],
                    ['Invite your team', 'team'],
                    ['Review audit log', '/audit-log'],
                    ['Create a production API key', 'api'],
                    ['Schedule a weekly report', '/reports?schedule=1'],
                    ['Set a cost budget alert', '/finops'],
                  ].map(([n, to], i) => (
                    <div className="onboardingTask" key={n}>
                      <label>
                        <input
                          type="checkbox"
                          checked={tasks[i]}
                          onChange={(e) =>
                            setTasks((v) =>
                              v.map((x, j) => (j === i ? e.target.checked : x)),
                            )
                          }
                        />
                        {n}
                      </label>
                      {to.startsWith('/') ? (
                        <Link href={to}>Open →</Link>
                      ) : (
                        <Button
                          variant="link"
                          onClick={() => choose(names[hashes.indexOf(to)])}
                        >
                          Open →
                        </Button>
                      )}
                    </div>
                  ))}
                  <p>
                    {tasks.filter(Boolean).length} of {tasks.length} complete ·
                    reference workspace
                  </p>
                </section>
                <aside>
                  <section className="panel learningResources">
                    <h2>Learning resources</h2>
                    {[
                      ['Browse agent templates', '/agents/catalog'],
                      ['Review governance policies', '/governance'],
                      ['Manage evaluations', '/evaluations'],
                      ['API keys & webhooks', '#api'],
                      ['Review AI costs', '/finops'],
                      ['Enterprise integrations', '#integrations'],
                    ].map(([label, to]) => (
                      <a key={label} href={to}>
                        {label} →
                      </a>
                    ))}
                  </section>
                  <section className="panel">
                    <h2>Next recommended</h2>
                    <h3>Invite your team</h3>
                    <p>
                      Add engineers, analysts and admins to collaborate on
                      agents and policies.
                    </p>
                    <Button
                      onClick={() => {
                        choose('Team & Roles');
                        setInviteOpen(true);
                      }}
                    >
                      Invite members
                    </Button>
                  </section>
                </aside>
              </div>
            </>
          )}
        </Panel>
        <DataNote />
      </div>
    </CapabilityNotice>
  );
}
