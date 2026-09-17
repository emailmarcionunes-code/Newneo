'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AssetIcon } from './Assets';
import { HeaderSearch, HeaderNotifications, HelpIcon } from './HeaderTools';
import { NewneoWordmark } from './NewneoLogo';
import { DemoControls, DemoBoundary } from './journeys/DemoExperience';
import { usePreviewValue } from './journeys/PreviewState';
import { useAccount } from './AccountContext';
import { useSidebarState } from './SidebarState';

export const workspaceNavigation = [
  ['Home', '/', 'overview'],
  ['Agents', '/agents', 'agents'],
  ['Reports', '/reports', 'reports'],
] as const;

export const operationsNavigation = [
  ['Skills', '/skills', 'skills'],
  ['Knowledge', '/knowledge', 'knowledge'],
  ['Connections', '/tools', 'tools'],
  ['Governance', '/governance', 'governance'],
  ['Evaluations', '/evaluations', 'evaluations'],
  ['Deployments', '/deployments', 'deployments'],
  ['AgentOps', '/agentops', 'agentops'],
  ['FinOps', '/finops', 'finops'],
  ['Playground', '/playground', 'playground'],
  ['Audit Log', '/audit-log', 'audit'],
] as const;

export const navigation = [...workspaceNavigation, ...operationsNavigation] as const;

function hasOperationsAccess({
  account,
  demoRole,
}: {
  account: ReturnType<typeof useAccount>;
  demoRole: string;
}) {
  if (account.mode === 'demo') {
    return ['administrator', 'admin', 'ai administrator', 'it administrator'].includes(
      demoRole.toLowerCase(),
    );
  }
  const role = account.workspace?.role?.toLowerCase() ?? '';
  return Boolean(
    account.workspace?.can_edit_agents ||
      ['administrator', 'admin', 'owner', 'ai administrator', 'it administrator'].includes(role),
  );
}

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
      style={compact ? { justifyContent: 'center', paddingInline: 8 } : undefined}
    >
      <AssetIcon name={icon} monochrome />
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
  const canAccessOperations = hasOperationsAccess({ account, demoRole });
  const groups = [
    { name: 'WORKSPACE', items: workspaceNavigation },
    ...(canAccessOperations ? [{ name: 'OPERATIONS', items: operationsNavigation }] : []),
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
        href="/agents/catalog"
        className="sidebarCreate"
        aria-label={canAccessOperations ? 'Add Agent' : 'Discover Agents'}
        data-tooltip={collapsed ? (canAccessOperations ? 'Add Agent' : 'Discover Agents') : undefined}
      >
        <span aria-hidden="true">＋</span>
        {!collapsed && (canAccessOperations ? 'Add Agent' : 'Discover Agents')}
      </Link>
      <nav aria-label="Main navigation">
        {groups.map((group) => (
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
        <NavItem
          label="Settings"
          href="/settings"
          icon="settings"
          compact={collapsed}
          active={path.startsWith('/settings')}
          onNavigate={onClose}
        />
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
          <p>{canAccessOperations ? 'Workspace + Operations access' : 'Business workspace'}</p>
          <small>{account.mode === 'demo' ? `Demo · ${demoRole}` : account.workspace?.role ?? 'Workspace member'}</small>
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
    : (navigation.find(([, href]) =>
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
  const canAccessOperations = hasOperationsAccess({ account, demoRole });
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
      <HeaderSearch />
      <div className="topActions">
        {account.mode === 'demo' && <DemoControls />}
        <HeaderNotifications />
        <details className="topbarMenu">
          <summary aria-label="Help">
            <HelpIcon />
          </summary>
          <div className="topbarPopover">
            <strong>{canAccessOperations ? 'Newneo Operations Guide' : 'Working with Newneo'}</strong>
            <p>
              {canAccessOperations
                ? 'Manage agents, knowledge, connections, skills, policies and operational controls. Business users only see the workspace they need to get work done.'
                : 'Choose an agent, give it the task and select or connect the business sources it should use. Newneo handles the technical AI configuration behind the scenes.'}
            </p>
          </div>
        </details>
        <details className="topbarMenu profileMenu">
          <summary>
            <span className="avatar">{account.authenticated ? 'AD' : 'AM'}</span>
            <span className="userContext">
              <strong>{account.authenticated ? account.displayName : 'Ana Martinez'}</strong>
              <small>{org}</small>
            </span>
          </summary>
          <div className="topbarPopover">
            <strong>{account.authenticated ? account.displayName : 'Ana Martinez'}</strong>
            <p>
              {account.authenticated
                ? account.workspace?.name
                : `Demo workspace · ${demoRole}`}
            </p>
            {canAccessOperations && <Link href="/settings#team">Team & Roles</Link>}
            <p>
              <Link href="/settings">Workspace settings</Link>
            </p>
            <Link href={account.authenticated ? '/settings' : '/login'}>
              {account.authenticated ? 'Manage account' : 'Sign out of preview'}
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}

export function ApplicationShell({ children }: { children: ReactNode }) {
  const account = useAccount();
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
        <h1>{account.error ? 'Workspace unavailable' : 'Sign in to your workspace'}</h1>
        <p role="alert">
          {account.error ?? 'Your session is no longer active. Sign in to continue.'}
        </p>
        <a href="/login">Open NEWNEO login →</a>
        {account.error && (
          <button
            onClick={() => window.dispatchEvent(new Event('newneo-account-changed'))}
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
                Demo · Acme Corp / Ana Martinez · Sample data only. No live actions.{' '}
                <a href="/login">Exit demo →</a>
              </div>
            )}
            {children}
          </DemoBoundary>
        </main>
      </section>
    </div>
  );
}
