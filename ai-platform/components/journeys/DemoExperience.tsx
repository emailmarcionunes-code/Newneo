'use client';
import { useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePreview, usePreviewValue, createDemoState } from './PreviewState';
import { Dialog } from './Shared';
import { Button } from '../UI';
export type Capability = 'create' | 'approve' | 'operate' | 'admin';
export const demoRoles = ['Administrator', 'Operator', 'Employee'] as const;
export function useDemoAccess() {
  const [role] = usePreviewValue('demo:role', 'Administrator');
  return {
    role,
    can: (cap: Capability) =>
      role === 'Administrator' || (role === 'Operator' && (cap === 'create' || cap === 'operate')) ||
      {
        create: 'Creator',
        approve: 'Approver',
        operate: 'Operator',
        admin: 'Administrator',
      }[cap] === role,
  };
}
export function CapabilityNotice({
  cap,
  children,
}: {
  cap: Capability;
  children: ReactNode;
}) {
  const { can, role } = useDemoAccess();
  return (
    <>
      {!can(cap) && (
        <p className="demoPermission" role="note">
          {role} preview: this action is unavailable. Switch profile in Demo
          controls to try it. This is not production access control.
        </p>
      )}
      <fieldset className="demoFieldset" disabled={!can(cap)}>
        {children}
      </fieldset>
    </>
  );
}
export function DemoControls() {
  const { update, state } = usePreview();
  const router = useRouter();
  const [role, setRole] = usePreviewValue('demo:role', 'Administrator');
  const [confirm, setConfirm] = useState<'empty' | 'sample' | null>(null);
  const [message, setMessage] = useState('');
  function restore() {
    if (!confirm) return;
    try {
      const prefix = 'newneo:launch:v1:acme-demo:customer-service-demo:';
      for (const key of Object.keys(localStorage))
        if (key.startsWith(prefix)) localStorage.removeItem(key);
      for (const key of Object.keys(sessionStorage))
        if (key.startsWith('newneo:resource-preview:v1:'))
          sessionStorage.removeItem(key);
    } catch {
      setMessage(
        'Browser storage could not be cleared. Session data was reset; stored drafts may remain.',
      );
    }
    update(() => createDemoState(confirm, role));
    setConfirm(null);
    router.push('/');
  }
  return (
    <div className="demoControls">
      <details>
        <summary aria-label={`Demo controls · ${role}`}>Demo</summary>
        <div className="demoControlsBody">
          <p>Sample workspace · No live execution. Simulated profiles do not change account permissions.</p>
          <a href="/login">Exit demo →</a>
          <label>
            Preview profile
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {demoRoles.map((r) => (
                <option key={r} value={r}>{r === 'Operator' ? 'AI Operator' : r === 'Employee' ? 'User' : r}</option>
              ))}
            </select>
          </label>
          <p>
            Workspace:{' '}
            {state.ui?.['demo:dataset'] === 'empty'
              ? 'Empty workspace scenario'
              : 'Sample workspace'}
          </p>
          <div className="resourceFooter">
            <Button variant="outline" onClick={() => setConfirm('empty')}>
              Start empty workspace
            </Button>
            <Button variant="outline" onClick={() => setConfirm('sample')}>
              Restore sample workspace
            </Button>
            <Button
              variant="link"
              onClick={() => {
                update((s) => ({
                  ...s,
                  ui: { ...s.ui, 'demo:onboarding': true },
                }));
                router.push('/');
              }}
            >
              Show getting started
            </Button>
          </div>
          <dl
            className="demoRoleTable"
            aria-label="Simulated profile capabilities"
          >
            <div>
              <dt>Administrator</dt>
              <dd>Configure, create, approve and operate</dd>
            </div>
            <div>
              <dt>Creator</dt>
              <dd>Configure agents, evaluate and request promotion</dd>
            </div>
            <div>
              <dt>Approver</dt>
              <dd>Review, approve or reject requests</dd>
            </div>
            <div>
              <dt>Operator</dt>
              <dd>Monitor, run sample tasks, pause and roll back</dd>
            </div>
          </dl>
        </div>
      </details>
      {message && <p role="status">{message}</p>}
      {confirm && (
        <Dialog
          title={
            confirm === 'empty'
              ? 'Start an empty workspace?'
              : 'Restore sample workspace?'
          }
          onClose={() => setConfirm(null)}
        >
          <p>
            This replaces demo agents, releases, preferences and saved launch
            drafts in this browser. Sidebar layout and real authentication are
            preserved. This cannot be undone.
          </p>
          <div className="resourceFooter">
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button onClick={restore}>Confirm workspace reset</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
export function GettingStarted() {
  const { state, update } = usePreview();
  const { can } = useDemoAccess();
  const added = Array.isArray(state.ui?.['workspace:agents'])
    ? state.ui['workspace:agents']
    : [];
  const steps = [
    [
      'Choose an agent template',
      'Start from a use case, then describe the mission and owner.',
      '/agents/catalog',
      added.length > 0,
    ],
    [
      'Configure and evaluate',
      'Attach approved sources and actions; inspect readiness before promotion.',
      '/evaluations',
      state.runs.length > 0,
    ],
    [
      'Review and publish',
      'Review the manifest or approval queue before activating a version.',
      '/governance',
      state.releases.some((r) => r.state === 'Active'),
    ],
    [
      'Explore monitoring',
      'Open your saved agent and run a sample task, then inspect AgentOps.',
      '/agentops',
      added.some((a) => Number(a.tasks) > 0),
    ],
  ] as const;
  return (
    <section className="panel gettingStarted">
      <h1>Welcome to your workspace</h1>
      <p>
        Build your first agent in eight steps. Everything here uses simulated
        data; no credentials or cloud setup are needed.
      </p>
      <ol>
        {steps.map(([title, description, href, done], i) => (
          <li key={title}>
            <span className="tag">{done ? 'Complete' : `Step ${i + 1}`}</span>
            <h2>{title}</h2>
            <p>{description}</p>
            <Link href={href}>{done ? 'Review' : 'Explore'} →</Link>
          </li>
        ))}
      </ol>
      {can('create') ? (
        <Link className="button primary" href="/agents/catalog">
          Add your first Agent →
        </Link>
      ) : (
        <p>
          Your current profile can explore the workspace. Choose Creator or
          Administrator in Demo controls to create an agent.
        </p>
      )}
      <Button
        variant="link"
        onClick={() =>
          update((s) => ({ ...s, ui: { ...s.ui, 'demo:onboarding': false } }))
        }
      >
        Dismiss getting started
      </Button>
    </section>
  );
}
export function DemoBoundary({ children }: { children: ReactNode }) {
  const { state } = usePreview();
  const path = usePathname();
  const { can, role } = useDemoAccess();
  const empty = state.ui?.['demo:dataset'] === 'empty';
  if (
    path === '/' &&
    (state.ui?.['demo:onboarding'] === true ||
      (empty && state.ui?.['demo:onboarding'] !== false))
  )
    return <GettingStarted />;
  if (path === '/agents/launch' && !can('create'))
    return (
      <section className="panel">
        <h1>Agent creation</h1>
        <p>
          {role} can explore agents but cannot create them in this simulation.
          Choose Creator or Administrator in Demo controls.
        </p>
        <Link href="/agents">View agents →</Link>
      </section>
    );
  const noData =
    empty &&
    (['/', '/reports', '/finops'].includes(path) ||
      (path === '/audit-log' && !state.audit.length) ||
      (path === '/governance' && !state.releases.length));
  if (noData)
    return (
      <section className="panel">
        <h1>
          {path === '/reports'
            ? 'Reports'
            : path === '/finops'
              ? 'AI Economics'
              : path === '/governance'
                ? 'Governance'
                : path === '/audit-log'
                  ? 'Audit Log'
                  : 'Command Center'}
        </h1>
        <p>
          No historical sample data in this workspace. Create and evaluate an
          agent to explore its lifecycle; restore the sample workspace to
          compare populated dashboards.
        </p>
        <Link className="button primary" href="/agents/catalog">
          Explore agent templates →
        </Link>
        <Link className="button outline" href="/agents">
          View your agents →
        </Link>
      </section>
    );
  return <>{children}</>;
}
