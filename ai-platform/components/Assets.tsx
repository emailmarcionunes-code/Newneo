import { ChartNoAxesCombined, Terminal, ScrollText } from 'lucide-react';
import type { CSSProperties } from 'react';

/** Exact Figma exports; replace assets here when final optical polish is approved. */
export function AssetIcon({
  name,
  size = 18,
  className = '',
  monochrome = false,
}: {
  name: string;
  size?: number;
  className?: string;
  monochrome?: boolean;
}) {
  const navigationIcon = {
    reports: ChartNoAxesCombined,
    playground: Terminal,
    audit: ScrollText,
  }[name as 'reports' | 'playground' | 'audit'];
  if (navigationIcon) {
    const Icon = navigationIcon;
    return (
      <Icon
        size={size}
        strokeWidth={1.5}
        className={`assetIcon ${className}`}
        aria-hidden="true"
      />
    );
  }
  if (monochrome)
    return (
      <span
        aria-hidden="true"
        className={`assetIcon ${className}`}
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          background: 'currentColor',
          maskImage: `url(/assets/figma/${name}.svg)`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
        }}
      />
    );
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
      <AssetIcon name={type} size={18} monochrome />
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
        src={`/assets/figma/${provider}.${provider === 'zendesk' ? 'svg' : 'png'}`}
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
