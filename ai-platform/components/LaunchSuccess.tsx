import { NeoMascot } from './NeoMascot';
import type { LaunchDraft } from '@/lib/launch';
import { approvedEndpoints, executionModels } from '@/lib/configuration';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { Button } from './UI';
import type { PreviewDeployment, ReferenceEvaluation } from '@/lib/preview';
export function LaunchSuccess({
  receipt,
  draft,
  evaluation,
  onOverview,
  onDeployment,
  onIterate,
}: {
  receipt: PreviewDeployment;
  draft: LaunchDraft;
  evaluation: ReferenceEvaluation | null;
  onOverview: () => void;
  onDeployment: () => void;
  onIterate: () => void;
}) {
  return (
    <section
      className="launchSuccess missionSuccess"
      aria-label="Deployment success preview"
    >
      <NeoMascot state="success" progress={100} size={200} showLabel />
      <h1>Agent Created</h1>
      <p>
        {receipt.agentName} is configured for {receipt.environment}.
      </p>
      <p className="successPreviewNote">
        Your preview is ready to explore. No live deployment occurred.
      </p>
      <ul className="neoCompletionSummary" aria-label="Agent creation summary">
        <li>
          <span>Knowledge connected</span>
          <strong>
            {draft.knowledge.length}{' '}
            {draft.knowledge.length === 1 ? 'source' : 'sources'}
          </strong>
        </li>
        <li>
          <span>Tools approved</span>
          <strong>
            {Object.values(draft.tools).flat().length} selected · preview
          </strong>
        </li>
        <li>
          <span>Infrastructure selected</span>
          <strong>
            {
              executionModels.find((x) => x.id === draft.infrastructure.kind)
                ?.name
            }
          </strong>
        </li>
        <li>
          <span>Model selected</span>
          <strong>
            {approvedEndpoints.find((x) => x.id === draft.model.modelId)?.name}
          </strong>
        </li>
        <li>
          <span>Governance active</span>
          <strong>
            {Object.values(draft.governance.controls).filter(Boolean).length}{' '}
            controls configured
          </strong>
        </li>
        <li>
          <span>
            {evaluation && evaluation.score >= 90
              ? 'Evaluation passed'
              : 'Evaluation reviewed'}
          </span>
          <strong>
            {evaluation ? `${evaluation.score}% · preview` : 'Not evaluated'}
          </strong>
        </li>
        <li>
          <span>Deployment complete</span>
          <strong>Preview only</strong>
        </li>
      </ul>
      <div className="successActions">
        <Button onClick={onOverview}>View Agent →</Button>
        <Link className="button secondary" href="/agentops">
          <Activity size={16} /> Open AgentOps
        </Link>
        <Button variant="secondary" onClick={onDeployment}>
          View Deployment
        </Button>
        <Button variant="link" onClick={onIterate}>
          Create New Version
        </Button>
      </div>
    </section>
  );
}
