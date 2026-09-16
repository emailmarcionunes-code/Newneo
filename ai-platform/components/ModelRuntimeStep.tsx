import { AssetIcon } from './Assets';
import { type InfrastructureSelection } from '@/lib/configuration';
const options = [
  {
    id: 'managed',
    name: 'Cloud',
    tag: 'Recommended',
    description: 'Managed enterprise cloud',
    scores: [82, 86, 70, 92],
  },
  {
    id: 'customer-cloud',
    name: 'Private Cloud',
    tag: 'Sovereignty',
    description: 'Dedicated customer / private environment',
    scores: [78, 58, 95, 78],
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    tag: 'Flexible',
    description: 'Cloud + private execution',
    scores: [90, 67, 90, 86],
  },
  {
    id: 'private',
    name: 'Local / On-Prem',
    tag: 'Maximum control',
    description: 'Customer datacenter / GPU',
    scores: [72, 52, 100, 72],
  },
] as const;
export function ModelRuntimeStep({
  value,
  onChange,
}: {
  value: InfrastructureSelection;
  onChange: (v: InfrastructureSelection) => void;
}) {
  const selected = value.kind;
  const option = options.find((o) => o.id === selected)!;
  return (
    <section aria-label="Infrastructure configuration">
      <div className="infraOptions">
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            className={`infraOption ${selected === o.id ? 'selected' : ''}`}
            aria-pressed={selected === o.id}
            onClick={() =>
              onChange({
                kind: o.id,
              })
            }
          >
            <div className="infraTitle">
              <span>
                <AssetIcon name={`runtime-${o.id}`} size={20} monochrome />
              </span>
              <div>
                <strong>{o.name}</strong>
                <small>{o.tag}</small>
              </div>
            </div>
            <p>{o.description}</p>
            <dl>
              {['Perf', 'Cost', 'Privacy', 'Latency'].map((k, i) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{o.scores[i]}</dd>
                </div>
              ))}
            </dl>
          </button>
        ))}
      </div>
      <section className="infraRecommendation">
        <strong>
          {option.name} · {option.tag} infrastructure
        </strong>
        <p>
          {selected === 'managed'
            ? 'Best fit for this mission: fast deployment, enterprise SLA, approved data boundary.'
            : option.description}
        </p>
        {selected === 'managed' && (
          <div className="tags">
            <span className="tag">Zero ops overhead</span>
            <span className="tag">Portable architecture</span>
            <span className="tag">Can migrate later</span>
          </div>
        )}
      </section>
      <details className="advancedSettings">
        <summary>Infrastructure details</summary>
        <p>
          Reference configuration for this preview. Region, network and compute
          are configured within organization-approved boundaries.
        </p>
      </details>
    </section>
  );
}
