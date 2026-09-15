'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from './UI';

const tabs = [
  'Overview',
  'Configuration',
  'Knowledge',
  'Tools',
  'Evaluations',
  'Versions',
  'Activity',
  'AgentOps',
] as const;
type Tab = (typeof tabs)[number];
const sources = [
  [
    'Support documentation',
    'Document collection',
    'Ready',
    'Read-only · Customer Service workspace',
  ],
  [
    'Order support policy',
    'Policy document',
    'Update recommended',
    'Read-only · Customer Service workspace',
  ],
  [
    'Frequently asked questions',
    'Knowledge base',
    'Ready',
    'Read-only · Customer Service workspace',
  ],
];
const actions = [
  ['Search Incident', 'Read', 'Search incidents within the workspace scope.'],
  [
    'Create Incident',
    'Write · approval required',
    'Create a support ticket after human approval.',
  ],
  [
    'Update Incident',
    'Write · approval required',
    'Update an existing ticket after human approval.',
  ],
];
export default function AgentDetail() {
  const [tab, setTab] = useState<Tab>('Overview');
  const [draft, setDraft] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [answer, setAnswer] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  function testAgent() {
    setTestOpen(true);
    setAnswer(false);
    dialog.current?.showModal();
  }
  function closeTest() {
    dialog.current?.close();
    setTestOpen(false);
  }
  return (
    <div className="agentDetail">
      <Link className="agentLaunch" href="/">
        ← Back to Overview
      </Link>
      <div className="pageHead">
        <div>
          <span className="eyebrow">AGENT DETAIL</span>
          <h1>Customer Service Agent</h1>
          <p>Answer questions, resolve issues and create support tickets.</p>
        </div>
        <div className="detailActions">
          <Button variant="secondary" onClick={testAgent}>
            Test
          </Button>
          <Button
            onClick={() => {
              setDraft(true);
              setTab('Versions');
            }}
          >
            Create New Version
          </Button>
        </div>
      </div>
      <div className="detailNotice">
        <strong>Demo agent · illustrative data</strong>
        <p>
          No agent is deployed. Tests and version creation below are local
          previews; no live changes are made.
        </p>
      </div>
      <dl className="detailIdentity">
        {[
          ['Status', 'Production · sample'],
          ['Current version', 'v1.2'],
          ['Environment', 'Production · sample'],
          ['Owner', 'Ana Martinez'],
          ['Health', 'Needs review'],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="detailLifecycle">
        <div className="detailActions">
          {['Promote', 'Rollback', 'Pause'].map((action) => (
            <Button
              variant="secondary"
              key={action}
              disabled
              aria-describedby="lifecycle-note"
            >
              {action}
            </Button>
          ))}
        </div>
        <p id="lifecycle-note">
          Live lifecycle actions require a connected runtime and authorization.
        </p>
      </div>
      <div role="tablist" aria-label="Agent details" className="detailTabs">
        {tabs.map((name, index) => (
          <button
            key={name}
            type="button"
            role="tab"
            id={`tab-${name}`}
            aria-selected={tab === name}
            aria-controls="agent-panel"
            tabIndex={tab === name ? 0 : -1}
            onClick={() => setTab(name)}
            onKeyDown={(event) => {
              let target = index;
              if (event.key === 'ArrowRight')
                target = (index + 1) % tabs.length;
              else if (event.key === 'ArrowLeft')
                target = (index + tabs.length - 1) % tabs.length;
              else if (event.key === 'Home') target = 0;
              else if (event.key === 'End') target = tabs.length - 1;
              else return;
              event.preventDefault();
              setTab(tabs[target]);
              document.getElementById(`tab-${tabs[target]}`)?.focus();
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <section
        id="agent-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
      >
        {tab === 'Overview' && (
          <>
            <div className="detailCards">
              {[
                [
                  'Task Success',
                  '92%',
                  'Reference result · not live telemetry',
                ],
                ['Evaluation Score', '92%', 'Latest sample evaluation'],
                [
                  'Human Escalation Rate',
                  '8%',
                  'Illustrative support activity',
                ],
              ].map(([label, value, note]) => (
                <article className="agentCard" key={label}>
                  <h2>{label}</h2>
                  <strong className="detailValue">{value}</strong>
                  <p>{note}</p>
                </article>
              ))}
            </div>
            <section className="panel detailSection">
              <h2>Needs attention</h2>
              <p>
                The candidate version has evaluation cases requiring review.
                Production configuration remains unchanged.
              </p>
              <Button variant="outline" onClick={() => setTab('Evaluations')}>
                Review evaluation results
              </Button>
            </section>
          </>
        )}
        {tab === 'Configuration' && (
          <section className="panel">
            <h2>Current configuration · v1.2</h2>
            <p className="detailMuted">
              Read-only production reference. Changes must go into a new
              version.
            </p>
            <dl className="detailRows">
              {[
                [
                  'Business objective',
                  'Resolve customer support questions using approved knowledge.',
                ],
                ['Intended users', 'Customer Service team'],
                [
                  'Expected outcome',
                  'Resolve support cases and reduce manual handling.',
                ],
                ['Runtime', 'Organization default · Customer Cloud'],
                ['Model', 'GPT-4o · approved endpoint'],
                [
                  'Governance',
                  'Read approved sources; ticket writes require human approval.',
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <Button
              onClick={() => {
                setDraft(true);
                setTab('Versions');
              }}
            >
              Create New Version
            </Button>
          </section>
        )}
        {tab === 'Knowledge' && (
          <div className="detailConnections">
            <div className="detailCards">
              {sources.map(([name, type, status, scope]) => (
                <article className="agentCard" key={name}>
                  <h2>{name}</h2>
                  <span className="tag">{type}</span>
                  <strong>{status}</strong>
                  <p>{scope}</p>
                  <small>Sample source · no live synchronization</small>
                </article>
              ))}
            </div>
            <aside className="panel detailSummary">
              <h2>Connected sources</h2>
              <p>3 sample connections</p>
              <ul>
                {sources.map(([name]) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </aside>
          </div>
        )}
        {tab === 'Tools' && (
          <div className="detailConnections">
            <div className="detailCards">
              {actions.map(([name, permission, description]) => (
                <article className="agentCard" key={name}>
                  <span className="eyebrow">SERVICENOW</span>
                  <h2>{name}</h2>
                  <span className="tag">{permission}</span>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <aside className="panel detailSummary">
              <h2>Connected tools</h2>
              <p>ServiceNow · 3 sample actions</p>
              <p>No live credentials or action execution.</p>
              <h3>MCP servers</h3>
              <p>No MCP server connected.</p>
            </aside>
          </div>
        )}
        {tab === 'Evaluations' && (
          <section className="panel">
            <h2>Candidate v1.3 · evaluation reference</h2>
            <p className="detailMuted">
              Fixed demonstration results, not an evaluation of a real agent.
            </p>
            <div className="detailCards detailSection">
              {[
                ['Passed', '46'],
                ['Needs review', '3'],
                ['Failed', '1'],
              ].map(([label, value]) => (
                <article className="agentCard" key={label}>
                  <h3>{label}</h3>
                  <strong className="detailValue">{value}</strong>
                  <p>Of 50 sample test cases</p>
                </article>
              ))}
            </div>
            <p>
              Review failed cases before requesting promotion. No production
              approval is granted by this preview.
            </p>
            <Button variant="outline" onClick={testAgent}>
              Open test preview
            </Button>
          </section>
        )}
        {tab === 'Versions' && (
          <section className="panel">
            <h2>Versions</h2>
            {draft && (
              <div role="status" className="detailNotice">
                <strong>New version draft prepared · local preview</strong>
                <p>
                  Based on v1.2. The production reference is unchanged. This
                  draft is not saved and will be cleared on reload.
                </p>
              </div>
            )}
            <div className="detailTableWrap" tabIndex={0} role="region" aria-label="Version history">
              <table>
                <caption>Illustrative version history</caption>
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>State</th>
                    <th>Environment</th>
                    <th>Evaluation</th>
                  </tr>
                </thead>
                <tbody>
                  {draft && (
                    <tr>
                      <td>New draft</td>
                      <td>Local preview</td>
                      <td>Development</td>
                      <td>Not evaluated</td>
                    </tr>
                  )}
                  <tr>
                    <td>v1.3</td>
                    <td>Candidate</td>
                    <td>Test</td>
                    <td>Needs review</td>
                  </tr>
                  <tr>
                    <td>v1.2</td>
                    <td>Current reference</td>
                    <td>Production</td>
                    <td>Passed · sample</td>
                  </tr>
                  <tr>
                    <td>v1.1</td>
                    <td>Archived</td>
                    <td>Production</td>
                    <td>Passed · sample</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
        {tab === 'Activity' && (
          <section className="panel">
            <h2>Activity</h2>
            <p className="detailMuted">Illustrative timeline</p>
            <ol className="detailTimeline">
              {[
                [
                  '2 hours ago',
                  'Version v1.2 deployed',
                  'Production reference updated.',
                ],
                [
                  '4 hours ago',
                  'Candidate v1.3 evaluated',
                  'One failed case and three cases requiring review.',
                ],
                [
                  'Yesterday',
                  'Approval policy updated',
                  'Human approval required for ticket writes.',
                ],
              ].map(([time, title, note]) => (
                <li key={title}>
                  <small>{time} · sample</small>
                  <h3>{title}</h3>
                  <p>{note}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
        {tab === 'AgentOps' && (
          <section className="panel">
            <h2>AgentOps</h2>
            <p>Execution monitoring is not connected for this demo agent.</p>
            <p className="detailMuted">
              Runs, traces and operational incidents will appear here once a
              runtime is connected.
            </p>
          </section>
        )}
      </section>
      <dialog
        ref={dialog}
        className="detailTest"
        onCancel={() => setTestOpen(false)}
      >
        <div className="overviewSectionHead">
          <h2>Test preview</h2>
          <Button variant="secondary" onClick={closeTest}>
            Close
          </Button>
        </div>
        {testOpen && (
          <>
            <p>Fixed sample conversation. No model or tool is called.</p>
            <Button variant="outline" onClick={() => setAnswer(true)}>
              How can I get help with an order?
            </Button>
            {answer && (
              <div role="status" className="detailNotice">
                <strong>Sample response</strong>
                <p>
                  Please provide your order reference so the support team can
                  help you check its status.
                </p>
              </div>
            )}
          </>
        )}
      </dialog>
    </div>
  );
}
