import Link from 'next/link';
import { AssetIcon } from './Assets';
import { Button } from './UI';
import type { PreviewDeployment } from '@/lib/preview';
export function LaunchSuccess({
  receipt,
  onOverview,
  onDeployment,
  onIterate,
}: {
  receipt: PreviewDeployment;
  onOverview: () => void;
  onDeployment: () => void;
  onIterate: () => void;
}) {
  return (
    <section className="launchSuccess" aria-label="Deployment success preview">
      <div className="successCelebration" aria-hidden="true">
        <AssetIcon name="success-circle" size={64} />
        <AssetIcon name="success-check" size={32} />
      </div>
      <h1>Your agent is live!</h1>
      <p>
        Preview: {receipt.agentName} would be deployed to{' '}
        {receipt.environment.toLowerCase()}. No live deployment occurred.
      </p>
      <span className="successEnvironment">
        {receipt.environment.toUpperCase()} · LIVE PREVIEW
      </span>
      <div className="successActions">
        <Button onClick={onOverview}>View Agent →</Button>
        <Link className="button secondary" href="/agentops">
          Open AgentOps
        </Link>
      </div>
      <section className="successNext">
        <h2>What's next?</h2>
        <div>
          <Link href="/agentops">
            <span className="nextIcon monitor">
              <AssetIcon name="next-monitor" />
            </span>
            <strong>Monitor performance</strong>
            <small>in AgentOps</small>
          </Link>
          <Button variant="link" onClick={onDeployment}>
            <span className="nextIcon feedback">
              <AssetIcon name="next-feedback" />
            </span>
            <strong>View Deployment</strong>
            <small>and review configuration</small>
          </Button>
          <Button variant="link" onClick={onIterate}>
            <span className="nextIcon iterate">
              <AssetIcon name="next-iterate" />
            </span>
            <strong>Create New Version</strong>
            <small>with new versions</small>
          </Button>
          <Link href="/agents/catalog">
            <span className="nextIcon explore">
              <AssetIcon name="next-explore" />
            </span>
            <strong>Explore more agents</strong>
            <small>and use cases</small>
          </Link>
        </div>
      </section>
    </section>
  );
}
