'use client';
import { useState } from 'react';
import { Button } from './UI';
import { usePreview } from './journeys/PreviewState';
import { useDemoAccess } from './journeys/DemoExperience';
import {
  builderKey,
  allSkills,
  definitionErrors,
  definitionFingerprint,
  publishSkill,
  type Skill,
} from '@/lib/skills';
const stages = [
  'Define Capability',
  'Connect Requirements',
  'Governance',
  'Evaluate',
  'Publish',
];
export function SkillBuilder({
  source,
  onClose,
  onPublished,
}: {
  source: Skill | null;
  onClose: () => void;
  onPublished: (s: Skill) => void;
}) {
  const { state, update } = usePreview();
  const { can } = useDemoAccess();
  const saved = state.ui?.[builderKey] as
    { skill: Skill; step: number; evidence: string } | undefined;
  const [skill, setSkill] = useState<Skill>(() => {
    if (!source && saved?.skill) return saved.skill;
    const now = new Date().toISOString();
    if (source) {
      const versions = allSkills(state.ui).filter((s) => s.id === source.id);
      const major = Number(source.version.split('.')[0]) || 1;
      const minor =
        Math.max(
          ...versions
            .filter((s) => Number(s.version.split('.')[0]) === major)
            .map((s) => Number(s.version.split('.')[1]) || 0),
        ) + 1;
      return {
        ...source,
        permissionRequirements:
          source.permissionRequirements || 'Least privilege within Agent scope',
        dataAccess: source.dataAccess || 'Authorized workspace resources only',
        version: `${major}.${minor}`,
        maturity: 'Experimental',
        evaluationScore: null,
        updatedAt: now,
      };
    }
    return {
      id: `custom-${crypto.randomUUID()}`,
      name: '',
      description: '',
      domain: 'IT',
      version: '1.0',
      maturity: 'Experimental',
      riskLevel: 'Low',
      owner: '',
      instructions: '',
      requiredKnowledgeTypes: [],
      toolRequirements: [],
      governanceRequirements: ['Audit logging', 'Scoped data access'],
      evaluationSuite: [
        { name: 'Valid request', expected: '' },
        { name: 'Tool failure', expected: '' },
      ],
      inputSchema: { request: 'string' },
      outputSchema: { outcome: 'string' },
      createdAt: now,
      updatedAt: now,
      evaluationScore: null,
    };
  });
  const [step, setStep] = useState(!source ? saved?.step || 0 : 0);
  const [evidence, setEvidence] = useState(
    !source ? saved?.evidence || '' : '',
  );
  const [notice, setNotice] = useState('');
  const [schemaError, setSchemaError] = useState('');
  const [inputs, setInputs] = useState(
    JSON.stringify(skill.inputSchema, null, 2),
  );
  const [outputs, setOutputs] = useState(
    JSON.stringify(skill.outputSchema, null, 2),
  );
  const errors = definitionErrors(skill);
  const failing = skill.evaluationSuite.some(
    (s) => s.previewResult === 'Failed',
  );
  const warnings = skill.evaluationSuite.some(
    (s) => s.previewResult === 'Warning',
  );
  const fresh = evidence === definitionFingerprint(skill);
  function change(p: Partial<Skill>) {
    setSkill((s) => ({ ...s, ...p }));
    setEvidence('');
    setNotice('');
  }
  function schema(value: string, input: boolean) {
    input ? setInputs(value) : setOutputs(value);
    try {
      const parsed = JSON.parse(value);
      if (
        !parsed ||
        Array.isArray(parsed) ||
        typeof parsed !== 'object' ||
        Object.values(parsed).some((v) => typeof v !== 'string')
      )
        throw Error();
      change(input ? { inputSchema: parsed } : { outputSchema: parsed });
      const other = JSON.parse(input ? outputs : inputs);
      if (
        !other ||
        Array.isArray(other) ||
        typeof other !== 'object' ||
        Object.values(other).some((v) => typeof v !== 'string')
      )
        throw Error();
      setSchemaError('');
    } catch {
      setSchemaError(
        'Inputs and outputs must be JSON objects with field names and string types.',
      );
      setEvidence('');
    }
  }
  function field(
    label: string,
    key: 'name' | 'description' | 'owner' | 'instructions',
  ) {
    return (
      <label>
        {label}
        <textarea
          value={skill[key]}
          onChange={(e) => change({ [key]: e.target.value })}
        />
      </label>
    );
  }
  function list(
    label: string,
    key:
      'requiredKnowledgeTypes' | 'toolRequirements' | 'governanceRequirements',
  ) {
    return (
      <label>
        {label}
        <textarea
          value={skill[key].join('\n')}
          onChange={(e) => change({ [key]: e.target.value.split('\n') })}
        />
        <small>One requirement per line.</small>
      </label>
    );
  }
  function clean() {
    return {
      ...skill,
      requiredKnowledgeTypes: skill.requiredKnowledgeTypes
        .map((v) => v.trim())
        .filter(Boolean),
      toolRequirements: skill.toolRequirements
        .map((v) => v.trim())
        .filter(Boolean),
      governanceRequirements: skill.governanceRequirements
        .map((v) => v.trim())
        .filter(Boolean),
    };
  }
  return (
    <section className="skillCard" aria-label="Skill Builder">
      <h2>
        {source ? 'Create Skill Version' : 'Create New Skill'} · v
        {skill.version}
      </h2>
      <p>
        Organization library · Demo only. Publishing does not change any Agent
        or execute connected systems.
      </p>
      <ol className="skillSteps">
        {stages.map((s, i) => (
          <li key={s} aria-current={step === i ? 'step' : undefined}>
            {i + 1}. {s}
          </li>
        ))}
      </ol>
      {notice && <p role="status">{notice}</p>}
      {schemaError && <p role="alert">{schemaError}</p>}
      {step === 0 && (
        <div className="skillFilters">
          {field('Skill name', 'name')}
          {field('Business outcome', 'description')}
          <label>
            Domain
            <select
              value={skill.domain}
              onChange={(e) => change({ domain: e.target.value })}
            >
              {[
                'IT',
                'Support',
                'Sales',
                'Research',
                'Legal',
                'Finance',
                'Shared',
                'Custom',
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          {field('Owner', 'owner')}
          {field('Instructions', 'instructions')}
          <label>
            Inputs (JSON)
            <textarea
              value={inputs}
              onChange={(e) => schema(e.target.value, true)}
            />
          </label>
          <label>
            Outputs (JSON)
            <textarea
              value={outputs}
              onChange={(e) => schema(e.target.value, false)}
            />
          </label>
        </div>
      )}
      {step === 1 && (
        <div className="skillFilters">
          {list('Knowledge requirements', 'requiredKnowledgeTypes')}
          {list('Tools / MCP requirements', 'toolRequirements')}
          <label>
            Permission requirements
            <textarea
              value={skill.permissionRequirements || ''}
              onChange={(e) =>
                change({ permissionRequirements: e.target.value })
              }
            />
          </label>
          <label>
            Parameter defaults (JSON)
            <textarea
              value={skill.parameterDefaults || '{}'}
              onChange={(e) => change({ parameterDefaults: e.target.value })}
            />
          </label>
          <p>
            Requirements are bound to approved resources separately for each
            Agent. Capabilities without tools or knowledge are supported.
          </p>
        </div>
      )}
      {step === 2 && (
        <div className="skillFilters">
          <label>
            Risk
            <select
              value={skill.riskLevel}
              onChange={(e) =>
                change({ riskLevel: e.target.value as Skill['riskLevel'] })
              }
            >
              {['Low', 'Medium', 'High'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          {list('Policies and approval requirements', 'governanceRequirements')}
          <label>
            Data access boundary
            <textarea
              value={skill.dataAccess || ''}
              onChange={(e) => change({ dataAccess: e.target.value })}
            />
          </label>
          <p>
            Medium and high risk require an explicit approval policy. This
            preview does not grant permissions.
          </p>
        </div>
      )}
      {step === 3 && (
        <>
          <h3>Reusable evaluation scenarios</h3>
          {skill.evaluationSuite.map((s, i) => (
            <div className="skillFilters" key={i}>
              <label>
                Scenario {i + 1}
                <input
                  value={s.name}
                  onChange={(e) =>
                    change({
                      evaluationSuite: skill.evaluationSuite.map((v, n) =>
                        n === i ? { ...v, name: e.target.value } : v,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Expected result {i + 1}
                <textarea
                  value={s.expected}
                  onChange={(e) =>
                    change({
                      evaluationSuite: skill.evaluationSuite.map((v, n) =>
                        n === i ? { ...v, expected: e.target.value } : v,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Simulated result {i + 1}
                <select
                  value={s.previewResult || 'Passed'}
                  onChange={(e) =>
                    change({
                      evaluationSuite: skill.evaluationSuite.map((v, n) =>
                        n === i
                          ? {
                              ...v,
                              previewResult: e.target.value as
                                'Passed' | 'Warning' | 'Failed',
                            }
                          : v,
                      ),
                    })
                  }
                >
                  <option>Passed</option>
                  <option>Warning</option>
                  <option>Failed</option>
                </select>
              </label>
              <Button
                variant="secondary"
                disabled={skill.evaluationSuite.length <= 2}
                onClick={() =>
                  change({
                    evaluationSuite: skill.evaluationSuite.filter(
                      (_, n) => n !== i,
                    ),
                  })
                }
              >
                Remove scenario {i + 1}
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() =>
              change({
                evaluationSuite: [
                  ...skill.evaluationSuite,
                  { name: '', expected: '' },
                ],
              })
            }
          >
            Add scenario
          </Button>
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <Button
            disabled={!!schemaError || !can('create')}
            onClick={() => {
              const s = clean();
              const issues = definitionErrors(s);
              if (issues.length) {
                setNotice(issues.join(' '));
                return;
              }
              setSkill(s);
              setEvidence(definitionFingerprint(s));
              setNotice(
                failing
                  ? 'Preview evaluation failed: resolve failing scenarios before promoting maturity.'
                  : 'Preview evaluation passed: definition, safety requirements and scenario completeness checked. No model or tool was called.',
              );
            }}
          >
            Run preview evaluation
          </Button>
          {fresh && (
            <ul>
              {skill.evaluationSuite.map((s, i) => (
                <li key={i}>
                  {s.name}: {s.previewResult || 'Passed'} · simulated expected
                  outcome — {s.expected}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {step === 4 && (
        <>
          <h3>
            Publish {skill.name} v{skill.version}
          </h3>
          <p>{skill.description}</p>
          <p>
            Risk: {skill.riskLevel} · Owner: {skill.owner}
          </p>
          <label>
            Maturity
            <select
              value={skill.maturity}
              onChange={(e) =>
                setSkill((s) => ({
                  ...s,
                  maturity: e.target.value as Skill['maturity'],
                }))
              }
            >
              <option>Experimental</option>
              <option disabled={!fresh || failing}>Validated</option>
              <option disabled={!fresh || failing || warnings}>
                Production Ready
              </option>
            </select>
          </label>
          <p>
            {fresh
              ? 'Fresh preview evidence available.'
              : 'Without evaluation, publish only as Experimental.'}{' '}
            These are demo labels, not production certification. Proven at Scale
            requires operational evidence and is unavailable here.
          </p>
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <Button
            disabled={
              !can('create') ||
              !!schemaError ||
              errors.length > 0 ||
              (skill.maturity !== 'Experimental' && (!fresh || failing)) ||
              (skill.maturity === 'Production Ready' && warnings)
            }
            onClick={() => {
              try {
                const next = publishSkill(state.ui, skill, evidence);
                update((s) => ({
                  ...s,
                  ui: publishSkill(s.ui, skill, evidence),
                  audit: [
                    `${skill.name} v${skill.version} published to demo library`,
                    ...s.audit,
                  ],
                }));
                void next;
                onPublished(skill);
              } catch (e) {
                setNotice((e as Error).message);
              }
            }}
          >
            Publish to demo library
          </Button>
        </>
      )}
      <div className="skillActions">
        <Button variant="secondary" onClick={onClose}>
          Close builder
        </Button>
        <Button
          variant="secondary"
          disabled={!can('create') || !!schemaError}
          onClick={() => {
            update((s) => ({
              ...s,
              ui: { ...s.ui, [builderKey]: { skill, step, evidence } },
            }));
            setNotice('Builder draft saved in this browser session.');
          }}
        >
          Save builder draft
        </Button>
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)}>
            Previous stage
          </Button>
        )}
        {step < 4 && (
          <Button disabled={!!schemaError} onClick={() => setStep(step + 1)}>
            Next stage
          </Button>
        )}
      </div>
    </section>
  );
}
