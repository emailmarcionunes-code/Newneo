'use client';
import { useState } from 'react';
import Link from 'next/link';
import { fleet, fleetTotals, incidents } from '@/lib/surfaces';
import { DemoNotice } from './RegistrySurface';
import { FilterChip, Button } from './UI';
const money = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
export default function OperationsSurface({
  finops = false,
}: {
  finops?: boolean;
}) {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<string | null>(null);
  const [sort, setSort] = useState('health');
  const [budget, setBudget] = useState('300');
  const total = fleetTotals();
  const detail = fleet.find((agent) => agent.id === selected);
  const selectedIncidents = incidents.filter(
    (incident) => !detail || incident.agent === detail.name,
  );
  const rows = fleet
    .filter(
      (agent) =>
        filter === 'All' ||
        (filter === 'Needs attention'
          ? agent.health !== 'Healthy'
          : agent.health === 'Healthy'),
    )
    .sort((a, b) =>
      sort === 'cost'
        ? b.cost - a.cost
        : sort === 'success'
          ? b.successful / b.tasks - a.successful / a.tasks
          : Number(a.health === 'Healthy') - Number(b.health === 'Healthy'),
    );
  const amount = Number(budget);
  const budgetValid = Number.isFinite(amount) && amount > 0;
  return (
    <div className="surfacePage">
      <div className="pageHead">
        <div>
          <h1>{finops ? 'FinOps' : 'AgentOps'}</h1>
          <p>
            {finops
              ? 'Understand AI spend, task economics and measurable business value.'
              : 'Operate agents across quality, reliability, security, economics and business outcome.'}
          </p>
        </div>
      </div>
      <DemoNotice />
      <div className="surfaceCards">
        {(finops
          ? [
              ['AI cost this month', money(total.cost)],
              ['Cost per task', money(total.cost / total.tasks)],
              [
                'Cost per successful task',
                money(total.cost / total.successful),
              ],
            ]
          : [
              [
                'Successful tasks',
                `${total.successful.toLocaleString('en-US')} / ${total.tasks.toLocaleString('en-US')}`,
              ],
              ['Task success', `${(100 * total.successful) / total.tasks}%`],
              ['Open incidents', `${incidents.length} · none critical`],
            ]
        ).map(([label, value]) => (
          <article className="agentCard" key={label}>
            <h2>{label}</h2>
            <strong className="surfaceValue">{value}</strong>
            <p>Sample activity · current month</p>
          </article>
        ))}
      </div>
      <div className="surfaceControls">
        <div className="filterRow">
          {['All', 'Needs attention', 'Healthy'].map((name) => (
            <FilterChip
              key={name}
              active={filter === name}
              onClick={() => setFilter(name)}
            >
              {name}
            </FilterChip>
          ))}
        </div>
        <label>
          Sort agents
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="health">Health priority</option>
            <option value="cost">Highest cost</option>
            <option value="success">Highest task success</option>
          </select>
        </label>
      </div>
      <div
        className="surfaceTable"
        role="region"
        aria-label="Agent fleet"
        tabIndex={0}
      >
        <table>
          <caption>Sample fleet · three representative agents</caption>
          <thead>
            <tr>
              {[
                'Agent',
                'Health',
                'Task success',
                'Evaluation',
                'Incidents',
                'Cost',
                'Business KPI',
                'Details',
              ].map((name) => (
                <th key={name}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((agent) => (
              <tr key={agent.id}>
                <td>{agent.name}</td>
                <td>{agent.health}</td>
                <td>{Math.round((100 * agent.successful) / agent.tasks)}%</td>
                <td>{agent.evaluation}%</td>
                <td>{agent.incidents}</td>
                <td>{money(agent.cost)}</td>
                <td>{agent.kpi}</td>
                <td>
                  <Button
                    variant="link"
                    aria-label={`Inspect ${agent.name}`}
                    aria-controls={detail ? 'operation-details' : undefined}
                    aria-expanded={selected === agent.id}
                    onClick={() => setSelected(agent.id)}
                  >
                    Inspect →
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail && (
        <section id="operation-details" className="panel">
          <div className="surfaceHeading">
            <h2>{detail.name}</h2>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close details
            </Button>
          </div>
          <dl className="surfaceFacts">
            <div>
              <dt>Volume / success / failure</dt>
              <dd>
                {detail.tasks} tasks / {detail.successful} successful /{' '}
                {detail.tasks - detail.successful} unsuccessful
              </dd>
            </div>
            <div>
              <dt>Latency</dt>
              <dd>{detail.latency} · sample average</dd>
            </div>
            <div>
              <dt>Human escalations</dt>
              <dd>{detail.escalations}</dd>
            </div>
            <div>
              <dt>Health and evaluation trends</dt>
              <dd>No historical measurements connected.</dd>
            </div>
            <div>
              <dt>Security events</dt>
              <dd>No live security feed connected.</dd>
            </div>
          </dl>
          {detail.id === 'customer-service' && (
            <Link href="/agents/customer-service" className="button outline">
              Open agent detail
            </Link>
          )}
        </section>
      )}
      {finops ? (
        <>
          <section className="panel">
            <h2>Budget planning</h2>
            <p>
              Local calculator using sample spend. This does not set an account
              budget or enforce a spending limit.
            </p>
            <label className="surfaceBudget">
              Monthly budget (USD)
              <input
                type="number"
                min="1"
                step="1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </label>
            <p role="status">
              {budgetValid
                ? `${Math.round((total.cost / amount) * 100)}% used · ${money(Math.max(0, amount - total.cost))} remaining${total.cost > amount ? ' · over budget' : ''}`
                : 'Enter a budget greater than zero.'}
            </p>
          </section>
          <div className="surfaceCards">
            {[
              ['Spend by workspace', 'Customer Service · $240 sample spend'],
              ['Spend by runtime', 'Customer Cloud · $240 sample spend'],
              ['Spend by environment', 'Production · $240 sample spend'],
              ['AI Units', 'No versioned conversion policy configured.'],
              [
                'Usage trend and forecast',
                'No historical usage series connected.',
              ],
              [
                'Optimization',
                'Review repeated model/tool calls while preserving quality and governance.',
              ],
            ].map(([title, body]) => (
              <article className="agentCard" key={title}>
                <h2>{title}</h2>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <section>
          <h2>Incidents</h2>
          <div className="surfaceCards">
            {selectedIncidents.map((incident) => (
              <article className="agentCard" key={incident.id}>
                <span className="tag">
                  {incident.severity} · {incident.status}
                </span>
                <h3>{incident.agent}</h3>
                <p>{incident.impact}</p>
                <details>
                  <summary>Evidence and recommended action</summary>
                  <dl className="surfaceFacts">
                    {[
                      ['Likely cause', incident.cause],
                      ['Evidence', incident.evidence],
                      ['Recommended action', incident.action],
                      ['Owner', incident.owner],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              </article>
            ))}
          </div>
          {selectedIncidents.length === 0 && (
            <p>No sample incidents for this agent.</p>
          )}
        </section>
      )}
    </div>
  );
}
