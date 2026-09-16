import { hybridModels } from '@/lib/hybrid-models';
import type { RuntimeSelection } from '@/lib/configuration';
export function ProviderModelStep({
  value,
  onChange,
}: {
  value: RuntimeSelection;
  onChange: (v: RuntimeSelection) => void;
}) {
  const selected = hybridModels.find((m) => m.id === value.endpointId);
  return (
    <section aria-label="Foundation model selection">
      <div className="hybridModels">
        {hybridModels.map((m) => (
          <button
            type="button"
            key={m.id}
            className={`hybridModel ${selected?.id === m.id ? 'selected' : ''}`}
            aria-pressed={selected?.id === m.id}
            onClick={() => onChange({ ...value, endpointId: m.id })}
          >
            <span className="modelIdentity">
              <strong>{m.name}</strong>
              <small>{m.provider}</small>
            </span>
            <span className="modelPill">{m.tag}</span>
            <span className="modelPill">{m.context}</span>
            <span className="modelProfile">{m.profile}</span>
            <span className="modelRadio" aria-hidden="true" />
          </button>
        ))}
      </div>
      {selected && (
        <section className="modelStrengths">
          <strong>{selected.name} strengths</strong>
          <p>{selected.strengths} · Organization approved</p>
          <details>
            <summary>Model profile and approval</summary>
            <dl className="surfaceFacts">
              {[
                ['Context', selected.context],
                ['Reasoning / capabilities', selected.profile],
                ['Relative cost', selected.cost],
                ['Latency', selected.latency],
                ['Multimodal support', selected.multimodal],
                ['Organization approval', 'Approved · reference catalog'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p>
              Hybrid v4 reference values, not live provider specifications or
              measurements.
            </p>
          </details>
        </section>
      )}
    </section>
  );
}
