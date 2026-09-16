import Image from 'next/image';
import type { CSSProperties } from 'react';

export type NeoState =
  'default' | 'assembling' | 'success' | 'thinking' | 'warning';
// One approved pose for now. Future poses can be replaced here without changing screens.
const neoAssets: Record<NeoState, string> = {
  default: '/assets/neo/salute.png',
  assembling: '/assets/neo/salute.png',
  success: '/assets/neo/salute.png',
  thinking: '/assets/neo/salute.png',
  warning: '/assets/neo/salute.png',
};
export function NeoMascot({
  state = 'default',
  progress = 100,
  size = 140,
  agentName,
  showLabel = false,
  animate = true,
}: {
  state?: NeoState;
  progress?: number;
  size?: number;
  agentName?: string;
  showLabel?: boolean;
  animate?: boolean;
}) {
  const reveal =
    state === 'assembling'
      ? Math.min(100, Math.max(0, Number.isFinite(progress) ? progress : 0))
      : 100;
  return (
    <figure
      className="neoMascot"
      data-state={state}
      data-animate={animate}
      data-progress={reveal}
      style={
        {
          '--neo-size': `${size}px`,
          '--neo-hidden': `${100 - reveal}%`,
        } as CSSProperties
      }
    >
      <div className="neoStage">
        {state === 'assembling' && (
          <Image
            className="neoOutline"
            src={neoAssets[state]}
            width={size}
            height={size}
            alt=""
            aria-hidden="true"
          />
        )}
        <div className="neoReveal">
          <Image
            className="neoImage"
            src={neoAssets[state]}
            width={size}
            height={size}
            alt={
              state === 'success'
                ? 'Neo, the NEWNEO companion, saluting to celebrate your agent creation'
                : ''
            }
            priority={state === 'success'}
          />
        </div>
      </div>
      {showLabel && (
        <figcaption>
          {state === 'assembling'
            ? `Assembling: ${agentName || 'your agent'}`
            : 'Neo · NEWNEO companion'}
        </figcaption>
      )}
    </figure>
  );
}
