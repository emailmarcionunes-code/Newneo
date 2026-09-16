import { ProviderLogo } from './Assets';
import {
  knowledgeSources,
  toolConnectors,
  type LaunchDraft,
} from '@/lib/launch';
export function HybridResourcesStep({
  draft,
  onChange,
}: {
  draft: LaunchDraft;
  onChange: (v: Partial<LaunchDraft>) => void;
}) {
  if (draft.step === 1)
    return (
      <section className="hybridResourceStage">
        <div className="knowledgeCoverage">
          <div>
            Knowledge coverage for this use case{' '}
            <strong>{Math.min(100, draft.knowledge.length * 28)}%</strong>
          </div>
          <progress
            max={100}
            value={Math.min(100, draft.knowledge.length * 28)}
            aria-label="Knowledge coverage"
          />
          <p>
            Recommendation: connect approved CRM knowledge to improve coverage.
            Preview estimate.
          </p>
        </div>
        <div className="hybridSourceGrid">
          {knowledgeSources.map((s) => (
            <button
              type="button"
              key={s.id}
              aria-pressed={draft.knowledge.includes(s.id)}
              onClick={() =>
                onChange({
                  knowledge: draft.knowledge.includes(s.id)
                    ? draft.knowledge.filter((id) => id !== s.id)
                    : [...draft.knowledge, s.id],
                })
              }
            >
              <ProviderLogo provider={s.id} size={24} />
              <span>
                <strong>{s.name}</strong>
                <small>
                  {draft.knowledge.includes(s.id)
                    ? 'Selected source'
                    : 'Approved organization source'}
                </small>
              </span>
              {draft.knowledge.includes(s.id) && (
                <span className="statusDot" aria-label="Selected" />
              )}
            </button>
          ))}
        </div>
      </section>
    );
  return (
    <section className="hybridToolRows" aria-label="Tool actions">
      {toolConnectors.flatMap((t) =>
        (t.actions ?? []).map((a) => (
          <label
            key={`${t.id}-${a.id}`}
            className={draft.tools[t.id]?.includes(a.id) ? 'selected' : ''}
          >
            <input
              type="checkbox"
              role="switch"
              disabled={!a.approved}
              checked={!!draft.tools[t.id]?.includes(a.id)}
              onChange={(e) => {
                const actions = e.target.checked
                  ? [...(draft.tools[t.id] ?? []), a.id]
                  : (draft.tools[t.id] ?? []).filter((x) => x !== a.id);
                const tools = { ...draft.tools };
                if (actions.length) tools[t.id] = actions;
                else delete tools[t.id];
                onChange({ tools });
              }}
            />
            <span>
              <strong>{a.name}</strong>
              <small>
                {t.name}
                {!a.approved ? ' · Organization approval required' : ''}
              </small>
            </span>
            <span className="modelPill">{a.access}</span>
            <span className="modelPill">
              {a.requiresApproval ? 'Approval required' : 'Low risk'}
            </span>
          </label>
        )),
      )}
    </section>
  );
}
