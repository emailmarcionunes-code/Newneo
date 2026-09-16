import { approvedEndpoints, executionModels } from '@/lib/configuration';
import { environments, type ReferenceEvaluation } from '@/lib/preview';
import type { LaunchDraft } from '@/lib/launch';
import { EnvironmentOption, Callout } from './UI';

export function DeployStep({
  draft,
  evaluation,
  disabled,
  onEnvironment,
}: {
  draft: LaunchDraft;
  evaluation: ReferenceEvaluation;
  disabled: boolean;
  onEnvironment: (value: LaunchDraft['environment']) => void;
}) {
  const rows = [
    ['Use Case', draft.name],
    [
      'Infrastructure',
      draft.runtime.executionModel === 'organization-default'
        ? 'Cloud · Organization Default'
        : executionModels.find(
            (item) => item.id === draft.runtime.executionModel,
          )?.name,
    ],
    [
      'Model',
      approvedEndpoints.find((item) => item.id === draft.runtime.endpointId)
        ?.name,
    ],
    ['Knowledge sources', `${draft.knowledge.length} connected`],
    ['Tools', `${Object.keys(draft.tools).length} connected`],
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
    </section>
  );
}
