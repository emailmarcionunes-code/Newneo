import type { CSSProperties } from 'react';
import { launchSteps, type LaunchDraft } from '@/lib/launch';
import { approvedEndpoints, executionModels } from '@/lib/configuration';
export function AgentAssembly({ draft }: { draft: LaunchDraft }) {
  const progress = Math.round((draft.step / 8) * 100);
  const summaries = [
    'Mission defined',
    `${draft.knowledge.length} sources`,
    `${Object.values(draft.tools).flat().length} actions`,
    executionModels.find((x) => x.id === draft.runtime.executionModel)?.name ??
      'Cloud',
    approvedEndpoints.find((x) => x.id === draft.runtime.endpointId)?.name ??
      'Model selected',
    'Policies configured',
    'Readiness reviewed',
    '',
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
              i < draft.step ? 'done' : i === draft.step ? 'current' : ''
            }
          />
        ))}
        <i />
      </div>
      <div className="assemblyScore">
        <strong>{progress}%</strong>
        <p>production readiness</p>
        <progress
          aria-label="Overall journey progress"
          max={8}
          value={draft.step}
        />
      </div>
      <ol className="assemblyStages">
        {launchSteps.map((name, i) => (
          <li
            key={name}
            className={
              i < draft.step ? 'complete' : i === draft.step ? 'current' : ''
            }
          >
            <b aria-hidden="true">{i < draft.step ? '✓' : ''}</b>
            <div>
              {name}
              {i < draft.step && <small>{summaries[i]}</small>}
            </div>
          </li>
        ))}
      </ol>
      <div className="intelligenceNote">
        <strong>NEWNEO INTELLIGENCE</strong>
        {draft.step === 0
          ? 'Describe the mission. I’ll shape the architecture and recommend the next decisions.'
          : 'Your current choices remain inside approved enterprise guardrails.'}
      </div>
    </aside>
  );
}
