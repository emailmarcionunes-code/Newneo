'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './UI';
type Workspace = {
  id: string;
  organization_id: string;
  name: string;
  can_edit_agents: boolean;
};
type SessionInfo = {
  authenticated: boolean;
  configured?: boolean;
  workspaces?: Workspace[];
  workspaceId?: string;
  error?: string;
};
export default function AccountSettings() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const response = await fetch('/api/session', { cache: 'no-store' });
    const value = await response.json();
    if (!response.ok) throw new Error(value.error ?? 'Account unavailable');
    setSession(value);
  }
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('login') === 'failed')
      setMessage('Sign-in failed or expired. Please try again.');
    refresh().catch((error) => setMessage(error.message));
  }, []);
  async function change(url: string, body: object) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const value = await response.json();
      if (!response.ok) throw new Error(value.error);
      await refresh();
      setMessage(
        url.includes('logout') ? 'Signed out.' : 'Workspace selected.',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="surfacePage">
      <div className="pageHead">
        <div>
          <h1>Settings</h1>
          <p>Account access and server workspace configuration.</p>
        </div>
      </div>
      <section className="panel">
        <h2>Account</h2>
        {!session && !message && <p role="status">Loading account status…</p>}
        {message && <p role="status">{message}</p>}
        {!session && message && (
          <Button
            variant="outline"
            onClick={() => {
              setMessage('');
              refresh().catch((error) => setMessage(error.message));
            }}
          >
            Retry
          </Button>
        )}
        {session?.authenticated ? (
          <>
            <p>Signed in through your configured identity provider.</p>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => change('/api/auth/logout', {})}
            >
              Sign out
            </Button>
          </>
        ) : (
          session && (
            <>
              <p>
                {session.configured
                  ? 'Sign in to access your provisioned workspaces and save drafts on the server.'
                  : 'Server login is not configured. The demo remains available while the identity provider and database are connected.'}
              </p>
              {session.configured && (
                <a href="/api/auth/login" className="button primary">
                  Sign in
                </a>
              )}
            </>
          )
        )}
      </section>
      {session?.authenticated && (
        <section className="panel">
          <h2>Your workspaces</h2>
          <p>
            Access is assigned by an administrator and verified on the server.
          </p>
          {!session.workspaces?.length ? (
            <p>
              No workspaces assigned. Contact your organization administrator.
            </p>
          ) : (
            <div className="surfaceCards">
              {session.workspaces.map((workspace) => (
                <article className="agentCard" key={workspace.id}>
                  <h3>{workspace.name}</h3>
                  <p>
                    {workspace.can_edit_agents
                      ? 'Can save draft configurations'
                      : 'Read-only access'}
                  </p>
                  <Button
                    variant={
                      session.workspaceId === workspace.id
                        ? 'secondary'
                        : 'primary'
                    }
                    disabled={busy || session.workspaceId === workspace.id}
                    onClick={() =>
                      change('/api/workspace/select', {
                        workspaceId: workspace.id,
                      })
                    }
                  >
                    {session.workspaceId === workspace.id
                      ? 'Selected'
                      : 'Select workspace'}
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      <section className="panel">
        <h2>Application mode</h2>
        <p>
          Catalog, dashboards and runtime connections still use demonstration
          resources. Signing in enables server draft storage; it does not turn
          sample agents into live deployments.
        </p>
        <Link className="button outline" href="/agents">
          Browse Agent Catalog
        </Link>
      </section>
      <section className="panel">
        <h2>Deployment and billing</h2>
        <p>
          No AWS infrastructure or paid resources have been provisioned by this
          application. Runtime deployment and provider billing require
          separately configured services.
        </p>
      </section>
    </div>
  );
}
