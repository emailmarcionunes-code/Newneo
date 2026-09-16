'use client';
import Link from 'next/link';
import { Check, Diamond, AlertCircle } from 'lucide-react';
import { hybridAgents, activity } from '@/lib/hybrid-data';
import { Table, DataNote } from './UI';
export default function OverviewFidelity() {
  return (
    <div className="overviewFidelity" data-reference="2:2">
      <h1 className="srOnly">Overview</h1>
      <section className="overviewReferenceMetrics" aria-label="Key metrics">
        {[
          ['Agents live', '6', '+1 this week', 'healthy'],
          ['Tasks today', '7,112', '+18% vs yesterday', 'blue'],
          ['Success rate', '95.4%', '↑ 0.6% vs last week', 'healthy'],
          ['Avg latency', '1.2s', 'P50 across all agents', 'neutral'],
          ['AI spend', '$1,840', '82% monthly budget', 'neutral'],
          ['Incidents', '1', 'Sales Agent degraded', 'danger'],
        ].map(([label, value, note, tone]) => (
          <article key={label}>
            <h2>{label}</h2>
            <strong className={tone}>{value}</strong>
            <p>{note}</p>
          </article>
        ))}
      </section>
      <div className="overviewReferencePanels">
        <section className="overviewHealthPanel">
          <header>
            <h2>Agent Health</h2>
            <Link href="/agents">View all →</Link>
          </header>
          <Table
            caption="Agent health"
            headers={[
              'Agent',
              'Status',
              'Tasks/day',
              'Success',
              'Latency',
              'Trend',
            ]}
            rows={hybridAgents.slice(0, 5).map((a, i) => [
              <Link key={a.id} href={`/agents/${a.id}`}>
                <span
                  className={`overviewHealthDot ${a.status === 'Degraded' ? 'danger' : 'healthy'}`}
                />
                {a.name}
              </Link>,
              <span
                key="s"
                className={a.status === 'Degraded' ? 'danger' : 'healthy'}
              >
                {a.status}
              </span>,
              a.tasks,
              <strong
                key="success"
                className={a.status === 'Degraded' ? 'danger' : 'healthy'}
              >
                {a.success}
              </strong>,
              a.latency,
              <strong key="trend" className={i === 3 ? 'danger' : 'healthy'}>
                {['+4%', '+1%', '+2%', '-6%', '+3%'][i]}
              </strong>,
            ])}
          />
        </section>
        <section className="overviewActivityPanel">
          <header>
            <h2>Activity</h2>
          </header>
          <ul>
            {activity.map((text, i) => {
              const Icon = i === 1 ? AlertCircle : i === 4 ? Diamond : Check;
              return (
                <li key={text}>
                  <span
                    className={`overviewEventIcon ${i === 1 ? 'danger' : i === 2 || i === 4 ? 'blue' : 'healthy'}`}
                  >
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <Link
                      href={
                        [
                          '/deployments/customer-service',
                          '/agentops/incidents/inc-001',
                          '/evaluations/customer-service',
                          '/deployments',
                          '/governance',
                        ][i]
                      }
                    >
                      {text}
                    </Link>
                    <small>
                      {
                        [
                          '8 min ago',
                          '23 min ago',
                          '1h ago',
                          '2h ago',
                          '3h ago',
                        ][i]
                      }
                    </small>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <DataNote />
    </div>
  );
}
