'use client';
import { useWorkspaceAgents } from './WorkspaceAgents';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { previewSourceRows } from '@/lib/source-preview';
import type { LaunchDraft } from '@/lib/launch';
import { hybridAgents } from '@/lib/hybrid-data';
import { agentConfiguration } from '@/lib/preview-records';
import { Button } from '../UI';
import { usePreview, identifier, suiteTypes, type Suite } from './PreviewState';
import { JourneyHeader, Dialog, Field, Feedback } from './Shared';
export default function Evaluations() {
  const hybridAgents = useWorkspaceAgents();
  const { state, update, ready } = usePreview();
  const query = useSearchParams();
  const agentId = query.get('agent') || 'customer-service';
  const agent = hybridAgents.find((a) => a.id === agentId) ?? hybridAgents[0];
  const contextualId =
    agent.id === 'customer-service' ? 'regression' : `regression-${agent.id}`;
  const contextualSuite: Suite = {
    id: contextualId,
    name: `${agent.name} regression`,
    category: 'Regression',
    question: `Complete a representative ${agent.name.toLowerCase()} request using approved knowledge and actions.`,
    expected:
      'Use authorized sources, respect policy boundaries and explain the outcome.',
    mandatory: true,
  };
  const suites =
    agent.id === 'customer-service'
      ? state.suites.filter((s) => !s.id.startsWith('regression-'))
      : [
          state.suites.find((s) => s.id === contextualId) || contextualSuite,
          ...state.suites.filter(
            (s) => s.id !== 'regression' && !s.id.startsWith('regression-'),
          ),
        ];
  const launch = state.ui?.[`agent:${agent.id}:launch`] as
    LaunchDraft | undefined;
  const unavailable = previewSourceRows(state.ui).filter(
    (r) =>
      launch?.knowledge.includes(r[0]) &&
      ['Error', 'Not connected', 'Not synchronized'].includes(r[5]),
  );
  const [suiteId, setSuiteId] = useState(contextualId);
  const [form, setForm] = useState<Suite | null>(null);
  const [scenario, setScenario] = useState('pass');
  const [version, setVersion] = useState(query.get('version') || 'v1.3');
  const [message, setMessage] = useState('');
  const [runId, setRunId] = useState('');
  const suite = suites.find((s) => s.id === suiteId);
  const runs = state.runs.filter(
    (r) =>
      r.suiteId === suiteId && (r.agentId ?? 'customer-service') === agent.id,
  );
  const run = runs.find((r) => r.id === runId) ?? runs[0];
  const previous = run ? runs[runs.indexOf(run) + 1] : undefined;
  return (
    <div className="surfacePage hybridPage operationalEditor">
      <JourneyHeader
        title="Evaluations"
        description="Build reusable suites and inspect evidence before promoting a version."
      >
        <Button
          disabled={!ready}
          onClick={() =>
            setForm({
              id: '',
              name: '',
              category: 'Functional',
              question: '',
              expected: '',
              mandatory: true,
            })
          }
        >
          + Create suite
        </Button>
      </JourneyHeader>
      <Feedback message={message} />
      {!!unavailable.length && (
        <section className="panel" role="status">
          <h2>Knowledge source unavailable</h2>
          <p>
            {unavailable.map((r) => r[1]).join(', ')} needs reconnection or
            synchronization before this agent can pass evaluation.
          </p>
          <Link href="/knowledge">Reconnect and synchronize sources →</Link>
        </section>
      )}
      <div className="surfaceCards">
        {suites.map((s) => (
          <article className="agentCard" key={s.id}>
            <span className="tag">{s.category}</span>
            <h2>{s.name}</h2>
            <p>{s.mandatory ? 'Mandatory control' : 'Advisory test'}</p>
            <Button
              variant="link"
              onClick={() => {
                setSuiteId(s.id);
                setRunId('');
              }}
            >
              Open {s.name}
            </Button>
          </article>
        ))}
      </div>
      {suite && (
        <section className="panel">
          <div className="surfaceHeading">
            <h2>{suite.name}</h2>
            <Button variant="outline" onClick={() => setForm(suite)}>
              Edit suite
            </Button>
          </div>
          <dl className="surfaceFacts">
            <div>
              <dt>Test question</dt>
              <dd>{suite.question}</dd>
            </div>
            <div>
              <dt>Expected result</dt>
              <dd>{suite.expected}</dd>
            </div>
            <div>
              <dt>Assigned agent</dt>
              <dd>{agent.name} · preview</dd>
            </div>
          </dl>
          <div className="journeyFormGrid">
            <Field label="Candidate version">
              <input
                required
                maxLength={40}
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </Field>
            <Field label="Evaluation scenario">
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              >
                <option value="pass">Pass</option>
                <option value="fail">Fail sample check</option>
              </select>
            </Field>
          </div>
          <Button
            disabled={!version.trim()}
            onClick={() => {
              const result = {
                id: identifier(),
                agentId: agent.id,
                configuration: agentConfiguration(state.ui, agent.id),
                suiteId: suite.id,
                category: suite.category,
                question: suite.question,
                expected: suite.expected,
                name: suite.name,
                version: version.trim(),
                passed: scenario === 'pass' && !unavailable.length,
                score: scenario === 'pass' ? 100 : 0,
              };
              update((s) => ({
                ...s,
                runs: [result, ...s.runs],
                audit: [
                  `Evaluation ${result.passed ? 'passed' : 'failed'}: ${result.version} · preview`,
                  ...s.audit,
                ],
              }));
              setRunId(result.id);
              setMessage(
                'Evaluation preview finished. No model or connector was called.',
              );
            }}
          >
            Run evaluation preview
          </Button>
        </section>
      )}
      {run ? (
        <section className="panel">
          <h2>Run results</h2>
          <Field label="Evaluation history">
            <select value={run.id} onChange={(e) => setRunId(e.target.value)}>
              {runs.map((r, i) => (
                <option key={r.id} value={r.id}>
                  {r.version} · {r.passed ? 'Pass' : 'Fail'} · run{' '}
                  {runs.length - i}
                </option>
              ))}
            </select>
          </Field>
          <div className="surfaceCards">
            <article className="agentCard">
              <h3>Overall result</h3>
              <strong className="surfaceValue">
                {run.passed ? 'Pass' : 'Fail'}
              </strong>
              <p>{run.version} · illustrative result</p>
            </article>
            <article className="agentCard">
              <h3>Score by category</h3>
              <strong className="surfaceValue">{run.score}%</strong>
              <p>{run.category} · one sample case</p>
            </article>
            <article className="agentCard">
              <h3>Previous run</h3>
              <strong>
                {previous
                  ? `${previous.version} · ${previous.score}%`
                  : 'No previous run'}
              </strong>
              <p>
                {previous
                  ? `${run.score - previous.score} percentage-point change`
                  : 'Run another scenario to compare results.'}
              </p>
            </article>
          </div>
          <details>
            <summary>
              {run.passed
                ? 'Passed test evidence'
                : 'Failed test and recommended action'}
            </summary>
            <p>
              {run.passed
                ? 'The sample answer matches the expected result.'
                : 'The sample answer did not meet the expected result. Review the candidate and rerun the evaluation.'}
            </p>
            <p>Question at run time: {run.question}</p>
            <p>Expected at run time: {run.expected}</p>
          </details>
          {run.passed ? (
            <Link
              className="button primary"
              href={`/deployments?agent=${agent.id}&run=${run.id}`}
            >
              Review for deployment →
            </Link>
          ) : (
            <p>Promotion is blocked for this failed run.</p>
          )}
        </section>
      ) : (
        <section className="panel">
          <h2>No evaluation runs yet</h2>
          <p>
            Choose a scenario and run the suite to explore results and
            comparisons.
          </p>
        </section>
      )}
      {form && (
        <Dialog
          title={form.id ? 'Edit evaluation suite' : 'Create evaluation suite'}
          onClose={() => setForm(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const item = { ...form, id: form.id || identifier() };
              update((s) => ({
                ...s,
                suites: s.suites.some((v) => v.id === item.id)
                  ? s.suites.map((v) => (v.id === item.id ? item : v))
                  : [...s.suites, item],
              }));
              setSuiteId(item.id);
              setRunId('');
              setForm(null);
              setMessage('Suite saved in this preview.');
            }}
          >
            <Field label="Suite name">
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Suite type">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {suiteTypes.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Test question">
              <textarea
                required
                maxLength={2000}
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </Field>
            <Field label="Expected result">
              <textarea
                required
                maxLength={2000}
                value={form.expected}
                onChange={(e) => setForm({ ...form, expected: e.target.value })}
              />
            </Field>
            <label className="resourceCheck">
              <input
                type="checkbox"
                checked={form.mandatory}
                onChange={(e) =>
                  setForm({ ...form, mandatory: e.target.checked })
                }
              />
              Mandatory before promotion
            </label>
            <div className="resourceFooter">
              <Button variant="secondary" onClick={() => setForm(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.name.trim() ||
                  !form.question.trim() ||
                  !form.expected.trim()
                }
              >
                Save suite preview
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
