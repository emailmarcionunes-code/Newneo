'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  allSkills,
  latestSkills,
  composition,
  maturities,
  type Skill,
} from '@/lib/skills';
import { productionVersion } from '@/lib/preview-records';
import { usePreview } from './journeys/PreviewState';
import { useWorkspaceAgents } from './journeys/WorkspaceAgents';
import { useDemoAccess } from './journeys/DemoExperience';
import { Tabs, Panel } from './journeys/Shared';
import { PageTitle, Metrics, Table, Tag, Status, DataNote, IconLabel } from './hybrid/UI';
import { Button } from './UI';
import { SkillPortfolio, SkillReuseDetail } from './SkillPortfolio';
import { capabilityCores, coreUsage } from '@/lib/skill-portfolio';
import { SkillBuilder } from './SkillBuilder';
import SkillInventoryLayout from './hybrid/SkillInventoryLayout';

// Clearly labeled historical demo aggregates, pinned to specific Skill versions.
// New definitions and bindings do not manufacture execution evidence.
const samples: Record<
  string,
  {
    executions: number;
    success: number;
    p95: number;
    cost: number;
    trend: number[];
  }
> = {
  'create-ticket:1.0': {
    executions: 32105,
    success: 99.7,
    p95: 1.4,
    cost: 0.012,
    trend: [1, 1, 2, 2],
  },
  'search-crm:1.0': {
    executions: 18420,
    success: 99.1,
    p95: 0.9,
    cost: 0.008,
    trend: [0, 1, 1, 1],
  },
  'executive-summary:1.0': {
    executions: 1240,
    success: 97.5,
    p95: 2.8,
    cost: 0.045,
    trend: [0, 0, 1, 1],
  },
};
function useSkillsData() {
  const { state, update } = usePreview();
  const agents = useWorkspaceAgents();
  const definitions = allSkills(state.ui),
    library = latestSkills(state.ui);
  const usedBy = (skillId: string) =>
    agents.flatMap((a) => {
      const version =
        state.releases.find(
          (r) =>
            r.agentId === a.id &&
            r.target === 'Production' &&
            r.state === 'Active',
        )?.version || productionVersion(a.id);
      const binding = composition(state.ui, a.id, version).bindings.find(
        (b) => b.skillId === skillId,
      );
      return binding
        ? [
            {
              id: a.id,
              name: a.name,
              agentVersion: version,
              skillVersion: binding.skillVersion,
            },
          ]
        : [];
    });
  const telemetry = (skillId: string) => {
    const users = usedBy(skillId);
    const versions = [...new Set(users.map((u) => u.skillVersion))];
    const measured = versions
      .map((v) => samples[`${skillId}:${v}`])
      .filter(Boolean);
    const executions = measured.reduce((n, m) => n + m.executions, 0);
    return {
      users,
      executions: measured.length ? executions : null,
      success: executions
        ? measured.reduce((n, m) => n + m.executions * m.success, 0) /
          executions
        : null,
      p95: measured.length === 1 ? measured[0].p95 : null,
      cost: executions
        ? measured.reduce((n, m) => n + m.executions * m.cost, 0) / executions
        : null,
      trend: measured.length === 1 ? measured[0].trend : null,
    };
  };
  const status = (s: Skill) =>
    String(state.ui?.[`skill:${s.id}:status`] || 'Active');
  return {
    state,
    update,
    library,
    definitions,
    agents,
    usedBy,
    telemetry,
    status,
  };
}
const number = (v: number | null) =>
  v === null ? '—' : v.toLocaleString('en-US');
const percent = (v: number | null) => (v === null ? '—' : `${v.toFixed(1)}%`);
export function GlobalSkills() {
  const data = useSkillsData();
  const { can } = useDemoAccess();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('List');
  const views = ['List', 'Pipeline', 'Matrix', 'Intelligence'];
  const [filters, setFilters] = useState<Record<string, string>>({
    Domain: 'All',
    Maturity: 'All',
    Risk: 'All',
    Status: 'All',
    Owner: 'All',
    Usage: 'All',
  });
  const options: Record<string, string[]> = {
    Domain: [
      ...new Set([
        ...data.library.map((s) => s.domain),
        'Customer Service',
        'HR',
        'Operations',
      ]),
    ],
    Maturity: [...maturities],
    Risk: ['Low', 'Medium', 'High'],
    Status: ['Active', 'Inactive'],
    Owner: [...new Set(data.library.map((s) => s.owner))],
    Usage: ['Used by Agents', 'Not used'],
  };
  const rows = data.library.filter(
    (s) =>
      `${s.name} ${s.description}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      Object.entries(filters).every(
        ([key, v]) =>
          v === 'All' ||
          (key === 'Domain'
            ? s.domain === v
            : key === 'Maturity'
              ? s.maturity === v
              : key === 'Risk'
                ? s.riskLevel === v
                : key === 'Status'
                  ? data.status(s) === v
                  : key === 'Owner'
                    ? s.owner === v
                    : v === 'Used by Agents'
                      ? data.usedBy(s.id).length > 0
                      : data.usedBy(s.id).length === 0),
      ),
  );
  const measurements = data.library.map((s) => data.telemetry(s.id));
  const total = measurements.reduce((n, m) => n + (m.executions || 0), 0);
  const most = [...data.library].sort(
    (a, b) =>
      data.usedBy(b.id).length - data.usedBy(a.id).length ||
      (data.telemetry(b.id).executions || 0) -
        (data.telemetry(a.id).executions || 0),
  )[0];
  const toolbar = (<div className="skillFilters portfolioFilters">
              <label>
                Search Skills
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or capability"
                />
              </label>
              {Object.entries(options).map(([key, values]) => (
                <label key={key}>
                  {key}
                  <select
                    value={filters[key]}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, [key]: e.target.value }))
                    }
                  >
                    {['All', ...values].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>);
  return (
    <SkillInventoryLayout view={view} onView={setView}
      action={<Button disabled={!can('create')} onClick={()=>router.push('/skills/new')}>+ Create Skill</Button>}
      metrics={[
          ['Total Skills', String(data.library.length)],
          [
            'Production Ready',
            String(
              data.library.filter((s) => s.maturity === 'Production Ready')
                .length,
            ),
          ],
          [
            'Proven at Scale',
            String(
              data.library.filter((s) => s.maturity === 'Proven at Scale')
                .length,
            ),
          ],
          [
            'Reused Across Domains',
            String(
              capabilityCores.filter(
                (c) => coreUsage(data.library, c.id).domains.length > 1,
              ).length,
            ),
          ],
          ['Executions (30d)', total ? number(total) : '—'],
          [
            'Active Agents Using Skills',
            String(
              new Set(
                measurements.flatMap((m) =>
                  m.users
                    .filter((u) =>
                      data.agents.some(
                        (a) =>
                          a.id === u.id &&
                          ['Live', 'Degraded'].includes(a.status),
                      ),
                    )
                    .map((u) => u.id),
                ),
              ).size,
            ),
          ],
        ]}>
        {view === 'Intelligence' && most && data.usedBy(most.id).length > 0 && (
          <section className="panel">
            <h2>Most Used Skill</h2>
            <Link href={`/skills/${most.id}`}>{most.name} →</Link>
            <p>
              Used by {data.usedBy(most.id).length} Agents ·{' '}
              {number(data.telemetry(most.id).executions)} executions / 30d ·{' '}
              {percent(data.telemetry(most.id).success)} success
            </p>
          </section>
        )}
        {(view === 'Matrix' || view === 'Intelligence') && (
          <SkillPortfolio
            skills={data.library}
            telemetry={data.telemetry}
            view={view}
          />
        )}
        {(view === 'Pipeline' || view === 'List') && (
          <>
            {view === 'Pipeline' && toolbar}
            {view === 'Pipeline' && (
              <div className="skillPipeline" aria-label="Skills by maturity">
                {maturities.map((maturity, index) => {
                  const members = rows.filter((s) => s.maturity === maturity);
                  return (
                    <section
                      className={`skillLane lane${index}`}
                      key={maturity}
                      aria-label={maturity}
                    >
                      <header>
                        <h2>{maturity}</h2>
                        <span>{members.length} Skills</span>
                      </header>
                      <div className="skillLaneCards">
                        {members.length ? (
                          members.map((s) => {
                            const t = data.telemetry(s.id);
                            return (
                              <Link
                                className="pipelineCard"
                                href={`/skills/${s.id}`}
                                key={s.id}
                              >
                                <strong>{s.name}</strong>
                                <span>
                                  {s.domain} · v{s.version}
                                </span>
                                <div>
                                  <span>{t.users.length} Agents</span>
                                  <span>{s.riskLevel} risk</span>
                                </div>
                                <div>
                                  <span>{number(t.executions)} executions</span>
                                  <span>{percent(t.success)} success</span>
                                </div>
                                <small>
                                  {data.status(s)} · {s.owner}
                                </small>
                              </Link>
                            );
                          })
                        ) : (
                          <p className="laneEmpty">No matching Skills</p>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
            {view === 'List' && (
              <section className="skillsListPanel" aria-label="Skill inventory">
                <Table
                  caption="Organization Skills"
                  toolbar={toolbar}
                  headers={[
                    'Skill',
                    'Domain',
                    'Maturity',
                    'Version',
                    'Risk',
                    'Status',
                    'Agents Using',
                    'Executions (30d)',
                    'Success Rate',
                    'Last Updated',
                    'Owner',
                  ]}
                  onRowClick={(i) => router.push(`/skills/${rows[i].id}`)}
                  rows={rows.map((s) => {
                    const t = data.telemetry(s.id);
                    return [
                      <Link key="name" href={`/skills/${s.id}`}>
                        <IconLabel kind="skill">{s.name}</IconLabel>
                      </Link>,
                      s.domain,
                      <Tag key="maturity">{s.maturity}</Tag>,
                      `v${s.version}`,
                      s.riskLevel,
                      <Status key="status">{data.status(s)}</Status>,
                      t.users.length,
                      number(t.executions),
                      percent(t.success),
                      new Date(s.updatedAt).toLocaleDateString('en-US'),
                      s.owner,
                    ];
                  })}
                />
              </section>
            )}
          </>
        )}
    </SkillInventoryLayout>
  );
}
export function GlobalSkillBuilder({
  sourceId,
  returnAgent,
}: {
  sourceId?: string;
  returnAgent?: string;
}) {
  const data = useSkillsData();
  const router = useRouter();
  const { ready } = usePreview();
  const source = sourceId ? data.library.find((s) => s.id === sourceId) : null;
  const [published, setPublished] = useState<Skill | null>(null);
  if (!ready) return <p>Loading Skills…</p>;
  if (sourceId && !source)
    return (
      <section className="panel">
        <h1>Skill not found</h1>
        <Link href="/skills">Back to Skills</Link>
      </section>
    );
  return (
    <div className="surfacePage hybridPage">
      <PageTitle
        title={source ? 'Create Skill Version' : 'Create Skill'}
        description="Define a reusable capability for your organization."
      />
      {published ? (
        <section className="panel" role="status">
          <h2>Skill published successfully</h2>
          <p>
            {published.name} v{published.version} is available in the
            organization-wide demo library. Existing Agent bindings are
            unchanged.
          </p>
          <div className="skillActions">
            <Link className="button primary" href={`/skills/${published.id}`}>
              View Skill
            </Link>
            <Link className="button secondary" href="/skills">
              Open Skill Library
            </Link>
            {returnAgent && data.agents.some((a) => a.id === returnAgent) && (
              <Link
                className="button secondary"
                href={`/agents/${returnAgent}`}
                onClick={() =>
                  data.update((s) => ({
                    ...s,
                    ui: { ...s.ui, [`agent:${returnAgent}:tab`]: 'Skills' },
                  }))
                }
              >
                Return to Agent to add Skill
              </Link>
            )}
          </div>
        </section>
      ) : (
        <SkillBuilder
          source={source || null}
          onClose={() => router.push('/skills')}
          onPublished={setPublished}
        />
      )}
    </div>
  );
}
const names = [
  'Overview',
  'Configuration',
  'Tools',
  'Knowledge',
  'Governance',
  'Evaluations',
  'Versions',
  'Usage',
];
export function GlobalSkillDetail({ id }: { id: string }) {
  const data = useSkillsData();
  const { ready } = usePreview();
  const { can } = useDemoAccess();
  const router = useRouter();
  const [tab, setTab] = useState('Overview');
  const [selectedVersion, setSelectedVersion] = useState('');
  const current = data.library.find((s) => s.id === id);
  if (!ready) return <p>Loading Skill…</p>;
  if (!current)
    return (
      <section className="panel">
        <h1>Skill not found</h1>
        <Link href="/skills">Back to Skills</Link>
      </section>
    );
  const skill =
    data.definitions.find(
      (s) => s.id === id && s.version === selectedVersion,
    ) || current;
  const versions = data.definitions.filter((s) => s.id === id);
  const t = data.telemetry(id);
  const outdated = t.users.filter((a) => a.skillVersion !== current.version);
  const agentLink = (a: (typeof t.users)[number]) => (
    <Link
      href={`/agents/${a.id}`}
      onClick={() =>
        data.update((s) => ({
          ...s,
          ui: { ...s.ui, [`agent:${a.id}:tab`]: 'Skills' },
        }))
      }
    >
      {a.name}
    </Link>
  );
  return (
    <div className="surfacePage hybridPage skillDetailPage">
      <Link href="/skills">← Skills</Link>
      <PageTitle
        title={skill.name}
        description={`${skill.domain} · v${skill.version} · ${skill.maturity}`}
      >
        <Button
          disabled={!can('create')}
          onClick={() =>
            router.push(`/skills/new?source=${encodeURIComponent(id)}`)
          }
        >
          Create New Version
        </Button>
      </PageTitle>
      <Metrics
        items={[
          ['Agents Using', String(t.users.length)],
          ['Executions (30d)', number(t.executions)],
          ['Success Rate', percent(t.success)],
          ['P95 Latency', t.p95 === null ? '—' : `${t.p95}s`],
          [
            'Avg Cost / Execution',
            t.cost === null ? '—' : `$${t.cost.toFixed(3)}`,
          ],
        ]}
      />
      {outdated.length > 0 && (
        <section className="intelligenceNote">
          <strong>Update available</strong>
          <p>
            {current.name} v{current.version} is available. {outdated.length}{' '}
            Agents use older versions. Update each Agent through a draft,
            evaluation and approval.
          </p>
          {outdated.map((a) => (
            <p key={a.id}>
              {agentLink(a)} · Skill v{a.skillVersion}
            </p>
          ))}
        </section>
      )}
      <section className="skillDetailPanel" aria-label="Skill details">
        <Tabs names={names} current={tab} onChange={setTab} />
        <Panel names={names} current={tab}>
          {tab === 'Overview' && (
            <div className="skillOverviewGrid">
              <section className="panel">
                <h2>Capability</h2>
                <p>{skill.description}</p>
              </section>
              <SkillReuseDetail
                skill={skill}
                skills={data.library}
                telemetry={data.telemetry}
              />
              <section className="panel">
                <p>
                  Owner: {skill.owner} · Risk: {skill.riskLevel} · Status:{' '}
                  {data.status(skill)}
                </p>
                <h2>Used by</h2>
                {t.users.length ? (
                  t.users.map((a) => (
                    <p key={a.id}>
                      {agentLink(a)} · Agent {a.agentVersion} → Skill v
                      {a.skillVersion}
                    </p>
                  ))
                ) : (
                  <p>
                    No Agents use this Skill yet. Open an Agent’s Skills tab to
                    add it.
                  </p>
                )}
                <p>
                  Usage metrics aggregate currently consumed versions; selected
                  definition: v{skill.version}.
                </p>
              </section>
            </div>
          )}
          {tab === 'Configuration' && (
            <>
              <h2>Capability definition</h2>
              <p>{skill.instructions}</p>
              <p>Owner: {skill.owner}</p>
              <h3>Inputs</h3>
              <pre>{JSON.stringify(skill.inputSchema, null, 2)}</pre>
              <h3>Outputs</h3>
              <pre>{JSON.stringify(skill.outputSchema, null, 2)}</pre>
              <p>Parameters: {skill.parameterDefaults || '{}'}</p>
              <p>Definitions are immutable. Use Create New Version to edit.</p>
              <Button
                variant="secondary"
                disabled={!can('create')}
                onClick={() =>
                  data.update((s) => ({
                    ...s,
                    ui: {
                      ...s.ui,
                      [`skill:${id}:status`]:
                        data.status(skill) === 'Active' ? 'Inactive' : 'Active',
                    },
                    audit: [
                      `${skill.name} library status changed · preview`,
                      ...s.audit,
                    ],
                  }))
                }
              >
                {data.status(skill) === 'Active' ? 'Deactivate' : 'Activate'}{' '}
                library Skill
              </Button>
              <p>
                Inactive Skills cannot receive new bindings. Existing pinned
                Agent compositions remain unchanged.
              </p>
            </>
          )}
          {tab === 'Tools' && (
            <>
              <h2>Tools / MCP requirements</h2>
              {skill.toolRequirements.length ? (
                <ul>
                  {skill.toolRequirements.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              ) : (
                <p>No tools required.</p>
              )}
              <p>
                Permissions:{' '}
                {skill.permissionRequirements ||
                  'Least privilege within the Agent scope'}
              </p>
              <Link href="/tools">Open Tools & MCP →</Link>
            </>
          )}
          {tab === 'Knowledge' && (
            <>
              <h2>Knowledge requirements</h2>
              {skill.requiredKnowledgeTypes.length ? (
                <ul>
                  {skill.requiredKnowledgeTypes.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              ) : (
                <p>No knowledge source required.</p>
              )}
              <Link href="/knowledge">Open Knowledge →</Link>
            </>
          )}
          {tab === 'Governance' && (
            <>
              <p>Risk: {skill.riskLevel}</p>
              <ul>
                {skill.governanceRequirements.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
              <p>
                Data boundary:{' '}
                {skill.dataAccess || 'Authorized workspace resources only'}
              </p>
              <p>
                Human approval is required for privileged or high-risk actions
                and must be enforced by each binding.
              </p>
            </>
          )}
          {tab === 'Evaluations' && (
            <>
              <h2>Skill evaluation · v{skill.version}</h2>
              <p>
                Score:{' '}
                {skill.evaluationScore === null
                  ? 'Not evaluated'
                  : `${skill.evaluationScore}% · sample / simulated`}
              </p>
              <Table
                caption="Skill scenarios"
                headers={['Scenario', 'Expected result', 'Demo result']}
                rows={skill.evaluationSuite.map((s) => [
                  s.name,
                  s.expected,
                  s.previewResult ||
                    (skill.evaluationScore === null
                      ? 'Not run'
                      : 'Reference sample'),
                ])}
              />
              <p>
                Run a fresh preview evaluation in Create New Version. Each Agent
                also requires binding validation and regression evaluation.
              </p>
            </>
          )}
          {tab === 'Versions' && (
            <>
              <Table
                caption="Skill versions"
                headers={[
                  'Version',
                  'Maturity',
                  'Updated',
                  'Agents Using',
                  'Inspect',
                ]}
                rows={[...versions].reverse().map((v) => [
                  `v${v.version}`,
                  v.maturity,
                  new Date(v.updatedAt).toLocaleDateString('en-US'),
                  t.users.filter((a) => a.skillVersion === v.version).length,
                  <Button
                    key={v.version}
                    variant="secondary"
                    onClick={() => {
                      setSelectedVersion(v.version);
                      setTab('Configuration');
                    }}
                  >
                    Inspect v{v.version}
                  </Button>,
                ])}
              />
              <p>
                Agent Version → Skill Binding → Skill Version. Publishing never
                upgrades Agents automatically.
              </p>
            </>
          )}
          {tab === 'Usage' && (
            <>
              <h2>Usage across Agents · last 30 days</h2>
              <Metrics
                items={[
                  ['Total Executions', number(t.executions)],
                  ['Success Rate', percent(t.success)],
                  [
                    'Error Rate',
                    t.success === null ? '—' : percent(100 - t.success),
                  ],
                  ['P95 Latency', t.p95 === null ? '—' : `${t.p95}s`],
                  [
                    'Cost',
                    t.cost === null || t.executions === null
                      ? '—'
                      : `$${(t.cost * t.executions).toFixed(2)}`,
                  ],
                ]}
              />
              <Table
                caption="Skill usage by Agent"
                headers={[
                  'Agent',
                  'Agent Version',
                  'Skill Version',
                  'Executions',
                  'Success',
                  'Latency',
                  'Cost',
                ]}
                rows={t.users.map((a, i) => {
                  const m = samples[`${id}:${a.skillVersion}`];
                  const peers = t.users.filter(
                    (u) => u.skillVersion === a.skillVersion,
                  );
                  const position = peers.findIndex((u) => u.id === a.id);
                  const n = m
                    ? Math.floor(m.executions / peers.length) +
                      (position < m.executions % peers.length ? 1 : 0)
                    : null;
                  return [
                    <span key={a.id}>{agentLink(a)}</span>,
                    a.agentVersion,
                    `v${a.skillVersion}`,
                    number(n),
                    percent(m?.success ?? null),
                    m ? `${m.p95}s` : '—',
                    m && n !== null ? `$${(n * m.cost).toFixed(2)}` : '—',
                  ];
                })}
              />
              <p>
                Per-Agent executions are an illustrative allocation of sample
                totals, not measured activity.
              </p>
              <h3>Adoption trend · sample weekly snapshots</h3>
              {t.trend ? (
                <Table
                  caption="Weekly Skill adoption"
                  headers={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
                  rows={[t.trend.map((n) => `${n} Agents`)]}
                />
              ) : (
                <p>No historical adoption data yet.</p>
              )}
            </>
          )}
        </Panel>
      </section>
      <DataNote />
    </div>
  );
}
