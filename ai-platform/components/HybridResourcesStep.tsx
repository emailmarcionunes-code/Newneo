import { Check } from 'lucide-react';
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
  if (draft.step === 1) {
    const coverage = Math.round(
      draft.knowledge.reduce(
        (sum, id) => sum + (sourceProfiles[id]?.coverage ?? 0),
        0,
      ) / Math.max(1, draft.knowledge.length),
    );
    return (
      <section className="hybridResourceStage">
        <div className="hybridSourceGrid">
          {knowledgeSources.map((s) => {
            const selected = draft.knowledge.includes(s.id);
            const profile = sourceProfiles[s.id];
            return (
              <button
                type="button"
                key={s.id}
                aria-label={`${s.name} ${selected ? 'Connected source' : 'Approved organization source'}`}
                aria-pressed={selected}
                onClick={() =>
                  onChange({
                    knowledgeNotNeeded: false,
                    knowledge: selected
                      ? draft.knowledge.filter((id) => id !== s.id)
                      : [...draft.knowledge, s.id],
                  })
                }
              >
                <ProviderLogo provider={s.id} size={24} />
                <span className="sourceIdentity">
                  <strong>
                    {s.name} {selected && <em>Connected</em>}
                  </strong>
                  <small>
                    {profile?.type} ·{' '}
                    {(profile?.docs ?? 0).toLocaleString('en-US')} docs
                  </small>
                </span>
                <span className="sourceCoverage">
                  <b>{profile?.coverage ?? 0}%</b>
                  <small>coverage</small>
                </span>
                <span className="selectionCircle" aria-hidden="true">
                  {selected && <Check size={13} />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="journeyInsight">
          <span aria-hidden="true">N</span>
          <p>
            Your current sources cover <strong>{coverage}%</strong> on average
            in this preview. Connect approved enterprise sources to support this
            mission.
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
      </section>
    );
  }
  const highRisk = toolConnectors.flatMap((t) =>
    (t.actions ?? []).filter(
      (a) => draft.tools[t.id]?.includes(a.id) && a.requiresApproval,
    ),
  ).length;
  return (
    <section aria-label="Tool actions">
      <p className="toolsExplainer">
        <strong>Knowledge</strong> = what the agent knows <span>·</span>{' '}
        <strong>Tools</strong> = what the agent can do
      </p>
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
              <span className="toolIdentity">
                <strong>{a.name}</strong>
                {a.requiresApproval && (
                  <em className="riskBadge medium">Requires human approval</em>
                )}
                <small>
                  {t.name} · {a.access} permission
                  {!a.approved ? ' · Organization approval required' : ''}
                </small>
              </span>
              <span
                className={`riskBadge ${a.requiresApproval ? 'high' : a.access === 'Write' ? 'medium' : 'low'}`}
              >
                {a.requiresApproval
                  ? 'high'
                  : a.access === 'Write'
                    ? 'medium'
                    : 'low'}{' '}
                risk
              </span>
            </label>
          )),
        )}
      </div>
      <div className="journeyInsight">
        <span aria-hidden="true">N</span>
        <p>
          {highRisk
            ? `${highRisk} high-risk actions selected require human approval. Review the human-in-the-loop control in Governance.`
            : 'Selected actions stay within their configured permission scopes. High-risk actions require human approval.'}
        </p>
      </div>
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
    </section>
  );
}
