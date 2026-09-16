'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AssetIcon } from './Assets';
import { NewneoWordmark } from './NewneoLogo';

export const navigation = [
  ['Overview', '/', 'overview'],
  ['Agents', '/agents', 'agents'],
  ['Knowledge', '/knowledge', 'knowledge'],
  ['Tools & MCP', '/tools', 'tools'],
  ['Models', '/models', 'models'],
  ['Evaluations', '/evaluations', 'evaluations'],
  ['Deployments', '/deployments', 'deployments'],
  ['AgentOps', '/agentops', 'agentops'],
  ['FinOps', '/finops', 'finops'],
  ['Governance', '/governance', 'governance'],
  ['Settings', '/settings', 'settings'],
] as const;

export function NavItem({
  label,
  href,
  icon,
  active,
  onNavigate,
}: {
  label: string;
  href: string;
  icon: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      className={`navItem${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
    >
      <AssetIcon name={icon} />
      <span>{label}</span>
    </Link>
  );
}
export function ApplicationSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const path = usePathname();
  return (
    <aside
      id="application-sidebar"
      className={`sidebar${open ? ' isOpen' : ''}`}
    >
      <Link href="/" className="brand" aria-label="Newneo home">
        <NewneoWordmark />
      </Link>
      <button
        type="button"
        className="sidebarClose"
        aria-label="Close menu"
        onClick={onClose}
      >
        ×
      </button>
      <nav aria-label="Main navigation">
        {navigation.map(([label, href, icon]) => (
          <NavItem
            key={href}
            {...{ label, href, icon }}
            active={
              href === '/'
                ? path === '/'
                : path === href || path.startsWith(`${href}/`)
            }
            onNavigate={onClose}
          />
        ))}
      </nav>
      <details className="workspaceMenu">
        <summary>
          <span className="organizationAvatar">AC</span>
          <span>Acme Corp</span>
        </summary>
        <div className="workspacePopover">
          <strong>Acme Corp</strong>
          <p>Customer Service workspace</p>
          <small>Demo organization</small>
        </div>
      </details>
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
      <div className="topActions">
        <details className="topbarMenu">
          <summary aria-label="Notifications">○</summary>
          <div className="topbarPopover">No new notifications.</div>
        </details>
        <details className="topbarMenu">
          <summary aria-label="Help">?</summary>
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
          </div>
        </details>
      </div>
    </header>
  );
}
export function ApplicationShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
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
  return (
    <div className="appShell">
      <a href="#main-content" className="skipLink">
        Skip to content
      </a>
      <ApplicationSidebar open={open} onClose={() => setOpen(false)} />
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
