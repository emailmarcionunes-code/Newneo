'use client';
import { usePreview, usePreviewValue } from './journeys/PreviewState';
import { useWorkspaceAgents } from './journeys/WorkspaceAgents';
import { previewSourceRows } from '@/lib/source-preview';
import {useAccount} from './AccountContext';
import { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, HelpCircle, CheckCheck } from 'lucide-react';
import { hybridAgents, sourceRows, actionRows } from '@/lib/hybrid-data';
const sampleNotices = [
  [
    'Incident',
    'High latency on Sales Assistant',
    'Salesforce API response time exceeded the approved threshold.',
    '2 min ago',
    '/agentops/incidents/inc-001',
  ],
  [
    'Deployment',
    'IT Support deployed to Production',
    'Version v2.3 passed its health checks.',
    '18 min ago',
    '/deployments/it-support',
  ],
  [
    'Evaluation',
    'Customer Service evaluation complete',
    'Review readiness and scenario recommendations.',
    '35 min ago',
    '/evaluations/customer-service',
  ],
  [
    'Governance',
    'PII policy requires attention',
    'Review the open violation and enforcement evidence.',
    '1 hr ago',
    '/governance/policies/pii',
  ],
  [
    'Knowledge sync',
    'Confluence sync completed',
    'Updated documents are ready for retrieval.',
    '2 hr ago',
    '/knowledge/confluence',
  ],
];
export function HeaderSearch() {
  const account=useAccount();
  const hybridAgents = useWorkspaceAgents();
  const { state } = usePreview();
  const sourceRows = previewSourceRows(state.ui);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const records = [
    ...(account.mode==='demo' ? [
    ...hybridAgents.map((a) => [a.name, 'Agent', `/agents/${a.id}`]),
    ...sourceRows.map((s) => [s[1], 'Knowledge', `/knowledge/${s[0]}`]),
    ...(state.ui?.['demo:dataset'] === 'empty' ? [] : actionRows).map((a) => [
      a[1],
      'Tool',
      `/tools/${a[0]}`,
    ]),
    ] : []),
    ...[
      'Agents','Skills','Knowledge','Audit Log',
      'Settings',
      'Reports',
      'Playground',
      'Governance',
      'Evaluations',
      'Deployments',
    ].map((n) => [n, 'Workspace', `/${n.toLowerCase().replaceAll(' ','-')}`]),
  ];
  const matches = records
    .filter((r) => r.join(' ').toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);
  return (
    <div
      className="globalSearch"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Search size={15} aria-hidden="true" />
      <label className="srOnly" htmlFor="global-search">
        Search workspace
      </label>
      <input
        id="global-search"
        type="search"
        placeholder="Search agents, sources, tools…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        aria-controls={open ? 'global-search-results' : undefined}
      />
      {open && (
        <div id="global-search-results" className="headerSearchResults">
          <strong>{query ? 'Search results' : 'Explore workspace'}</strong>
          {matches.length ? (
            matches.map(([name, kind, url]) => (
              <Link key={url} href={url} onClick={() => setOpen(false)}>
                <span>{name}</span>
                <small>{kind}</small>
              </Link>
            ))
          ) : (
            <p>No matches. Try an agent, source or tool name.</p>
          )}
        </div>
      )}
    </div>
  );
}
export function HeaderNotifications() {
  const account=useAccount();
  const { state } = usePreview();
  const notices = account.mode!=='demo'||state.ui?.['demo:dataset'] === 'empty' ? [] : sampleNotices;
  const [read, setRead] = usePreviewValue('demo:notifications-read', false);
  return (
    <details
      className="topbarMenu notificationMenu"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.currentTarget.open = false;
          e.currentTarget.querySelector('summary')?.focus();
        }
      }}
    >
      <summary aria-label="Notifications">
        <Bell size={18} />
        {!read && notices.length > 0 && (
          <span className="notificationCount">{notices.length}</span>
        )}
      </summary>
      <div className="topbarPopover notificationPopover">
        <div className="notificationHeading">
          <strong>Notifications</strong>
          <button
            type="button"
            aria-label="Mark all notifications as read"
            onClick={() => setRead(true)}
          >
            <CheckCheck size={17} />
          </button>
        </div>
        <p className="hybridDataNote">
          {account.mode!=='demo'?'Live notifications are not connected.':read || !notices.length
            ? 'All caught up'
            : `${notices.length} unread`}{' '}
          {account.mode==='demo'?'· Reference workspace':''}
        </p>
        {notices.map(([kind, title, body, time, url]) => (
          <Link href={url} key={kind}>
            <span className="categoryBadge">{kind}</span>
            <strong>{title}</strong>
            <p>{body}</p>
            <small>{time}</small>
          </Link>
        ))}
        <Link className="notificationSettings" href="/settings#notifications">
          Notification preferences
        </Link>
      </div>
    </details>
  );
}
export function HelpIcon() {
  return <HelpCircle size={18} aria-hidden="true" />;
}
