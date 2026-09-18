'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SignOutControl } from './SignOutControl';
import { AssetIcon } from './Assets';
import NeoHelp from './NeoHelp';
import { HeaderSearch, HeaderNotifications, HelpIcon } from './HeaderTools';
import { NewneoWordmark } from './NewneoLogo';
import { DemoControls, DemoBoundary } from './journeys/DemoExperience';
import { usePreviewValue } from './journeys/PreviewState';
import { useAccount } from './AccountContext';
import {
  isOperationsPath, isSettingsPath, canAccessProductPath,
  hasCapability,
  demoProductRole,
} from '@/lib/product-access';
import { useSidebarState } from './SidebarState';

export const navigation = [
  ['Overview', '/operations', 'overview'],
  ['Agents', '/agents', 'agents'],
  ['Skills', '/skills', 'skills'],
  ['Knowledge', '/knowledge', 'knowledge'],
  ['Connections', '/tools', 'tools'],
  ['Models', '/models', 'models'],
  ['Governance', '/governance', 'governance'],
  ['Evaluations', '/evaluations', 'evaluations'],
  ['Deployments', '/deployments', 'deployments'],
  ['AgentOps', '/agentops', 'agentops'],
  ['FinOps', '/finops', 'finops'],
  ['Reports', '/reports', 'reports'],
  ['Playground', '/playground', 'playground'],
  ['Audit Log', '/audit-log', 'audit'],
  ['Settings', '/settings', 'settings'],
] as const;
const workspaceNavigation = [
  ['Home', '/', 'overview'],
  ['My Agents', '/workspace/agents', 'agents'],
  ['Discover', '/workspace/discover', 'skills'],
  ['Work', '/workspace/work', 'playground'],
  ['Analytics', '/workspace/analytics', 'reports'],
  ['Reports', '/workspace/reports', 'reports'],
] as const;

export function NavItem({
  label,
  href,
  icon,
  active,
  compact = false,
  onNavigate,
}: {
  label: string;
  href: string;
  icon: string;
  active: boolean;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      className={`navItem${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined}
      aria-label={compact ? label : undefined}
      data-tooltip={compact ? label : undefined}
      onClick={onNavigate}
      style={
        compact ? { justifyContent: 'center', paddingInline: 8 } : undefined
      }
    >
      {icon === 'help' ? <HelpIcon/> : <AssetIcon name={icon} monochrome />}
      {!compact && <span>{label}</span>}
    </Link>
  );
}

export function ApplicationSidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapsed,
}: {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapsed: () => void;
}) {
  const [previewOrg] = usePreviewValue('settings:org', 'Acme Corp');
  const account = useAccount();
  const org =
    account.mode === 'demo'
      ? 'Acme Corp'
      : account.authenticated
        ? (account.workspace?.organization_name ?? 'Select workspace')
        : previewOrg;
  const [demoRole] = usePreviewValue('demo:role', 'Administrator');
  const path = usePathname();
  const canOperate = hasCapability(
    account.mode === 'demo'
      ? demoProductRole(demoRole)
      : account.workspace?.role,
    'operations:view',
  );
  const operations = isOperationsPath(path) && canOperate;
  const companyAdmin =
    (account.mode === 'demo'
      ? demoProductRole(demoRole)
      : account.workspace?.role) === 'Org Admin';
  const visibleGroups = [
    { name: 'WORKSPACE', items: workspaceNavigation },
    ...(canOperate
      ? [
          {
            name: 'OPERATIONS',
            items: navigation.filter(([,href]) => !isSettingsPath(href)),
          },
        ]
      : []),
  ];
  return (
    <aside
      id="application-sidebar"
      className={`sidebar${open ? ' isOpen' : ''}${collapsed ? ' isCollapsed' : ''}`}
      style={{ width: collapsed ? 60 : 224 }}
    >
      <Link
        href="/"
        className="brand"
        aria-label="Newneo home"
        style={{
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-start',
          marginInline: collapsed ? 0 : 8,
        }}
      >
        <NewneoWordmark compact={collapsed} sidebar />
      </Link>
      <button
        type="button"
        className="sidebarClose"
        aria-label="Close menu"
        onClick={onClose}
      >
        ×
      </button>
      <Link
        href={operations ? '/agents/catalog' : '/workspace/discover'}
        className="sidebarCreate"
        aria-label="Add Agent"
        data-tooltip={collapsed ? 'Add Agent' : undefined}
      >
        <span aria-hidden="true">＋</span>
        {!collapsed && 'Add Agent'}
      </Link>
      <nav aria-label="Main navigation">
        {visibleGroups.map((group) => (
          <section className="navGroup" key={group.name}>
            <h2>{collapsed ? '' : group.name}</h2>
            {group.items.map(([label, href, icon]) => (
              <NavItem
                key={href}
                {...{ label, href, icon }}
                compact={collapsed}
                active={
                  href === '/'
                    ? path === '/'
                    : path === href || path.startsWith(`${href}/`)
                }
                onNavigate={onClose}
              />
            ))}
          </section>
        ))}
      </nav>
      <div className="sidebarBottom">
        {companyAdmin && <NavItem label="Settings" href="/settings" icon="settings" compact={collapsed} active={isSettingsPath(path)} onNavigate={onClose}/>}

      </div>
      <details
        className="workspaceMenu"
        style={
          collapsed
            ? { paddingInline: 0, display: 'grid', justifyItems: 'center' }
            : undefined
        }
      >
        <summary title={collapsed ? org : undefined}>
          <span className="organizationAvatar">
            {account.authenticated ? org.slice(0, 2).toUpperCase() : 'AC'}
          </span>
          {!collapsed && <span>{org}</span>}
        </summary>
        <div className="workspacePopover">
          <strong>{org}</strong>
          <p>
            {account.mode === 'demo'
              ? 'Demo workspace'
              : account.workspace?.name}
          </p>
          <small>
            {account.mode === 'demo' ? 'Sample data' : account.workspace?.role}
          </small>
        </div>
      </details>
      <button
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={onToggleCollapsed}
        style={{
          width: 28,
          height: 28,
          margin: '12px auto 0',
          borderRadius: 7,
          border: '1px solid #334155',
          background: '#131e32',
          color: '#94a3b8',
          display: 'grid',
          placeItems: 'center',
          lineHeight: 1,
        }}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  );
}

export function Topbar({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const path = usePathname();
  const title = path.includes('/agents/launch')
    ? 'Add Agent'
    : ([...workspaceNavigation, ...navigation].find(([, href]) =>
        href === '/'
          ? path === '/'
          : path === href || path.startsWith(href + '/'),
      )?.[0] ?? (path === '/models' ? 'Model endpoints' : 'Workspace'));
  const [previewOrg] = usePreviewValue('settings:org', 'Acme Corp');
  const account = useAccount();
  const org =
    account.mode === 'demo'
      ? 'Acme Corp'
      : account.authenticated
        ? (account.workspace?.organization_name ?? 'Select workspace')
        : previewOrg;
  const [demoRole] = usePreviewValue('demo:role', 'Administrator');
  const operations =
    isOperationsPath(path) &&
    hasCapability(
      account.mode === 'demo'
        ? demoProductRole(demoRole)
        : account.workspace?.role,
      'operations:view',
    );
  return (
    <header className="topbar" role="banner">
      <button
        className="menuToggle"
        type="button"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls="application-sidebar"
        onClick={onToggle}
      >
        ☰
      </button>
      <div className="shellBreadcrumb">
        <span>{org}</span>
        <span aria-hidden="true">/</span>
        <strong>{title}</strong>
      </div>
      {operations ? (
        <HeaderSearch />
      ) : (
        <Link href="/workspace/discover" style={{ marginLeft: 'auto' }}>
          Find an Agent
        </Link>
      )}
      <div className="topActions">
        {account.mode === 'demo' && <DemoControls />}
        {operations && <HeaderNotifications />}
        <details className="topbarMenu profileMenu">
          <summary aria-label="User menu">
            <span className="avatar">
              {account.authenticated ? 'AD' : 'AM'}
            </span>
            <span className="userContext">
              <strong>
                {account.authenticated ? account.displayName : 'Ana Martinez'}
              </strong>
              <small>{org}</small>
            </span>
          </summary>
          <div className="topbarPopover">
            <strong>
              {account.authenticated ? account.displayName : 'Ana Martinez'}
            </strong>
            <p>
              {account.authenticated
                ? account.workspace?.name
                : `Demo workspace · ${demoRole}`}
            </p>
            <Link href="/workspace/profile">Profile</Link>
            <p>
              <Link href="/workspace/help">Help</Link>
            </p>
            <SignOutControl />
          </div>
        </details>
      </div>
    </header>
  );
}

export function ApplicationShell({ children }: { children: ReactNode }) {
  const account = useAccount();
  const path = usePathname();
  const [demoRole] = usePreviewValue('demo:role', 'Administrator');
  const effectiveRole =
    account.mode === 'demo'
      ? demoProductRole(demoRole)
      : account.workspace?.role;
  const allowed = canAccessProductPath(effectiveRole,path);
  const [open, setOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarState();
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const sidebar = document.getElementById('application-sidebar');
    const focusable = () => [
      ...(sidebar?.querySelectorAll<HTMLElement>('a, button, summary') ?? []),
    ];
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab') {
        const items = focusable();
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open]);

  if (account.mode !== 'demo' && !account.authenticated)
    return (
      <main style={{ maxWidth: 640, margin: '12vh auto', padding: 24 }}>
        <NewneoWordmark />
        <h1>
          {account.error
            ? 'Workspace unavailable'
            : 'Sign in to your workspace'}
        </h1>
        <p role="alert">
          {account.error ??
            'Your session is no longer active. Sign in to continue.'}
        </p>
        <a href="/login">Open NEWNEO login →</a>
        {account.error && (
          <button
            onClick={() =>
              window.dispatchEvent(new Event('newneo-account-changed'))
            }
          >
            Retry
          </button>
        )}
      </main>
    );

  const shellStyle = {
    '--sidebar-width': collapsed ? '60px' : '224px',
  } as CSSProperties;

  return (
    <div className="appShell" style={shellStyle}>
      <a href="#main-content" className="skipLink">
        Skip to content
      </a>
      <ApplicationSidebar
        open={open}
        collapsed={collapsed}
        onClose={() => setOpen(false)}
        onToggleCollapsed={toggleCollapsed}
      />
      {open && (
        <button
          type="button"
          className="sidebarBackdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <section className="mainArea">
        <Topbar open={open} onToggle={() => setOpen(!open)} />
        <main id="main-content" className="content">
          <DemoBoundary>
            {account.mode === 'demo' && (
              <div role="note" className="intelligenceNote">
                Demo · Acme Corp / Ana Martinez · Sample data only. No live
                actions. <a href="/login">Exit demo →</a>
              </div>
            )}
            {allowed ? (
              children
            ) : (
              <section className="panel">
                <h1>{isSettingsPath(path) ? 'Administrator access required' : 'Operations access required'}</h1>
                <p>
                  {isSettingsPath(path) ? 'These organization settings are available to Administrators.' : 'Your role provides access to Workspace. Contact your administrator for additional access.'}
                </p>
                <Link href="/">Return to Workspace</Link>
              </section>
            )}
          </DemoBoundary>
        </main>
      </section>
      <NeoHelp/>
    </div>
  );
}
