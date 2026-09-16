'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  hybridAgents,
  sourceRows,
  actionRows,
  activity,
} from '@/lib/hybrid-data';
import { Button, FilterChip } from '../UI';
import ResourceExperience from '../ResourceExperience';
import {
  PageTitle,
  Metrics,
  Table,
  Status,
  DetailLink,
  DataNote,
  Bars,
} from './UI';
export function Agents() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  return (
    <div className="surfacePage hybridPage">
      <PageTitle
        title="All Agents"
        description="4 live · 1 staging · 1 degraded"
      >
        <Link className="button primary" href="/agents/catalog">
          + Create Agent
        </Link>
      </PageTitle>
      <div className="hybridControls">
        <input
          aria-label="Search agents"
          placeholder="Search agents…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filterRow">
          {['All', 'Live', 'Degraded', 'Staging'].map((v) => (
            <FilterChip
              key={v}
              active={filter === v}
              onClick={() => setFilter(v)}
            >
              {v}
            </FilterChip>
          ))}
        </div>
      </div>
      <Table
        caption="All agents"
        headers={[
          'Agent',
          'Status',
          'Tasks/day',
          'Success',
          'Latency',
          'Model',
        ]}
        rows={hybridAgents
          .filter(
            (a) =>
              (filter === 'All' || a.status === filter) &&
              a.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((a) => [
            <DetailLink key={a.id} href={`/agents/${a.id}`}>
              {a.name}
            </DetailLink>,
            <Status key="s">{a.status}</Status>,
            a.tasks,
            a.success,
            a.latency,
            a.model,
          ])}
      />
      <DataNote />
    </div>
  );
}
export function Overview() {
  return (
    <div className="surfacePage hybridPage">
      <h1 className="srOnly">Overview</h1>
      <Metrics
        items={[
          ['Agents live', '6', '+1 this week'],
          ['Tasks today', '7,112', '+18% vs yesterday'],
          ['Success rate', '95.4%', '↑ 0.6% vs last week'],
          ['Avg latency', '1.2s', 'P50 across all agents'],
          ['AI spend', '$1,840', '82% monthly budget'],
          ['Incidents', '1', 'Sales Agent degraded'],
        ]}
      />
      <div className="hybridSplit">
        <section className="panel">
          <div className="surfaceHeading">
            <h2>Agent Health</h2>
            <Link href="/agents">View all →</Link>
          </div>
          <Table
            caption="Agent health"
            headers={['Agent', 'Status', 'Tasks/day', 'Success', 'Latency']}
            rows={hybridAgents.slice(0, 5).map((a) => [
              <DetailLink key={a.id} href={`/agents/${a.id}`}>
                {a.name}
              </DetailLink>,
              <Status key="s">{a.status}</Status>,
              a.tasks,
              a.success,
              a.latency,
            ])}
          />
        </section>
        <section className="panel">
          <h2>Activity</h2>
          <ul className="hybridActivity">
            {activity.map((v, i) => (
              <li key={v}>
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
                  {v}
                </Link>
                <small>
                  {['8 min ago', '23 min ago', '1h ago', '2h ago', '3h ago'][i]}
                </small>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <DataNote />
    </div>
  );
}
export function Resources({ tools = false }: { tools?: boolean }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [manage, setManage] = useState(false);
  if (manage)
    return (
      <>
        <Button variant="secondary" onClick={() => setManage(false)}>
          ← Back to {tools ? 'Tools & Actions' : 'Knowledge Sources'}
        </Button>
        <ResourceExperience surface={tools ? 'tools' : 'knowledge'} />
      </>
    );
  return (
    <div className="surfacePage hybridPage">
      <PageTitle
        title={tools ? 'Tools & Actions' : 'Knowledge Sources'}
        description={
          tools
            ? 'Manage what agents can do, their permissions, risk and MCP execution layer.'
            : 'Monitor organization knowledge, sync health, coverage and agent usage.'
        }
      />
      <Metrics
        items={
          tools
            ? [
                ['Actions available', '10', 'across systems'],
                ['Active actions', '8', 'in use by agents'],
                ['High-risk actions', '2', 'human approval'],
                ['MCP servers', '4', '3 running'],
              ]
            : [
                ['Sources connected', '7', '8 total'],
                ['Documents indexed', '83,708', 'across all sources'],
                ['Index coverage', '91%', 'active sources'],
                ['Sync errors', '1', 'requires attention'],
              ]
        }
      />
      <div className="hybridControls">
        {tools ? (
          <div className="filterRow">
            {['All', 'Active', 'Restricted', 'Pending'].map((f) => (
              <FilterChip
                key={f}
                active={filter === f}
                onClick={() => setFilter(f)}
              >
                {f}
              </FilterChip>
            ))}
          </div>
        ) : (
          <input
            aria-label="Search sources"
            placeholder="Search sources…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
        <Button onClick={() => setManage(true)}>
          {tools ? '+ Add Tool' : '+ Connect Source'}
        </Button>
      </div>
      {tools ? (
        <div className="hybridSplit">
          <Table
            caption="Tool actions" emptyMessage="No tools match your filters. Clear the search or add an approved tool."
            headers={[
              'Action',
              'System',
              'Permission',
              'Risk',
              'Agents',
              'Status',
            ]}
            rows={actionRows
              .filter((r) => filter === 'All' || r[6] === filter)
              .map((r) => [
                <DetailLink key={r[0]} href={`/tools/${r[0]}`}>
                  {r[1]}
                </DetailLink>,
                r[2],
                r[3],
                <Status key="risk">{r[4]}</Status>,
                r[5],
                <Status key="s">{r[6]}</Status>,
              ])}
          />
          <aside>
            <section className="panel">
              <h2>MCP Servers</h2>
              <ul className="hybridActivity">
                {[
                  'filesystem-mcp',
                  'github-mcp',
                  'slack-mcp',
                  'postgres-mcp',
                ].map((x, i) => (
                  <li key={x}>
                    {x}
                    <Status>{i === 3 ? 'Error' : 'Live'}</Status>
                  </li>
                ))}
              </ul>
            </section>
            <section className="panel">
              <h2>Permission breakdown</h2>
              <Bars
                items={[
                  ['Read', 40, '2'],
                  ['Write', 80, '4'],
                  ['Execute', 40, '2'],
                  ['Admin', 20, '1'],
                ]}
              />
            </section>
          </aside>
        </div>
      ) : (
        <>
          <Table
            caption="Knowledge sources" emptyMessage="No knowledge sources match your search. Clear it or connect a source."
            headers={[
              'Source',
              'Type',
              'Documents',
              'Last Sync',
              'Status',
              'Agents using',
              'Coverage',
            ]}
            rows={sourceRows
              .filter((r) =>
                r.join(' ').toLowerCase().includes(search.toLowerCase()),
              )
              .map((r) => [
                <DetailLink key={r[0]} href={`/knowledge/${r[0]}`}>
                  {r[1]}
                </DetailLink>,
                ...r.slice(2, 5),
                <Status key="s">{r[5]}</Status>,
                r[6],
                r[7],
              ])}
          />
          <div className="intelligenceNote">
            <strong>NEWNEO INTELLIGENCE</strong>Google Drive has not synced. Fix
            OAuth to restore documents and improve Knowledge Assistant coverage.
          </div>
        </>
      )}
      <DataNote />
    </div>
  );
}
