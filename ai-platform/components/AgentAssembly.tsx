import { NeoMascot } from './NeoMascot';
import { Check } from 'lucide-react';
import { readiness } from '@/lib/readiness';
import type { ReferenceEvaluation } from '@/lib/preview';
import { launchSteps, type LaunchDraft } from '@/lib/launch';
import { approvedEndpoints, executionModels } from '@/lib/configuration';
import { NewneoMark } from './NewneoLogo';
export function AgentAssembly({
  draft,
  evaluation,
}: {
  draft: LaunchDraft;
  evaluation?: ReferenceEvaluation | null;
}) {
  const ready = readiness(draft, evaluation);
  const complete = ready.stages.filter((s) => s.complete).length;
  const summaries = [
    draft.name,
    `${draft.knowledge.length} sources`,
    `${Object.values(draft.tools).flat().length} tools`,
    executionModels.find((x) => x.id === draft.infrastructure.kind)?.name ??
      'Cloud',
    approvedEndpoints.find((x) => x.id === draft.model.modelId)?.name ??
      'Model selected',
    `${(['logInteractions', 'maskSensitive', 'roleBasedAccess', 'sensitiveApproval', 'dataResidency', 'retentionPolicy'] as const).filter((key) => draft.governance.controls[key]).length} policies`,
    evaluation ? `${evaluation.score}% readiness` : 'Awaiting evaluation',
    draft.environment ?? 'Select environment',
  ];
  return (
    <aside className="hybridAssembly" aria-label="Agent Assembly">
      <section className="assemblyCard">
        <h2>
          <NewneoMark size={15} /> AGENT ASSEMBLY
        </h2>
        <NeoMascot
          state="assembling"
          progress={ready.percent}
          agentName={draft.name}
          showLabel
        />
        <ol className="assemblyStages">
          {launchSteps.map((name, i) => (
            <li
              key={name}
              className={
                i === draft.step
                  ? 'current'
                  : ready.stages[i].complete
                    ? 'complete'
                    : ''
              }
            >
              <b aria-hidden="true">
                {i !== draft.step && ready.stages[i].complete && (
                  <Check size={12} />
                )}
              </b>
              <div>
                <span>{name}</span>
                {i === draft.step ? (
                  <small>In progress</small>
                ) : ready.stages[i].complete ? (
                  <small title={summaries[i]}>{summaries[i]}</small>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section
        className={`assemblyCard assemblyReadiness ${ready.percent >= 88 ? 'ready' : ''}`}
      >
        <h2>
          READINESS <span>{ready.percent}%</span>
        </h2>
        <div className="assemblyScore">
          <strong>{ready.percent}%</strong>
          <progress
            aria-label="Overall journey progress"
            max={8}
            value={complete}
          />
          <p>
            <b>{complete}</b> of 8 stages complete
          </p>
          <small>
            Current: <b>{launchSteps[draft.step]}</b>
          </small>
          <p className="readinessHint">
            {complete === 0
              ? 'Define your use case to begin'
              : ready.productionReady
                ? 'Ready for deployment preview'
                : 'Building production readiness'}
          </p>
        </div>
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
      </section>
    </aside>
  );
}
