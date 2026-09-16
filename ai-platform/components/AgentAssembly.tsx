import type { CSSProperties } from 'react';
import { readiness } from '@/lib/readiness';
import type { ReferenceEvaluation } from '@/lib/preview';
import { launchSteps, type LaunchDraft } from '@/lib/launch';
import { approvedEndpoints, executionModels } from '@/lib/configuration';
export function AgentAssembly({
  draft,
  evaluation,
}: {
  draft: LaunchDraft;
  evaluation?: ReferenceEvaluation | null;
}) {
  const ready = readiness(draft, evaluation);
  const progress = ready.percent;
  const summaries = [
    'Mission defined',
    `${draft.knowledge.length} sources`,
    `${Object.values(draft.tools).flat().length} actions`,
    executionModels.find((x) => x.id === draft.infrastructure.kind)?.name ??
      'Cloud',
    approvedEndpoints.find((x) => x.id === draft.model.modelId)?.name ??
      'Model selected',
    'Policies configured',
    evaluation
      ? `${evaluation.score}% · reference evaluation`
      : 'Awaiting evaluation',
    draft.environment ?? 'Select environment',
  ];
  return (
    <aside className="hybridAssembly" aria-label="Agent Assembly">
      <h2>AGENT ASSEMBLY</h2>
      <div className="assemblyVisual" aria-hidden="true">
        {launchSteps.map((_, i) => (
          <span
            key={i}
            style={{ '--ring': i + 1 } as CSSProperties}
            className={
              ready.stages[i].complete
                ? 'done'
                : i === draft.step
                  ? 'current'
                  : ''
            }
          />
        ))}
        <i />
      </div>
      <div className="assemblyScore">
        <strong>{progress}%</strong>
        <p>production readiness</p>
        <small>Current: {launchSteps[draft.step]}</small>
        <progress
          aria-label="Overall journey progress"
          max={8}
          value={ready.stages.filter((s) => s.complete).length}
        />
      </div>
      <ol className="assemblyStages">
        {launchSteps.map((name, i) => (
          <li
            key={name}
            className={
              ready.stages[i].complete
                ? 'complete'
                : i === draft.step
                  ? 'current'
                  : ''
            }
          >
            <b aria-hidden="true">{ready.stages[i].complete ? '✓' : ''}</b>
            <div>
              {name}
              {ready.stages[i].complete && <small>{summaries[i]}</small>}
            </div>
          </li>
        ))}
      </ol>
      {(ready.blockers.length > 0 || ready.warnings.length > 0) && (
        <details className="readinessIssues">
          <summary>{ready.blockers.length} requirements remaining</summary>
          <ul>
            {[...ready.blockers, ...ready.warnings].map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </details>
      )}
      {ready.productionReady && (
        <p className="successText">
          Production requirements satisfied · preview
        </p>
      )}
      <div className="intelligenceNote">
        <strong>NEWNEO INTELLIGENCE</strong>
        {draft.step === 0
          ? 'Describe the mission. I’ll shape the architecture and recommend the next decisions.'
          : 'Your current choices remain inside approved enterprise guardrails.'}
      </div>
    </aside>
  );
}
