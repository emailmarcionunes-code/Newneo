'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AgentIcon } from './Assets';
import { Button, FilterChip } from './UI';
import {
  catalogFilters,
  filterAgents,
  type AgentTemplate,
} from '@/lib/catalog';

export function AgentCard({
  agent,
  featured = false,
}: {
  agent: AgentTemplate;
  featured?: boolean;
}) {
  const index = [
    'customer-service',
    'it-support',
    'knowledge-assistant',
    'sales-assistant',
    'process-automation',
    'research-assistant',
  ].indexOf(agent.id);
  const details = [
    [
      'Medium',
      'Resolve faster. Escalate smarter.',
      [
        ['68%', 'Deflection'],
        ['4.8', 'CSAT'],
        ['< 2min', 'Resolution'],
      ],
    ],
    [
      'Medium',
      'Zero-touch IT operations.',
      [
        ['80%', 'First-call'],
        ['< 90s', 'Response'],
        ['24/7', 'Coverage'],
      ],
    ],
    [
      'Low',
      'Your organization’s memory.',
      [
        ['94%', 'Accuracy'],
        ['78%', 'Faster'],
        ['0', 'Hallucinations'],
      ],
    ],
    [
      'High',
      'Pipeline intelligence at scale.',
      [
        ['23%', 'Pipeline lift'],
        ['40%', 'Less entry'],
        ['Live', 'Deal insights'],
      ],
    ],
    [
      'High',
      'Workflows that think.',
      [
        ['90%', 'Automation'],
        ['3.2×', 'Throughput'],
        ['100%', 'Audit trail'],
      ],
    ],
    [
      'Low',
      'Strategic intelligence, instantly.',
      [
        ['10×', 'Faster'],
        ['Multi', 'Sources'],
        ['Exec', 'Ready outputs'],
      ],
    ],
  ] as const;
  const [complexity, tagline, metrics] =
    index >= 0
      ? details[index]
      : [
          agent.complexity ?? 'Medium',
          agent.tagline ?? agent.description,
          [
            ['Scoped', 'Permissions'],
            ['Review', 'Approvals'],
            ['Demo', 'Template'],
          ],
        ];
  return (
    <article className="agentCard hybridCatalogCard">
      <Link
        href={`/agents/launch?template=${agent.id}`}
        aria-label={`Get started with ${agent.name}`}
      >
        <div className="catalogCardTop">
          <AgentIcon type={agent.type} />
          <span className="modelPill" data-complexity={complexity}>
            {complexity}
          </span>
        </div>
        <h2>{agent.name}</h2>
        <p className="catalogTagline">{tagline}</p>
        <p>
          Business-ready template with recommended knowledge, tools, policies
          and evaluations.
        </p>
        <dl className="catalogMetrics">
          {metrics.map(([v, k]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Link>
    </article>
  );
}

export default function AgentCatalog() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const agents = filterAgents(filter).filter((a) =>
    `${a.name} ${a.description} ${a.tags.join(' ')}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  return (
    <div className="catalog">
      <div className="pageHead">
        <div>
          <h1>Choose a template or start from scratch</h1>
          <p>
            Start with a proven business pattern. Every agent still follows the
            same governed path to production.
          </p>
        </div>
        <Link className="button primary" href="/agents/launch?template=custom">
          + Create Custom Agent
        </Link>
      </div>
      <label className="catalogSearch">
        Search agent templates
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search agents, capabilities or categories…"
        />
      </label>
      <div className="filterRow" aria-label="Agent categories">
        {catalogFilters.map((category) => (
          <FilterChip
            key={category}
            active={filter === category}
            onClick={() => setFilter(category)}
          >
            {category}
          </FilterChip>
        ))}
      </div>
      <section className="agentGrid" aria-label="Agent templates" tabIndex={0}>
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} featured={false} />
        ))}
      </section>
      {!agents.length && (
        <section className="contextPanel">
          <h2>No agents in this category</h2>
          <p>
            Explore the catalog to find an approved agent for your use case.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setFilter('All');
              setSearch('');
            }}
          >
            Show all agents
          </Button>
        </section>
      )}
    </div>
  );
}
