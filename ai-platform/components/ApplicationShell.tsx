'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AssetIcon } from './Assets';
import { HeaderSearch, HeaderNotifications, HelpIcon } from './HeaderTools';
import { NewneoWordmark } from './NewneoLogo';

export const navigation = [
  ['Overview', '/', 'overview'],
  ['Agents', '/agents', 'agents'],
  ['Knowledge', '/knowledge', 'knowledge'],
  ['Tools & MCP', '/tools', 'tools'],
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
const groups = [
  { name: 'BUILD / MANAGE', items: navigation.slice(0, 5) },
  { name: 'OPERATE', items: navigation.slice(5, 10) },
  { name: 'PLATFORM', items: navigation.slice(10, 12) },
];

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
      <AssetIcon name={icon} />
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
  const path = usePathname();
  return (
    <aside
      id="application-sidebar"
      className={`sidebar${open ? ' isOpen' : ''}${collapsed ? ' isCollapsed' : ''}`}
      style={{ width: collapsed ? 60 : 224, transition: 'width 180ms ease' }}
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
        <NewneoWordmark compact={collapsed} />
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
        aria-label="Create Agent"
        data-tooltip={collapsed ? 'Create Agent' : undefined}
      >
        <span aria-hidden="true">＋</span>
        {!collapsed && 'Create Agent'}
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
        <summary title={collapsed ? 'Acme Corp' : undefined}>
          <span className="organizationAvatar">AC</span>
          {!collapsed && <span>Acme Corp</span>}
        </summary>
        <div className="workspacePopover">
          <strong>Acme Corp</strong>
          <p>Customer Service workspace</p>
          <small>Demo organization</small>
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
    ? 'Create Agent'
    : (navigation.find(([, href]) =>
        href === '/'
          ? path === '/'
          : path === href || path.startsWith(href + '/'),
      )?.[0] ?? 'Workspace');
  return (
    <header className="topbar">
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
        <span>Acme Corp</span>
        <span aria-hidden="true">/</span>
        <strong>{title}</strong>
      </div>
      <HeaderSearch />
      <div className="topActions">
        <HeaderNotifications />
        <details className="topbarMenu">
          <summary aria-label="Help">
            <HelpIcon />
          </summary>
          <div className="topbarPopover">
            <strong>Agent Launch Guide</strong>
            <p>
              Choose an agent, define its use case and select approved knowledge
              and actions. Save a draft to return later.
            </p>
          </div>
        </details>
        <details className="topbarMenu profileMenu">
          <summary>
            <span className="avatar">AM</span>
            <span className="userContext">
              <strong>Ana Martinez</strong>
              <small>Acme Corp</small>
            </span>
          </summary>
          <div className="topbarPopover">
            <strong>Ana Martinez</strong>
            <p>Demo workspace · AI Engineer</p>
            <Link href="/settings#team">Team & Roles</Link>
            <p>
              <Link href="/settings">Workspace settings</Link>
            </p>
            <Link href="/login">Sign out of preview</Link>
          </div>
        </details>
      </div>
    </header>
  );
}

export function ApplicationShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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
        onToggleCollapsed={() => setCollapsed((value) => !value)}
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
          {children}
        </main>
      </section>
    </div>
  );
}
