import Image from 'next/image';
import Link from 'next/link';
import { Activity } from 'lucide-react';
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
    <section
      className="launchSuccess missionSuccess"
      aria-label="Deployment success preview"
    >
      <Image
        className="salutingRobot"
        src="/assets/agent-ready-salute.png"
        alt="Friendly robot saluting, ready for the mission"
        width={180}
        height={180}
        priority
      />
      <h1>Ready for the mission</h1>
      <p>
        {receipt.agentName} is configured for {receipt.environment}.
      </p>
      <p className="successPreviewNote">
        Your preview is ready to explore. No live deployment occurred.
      </p>
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
