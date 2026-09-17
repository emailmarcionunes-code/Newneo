'use client';
import { useDemoAccess } from '../journeys/DemoExperience';
import { useWorkspaceAgents } from '../journeys/WorkspaceAgents';
import AgentWorkspace from './AgentWorkspace';
import { evaluationScenarios } from '@/lib/readiness';
import {
  previewSourceRows,
  sourceAgents,
  sourceDocuments,
} from '@/lib/source-preview';
import { sourceProfiles } from '@/lib/resource-profiles';
import { useState } from 'react';
import Link from 'next/link';
import { notFound, useSearchParams } from 'next/navigation';
import {
  deploymentRecords,
  evaluationRecords,
  productionVersion,
} from '@/lib/preview-records';
import { hybridAgents, sourceRows, actionRows } from '@/lib/hybrid-data';
import { Button, FormField } from '../UI';
import { Tabs, Panel, Feedback } from '../journeys/Shared';
import { usePreview, usePreviewValue } from '../journeys/PreviewState';
import { PageTitle, Metrics, Table, Status, DataNote, Bars } from './UI';
export default function HybridDetail({
  kind,
  id,
}: {
  kind: string;
  id: string;
}) {
  const hybridAgents = useWorkspaceAgents();
  const { can } = useDemoAccess();
  const { state, update, ready } = usePreview();
  const query = useSearchParams();
  const sourceRows = previewSourceRows(state.ui);
  const releaseId = query.get('release');
  const runId = query.get('run');
  const referenceRelease = deploymentRecords.find(
    (r) => r.agentId === id && (!releaseId || r.id === releaseId),
  );
  const currentRelease = state.releases.find(
    (r) =>
      (!releaseId || r.id === releaseId) &&
      (r.agentId || 'customer-service') === id,
  );
  const releaseVersion =
    currentRelease?.version ||
    referenceRelease?.version ||
    productionVersion(id);
  const releaseEnvironment =
    currentRelease?.target || referenceRelease?.environment || 'Production';
  const recordId = releaseId || referenceRelease?.id || id;
  const run =
    state.runs.find(
      (r) => r.id === runId && (r.agentId || 'customer-service') === id,
    ) || evaluationRecords(id).find((r) => !runId || r.id === runId);

  const [tab, setTab] = useState(
    kind === 'knowledge' && query.get('tab') === 'Sync' ? 'Sync' : 'Overview',
  );
  const [message, setMessage] = useState('');
  const [storedStatus, setStoredStatus] = usePreviewValue(
    `deployment:${recordId}:status`,
    referenceRelease?.status || 'Success',
  );
  const status =
    kind === 'incidents'
      ? state.incidentStates[id] ||
        (id === 'inc-002' ? 'Investigating' : 'Open')
      : currentRelease?.state || storedStatus;
  function setStatus(value: string) {
    if (kind === 'incidents')
      update((s) => ({
        ...s,
        incidentStates: { ...s.incidentStates, [id]: value },
      }));
    else if (currentRelease)
      update((s) => ({
        ...s,
        releases: s.releases.map((r) =>
          r.id === recordId ? { ...r, state: value as typeof r.state } : r,
        ),
      }));
    else setStoredStatus(value);
  }
  const [syncing, setSyncing] = useState(false);
  const policyNames: Record<string, string> = {
    '0': 'Audit Logging',
    pii: 'PII Data Protection',
    '2': 'Role-Based Access',
    '3': 'Human-in-the-Loop',
    '4': 'Data Residency (EU)',
    '5': 'Rate Limiting',
  };
  const [policy, setPolicy] = usePreviewValue(
    `policy:${id}:name`,
    policyNames[id] ?? '',
  );
  const [description, setDescription] = usePreviewValue(
    `policy:${id}:description`,
    id === 'pii'
      ? 'Detect, mask and handle personal data according to GDPR / LGPD policy.'
      : id === '0'
        ? 'Retain an auditable record of agent actions and approvals.'
        : id === '2'
          ? 'Limit agent access to authorized organization roles.'
          : id === '3'
            ? 'Require human approval before sensitive actions execute.'
            : id === '4'
              ? 'Keep processing and storage inside approved EU regions.'
              : 'Limit per-user request volume within approved quotas.',
  );
  const [mode, setMode] = usePreviewValue(`policy:${id}:mode`, 'Enforce');
  if (
    (ready &&
      ['agents', 'evaluations', 'deployments'].includes(kind) &&
      !hybridAgents.some((a) => a.id === id)) ||
    (ready && kind === 'knowledge' && !sourceRows.some((r) => r[0] === id)) ||
    (kind === 'tools' && !actionRows.some((r) => r[0] === id)) ||
    (kind === 'policies' && !policyNames[id]) ||
    (kind === 'incidents' && !['inc-001', 'inc-002'].includes(id))
  )
    notFound();
  const baseAgent = hybridAgents.find((a) => a.id === id) ?? hybridAgents[0];
  const agent =
    kind === 'evaluations' && run
      ? { ...baseAgent, score: run.score }
      : baseAgent;
  if (
    ready &&
    ((kind === 'evaluations' && runId && !run) ||
      (kind === 'deployments' &&
        releaseId &&
        !currentRelease &&
        !referenceRelease))
  )
    notFound();
  function act(text: string) {
    setMessage(`${text} · preview only.`);
    update((s) => ({ ...s, audit: [`${text} · preview`, ...s.audit] }));
  }
  if (!ready && id.startsWith('preview-'))
    return <p role="status">Loading agent…</p>;
  if (kind === 'agents') return <AgentWorkspace agent={agent} />;
  if (kind === 'knowledge') {
    const r = sourceRows.find((r) => r[0] === id) ?? sourceRows[0];
    const names = ['Overview', 'Documents', 'Sync'];
    const linkedAgents = sourceAgents[id] || [];
    const documents =
      r[5] === 'Live' ? sourceDocuments[id] || [`${r[1]} sample document`] : [];
    return (
      <div className={`surfacePage hybridPage detailPage ${kind}Detail`}>
        <PageTitle
          title={r[1]}
          description={`Last synced ${r[4]} · ${r[3]} documents · ${linkedAgents.length} agents`}
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
                  ['Agents using', String(linkedAgents.length)],
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
                        sourceProfiles[id]?.description ??
                          'Approved organization source',
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
                  {linkedAgents.length ? (
                    linkedAgents.map((agentId) => (
                      <p key={agentId}>
                        <Link href={`/agents/${agentId}`}>
                          {hybridAgents.find((a) => a.id === agentId)?.name} →
                        </Link>
                      </p>
                    ))
                  ) : (
                    <p>No agents use this source yet.</p>
                  )}
                </section>
              </div>
              <section className="panel">
                <Bars
                  semantics="quality"
                  items={[
                    ['Index coverage for connected agents', parseInt(r[7])],
                  ]}
                />
                <p>
                  {parseInt(r[7]) >= 80
                    ? 'Healthy coverage.'
                    : 'Coverage needs attention.'}{' '}
                  Review freshness and source permissions.
                </p>
              </section>
            </>
          ) : tab === 'Documents' ? (
            <Table
              caption="Indexed documents"
              headers={['Document', 'Status', 'Updated']}
              emptyMessage={
                r[5] === 'Error'
                  ? 'Source needs attention. Restore access and synchronize before documents are available.'
                  : 'No indexed documents. Synchronize this source first.'
              }
              rows={documents.map((d) => [d, 'Indexed', r[4]])}
            />
          ) : (
            <section className="panel">
              <h2>Sync history</h2>
              <p>
                Last sync: {r[4]} · {r[5]}
              </p>
              <Button
                disabled={syncing || !(can('operate') || can('create'))}
                onClick={async () => {
                  setSyncing(true);
                  setMessage('Sync in progress — indexing approved documents.');
                  await new Promise((resolve) => setTimeout(resolve, 700));
                  setSyncing(false);
                  if (r[5] === 'Error') {
                    setMessage(
                      'Sync could not complete: restore source access in Manage sources and retry.',
                    );
                    return;
                  }
                  update((s) => ({
                    ...s,
                    ui: { ...s.ui, [`source:${id}:synced`]: true },
                  }));
                  act(`${r[1]} synchronization completed`);
                }}
              >
                {syncing ? 'Syncing…' : 'Run sync preview'}
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
      <div className={`surfacePage hybridPage detailPage ${kind}Detail`}>
        <PageTitle
          title={r[1]}
          description={`${r[2]} · ${r[3]} permission · ${r[4]} risk · organization-approved endpoint`}
        >
          <Button
            disabled={!can('operate')}
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
        <div className="hybridSplit toolOverviewGrid">
          <section className="panel">
            <h2>Description</h2>
            <p>
              {r[1]} through {r[2]}, using organization-scoped{' '}
              {r[3].toLowerCase()} permission.{' '}
              {r[4] === 'High'
                ? 'Human approval is required before execution.'
                : 'Execution follows the approved policy and is audited.'}
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
            {[hybridAgents[0], hybridAgents[1], hybridAgents[4]].map((a) => (
              <p key={a.id}>
                <Link href={`/agents/${a.id}`}>{a.name}</Link>
              </p>
            ))}
          </section>
          <section className="panel toolRecentCalls">
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
              ].map((row) =>
                row.map((cell, i) =>
                  i === 3 ? <Status key={i}>{cell}</Status> : cell,
                ),
              )}
            />
          </section>
        </div>
        <DataNote />
      </div>
    );
  }
  if (kind === 'evaluations')
    return (
      <div className={`surfacePage hybridPage detailPage ${kind}Detail`}>
        <PageTitle
          title={
            id === 'customer-service'
              ? 'Tier-1 Support Suite'
              : `${agent.name} evaluation`
          }
          description={`${agent.name} · ${run?.id || 'EV-204'} · ${run?.version || productionVersion(id)} · ${agent.model}`}
        >
          <Status>{agent.score >= 90 ? 'Passed' : 'Warning'}</Status>
        </PageTitle>
        <div className="evaluationSummary">
          <section
            className={`panel evaluationScore ${agent.score >= 90 ? 'healthy' : 'warning'}`}
          >
            <strong>{agent.score}%</strong>
            <span>readiness score</span>
            <small>
              {agent.score >= 90
                ? '5 pass · 2 warn · 0 fail'
                : '4 pass · 2 warn · 1 fail'}
            </small>
          </section>
          <Metrics
            items={[
              ['Scenarios passed', `${Math.round(agent.score / 2)}/50`],
              ['Failed scenarios', agent.score >= 90 ? '0' : '3'],
              ['Duration', '4m 12s'],
              ['Model', id === 'customer-service' ? 'GPT-4o' : agent.model],
              ['Pass rate', `${agent.score}%`],
              ['Run date', run && 'when' in run ? run.when : 'This session'],
            ]}
          />
        </div>
        <div className="evaluationWorkspace">
          <section className="panel">
            <h2>Scenario results</h2>
            {run && 'question' in run && (
              <div>
                <h3>{run.name}</h3>
                <p>{run.question}</p>
                <p>Expected: {run.expected}</p>
                <Status>{run.passed ? 'Passed' : 'Failed'}</Status>
              </div>
            )}
            <p>Illustrative scenario breakdown for this preview.</p>
            <div className="scenarioResults">
              {[
                ['Task completion', '48/50 scenarios resolved', 96],
                ['Answer accuracy', 'High groundedness against KB', 91],
                ['Hallucination resistance', 'Assertions verified', 94],
                ['Safety & policy', '2 PII snippets need review', 78],
                ['Tool execution', 'All actions completed', 97],
                ['Latency P95', '2.4s vs 3s threshold', 91],
                ['Edge cases', 'Ambiguous queries need work', 72],
              ].map(([name, note, score]) => (
                <div
                  key={String(name)}
                  data-tone={Number(score) < 85 ? 'warning' : 'healthy'}
                >
                  <span>{name}</span>
                  <small>{note}</small>
                  <progress
                    aria-label={String(name)}
                    max={100}
                    value={Number(score)}
                  />
                  <strong>{score}%</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="evaluationScenarios panel">
            <h2>Representative outputs and recommendations</h2>
            <p>
              {agent.score >= 90
                ? 'Production candidate: no failed scenarios. Review warnings before promotion.'
                : 'Production blocked: resolve failed scenarios and rerun the evaluation.'}
            </p>
            {evaluationScenarios
              .filter((s) => (agent.score >= 90 ? s.status !== 'Failed' : true))
              .map((s) => (
                <details key={s.id}>
                  <summary>
                    <strong>{s.name}</strong>
                    <Status>{s.status}</Status>
                  </summary>
                  <p>{s.output}</p>
                  <p>
                    <strong>Recommendation:</strong> {s.recommendation}
                  </p>
                  <code>{s.trace}</code>
                </details>
              ))}
          </section>
        </div>
        <Link className="button outline" href="/evaluations">
          Compare evaluation runs →
        </Link>
        <DataNote />
      </div>
    );
  if (kind === 'deployments')
    return (
      <div className={`surfacePage hybridPage detailPage ${kind}Detail`}>
        <PageTitle
          title={`${agent.name} — ${releaseVersion}`}
          description={`${releaseEnvironment} · ${recordId} · ${referenceRelease?.when || 'This session'} · ${referenceRelease?.by || 'You'}`}
        >
          <Button
            variant="outline"
            disabled={status === 'Rolled back' || !can('operate')}
            onClick={() => {
              if (!window.confirm('Roll back this deployment in the preview?'))
                return;
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
            ['Environment', releaseEnvironment],
            ['Duration', referenceRelease?.duration || 'Preview'],
            ['Deployed by', referenceRelease?.by || 'You'],
            ['Status', status],
          ]}
        />
        <div className="hybridSplit">
          <section className="panel">
            <h2>Deploy timeline</h2>
            {currentRelease &&
              ['Failed', 'Rejected', 'Pending approval'].includes(status) && (
                <p role="status">
                  {status === 'Failed'
                    ? 'Health check failed. No traffic changed; the previous active release is preserved.'
                    : status === 'Rejected'
                      ? 'Review rejected. No deployment occurred.'
                      : 'Awaiting review. No deployment occurred.'}{' '}
                  <Link
                    href={`/deployments?agent=${id}&run=${currentRelease.runId}&edit=1`}
                  >
                    Review release and recover →
                  </Link>
                </p>
              )}
            <ol className="hybridTimeline">
              {[
                'Deploy triggered',
                'Pre-flight checks',
                'Container build',
                'Health check',
                'Traffic cutover',
                status === 'Failed'
                  ? 'Deployment stopped — health check failed'
                  : status === 'Rejected'
                    ? 'Deployment rejected'
                    : status === 'Pending approval'
                      ? 'Awaiting approval'
                      : 'Deploy complete',
              ].map((v, i) => (
                <li key={v}>
                  <time>
                    {
                      [
                        'Today 12:04',
                        '+0:12',
                        '+0:38',
                        '+1:20',
                        '+1:44',
                        '2m 14s',
                      ][i]
                    }
                  </time>
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
      <div className={`surfacePage hybridPage detailPage ${kind}Detail`}>
        <PageTitle
          title={`${id.toUpperCase()} · ${id === 'inc-002' ? 'Tool execution failed' : 'High latency detected'}`}
          description={`${id === 'inc-002' ? 'Process Automation' : 'Sales Assistant'} · ${status} · Started 14:30`}
        >
          <div className="resourceFooter">
            <Button
              variant="outline"
              disabled={!can('operate')}
              onClick={() => {
                if (!can('operate')) return;
                setStatus('Escalated');
                act('Incident escalated');
              }}
            >
              Escalate
            </Button>
            <Button
              onClick={() => {
                setStatus('Resolved');
                act('Incident resolved');
              }}
              disabled={status === 'Resolved' || !can('operate')}
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
            ['SLA breach risk', status === 'Resolved' ? 'Resolved' : 'Yes'],
            ['Duration', '45 min'],
          ]}
        />
        <div className="hybridSplit">
          <section className="panel">
            <h2>Incident timeline</h2>
            <ol className="hybridTimeline">
              {(id === 'inc-002'
                ? [
                    'ServiceNow action timed out',
                    'Execution halted without duplicate write',
                    'Failure recorded in audit log',
                    'Human review requested',
                    'Retry pending endpoint recovery',
                  ]
                : [
                    'Latency threshold exceeded — P95 crossed 3s limit',
                    'Incident auto-created by monitoring',
                    'Alert sent to #ops-alerts Slack channel',
                    'On-call engineer acknowledged incident',
                    'Root cause identified: Salesforce CRM API degraded',
                    'Circuit breaker enabled on CRM',
                    'P95 improving — 5.1s → 3.8s',
                  ]
              ).map((v, i) => (
                <li
                  key={v}
                  data-tone={
                    [
                      'danger',
                      'warning',
                      'blue',
                      'blue',
                      'warning',
                      'healthy',
                      'healthy',
                    ][i]
                  }
                >
                  <time>
                    {
                      [
                        '14:30:00',
                        '14:30:05',
                        '14:30:10',
                        '14:31:00',
                        '14:32:00',
                        '14:35:00',
                        '14:45:00',
                      ][i]
                    }
                  </time>
                  <span>{v}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="panel">
            <h2>Incident context</h2>
            <p>
              Agent:{' '}
              {id === 'inc-002' ? 'Process Automation' : 'Sales Assistant'}
            </p>
            <p>Severity: High</p>
            <h3>Root cause</h3>
            <p>
              {id === 'inc-002'
                ? 'ServiceNow action exceeded its execution deadline'
                : 'Salesforce CRM API degraded'}
            </p>
            <h3>Recommended action</h3>
            <p>
              {id === 'inc-002'
                ? 'Retry with an idempotency key after validating the ServiceNow endpoint; keep failed writes in the human review queue.'
                : 'Keep circuit breaker enabled and fail over reads to the cached CRM snapshot until the provider recovers.'}
            </p>
          </section>
        </div>
        <DataNote />
      </div>
    );
  return (
    <div className={`surfacePage hybridPage detailPage ${kind}Detail`}>
      <PageTitle
        title={`Edit: ${policy}`}
        description={`Workspace policy · ${mode}`}
      />
      <Feedback message={message} />
      <div className="hybridSplit">
        <form
          id="policy-form"
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
            disabled={!can('admin')}
            value={policy}
            required
            onChange={(e) => setPolicy(e.target.value)}
          />
          <label className="journeyField">
            Description
            <textarea
              value={description}
              disabled={!can('admin')}
              required
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="tags">
            <span className="tag">
              {id === 'pii'
                ? 'Privacy'
                : id === '4'
                  ? 'Compliance'
                  : 'Security'}
            </span>
            <span className="tag">Required</span>
          </div>
          <div className="policyScope">
            <h3>Scope</h3>
            <div className="tags">
              <span className="tag">All agents</span>
              <span className="tag">Customer Service</span>
              <span className="tag">Sales Assistant</span>
            </div>
          </div>
          <fieldset className="policyModes">
            <legend>Enforcement mode</legend>
            {['Enforce', 'Warn', 'Audit only'].map((m) => (
              <label key={m}>
                <input
                  type="radio"
                  name="mode"
                  disabled={!can('admin')}
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
        </form>
        <section className="panel">
          <h2>Policy status</h2>
          <Status>{mode === 'Enforce' ? 'Enforced' : mode}</Status>
          <p className={id === 'pii' ? 'hybridDanger' : ''}>
            {id === 'pii'
              ? '3 active violations'
              : 'No active violations for this policy'}
          </p>
          <ul className="hybridActivity">
            {(id === 'pii'
              ? [
                  'Customer Service Agent — email exposed',
                  'Sales Assistant — phone exposed',
                  'Customer Service Agent — CPF detected',
                ]
              : []
            ).map((v, i) => (
              <li key={v}>
                {v}
                <small>
                  {['Sep 15 14:32', 'Sep 14 09:10', 'Sep 13 16:45'][i]}
                </small>
              </li>
            ))}
          </ul>
          <Button type="submit" form="policy-form" disabled={!can('admin')}>
            Save changes
          </Button>
        </section>
      </div>
      <DataNote />
    </div>
  );
}
