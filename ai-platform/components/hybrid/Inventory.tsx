'use client';
import AgentInventoryView from './AgentInventoryView';
import { RefreshCw } from 'lucide-react';
import { deploymentRecords } from '@/lib/preview-records';
import { IconLabel, Tag, Progress } from './UI';
import { useWorkspaceAgents } from '../journeys/WorkspaceAgents';
import { useState } from 'react';
import { usePreview, usePreviewValue } from '../journeys/PreviewState';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { actionRows as fixtureActions } from '@/lib/hybrid-data';
import { Button, FilterChip } from '../UI';
import { previewSourceRows } from '@/lib/source-preview';
import ResourceExperience from '../ResourceExperience';
import { PageTitle, Metrics, Table, Status, DetailLink, DataNote } from './UI';
export function Agents() {
  const { state } = usePreview();
  const hybridAgents = useWorkspaceAgents();
  const [filter, setFilter] = usePreviewValue('agents:filter', 'All');
  const [search, setSearch] = usePreviewValue('agents:search', '');
  const router = useRouter();
  const visibleAgents = hybridAgents.filter(
    (a) =>
      (filter === 'All' || a.status === filter) &&
      a.name.toLowerCase().includes(search.toLowerCase()),
  );
  return <AgentInventoryView description={`${hybridAgents.filter(a=>a.status==='Live').length} live · ${hybridAgents.filter(a=>a.status==='Staging').length} staging · ${hybridAgents.filter(a=>a.status==='Degraded').length} degraded`} action={<Link className="button primary" href="/agents/catalog">+ Add Agent</Link>} search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} filters={['All','Live','Degraded','Paused','Staging']} note="Interactive demo · sample data · no live execution" rows={visibleAgents.map(a=>({id:a.id,name:a.name,status:a.status,version:String(state.releases.find(r=>r.agentId===a.id&&r.state==='Active')?.version??state.ui?.[`agent:${a.id}:version`]??deploymentRecords.find(r=>r.agentId===a.id&&r.status==='Success')?.version??'—'),tasks:a.tasks,success:<span className={a.status==='Degraded'?'hybridDanger':a.status==='Live'?'successText':''}>{a.success}</span>,latency:a.latency,model:a.model,owner:String(state.ui?.[`agent:${a.id}:owner`]??'Ops Team'),deployed:a.id.startsWith('preview-')?'This session':deploymentRecords.find(r=>r.agentId===a.id&&r.status==='Success')?.when??'—'}))}>{!hybridAgents.length&&<section className="panel"><h2>Add your first Agent</h2><p>Choose an Agent, review its mission and follow the eight-step guide. No credentials are required for this demo.</p><Link href="/agents/catalog">Browse templates →</Link></section>}</AgentInventoryView>;
}

export { default as Overview } from './OverviewFidelity';
export function Resources({ tools = false }: { tools?: boolean }) {
  const { state } = usePreview();
  const sourceRows = previewSourceRows(state.ui);
  const actionRows =
    state.ui?.['demo:dataset'] === 'empty' ? [] : fixtureActions;
  const [search, setSearch] = usePreviewValue(`inventory:${tools}:search`, '');
  const [manage, setManage] = useState(false);
  const [toolTab, setToolTab] = useState('Tools');
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
        title={tools ? 'Tools & MCP' : 'Knowledge'}
        description={
          tools
            ? 'Actions available to your enterprise agents'
            : 'Enterprise data sources powering your agents'
        }
      >
        <Button variant="outline" onClick={() => setManage(true)}>
          {tools ? '+ Add Tool' : '+ Add Source'}
        </Button>
      </PageTitle>
      {!tools && (
        <Metrics
          items={
            tools
              ? [
                  [
                    'Actions available',
                    String(actionRows.length),
                    'across systems',
                  ],
                  [
                    'Active actions',
                    String(
                      actionRows.filter((r) => r.includes('Active')).length,
                    ),
                    'in use by agents',
                  ],
                  [
                    'High-risk actions',
                    state.ui?.['demo:dataset'] === 'empty' ? '0' : '2',
                    'human approval',
                  ],
                  [
                    'MCP servers',
                    state.ui?.['demo:dataset'] === 'empty' ? '0' : '4',
                    state.ui?.['demo:dataset'] === 'empty'
                      ? 'None connected'
                      : '3 running',
                  ],
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
                        (sum, r) =>
                          sum + (Number(r[3].replaceAll(',', '')) || 0),
                        0,
                      )
                      .toLocaleString('en-US'),
                    'across all sources',
                  ],
                  [
                    'Index coverage',
                    `${Math.round(sourceRows.reduce((sum, r) => sum + (parseFloat(r[7]) || 0), 0) / Math.max(1, sourceRows.length))}%`,
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
      )}
      <div className="hybridControls">
        {tools ? (
          <div className="filterRow">
            {['Tools', 'MCP Servers'].map((f) => (
              <FilterChip
                key={f}
                active={toolTab === f}
                onClick={() => setToolTab(f)}
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
      </div>
      {tools ? (
        <div className="referenceToolContent">
          {toolTab === 'Tools' ? (
            <Table
              caption="Tool actions"
              emptyMessage="No tools match your filters. Clear the search or add an approved tool."
              headers={[
                'Action',
                'System',
                'Permission',
                'Risk',
                'Agents',
                'Calls Today',
                'Last Used',
                'Status',
              ]}
              rows={actionRows.map((r) => [
                <DetailLink key={r[0]} href={`/tools/${r[0]}`}>
                  <IconLabel kind="tool">{r[1]}</IconLabel>
                </DetailLink>,
                <Tag key="system">{r[2]}</Tag>,
                <span className="referenceMono" key="permission">
                  {r[3]}
                </span>,
                <Status key="risk">{r[4]}</Status>,
                r[5],
                r[6] === 'Active' ? '287' : '—',
                <span key="used" className="referenceMono">
                  —
                </span>,
                <Status key="s">{r[6]}</Status>,
              ])}
            />
          ) : (
            <div className="referenceServers">
              {(state.ui?.['demo:dataset'] === 'empty'
                ? []
                : [
                    'Internal MCP Gateway',
                    'Salesforce MCP Adapter',
                    'ITSM MCP Bridge',
                  ]
              ).map((name, i) => (
                <section className="panel" key={name}>
                  <IconLabel kind="server">
                    <span>
                      <strong>{name}</strong>{' '}
                      <Tag>{['v1.4', 'v2.1', 'v1.0'][i]}</Tag>
                      <small>{[12, 6, 8][i]} tools registered</small>
                    </span>
                  </IconLabel>
                  <Status>{i === 2 ? 'Degraded' : 'Online'}</Status>
                </section>
              ))}
              <div className="intelligenceNote">
                <strong>NEWNEO</strong>ITSM MCP Bridge is degraded — latency
                increased 3× in the last hour. This may affect IT Support Agent
                tool execution.
              </div>
            </div>
          )}
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
              'Region',
              'Sync',
            ]}
            rows={sourceRows
              .filter((r) =>
                r.join(' ').toLowerCase().includes(search.toLowerCase()),
              )
              .map((r) => [
                <DetailLink key={r[0]} href={`/knowledge/${r[0]}`}>
                  <IconLabel kind="source">{r[1]}</IconLabel>
                </DetailLink>,
                <Tag key="type">{r[2]}</Tag>,
                r[3],
                <span key="sync" className="referenceMono">
                  {r[4]}
                </span>,
                <Status key="s">{r[5]}</Status>,
                r[6],
                <Progress
                  key="coverage"
                  value={parseFloat(r[7])}
                  label={`${r[1]} coverage`}
                />,
                <span key="region" className="referenceMono">
                  EU (Frankfurt)
                </span>,
                <Link
                  key="refresh"
                  className="referenceSync"
                  href={`/knowledge/${r[0]}?tab=Sync`}
                  aria-label={`Manage synchronization for ${r[1]}`}
                >
                  <RefreshCw size={15} aria-hidden="true" />
                </Link>,
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
