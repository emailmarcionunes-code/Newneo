import { CheckCircle2 } from 'lucide-react';
import { useDemoAccess } from './journeys/DemoExperience';
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
  const { can } = useDemoAccess();
  const rows = [
    ['Agent', draft.name],
    ['Mission', draft.description],
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
        <h3>DEPLOYMENT SUMMARY</h3>
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
      <div className="deploymentChecks">
        {[
          [
            'Identity & mission configured',
            !!draft.name.trim() && !!draft.businessOwner?.trim(),
          ],
          [
            'Governance policies applied',
            [
              'logInteractions',
              'maskSensitive',
              'roleBasedAccess',
              'dataResidency',
              'retentionPolicy',
            ].every(
              (k) =>
                draft.governance.controls[
                  k as keyof typeof draft.governance.controls
                ],
            ),
          ],
          [
            'Evaluation scenarios passed',
            !evaluation.cases.some((c) => c.status === 'Failed' && c.count > 0),
          ],
          [
            'Infrastructure configuration selected',
            !!draft.infrastructure.kind,
          ],
        ].map(([label, passed]) => (
          <div key={String(label)} className={passed ? 'passed' : 'pending'}>
            <CheckCircle2 size={17} />
            {label}
            <span>{passed ? 'Ready' : 'Review'}</span>
          </div>
        ))}
      </div>
      <section className="deploymentApproval">
        {!can('approve') && (
          <p role="note">
            Creator preview: deploy to Staging first, then request a reviewed
            promotion in Deployments. An Approver reviews the request in
            Governance.
          </p>
        )}
        <label className="notificationChoice">
          <input
            type="checkbox"
            checked={!!draft.productionApproved}
            disabled={!can('approve')}
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
