import {
  ChartNoAxesCombined,
  Terminal, Cpu,
  ScrollText,
  Puzzle, MessageSquareText, UserRoundCheck, Siren, KeyRound,
  ChartNoAxesColumnIncreasing, Presentation, ContactRound, UsersRound,
  ShoppingCart, ReceiptText, ShieldCheck, CalendarRange, Megaphone, FileCheck2,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { agentIdentity } from '@/lib/agent-identity';

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
    skills: Puzzle,
    models: Cpu,
  }[name as 'reports' | 'playground' | 'audit' | 'skills' | 'models'];
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
const specialistIcons = {
  'customer-feedback': MessageSquareText, 'customer-onboarding': UserRoundCheck,
  'incident-response': Siren, 'access-requests': KeyRound,
  'revenue-intelligence': ChartNoAxesColumnIncreasing, 'sales-enablement': Presentation,
  'employee-onboarding': ContactRound, 'employee-self-service': UsersRound,
  procurement: ShoppingCart, 'invoice-review': ReceiptText, 'compliance-monitor': ShieldCheck,
  'operations-planning': CalendarRange, 'marketing-insights': Megaphone, 'content-review': FileCheck2,
};
export function AgentIcon({ type = 'automation', identity, name }: { type?: AgentType; identity?: string; name?: string }) {
  const visual = agentIdentity(identity, name, type);
  const Icon = specialistIcons[visual.key as keyof typeof specialistIcons];
  return <span className={`agentIcon ${visual.type}`} data-agent-identity={visual.key} aria-hidden="true">
    {Icon ? <Icon size={20} strokeWidth={1.5} /> : <AssetIcon name={visual.type} size={20} monochrome />}
  </span>;
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
