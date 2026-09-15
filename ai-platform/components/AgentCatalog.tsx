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
  return (
    <article className={`agentCard${featured ? ' featured' : ''}`}>
      <AgentIcon type={agent.type} />
      <h2>{agent.name}</h2>
      <p>{agent.description}</p>
      <div className="tags">
        {agent.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <Link
        className="agentLaunch"
        href={`/agents/launch?template=${agent.id}`}
        aria-label={`Get started with ${agent.name}`}
      >
        Get started →
      </Link>
    </article>
  );
}
export default function AgentCatalog() {
  const [filter, setFilter] = useState('All');
  const agents = filterAgents(filter);
  return (
    <div className="catalog">
      <div className="pageHead">
        <div>
          <h1>Agent Catalog</h1>
          <p>Pre-built and custom agents for real business outcomes.</p>
        </div>
        <Link className="button primary" href="/agents/launch?template=custom">
          + Create Custom Agent
        </Link>
      </div>
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
      <section className="agentGrid" aria-label="Agent templates">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            featured={agent.id === 'customer-service'}
          />
        ))}
      </section>
      {!agents.length && (
        <section className="contextPanel">
          <h2>No agents in this category</h2>
          <p>
            Explore the catalog to find an approved agent for your use case.
          </p>
          <Button variant="secondary" onClick={() => setFilter('All')}>
            Show all agents
          </Button>
        </section>
      )}
    </div>
  );
}
