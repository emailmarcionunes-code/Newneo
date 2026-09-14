'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FilterChip } from './UI';

const metrics = [
  ['Agents in Production', '12', 'Across the demo organization'],
  ['Successful Tasks', '4,600', '92% of 5,000 tasks this month'],
  ['Evaluation Score', '92%', 'Latest reference evaluation'],
  ['Human Escalation Rate', '8%', '400 of 5,000 tasks this month'],
  ['AI Cost This Month', '$240', 'Illustrative usage · USD'],
  ['Business Outcome', '120 h', 'Estimated hours saved this month'],
  ['Security Events', '2', 'Both reviewed · none outstanding'],
  ['Critical Incidents', '0', 'No open critical incidents'],
];
const health = [
  [
    'Quality',
    'Needs attention',
    'One agent has evaluation cases requiring review.',
  ],
  [
    'Reliability',
    'Healthy',
    '92% of tasks completed successfully in this sample.',
  ],
  [
    'Security',
    'Healthy',
    'Two reviewed events; no outstanding security events.',
  ],
  ['Economics', 'Healthy', '$240 in illustrative AI usage this month.'],
  [
    'Business Outcome',
    'Healthy',
    '120 estimated hours saved across the demo organization.',
  ],
];
const attention = [
  {
    name: 'Customer Service Agent',
    issue: 'Evaluation cases need review',
    impact: 'The next version is waiting for evaluation review.',
    action: 'Review the failed cases before promoting a new version.',
    status: 'Needs review',
  },
  {
    name: 'Knowledge Assistant',
    issue: 'Knowledge source needs an update',
    impact: 'Answers may not reflect the latest support policy.',
    action:
      'Refresh the source and evaluate answers against the updated policy.',
    status: 'Needs attention',
  },
];
const changes = [
  ['Agent deployed', 'Customer Service Agent · version 1.2', '2 hours ago'],
  [
    'Knowledge source updated',
    'Knowledge Assistant · support documentation',
    '3 hours ago',
  ],
  [
    'Evaluation failed',
    'Customer Service Agent · candidate version 1.3',
    '4 hours ago',
  ],
  [
    'Policy modified',
    'Human approval required for external actions',
    'Yesterday',
  ],
];

export default function Overview() {
  const [empty, setEmpty] = useState(false);
  return (
    <div className="overview">
      <div className="pageHead">
        <div>
          <h1>Overview</h1>
          <p>Is your enterprise AI healthy, useful and under control?</p>
        </div>
        <Link href="/agents" className="button primary">
          Browse Agent Catalog →
        </Link>
      </div>
      <div className="overviewDemo">
        <div>
          <strong>Demo workspace</strong>
          <p>
            Illustrative data only. No live agents, usage or incidents are
            connected.
          </p>
        </div>
        <div className="overviewModes" aria-label="Preview scenario">
          <FilterChip active={!empty} onClick={() => setEmpty(false)}>
            Sample activity
          </FilterChip>
          <FilterChip active={empty} onClick={() => setEmpty(true)}>
            No agents
          </FilterChip>
        </div>
      </div>
      {empty ? (
        <section className="panel overviewEmpty">
          <span className="eyebrow">GET STARTED</span>
          <h2>Launch your first enterprise AI use case.</h2>
          <p>
            Choose an agent from the catalog to define its use case, knowledge
            and approved actions.
          </p>
          <Link href="/agents" className="button primary">
            Browse Agent Catalog
          </Link>
        </section>
      ) : (
        <>
          <section aria-label="Key metrics" className="overviewMetrics">
            {metrics.map(([label, value, note]) => (
              <article className="agentCard overviewMetric" key={label}>
                <h2>{label}</h2>
                <strong>{value}</strong>
                <p>{note}</p>
                <span className="tag">Sample data</span>
              </article>
            ))}
          </section>
          <section
            className="panel overviewHealth"
            aria-labelledby="health-title"
          >
            <div className="overviewSectionHead">
              <div>
                <h2 id="health-title">Enterprise AI Health</h2>
                <p>
                  Quality, reliability, security, economics and business
                  outcomes.
                </p>
              </div>
              <span className="overviewStatus warning">Needs attention</span>
            </div>
            <p className="overviewHealthNote">
              Evaluation review is needed. This sample status is illustrative,
              not a calculated production score.
            </p>
            <div className="overviewHealthGrid">
              {health.map(([name, status, detail]) => (
                <details key={name}>
                  <summary>
                    <strong>{name}</strong>
                    <span
                      className={`overviewStatus ${status === 'Healthy' ? 'healthy' : 'warning'}`}
                    >
                      {status}
                    </span>
                  </summary>
                  <p>{detail}</p>
                </details>
              ))}
            </div>
          </section>
          <section aria-labelledby="attention-title">
            <div className="overviewSectionHead">
              <div>
                <h2 id="attention-title">Agents requiring attention</h2>
                <p>Prioritized issues and recommended next steps.</p>
              </div>
              <span className="tag">2 agents</span>
            </div>
            <div className="overviewAttention">
              {attention.map((item, index) => (
                <article className="agentCard" key={item.name}>
                  <div className="overviewSectionHead">
                    <span className="eyebrow">PRIORITY {index + 1}</span>
                    <span className="overviewStatus warning">
                      {item.status}
                    </span>
                  </div>
                  <h3>{item.name}</h3>
                  {index === 0 && (
                    <Link
                      className="agentLaunch"
                      href="/agents/customer-service"
                    >
                      View agent →
                    </Link>
                  )}
                  <strong>{item.issue}</strong>
                  <p>{item.impact}</p>
                  <details>
                    <summary>Recommended action</summary>
                    <p>{item.action}</p>
                  </details>
                </article>
              ))}
            </div>
          </section>
          <div className="overviewBottom">
            <section className="panel" aria-labelledby="outcomes-title">
              <h2 id="outcomes-title">Business outcomes</h2>
              <p className="overviewMuted">
                This month · illustrative estimates
              </p>
              <dl className="overviewOutcomes">
                <div>
                  <dt>Support cases resolved</dt>
                  <dd>1,840</dd>
                </div>
                <div>
                  <dt>Hours saved</dt>
                  <dd>120 h</dd>
                </div>
                <div>
                  <dt>Cycle time reduced</dt>
                  <dd>18%</dd>
                </div>
                <div>
                  <dt>Tickets avoided</dt>
                  <dd>320</dd>
                </div>
              </dl>
            </section>
            <section className="panel" aria-labelledby="changes-title">
              <h2 id="changes-title">Recent changes</h2>
              <ul className="overviewChanges">
                {changes.map(([title, detail, time]) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <p>{detail}</p>
                    <span>{time} · sample activity</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
