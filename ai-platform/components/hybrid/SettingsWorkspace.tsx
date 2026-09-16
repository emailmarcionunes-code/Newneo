'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, FormField } from '../UI';
import { Tabs, Panel, Feedback } from '../journeys/Shared';
import AccountSettings from '../AccountSettings';
import { PageTitle, Table, Status, DataNote } from './UI';
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
  const [org, setOrg] = useState('Acme Corp');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');
  const [users, setUsers] = useState([
    ['Ana Martinez', 'ana@acme.example', 'Admin', 'Active'],
    ['João Silva', 'joao@acme.example', 'AI Engineer', 'Active'],
    ['Taylor Ferreira', 'taylor@acme.example', 'Reviewer', 'Active'],
  ]);
  const [keys, setKeys] = useState([
    ['Analytics preview', 'Read only', '•••• DEMO', 'Active'],
  ]);
  const [keyName, setKeyName] = useState('');
  const [hook, setHook] = useState('');
  const [hooks, setHooks] = useState<string[]>([]);
  const [alerts, setAlerts] = useState([true, true, true, true, false]);
  const [tasks, setTasks] = useState([true, false, false, false, false]);
  useEffect(() => {
    const read = () => {
      const i = hashes.indexOf(location.hash.slice(1));
      if (i >= 0) setTab(names[i]);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  function choose(n: string) {
    setTab(n);
    history.replaceState(null, '', `#${hashes[names.indexOf(n)]}`);
    setMessage('');
  }
  return (
    <div className="surfacePage hybridPage">
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
              <h2>Organization profile</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setMessage('Organization profile saved for this preview.');
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
                    defaultValue="billing@acme.example"
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
            </section>
            <section className="panel">
              <h2>Plan & usage</h2>
              {[
                ['Agents deployed', 6, 20],
                ['Monthly tasks', 6912, 50000],
                ['Knowledge sources', 8, 25],
                ['Team members', users.length, 50],
              ].map(([k, n, max]) => (
                <label key={k} className="usageLine">
                  {k} · {n}/{max}
                  <progress
                    aria-label={String(k)}
                    value={Number(n)}
                    max={Number(max)}
                  />
                </label>
              ))}
            </section>
          </>
        ) : tab === 'Team & Roles' ? (
          <section className="panel">
            <h2>Team members</h2>
            <Table
              caption="Team members"
              headers={['Name', 'Email', 'Role', 'Status']}
              rows={users.map((u, i) => [
                u[0],
                u[1],
                <select
                  key="role"
                  aria-label={`Role for ${u[1]}`}
                  value={u[2]}
                  onChange={(e) => {
                    setUsers((v) =>
                      v.map((x, j) =>
                        j === i ? [x[0], x[1], e.target.value, x[3]] : x,
                      ),
                    );
                    setMessage(
                      'Role updated in preview only; no access granted.',
                    );
                  }}
                >
                  {['Admin', 'AI Engineer', 'Reviewer', 'Viewer'].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>,
                <Status key="s">{u[3]}</Status>,
              ])}
            />
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
                setMessage('Invitation added to preview. No email was sent.');
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
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  {['AI Engineer', 'Reviewer', 'Viewer'].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <Button type="submit">Add invitation preview</Button>
            </form>
            <p>
              Admins manage the organization. AI Engineers create versions.
              Reviewers approve changes. Viewers inspect approved data.
            </p>
          </section>
        ) : tab === 'API & Webhooks' ? (
          <>
            <section className="panel">
              <h2>API keys</h2>
              <Table
                caption="API keys"
                headers={['Name', 'Scope', 'Token', 'Status', 'Action']}
                rows={keys.map((k, i) => [
                  ...k.slice(0, 3),
                  <Status key="s">{k[3]}</Status>,
                  <Button
                    key="revoke"
                    variant="link"
                    disabled={k[3] === 'Revoked'}
                    onClick={() => {
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
              <form
                className="settingsInlineForm"
                onSubmit={(e) => {
                  e.preventDefault();
                  setKeys((v) => [
                    ...v,
                    [keyName, 'Read only', '•••• DEMO', 'Active'],
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
            </section>
            <section className="panel">
              <h2>Webhooks</h2>
              {hooks.length ? (
                <ul>
                  {hooks.map((u) => (
                    <li key={u}>
                      {u} · deployment.completed, evaluation.completed · Preview
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
              <select defaultValue="Daily">
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
          <section className="panel">
            <h2>Getting Started</h2>
            <p>Complete your workspace setup before inviting end users.</p>
            <progress
              aria-label="Onboarding progress"
              max={5}
              value={tasks.filter(Boolean).length}
            />
            {[
              ['Review organization profile', 'organization'],
              ['Invite your team', 'team'],
              ['Connect knowledge sources', '/knowledge'],
              ['Review approved tools', '/tools'],
              ['Launch your first agent', '/agents/catalog'],
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
            <p>{tasks.filter(Boolean).length} of 5 complete</p>
          </section>
        )}
      </Panel>
      <DataNote />
    </div>
  );
}
