'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  allSkills,
  latestSkills,
  reviseSkillBinding,
  maturities,
  composition,
  emptyBinding,
  validateBinding,
  bindingFingerprint,
  addSkillToDraft,
  resolveAgentDomain,
  proposedSkillVersion,
  type Skill,
  type SkillBinding,
} from '@/lib/skills';
import { useWorkspaceAgents } from './journeys/WorkspaceAgents';
import { productionVersion } from '@/lib/preview-records';
import { usePreview } from './journeys/PreviewState';
import { useDemoAccess } from './journeys/DemoExperience';
import { Button } from './UI';
import { SkillBuilder } from './SkillBuilder';
import { NeoMascot } from './NeoMascot';
const steps = [
  'Choose Skill',
  'Bind & Configure',
  'Validate',
  'Add to Version',
];
export function SkillsPanel({
  agentId,
  agentName,
  currentVersion,
}: {
  agentId: string;
  agentName: string;
  currentVersion: string;
}) {
  const { state, update } = usePreview();
  const hybridAgents = useWorkspaceAgents();
  const { can } = useDemoAccess();
  const [step, setStep] = useState<number | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [binding, setBinding] = useState<SkillBinding | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [maturity, setMaturity] = useState('All');
  const [risk, setRisk] = useState('All');
  const [inspect, setInspect] = useState<string | null>(null);
  const [builder, setBuilder] = useState(false);
  const [builderSource, setBuilderSource] = useState<Skill | null>(null);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState<Skill | null>(null);
  const library = latestSkills(state.ui);
  const definitions = allSkills(state.ui);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    version: string;
    count: number;
    name: string;
    action?: string;
  } | null>(null);
  const draftVersion = state.ui?.[`agent:${agentId}:draft`]
    ? String(state.ui?.[`agent:${agentId}:draftVersion`])
    : null;
  const shown = draftVersion || currentVersion;
  const assigned = composition(state.ui, agentId, shown);
  const checks =
    skill && binding
      ? validateBinding(skill, binding, resolveAgentDomain(state.ui, agentId))
      : [];
  function change(p: Partial<SkillBinding>) {
    setBinding((b) =>
      b
        ? { ...b, ...p, evaluated: false, validationFingerprint: undefined }
        : b,
    );
  }
  function choose(s: Skill) {
    setEditing(false);
    setSkill(s);
    setBinding(emptyBinding(s));
    setStep(1);
    setError('');
  }
  function save() {
    if (!skill || !binding || !can('create')) return;
    try {
      const mutate = editing ? reviseSkillBinding : addSkillToDraft;
      const result = mutate(state.ui, agentId, currentVersion, skill, binding);
      update((s) => {
        const latest = mutate(s.ui, agentId, currentVersion, skill, binding);
        const event = `${skill.name} v${skill.version} ${editing ? 'updated in' : 'added to'} draft Agent Version ${latest.version} by demo creator`;
        return {
          ...s,
          ui: {
            ...latest.ui,
            [`agent:${agentId}:events`]: [
              event,
              ...((s.ui?.[`agent:${agentId}:events`] as string[]) || []),
            ],
          },
          audit: [`${agentName}: ${event} · preview`, ...s.audit],
        };
      });
      setSuccess({
        version: result.version,
        count: result.count,
        name: skill.name,
        action: editing ? 'updated' : 'added',
      });
      setStep(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const actions = (
    <>
      <Link
        className="button secondary"
        href={`/evaluations?agent=${agentId}&version=${shown}&edit=1`}
      >
        Evaluate Version
      </Link>
      <Link
        className="button secondary"
        href={`/deployments?agent=${agentId}&edit=1`}
      >
        Request Approval / Promote
      </Link>
    </>
  );
  return (
    <section className="panel skillsPanel" aria-label="Agent Skills">
      <div className="skillHeading">
        <div>
          <h2>Skills</h2>
          <p>
            Skills are what this Agent knows how to accomplish. Tools are
            execution mechanisms.
          </p>
        </div>
        <Button
          disabled={!can('create')}
          onClick={() => {
            setStep(0);
            setSuccess(null);
            setBuilder(false);
            setError('');
            setEditing(false);
            setRemoving(null);
          }}
        >
          + Add Skill
        </Button>
      </div>
      <p className="intelligenceNote">
        Interactive preview ·{' '}
        {draftVersion
          ? `Draft ${shown}; Production ${currentVersion} is unchanged.`
          : `Active version ${currentVersion}. Changes create a draft.`}{' '}
        Organization: Acme Corp.
      </p>
      {error && <p role="alert">{error}</p>}
      {success && (
        <section className="skillSuccess" role="status">
          <NeoMascot state="default" size={64} />
          <div>
            <h3>Skill {success.action || 'added'} successfully</h3>
            <p>
              {success.name} was {success.action || 'added'} in {agentName}{' '}
              {success.version}.
            </p>
            <p>
              Draft {success.version} now has {success.count} skills. Evaluation
              is required before Production promotion.
            </p>
            <div className="skillActions">{actions}</div>
          </div>
        </section>
      )}
      {step === null && draftVersion && !success && (
        <div className="skillActions">{actions}</div>
      )}
      {removing && (
        <section className="skillCard" aria-label="Remove Skill confirmation">
          <h3>Remove {removing.name}?</h3>
          <p>
            This changes only the draft Agent Version. Production stays
            unchanged and a new evaluation is required.
          </p>
          <div className="skillActions">
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Keep Skill
            </Button>
            <Button
              disabled={!can('create')}
              onClick={() => {
                try {
                  const result = reviseSkillBinding(
                    state.ui,
                    agentId,
                    currentVersion,
                    removing,
                    null,
                  );
                  update((s) => {
                    const next = reviseSkillBinding(
                      s.ui,
                      agentId,
                      currentVersion,
                      removing,
                      null,
                    );
                    const event = `Removed ${removing.name} from draft ${next.version} by demo creator`;
                    return {
                      ...s,
                      ui: {
                        ...next.ui,
                        [`agent:${agentId}:events`]: [
                          event,
                          ...((s.ui?.[`agent:${agentId}:events`] as string[]) ||
                            []),
                        ],
                      },
                      audit: [event, ...s.audit],
                    };
                  });
                  setSuccess({
                    name: removing.name,
                    version: result.version,
                    count: result.count,
                    action: 'removed',
                  });
                  setRemoving(null);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Confirm removal from draft
            </Button>
          </div>
        </section>
      )}
      {step === null && (
        <>
          <p>
            {assigned.bindings.length} skills in {shown}
          </p>
          <div className="skillLibraryGrid">
            {assigned.bindings.map((b) => {
              const s = definitions.find(
                (s) => s.id === b.skillId && s.version === b.skillVersion,
              );
              if (!s)
                return (
                  <p key={b.skillId}>
                    Definition unavailable: {b.skillId} v{b.skillVersion}
                  </p>
                );
              const latest = library.find((v) => v.id === s.id)!;
              const edit = (target: Skill) => {
                setSkill(target);
                setBinding({
                  ...b,
                  skillVersion: target.version,
                  tools: Object.fromEntries(
                    target.toolRequirements.map((t) => [t, b.tools[t] || '']),
                  ),
                  evaluated: false,
                  validationFingerprint: undefined,
                });
                setEditing(true);
                setSuccess(null);
                setStep(1);
                setError('');
              };
              return (
                <article className="skillCard" key={b.skillId}>
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <dl>
                    <dt>Version / maturity</dt>
                    <dd>
                      v{b.skillVersion} · {s.maturity}
                    </dd>
                    <dt>Risk / status</dt>
                    <dd>
                      {s.riskLevel} · {draftVersion ? 'Draft' : 'Active'}
                    </dd>
                    <dt>Tools used</dt>
                    <dd>{Object.values(b.tools).join(', ')}</dd>
                    <dt>Knowledge requirements</dt>
                    <dd>{b.knowledge}</dd>
                    <dt>Evaluation</dt>
                    <dd>
                      {s.evaluationScore ?? 'Not evaluated'}
                      {s.evaluationScore !== null ? '% · library sample' : ''};
                      bound Agent requires evaluation
                    </dd>
                    <dt>Last updated</dt>
                    <dd>{new Date(b.updatedAt).toLocaleDateString('en-US')}</dd>
                  </dl>
                  <div className="skillActions">
                    <Button
                      variant="secondary"
                      disabled={!can('create')}
                      onClick={() => edit(s)}
                    >
                      Configure {s.name}
                    </Button>
                    {latest.version !== b.skillVersion && (
                      <Button
                        disabled={!can('create')}
                        onClick={() => edit(latest)}
                      >
                        Upgrade to v{latest.version}
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      disabled={!can('create')}
                      onClick={() => {
                        setRemoving(s);
                        setSuccess(null);
                      }}
                    >
                      Remove {s.name}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
          {!assigned.bindings.length && (
            <p>
              No skills yet. Add a reusable capability from the organization
              library.
            </p>
          )}
        </>
      )}
      {builder && (
        <SkillBuilder
          key={
            builderSource
              ? `${builderSource.id}:${builderSource.version}`
              : 'new'
          }
          source={builderSource}
          onClose={() => setBuilder(false)}
          onPublished={(s) => {
            setBuilder(false);
            setSearch(s.name);
            setCategory('All');
            setMaturity('All');
            setRisk('All');
            setError(
              'Skill published to the demo library. Existing Agent bindings are unchanged.',
            );
          }}
        />
      )}
      {step !== null && !builder && (
        <section aria-label="Add Skill journey">
          <ol className="skillSteps">
            {steps.map((name, i) => (
              <li key={name} aria-current={step === i ? 'step' : undefined}>
                {i + 1}. {name}
              </li>
            ))}
          </ol>
          {step === 0 && (
            <>
              <h3>Organization Skill Library</h3>
              <Button
                variant="secondary"
                disabled={!can('create')}
                onClick={() => {
                  setBuilderSource(null);
                  setBuilder(true);
                }}
              >
                Create New Skill
              </Button>
              <div className="skillFilters">
                <label>
                  Search Skills
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name or capability"
                  />
                </label>
                <label>
                  Category
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {['All', ...new Set(library.map((s) => s.domain))].map(
                      (v) => (
                        <option key={v}>{v}</option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Maturity
                  <select
                    value={maturity}
                    onChange={(e) => setMaturity(e.target.value)}
                  >
                    {['All', ...maturities].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Risk
                  <select
                    value={risk}
                    onChange={(e) => setRisk(e.target.value)}
                  >
                    {['All', 'Low', 'Medium', 'High'].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="skillLibraryGrid">
                {library
                  .filter(
                    (s) =>
                      (s.name + ' ' + s.description)
                        .toLowerCase()
                        .includes(search.toLowerCase()) &&
                      (category === 'All' || s.domain === category) &&
                      (maturity === 'All' || s.maturity === maturity) &&
                      (risk === 'All' || s.riskLevel === risk),
                  )
                  .map((s) => {
                    const used = hybridAgents.filter((a) => {
                      const active =
                        state.releases.find(
                          (r) =>
                            r.agentId === a.id &&
                            r.target === 'Production' &&
                            r.state === 'Active',
                        )?.version || productionVersion(a.id);
                      return composition(state.ui, a.id, active).bindings.some(
                        (b) => b.skillId === s.id,
                      );
                    });
                    const bound = assigned.bindings.some(
                      (b) => b.skillId === s.id,
                    );
                    return (
                      <article className="skillCard" key={s.id}>
                        <h3>{s.name}</h3>
                        <p>{s.description}</p>
                        <p>
                          v{s.version} · {s.maturity} · Risk: {s.riskLevel}
                        </p>
                        <p>Required: {s.toolRequirements.join(', ')}</p>
                        <p>
                          Eval:{' '}
                          {s.evaluationScore === null
                            ? 'Not evaluated'
                            : `${s.evaluationScore}% sample`}{' '}
                          · Used by {used.length} Agents
                        </p>
                        {used.length > 0 && (
                          <small>{used.map((a) => a.name).join(', ')}</small>
                        )}
                        <div className="skillActions">
                          <Button
                            variant="secondary"
                            onClick={() =>
                              setInspect(inspect === s.id ? null : s.id)
                            }
                          >
                            Inspect {s.name}
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={!can('create')}
                            onClick={() => {
                              setBuilderSource(s);
                              setBuilder(true);
                            }}
                          >
                            New version of {s.name}
                          </Button>
                          <Button
                            disabled={bound || !can('create')}
                            onClick={() => choose(s)}
                          >
                            {bound ? 'Already added' : `Choose ${s.name}`}
                          </Button>
                        </div>
                        {inspect === s.id && (
                          <div>
                            <p>{s.instructions}</p>
                            <p>
                              Knowledge: {s.requiredKnowledgeTypes.join(', ')}
                            </p>
                            <p>
                              Governance: {s.governanceRequirements.join(', ')}
                            </p>
                            <p>Owner: {s.owner}</p>
                            <p>
                              Permission requirements:{' '}
                              {s.permissionRequirements ||
                                'Scoped Agent permissions'}
                            </p>
                            <p>
                              Data access:{' '}
                              {s.dataAccess || 'Authorized workspace only'}
                            </p>
                            <h4>Published versions</h4>
                            <ul>
                              {definitions
                                .filter((v) => v.id === s.id)
                                .map((v) => (
                                  <li key={v.version}>
                                    v{v.version} · {v.maturity} ·{' '}
                                    {new Date(v.updatedAt).toLocaleDateString(
                                      'en-US',
                                    )}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </article>
                    );
                  })}
              </div>
            </>
          )}
          {step === 1 && skill && binding && (
            <>
              <h3>
                Bind {skill.name} to {agentName}
              </h3>
              <p>
                Domain: {skill.domain} → {resolveAgentDomain(state.ui, agentId)}
                . Select approved demo bindings; these do not connect live
                systems.
              </p>
              <div className="skillFilters">
                <label>
                  Required Knowledge
                  <select
                    value={binding.knowledge}
                    onChange={(e) => change({ knowledge: e.target.value })}
                  >
                    <option value="">Choose knowledge</option>
                    {skill.requiredKnowledgeTypes.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </label>
                {skill.toolRequirements.map((t) => (
                  <label key={t}>
                    {t} action
                    <select
                      value={binding.tools[t]}
                      onChange={(e) =>
                        change({
                          tools: { ...binding.tools, [t]: e.target.value },
                        })
                      }
                    >
                      <option value="">Not connected</option>
                      <option>{t} approved demo action</option>
                    </select>
                  </label>
                ))}
                <label>
                  Permission scope
                  <input
                    value={binding.scope}
                    onChange={(e) => change({ scope: e.target.value })}
                    placeholder="e.g. standard employees in IT"
                  />
                </label>
                <label>
                  Parameters (JSON)
                  <textarea
                    value={binding.parameters}
                    onChange={(e) => change({ parameters: e.target.value })}
                  />
                </label>
                <label>
                  Validation environment
                  <select
                    value={binding.environment}
                    onChange={(e) =>
                      change({
                        environment: e.target
                          .value as SkillBinding['environment'],
                      })
                    }
                  >
                    <option>Staging</option>
                    <option>Development</option>
                  </select>
                </label>
              </div>
              {(
                [
                  ['permissions', 'Scoped permissions available'],
                  ['policies', 'Governance policies compatible'],
                  [
                    'humanApproval',
                    'Human approval for privileged / high-risk actions',
                  ],
                  ['modelCompatible', 'Model compatible'],
                  [
                    'infrastructureCompatible',
                    'Infrastructure constraints satisfied',
                  ],
                ] as const
              ).map(([key, label]) => (
                <label className="skillCheck" key={key}>
                  <input
                    type="checkbox"
                    checked={binding[key]}
                    onChange={(e) => change({ [key]: e.target.checked })}
                  />
                  {label}
                </label>
              ))}
              <p>
                These checks are explicit demo fixtures, not verified enterprise
                permissions.
              </p>
            </>
          )}
          {step === 2 && skill && binding && (
            <>
              <h3>Can this Skill safely be added?</h3>
              <p>Deterministic preview validation. No tools are executed.</p>
              <ul className="skillChecks">
                {checks.map((c) => (
                  <li key={c.name}>
                    <span>{c.name}</span>
                    <strong data-status={c.status}>{c.status}</strong>
                  </li>
                ))}
              </ul>
              <h4>Reusable Skill scenarios</h4>
              <ul>
                {skill.evaluationSuite.map((s) => (
                  <li key={s.name}>
                    {s.name}: {s.expected}
                  </li>
                ))}
              </ul>
              <p>
                Includes Agent regression checks to preserve existing
                capabilities.
              </p>
              <Button
                disabled={checks.some(
                  (c) =>
                    c.status === 'Blocking' &&
                    c.name !== 'Skill scenarios and Agent regression',
                )}
                onClick={() =>
                  setBinding({
                    ...binding,
                    evaluated: true,
                    validationFingerprint: bindingFingerprint(binding),
                  })
                }
              >
                Run Skill tests and Agent regression preview
              </Button>
            </>
          )}
          {step === 3 && skill && binding && (
            <>
              <h3>
                {editing
                  ? 'Update draft Agent Version'
                  : 'Add to a new Agent Version'}
              </h3>
              <p>
                Current: {agentName} {currentVersion}
              </p>
              <p>
                Change: + {skill.name} v{skill.version}
              </p>
              <p>
                Target:{' '}
                {proposedSkillVersion(state.ui, agentId, currentVersion)} ·
                Production is unchanged.
              </p>
              <p>
                Tools: {Object.values(binding.tools).join(', ')}. Knowledge:{' '}
                {binding.knowledge}. Approval:{' '}
                {binding.humanApproval ? 'required' : 'standard policy'}.
              </p>
              <p>
                Save the draft, then evaluate the complete version and request
                approval before promotion.
              </p>
              <Button
                disabled={
                  !can('create') || checks.some((c) => c.status === 'Blocking')
                }
                onClick={save}
              >
                Save as Draft
              </Button>
            </>
          )}
          <div className="skillActions">
            <Button
              variant="secondary"
              onClick={() => {
                setStep(null);
                setError('');
              }}
            >
              Cancel
            </Button>
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step > 0 && step < 3 && (
              <Button
                disabled={
                  step === 2 && checks.some((c) => c.status === 'Blocking')
                }
                onClick={() => setStep(step + 1)}
              >
                Continue
              </Button>
            )}
          </div>
        </section>
      )}
    </section>
  );
}
