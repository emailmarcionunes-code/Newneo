import type { CSSProperties } from 'react';

/** Exact Figma exports; replace assets here when final optical polish is approved. */
export function AssetIcon({
  name,
  size = 18,
  className = '',
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      className={`assetIcon ${className}`}
      src={`/assets/figma/${name}.svg`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}
export type AgentType =
  'service' | 'it' | 'assistant' | 'sales' | 'automation' | 'research';
export function AgentIcon({ type }: { type: AgentType }) {
  return (
    <span className={`agentIcon ${type}`}>
      <AssetIcon name={type} size={18} />
    </span>
  );
}
export function ProviderLogo({
  provider,
  size = 32,
}: {
  provider: string;
  size?: number;
}) {
  return (
    <span
      className={`providerLogo ${provider}`}
      style={{ '--logo-size': `${size}px` } as CSSProperties}
    >
      <img
        src={`/assets/figma/${provider}.png`}
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
      />
    </span>
  );
}
export function LaunchIcon() {
  return (
    <span className="launchIcon">
      <AssetIcon name="launch" size={18} />
    </span>
  );
}
