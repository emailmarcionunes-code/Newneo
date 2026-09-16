'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { workspaceSpend } from '@/lib/preview-records';
import { incidents } from '@/lib/surfaces';
import { Button } from '../UI';
import { usePreview } from './PreviewState';
import { Field, Feedback, Dialog } from './Shared';
export default function Operations({ finops }: { finops: boolean }) {
  const { state, update, ready } = usePreview();
  const [task, setTask] = useState(false);
  const [incident, setIncident] = useState('');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState(String(state.budget));
  const [alert, setAlert] = useState(String(state.alert));
  const [days, setDays] = useState('15');
  useEffect(() => {
    if (ready) {
      setBudget(String(state.budget));
      setAlert(String(state.alert));
    }
  }, [ready, state.budget, state.alert]);
  const detail = incidents.find((i) => i.id === incident);
  const valid =
    Number(budget) > 0 &&
    Number.isFinite(Number(budget)) &&
    Number(alert) >= 1 &&
    Number(alert) <= 100;
  const day = Number(days);
  const forecast = day >= 1 && day <= 30 ? (workspaceSpend / day) * 30 : null;
  return (
    <section className="panel">
      <h2>
        {finops ? 'Budgets, forecast & recommendations' : 'Task investigation'}
      </h2>
      <p>Interactive sample data · changes are saved in this tab only.</p>
      <Feedback message={message} />
      {finops ? (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!valid) return;
              update((s) => ({
                ...s,
                budget: Number(budget),
                alert: Number(alert),
                audit: ['Budget and alert saved · preview', ...s.audit],
              }));
              setMessage(
                'Budget and alert saved in this preview. No spending limit or notification was activated.',
              );
            }}
          >
            <div className="journeyFormGrid">
              <Field label="Saved budget (USD)">
                <input
                  type="number"
                  required
                  min="1"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </Field>
              <Field label="Alert threshold (%)">
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={alert}
                  onChange={(e) => setAlert(e.target.value)}
                />
              </Field>
            </div>
            <Button type="submit" disabled={!valid}>
              Save budget preview
            </Button>
          </form>
          <p>
            Sample spend: ${workspaceSpend} ·{' '}
            {(workspaceSpend / state.budget) * 100 >= state.alert
              ? 'Alert threshold reached'
              : 'Below alert threshold'}{' '}
            ({state.alert}%).
          </p>
          <Field label="Elapsed days in sample 30-day month">
            <input
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </Field>
          <p>
            {forecast
              ? `Illustrative forecast: $${forecast.toFixed(2)} = $${workspaceSpend} ÷ ${day} days × 30. ${forecast > state.budget ? 'Above saved budget.' : 'Within saved budget.'}`
              : 'Enter a day from 1 to 30.'}
          </p>
          <details>
            <summary>Review optimization recommendation</summary>
            <p>
              Investigate repeated model calls in Customer Service Agent ($120
              sample cost). Compare a candidate version in Evaluations before
              making any model change. Savings have not been measured.
            </p>
            <Link href="/evaluations">Compare candidate quality →</Link>
          </details>
        </>
      ) : (
        <>
          <div className="surfaceCards">
            <article className="agentCard">
              <span className="tag">Sample failed task</span>
              <h3>Order status request</h3>
              <p>Customer Service Agent · policy citation missing.</p>
              <Button variant="outline" onClick={() => setTask(true)}>
                Inspect task trace
              </Button>
            </article>
            {incidents.map((i) => (
              <article className="agentCard" key={i.id}>
                <span className="tag">
                  {state.incidentStates[i.id] || 'Open'}
                </span>
                <h3>{i.agent}</h3>
                <p>{i.impact}</p>
                <Button variant="outline" onClick={() => setIncident(i.id)}>
                  Investigate {i.agent}
                </Button>
              </article>
            ))}
          </div>
          <h3>Release activity</h3>
          {state.releases.length ? (
            <ul>
              {state.releases.map((r) => (
                <li key={r.id}>
                  {r.version} · {r.target} · {r.state}
                </li>
              ))}
            </ul>
          ) : (
            <p>No release activity in this preview.</p>
          )}
          <Link href="/finops" className="button outline">
            Continue to FinOps →
          </Link>
        </>
      )}
      {task && (
        <Dialog title="Task trace · sample" onClose={() => setTask(false)}>
          <ol className="journeyList">
            <li>Request received: order status question.</li>
            <li>Knowledge retrieved: sample support policy.</li>
            <li>
              Model response: answer generated without the required citation.
            </li>
            <li>Quality check failed: routed to human review.</li>
          </ol>
          <p>No customer data or live model response is shown.</p>
          <Link href="/evaluations" className="button outline">
            Open regression evaluations
          </Link>
        </Dialog>
      )}
      {detail && (
        <Dialog title="Incident investigation" onClose={() => setIncident('')}>
          <h3>{detail.agent}</h3>
          <dl className="surfaceFacts">
            {[
              ['Impact', detail.impact],
              ['Likely cause', detail.cause],
              ['Evidence', detail.evidence],
              ['Recommended action', detail.action],
              ['Owner', detail.owner],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <Field label="Investigation status">
            <select
              value={state.incidentStates[detail.id] || 'Open'}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  incidentStates: {
                    ...s.incidentStates,
                    [detail.id]: e.target.value,
                  },
                  audit: [
                    `Incident ${detail.id}: ${e.target.value} · preview`,
                    ...s.audit,
                  ],
                }))
              }
            >
              {['Open', 'Investigating', 'Resolved in preview'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <p>This status does not remediate a real incident.</p>
        </Dialog>
      )}
    </section>
  );
}
