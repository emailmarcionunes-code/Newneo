'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './UI';
import {UserRound,Building2,Layers3,WalletCards} from 'lucide-react';
type Workspace = {
  id: string;
  organization_id: string;
  name: string;
  organization_name: string;
  can_edit_agents: boolean;
};
type SessionInfo = {
  authenticated: boolean;
  displayName?: string;
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
      window.dispatchEvent(new Event('newneo-account-changed'));
      setMessage(url.includes('logout') ? 'Signed out.' : 'Workspace selected.');
      if (url.includes('/select')) window.location.assign('/');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="surfacePage accountSettings">
      <div className="pageHead">
        <div>
          <h2>Account & workspace</h2>
          <p>Manage your account and organization.</p>
        </div>
      </div>
      <section className="panel">
        <h2><UserRound size={18}/>Account</h2>
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
            <p>{session.displayName} · Signed in securely.</p>
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
          <h2><Building2 size={18}/>Your workspaces</h2>
          <Link href={session.workspaceId ? "/" : "/welcome"} className="button primary">{session.workspaceId ? "Open Overview →" : "Continue to workspace →"}</Link>
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
                  <h3>{workspace.organization_name}</h3><p>Workspace: {workspace.name}</p>
                  <p>
                    {workspace.can_edit_agents
                      ? 'Can author Agent, Skill and Knowledge configurations'
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
        <h2><Layers3 size={18}/>Application mode</h2>
        <p>
          Your selected workspace stores Agent and Skill versions, Knowledge documents and audit history. Demo data belongs to a separate preview context.
        </p>
        <Link className="button outline" href="/agents">
          Manage Agents
        </Link>
      </section>
      <section className="panel">
        <h2><WalletCards size={18}/>Deployment and billing</h2>
        <p>
          The platform is hosted. Paid Agent execution and provider usage reporting are not yet enabled. Existing hosting charges continue independently of Agent execution.
        </p>
      </section>
    </div>
  );
}
