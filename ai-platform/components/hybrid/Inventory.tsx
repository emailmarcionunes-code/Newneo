'use client';
import { useWorkspaceAgents } from '../journeys/WorkspaceAgents';
import { useState } from 'react';
import { usePreview, usePreviewValue } from '../journeys/PreviewState';
import Link from 'next/link';
import { hybridAgents, sourceRows, actionRows } from '@/lib/hybrid-data';
import { Button, FilterChip } from '../UI';
import { previewSourceRows } from '@/lib/source-preview';
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
  const hybridAgents = useWorkspaceAgents();
  const [filter, setFilter] = usePreviewValue('agents:filter', 'All');
  const [search, setSearch] = usePreviewValue('agents:search', '');
  return (
    <div className="surfacePage hybridPage agentsPage">
      <PageTitle
        title="All Agents"
        description={`${hybridAgents.filter((a) => a.status === 'Live').length} live · ${hybridAgents.filter((a) => a.status === 'Staging').length} staging · ${hybridAgents.filter((a) => a.status === 'Degraded').length} degraded`}
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
              <span className="agentNameWithStatus">
                <i
                  className={
                    a.status === 'Degraded'
                      ? 'hybridDanger'
                      : a.status === 'Live'
                        ? 'successText'
                        : 'blueText'
                  }
                  aria-hidden="true"
                />
                {a.name}
              </span>
            </DetailLink>,
            <Status key="s">{a.status}</Status>,
            a.tasks,
            <span
              key="success"
              className={
                a.status === 'Degraded'
                  ? 'hybridDanger'
                  : a.status === 'Live'
                    ? 'successText'
                    : ''
              }
            >
              {a.success}
            </span>,
            a.latency,
            a.model,
          ])}
      />
      <DataNote />
    </div>
  );
}
export { default as Overview } from './OverviewFidelity';
export function Resources({ tools = false }: { tools?: boolean }) {
  const { state } = usePreview();
  const sourceRows = previewSourceRows(state.ui);
  const [search, setSearch] = usePreviewValue(`inventory:${tools}:search`, '');
  const [filter, setFilter] = usePreviewValue(
    `inventory:${tools}:filter`,
    'All',
  );
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
    <div
      className={`surfacePage hybridPage ${tools ? 'toolsPage' : 'knowledgePage'}`}
    >
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
                [
                  'Sources connected',
                  String(sourceRows.filter((r) => r[5] === 'Live').length),
                  `${sourceRows.length} total`,
                ],
                [
                  'Documents indexed',
                  sourceRows
                    .reduce(
                      (sum, r) => sum + (Number(r[3].replaceAll(',', '')) || 0),
                      0,
                    )
                    .toLocaleString('en-US'),
                  'across all sources',
                ],
                [
                  'Index coverage',
                  `${Math.round(sourceRows.reduce((sum, r) => sum + (parseFloat(r[7]) || 0), 0) / sourceRows.length)}%`,
                  'all sources',
                ],
                [
                  'Sync errors',
                  String(sourceRows.filter((r) => r[5] === 'Error').length),
                  'requires attention',
                ],
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
            caption="Tool actions"
            emptyMessage="No tools match your filters. Clear the search or add an approved tool."
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
              <div className="surfaceHeading">
                <h2>MCP Servers</h2>
                <span className="modelPill">3/4 online</span>
              </div>
              <ul className="mcpServers">
                {[
                  'filesystem-mcp',
                  'github-mcp',
                  'slack-mcp',
                  'postgres-mcp',
                ].map((x, i) => (
                  <li key={x}>
                    <span
                      className={i === 3 ? 'hybridDanger' : 'successText'}
                      aria-label={i === 3 ? 'Offline' : 'Online'}
                    >
                      ●
                    </span>
                    <span>{x}</span>
                    <small>{['4ms', '32ms', '18ms', '—'][i]}</small>
                  </li>
                ))}
              </ul>
            </section>
            <section className="panel permissionBreakdown">
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
            caption="Knowledge sources"
            emptyMessage="No knowledge sources match your search. Clear it or connect a source."
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
                <span
                  key="coverage"
                  className={
                    parseInt(r[7]) >= 85
                      ? 'successText'
                      : parseInt(r[7]) === 0
                        ? 'hybridDanger'
                        : 'warningText'
                  }
                >
                  {r[7]}
                </span>,
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
