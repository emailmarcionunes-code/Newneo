import { productionBlockers } from '@/lib/readiness';
import { approvedEndpoints, executionModels } from '@/lib/configuration';
import { environments, type ReferenceEvaluation } from '@/lib/preview';
import type { LaunchDraft } from '@/lib/launch';
import { EnvironmentOption, Callout } from './UI';

export function DeployStep({
  draft,
  evaluation,
  disabled,
  onEnvironment,
  onApprove,
}: {
  draft: LaunchDraft;
  evaluation: ReferenceEvaluation;
  disabled: boolean;
  onEnvironment: (value: LaunchDraft['environment']) => void;
  onApprove: (value: boolean) => void;
}) {
  const rows = [
    ['Use Case', draft.name],
    [
      'Infrastructure',
      executionModels.find((item) => item.id === draft.infrastructure.kind)
        ?.name,
    ],
    [
      'Model',
      approvedEndpoints.find((item) => item.id === draft.model.modelId)?.name,
    ],
    ['Knowledge sources', `${draft.knowledge.length} connected`],
    ['Tools', `${Object.values(draft.tools).flat().length} approved actions`],
    ['Access', 'Everyone in the company'],
    [
      'Governance',
      draft.governance.controls.companyPolicy
        ? 'Company policy enabled'
        : 'Company policy not selected',
    ],
    ['Evaluation score', `${evaluation.score}% · Reference only`],
    [
      'Approvals',
      draft.governance.controls.sensitiveApproval
        ? 'Sensitive actions require approval'
        : 'Organization policy applies',
    ],
  ];
  return (
    <section
      className="deployColumns"
      aria-label="Deployment preview configuration"
    >
      <section className="deploymentSummary">
        <h3>Summary</h3>
        <dl>
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <fieldset className="environmentSelection">
        <legend>Select environment</legend>
        {environments.map((environment) => (
          <EnvironmentOption
            key={environment.name}
            {...environment}
            selected={draft.environment === environment.name}
            disabled={disabled}
            onChange={() => onEnvironment(environment.name)}
          />
        ))}
        <Callout>
          You can always start outside production and promote later.
        </Callout>
        <p className="referenceLabel">
          Select an environment deliberately. This preview does not create or
          promote a live agent.
        </p>
      </fieldset>
      <section className="deploymentApproval">
        <label className="notificationChoice">
          <input
            type="checkbox"
            checked={!!draft.productionApproved}
            onChange={(e) => onApprove(e.target.checked)}
          />
          I reviewed the manifest and approve this production preview
        </label>
        <p className="hybridDataNote">
          Demo approval only; no live release or permission is granted.
        </p>
        {draft.environment === 'Production' &&
          productionBlockers(draft, evaluation).length > 0 && (
            <div role="status">
              <strong>Production blocked</strong>
              <ul>
                {productionBlockers(draft, evaluation).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          )}
      </section>
    </section>
  );
}
