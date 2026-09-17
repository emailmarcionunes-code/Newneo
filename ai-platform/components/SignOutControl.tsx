'use client';
import { useState } from 'react';
export function SignOutControl() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function signOut() {
    setBusy(true);
    try {
      const r = await fetch('/api/auth/logout', { method: 'POST' });
      if (!r.ok) throw Error('Unable to sign out. Please retry.');
      window.location.assign('/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign out.');
      setBusy(false);
    }
  }
  return (
    <>
      <button className="button secondary" disabled={busy} onClick={signOut}>
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
