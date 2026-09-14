import {
  governanceGroups,
  type GovernanceSelection,
} from '@/lib/configuration';
import {
  knowledgeSources,
  toolConnectors,
  type LaunchDraft,
} from '@/lib/launch';
import { SelectField } from './UI';

export function GovernanceStep({
  value,
  draft,
  onChange,
}: {
  value: GovernanceSelection;
  draft: LaunchDraft;
  onChange: (value: GovernanceSelection) => void;
}) {
  const sources = knowledgeSources
    .filter((source) => draft.knowledge.includes(source.id))
    .map((source) => source.name);
  const actions = toolConnectors.flatMap((tool) =>
    (tool.actions ?? [])
      .filter(
        (action) =>
          action.approved && draft.tools[tool.id]?.includes(action.id),
      )
      .map((action) => ({ ...action, name: `${tool.name}: ${action.name}` })),
  );
  const approvals = actions.filter(
    (action) =>
      action.requiresApproval ||
      (value.controls.sensitiveApproval && action.access === 'Write'),
  );
  return (
    <section className="governanceStep" aria-label="Governance configuration">
      <div className="governanceGrid">
        {governanceGroups.map((group) => (
          <section
            className="governanceCard"
            key={group.title}
            aria-label={group.title}
          >
            <h3>{group.title}</h3>
            {group.title === 'Access & Permissions' && (
              <SelectField
                id="agent-audience"
                label="Who can use this agent?"
                value={value.audience}
                onChange={() => onChange({ ...value, audience: 'everyone' })}
              >
                <option value="everyone">Everyone in the company</option>
              </SelectField>
            )}
            <div className="governanceControls">
              {group.controls.map((control) => (
                <label key={control.id}>
                  <input
                    type="checkbox"
                    checked={value.controls[control.id]}
                    onChange={(event) =>
                      onChange({
                        ...value,
                        controls: {
                          ...value.controls,
                          [control.id]: event.target.checked,
                        },
                      })
                    }
                  />
                  <span>{control.label}</span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
      <details className="advancedSettings governanceSummary">
        <summary>Access and approval summary</summary>
        <p>
          This agent can read{' '}
          {sources.length
            ? sources.join(', ')
            : 'no connected knowledge sources'}
          , execute{' '}
          {actions.length
            ? actions.map((action) => action.name).join('; ')
            : 'no tool actions'}
          , and requires approval for{' '}
          {approvals.length
            ? approvals.map((action) => action.name).join('; ')
            : 'no selected actions'}
          .
        </p>
        <p>
          These are draft preferences. Organization policies and action-level
          approvals remain enforced by the production service. Compliance
          selections record requirements; they do not certify compliance.
        </p>
      </details>
    </section>
  );
}
