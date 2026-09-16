import type { GovernanceSelection } from '@/lib/configuration';
import type { LaunchDraft } from '@/lib/launch';
const controls = [
  [
    'logInteractions',
    'Audit logging',
    'Every action logged with full context',
    'Required',
  ],
  [
    'maskSensitive',
    'PII protection',
    'Detect and handle personal data via policy',
    'Required',
  ],
  [
    'roleBasedAccess',
    'Role-based access',
    'Agent access limited to authorized users',
    'Required',
  ],
  [
    'sensitiveApproval',
    'Human-in-the-loop',
    'High-risk actions require approval',
    'Recommended',
  ],
  [
    'dataResidency',
    'Data residency',
    'All data remains in approved regions',
    'Recommended',
  ],
  [
    'retentionPolicy',
    'Retention policy',
    'Conversation data handled by organization policy',
    'Recommended',
  ],
] as const;
export function GovernanceStep({
  value,
  onChange,
}: {
  value: GovernanceSelection;
  draft: LaunchDraft;
  onChange: (v: GovernanceSelection) => void;
}) {
  return (
    <section className="hybridGovernance">
      <div className="hybridToolRows">
        {controls.map(([id, name, description]) => (
          <label key={id} className={value.controls[id] ? 'selected' : ''}>
            <input
              type="checkbox"
              role="switch"
              checked={value.controls[id]}
              onChange={(e) =>
                onChange({
                  ...value,
                  controls: { ...value.controls, [id]: e.target.checked },
                })
              }
            />
            <span>
              <strong>{name}</strong>
              <small>{description}</small>
            </span>
            <span
              className={`riskBadge ${id === 'retentionPolicy' ? 'low' : id === 'dataResidency' ? 'medium' : 'high'}`}
            >
              {id === 'retentionPolicy'
                ? 'Low'
                : id === 'dataResidency'
                  ? 'Medium'
                  : 'High'}
            </span>
            <span
              className={`policyState ${value.controls[id] ? 'active' : ''}`}
            >
              {value.controls[id] ? 'Active' : 'Inactive'}
            </span>
          </label>
        ))}
      </div>
      <div className="intelligenceNote">
        <strong>Protection & confidence</strong>
        {controls.filter(([id]) => value.controls[id]).length} active controls ·
        review gaps before Production.
      </div>
    </section>
  );
}
