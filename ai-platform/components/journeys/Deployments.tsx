'use client';
import { useWorkspaceAgents } from './WorkspaceAgents';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { hybridAgents } from '@/lib/hybrid-data';
import { agentConfiguration } from '@/lib/preview-records';
import { Button } from '../UI';
import { usePreview, identifier, type Release } from './PreviewState';
import { JourneyHeader, Field, Feedback } from './Shared';
export default function Deployments() {
  const hybridAgents = useWorkspaceAgents();
  const { state, update } = usePreview();
  const query = useSearchParams();
  const agentId = query.get('agent');
  const [runId, setRunId] = useState(query.get('run') || '');
  const [target, setTarget] = useState('Test');
  const [outcome, setOutcome] = useState('success');
  const [message, setMessage] = useState('');
  const passed = state.runs.filter(
    (r) =>
      r.passed &&
      (!agentId || r.agentId === agentId) &&
      (!r.configuration ||
        r.configuration ===
          agentConfiguration(state.ui, r.agentId || 'customer-service')),
  );
  const run = passed.find((r) => r.id === runId) ?? passed[0];
  function transition(id: string, next: Release['state']) {
    update((s) => ({
      ...s,
      releases: s.releases.map((r) =>
        r.id === id ? { ...r, state: next } : r,
      ),
      audit: [`Deployment ${next} · preview`, ...s.audit],
    }));
    setMessage(`Deployment ${next.toLowerCase()} in this preview.`);
  }
  return (
    <div className="surfacePage hybridPage operationalEditor">
      <JourneyHeader
        title="Deployments"
        description="Review evaluated versions and explore controlled environment changes."
      />
      <Feedback message={message} />
      <section className="panel">
        <h2>Request promotion</h2>
        {run ? (
          <>
            <div className="journeyFormGrid">
              <Field label="Passed evaluation">
                <select
                  value={run.id}
                  onChange={(e) => setRunId(e.target.value)}
                >
                  {passed.map((r, i) => (
                    <option key={r.id} value={r.id}>
                      {r.version} · {r.name} · run {passed.length - i}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Deployment simulation">
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                >
                  <option value="success">Successful deployment</option>
                  <option value="failure">Health check fails</option>
                </select>
              </Field>
              <Field label="Target environment">
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option>Test</option>
                  <option>Production</option>
                </select>
              </Field>
            </div>
            <p>
              {
                hybridAgents.find(
                  (a) => a.id === (run.agentId || 'customer-service'),
                )?.name
              }{' '}
              · {target === 'Test' ? 'Development → Test' : 'Test → Production'}
              . Every promotion in this preview requires review.
            </p>
            <Button
              disabled={
                (target === 'Production' &&
                  !state.releases.some(
                    (r) =>
                      r.runId === run.id &&
                      r.target === 'Test' &&
                      r.state === 'Active',
                  )) ||
                state.releases.some(
                  (r) =>
                    r.runId === run.id &&
                    r.target === target &&
                    ['Pending approval', 'Active', 'Paused'].includes(r.state),
                )
              }
              onClick={() => {
                const releaseId = identifier();
                update((s) => ({
                  ...s,
                  ui: { ...s.ui, [`release:${releaseId}:outcome`]: outcome },
                  releases: [
                    {
                      id: releaseId,
                      runId: run.id,
                      agentId: run.agentId || 'customer-service',
                      version: run.version,
                      source: target === 'Test' ? 'Development' : 'Test',
                      target,
                      state: 'Pending approval',
                      reason: '',
                    },
                    ...s.releases,
                  ],
                  audit: [
                    `Promotion requested: ${run.version} → ${target} · preview`,
                    ...s.audit,
                  ],
                }));
                setMessage('Request created. Open Governance to review it.');
              }}
            >
              Request promotion preview
            </Button>
            {target === 'Production' &&
              !state.releases.some(
                (r) =>
                  r.runId === run.id &&
                  r.target === 'Test' &&
                  r.state === 'Active',
              ) && (
                <p>
                  Approve this version in Test before requesting Production.
                </p>
              )}
          </>
        ) : (
          <p>
            No passed evaluations available.{' '}
            <Link href="/evaluations">Run an evaluation first →</Link>
          </p>
        )}
        <p>
          <Link href="/governance">Open approval queue →</Link>
        </p>
      </section>
      <h2>Release history</h2>
      {!state.releases.length && (
        <section className="panel">No release requests yet.</section>
      )}
      <div className="surfaceCards">
        {state.releases.map((r) => (
          <article className="agentCard" key={r.id}>
            <span className="tag">{r.state}</span>
            <h3>
              {
                hybridAgents.find(
                  (a) => a.id === (r.agentId || 'customer-service'),
                )?.name
              }{' '}
              · {r.version}
            </h3>
            <p>
              {r.source} → {r.target}
            </p>
            <p>Requested by you · preview</p>
            {r.reason && <p>Review note: {r.reason}</p>}
            {['Failed', 'Rejected', 'Rolled back'].includes(r.state) && (
              <div>
                <p>
                  {r.state === 'Failed'
                    ? 'Health check failed. Traffic was not switched. Correct the configuration and request another reviewed deployment.'
                    : 'This release is not active. Review the decision and request another promotion when ready.'}
                </p>
                <Link
                  href={`/evaluations?agent=${r.agentId || 'customer-service'}&version=${r.version}&edit=1`}
                >
                  Review configuration and rerun evaluation →
                </Link>
              </div>
            )}
            {r.state === 'Pending approval' && (
              <Link href="/governance">Review request →</Link>
            )}
            {r.state === 'Active' && (
              <Button
                variant="outline"
                onClick={() => transition(r.id, 'Paused')}
              >
                Pause preview
              </Button>
            )}
            {r.state === 'Paused' && (
              <Button
                variant="outline"
                onClick={() => transition(r.id, 'Active')}
              >
                Resume preview
              </Button>
            )}
            {['Active', 'Paused'].includes(r.state) && (
              <Button
                variant="secondary"
                onClick={() => transition(r.id, 'Rolled back')}
              >
                Roll back to baseline preview
              </Button>
            )}
          </article>
        ))}
      </div>
      <Link className="button outline" href="/agentops">
        Continue to AgentOps →
      </Link>
    </div>
  );
}
