import { NeoMascot } from './NeoMascot';
import { readiness } from '@/lib/readiness';
import type { ReferenceEvaluation } from '@/lib/preview';
import { launchSteps, type LaunchDraft } from '@/lib/launch';
export function AgentAssembly({
  draft,
  evaluation,
}: {
  draft: LaunchDraft;
  evaluation?: ReferenceEvaluation | null;
}) {
  const ready = readiness(draft, evaluation);
  const complete = ready.stages.filter((s) => s.complete).length;
  return (
    <aside className="hybridAssembly" aria-label="Agent Assembly">
      <section
        className={`assemblyCard assemblyReadiness ${ready.percent >= 88 ? 'ready' : ''}`}
      >
        <h2>
          READINESS <span>{ready.percent}%</span>
        </h2>
        <NeoMascot
          state="assembling"
          progress={ready.percent}
          size={112}
          agentName={draft.name}
          showLabel
        />
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
