import { sourceProfiles } from '@/lib/resource-profiles';
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
            <strong>
              {Math.round(
                draft.knowledge.reduce(
                  (sum, id) => sum + (sourceProfiles[id]?.coverage ?? 0),
                  0,
                ) / Math.max(1, draft.knowledge.length),
              )}
              %
            </strong>
          </div>
          <progress
            max={100}
            value={Math.round(
              draft.knowledge.reduce(
                (sum, id) => sum + (sourceProfiles[id]?.coverage ?? 0),
                0,
              ) / Math.max(1, draft.knowledge.length),
            )}
            aria-label="Knowledge coverage"
          />
          <p>
            Recommendation: connect approved CRM knowledge to improve coverage.
            Preview estimate.
          </p>
        </div>
        <label className="notificationChoice">
          <input
            type="checkbox"
            checked={!!draft.knowledgeNotNeeded}
            onChange={(e) =>
              onChange({
                knowledgeNotNeeded: e.target.checked,
                knowledge: e.target.checked ? [] : draft.knowledge,
              })
            }
          />
          No knowledge sources needed for this mission
        </label>
        {!draft.knowledge.length && (
          <p className="hybridEmpty">
            No knowledge sources selected. Choose an approved source or confirm
            none are needed.
          </p>
        )}
        <div className="hybridSourceGrid">
          {knowledgeSources.map((s) => (
            <button
              type="button"
              key={s.id}
              aria-pressed={draft.knowledge.includes(s.id)}
              onClick={() =>
                onChange({
                  knowledgeNotNeeded: false,
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
                    ? 'Connected source'
                    : 'Approved organization source'}
                </small>
                <small>
                  {sourceProfiles[s.id]?.type} ·{' '}
                  {(sourceProfiles[s.id]?.docs ?? 0).toLocaleString('en-US')}{' '}
                  docs
                </small>
                <small>
                  {sourceProfiles[s.id]?.coverage ?? 0}% coverage ·{' '}
                  {sourceProfiles[s.id]?.permission}
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
    <section aria-label="Tool actions">
      <p className="intelligenceNote">
        <strong>Knowledge = what the agent knows</strong>Tools = what the agent
        can do. Permissions and human approval constrain each action.
      </p>
      <label className="notificationChoice">
        <input
          type="checkbox"
          checked={!!draft.toolsNotNeeded}
          onChange={(e) =>
            onChange({
              toolsNotNeeded: e.target.checked,
              tools: e.target.checked ? {} : draft.tools,
            })
          }
        />
        No tools needed for this mission
      </label>
      {!Object.values(draft.tools).flat().length && (
        <p className="hybridEmpty">
          No tools selected. Add an action or confirm this agent only answers
          questions.
        </p>
      )}
      <div className="hybridToolRows">
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
                  onChange({ tools, toolsNotNeeded: false });
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
                {a.requiresApproval
                  ? 'High risk · Human approval required'
                  : a.access === 'Write'
                    ? 'Medium risk · Policy approval'
                    : 'Low risk · Approved'}
              </span>
            </label>
          )),
        )}
      </div>
    </section>
  );
}
