'use client';
import { FormEvent, useRef, useState } from 'react';
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import styles from './Login.module.css';

type View = { step: 'signin' | 'forgot' | 'code' | 'new-password' | 'select-mfa' | 'setup-mfa' | 'reset' | 'complete'; message?: string; requiredAttributes?: string[]; choices?: string[]; secret?: string };
const methodLabels: Record<string, string> = { SOFTWARE_TOKEN_MFA: 'Authenticator app', SMS_MFA: 'Text message', SMS_OTP: 'Text message', EMAIL_OTP: 'Email verification' };
export default function LoginForm() {
  const [view, setView] = useState<View>({ step: 'signin' });
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [alternate, setAlternate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const passwords = ['signin', 'new-password', 'reset'].includes(view.step);
  const newPassword = view.step === 'new-password' || view.step === 'reset';
  const code = ['code', 'reset', 'setup-mfa'].includes(view.step);
  const titles: Partial<Record<View['step'], string>> = {
    forgot: 'Reset your password', reset: 'Choose a new password', 'new-password': 'Set your password',
    code: 'Verify your identity', 'setup-mfa': 'Set up your authenticator', 'select-mfa': 'Choose how to verify',
  };
  async function reset(next: 'signin' | 'forgot') {
    setBusy(true);
    try {
      const response = await fetch('/api/auth/native', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel' }) });
      if (!response.ok) throw new Error();
      form.current?.reset(); setView({ step: next }); setError(''); setAlternate(false); setShowPassword(false);
    } catch { setError('Could not restart sign-in. Please try again.'); }
    finally { setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    if (newPassword && data.get('password') !== data.get('confirmPassword')) { setError('The passwords do not match.'); return; }
    setBusy(true); setError(''); setAlternate(false);
    const attributes = Object.fromEntries((view.requiredAttributes ?? []).map(name => [name, data.get(`attribute:${name}`)]));
    try {
      const response = await fetch('/api/auth/native', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: ['signin', 'forgot', 'reset'].includes(view.step) ? view.step : 'challenge', email, password: data.get('password'), code: data.get('code'), choice: data.get('choice'), attributes }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'We could not complete sign-in. Please try again.'); setAlternate(Boolean(result.alternate));
        if (result.restart) setView({ step: 'signin' });
        return;
      }
      form.current?.reset(); setShowPassword(false);
      if (result.step === 'complete') { setView(result); window.location.assign('/welcome'); return; }
      setView(result);
    } catch { setError('Unable to connect. Check your connection and try again.'); }
    finally { setBusy(false); }
  }
  return <form ref={form} className={styles.authForm} onSubmit={submit} aria-label="Sign in to NEWNEO">
    {titles[view.step] && <h3 tabIndex={-1}>{titles[view.step]}</h3>}
    {view.step === 'new-password' && <p>Your invitation is ready. Choose your own password to continue.</p>}
    {view.step === 'forgot' && <p>Enter your work email to receive recovery instructions.</p>}
    {view.message && <p className={styles.formMessage} role="status">{view.message}</p>}
    {view.step === 'setup-mfa' && <div className={styles.setup}>
      <p>Add an account in your authenticator app, choose “Enter a setup key” and select time-based codes.</p>
      <span>Account: {email}</span><label>Setup key<code>{view.secret}</code></label>
      <p>Then enter the six-digit code below. Keep this key private.</p>
    </div>}
    <fieldset disabled={busy}>
      {(view.step === 'signin' || view.step === 'forgot') && <label htmlFor="login-email">Work email
        <input id="login-email" name="email" type="email" autoComplete="username" placeholder="you@company.com" maxLength={256} required value={email} onChange={e => setEmail(e.target.value)} />
      </label>}
      {code && <label htmlFor="login-code">Verification code
        <input key={view.step} id="login-code" name="code" autoComplete="one-time-code" inputMode="numeric" maxLength={32} required autoFocus />
      </label>}
      {passwords && <label htmlFor="login-password">{newPassword ? 'New password' : 'Password'}
        <div className={styles.passwordField}>
          <input key={view.step} id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={newPassword ? 'new-password' : 'current-password'} maxLength={256} required />
          <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
      </label>}
      {newPassword && <><p className={styles.passwordHint}>Use a strong password that meets your organization’s policy.</p><label htmlFor="login-confirm">Confirm new password<input id="login-confirm" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" maxLength={256} required /></label></>}
      {(view.requiredAttributes ?? []).map(name => <label key={name} htmlFor={`login-attribute-${name}`}>{name.replaceAll('_', ' ')}<input id={`login-attribute-${name}`} name={`attribute:${name}`} required maxLength={2048} /></label>)}
      {view.step === 'select-mfa' && <label htmlFor="login-method">Verification method<select id="login-method" name="choice">{view.choices?.map(choice => <option key={choice} value={choice}>{methodLabels[choice] || choice}</option>)}</select></label>}
      {view.step === 'signin' && <button type="button" className={styles.textButton} onClick={() => reset('forgot')}>Forgot password?</button>}
      {error && <div className={styles.formError} role="alert">{error}</div>}
      {view.step !== 'complete' && <button className={styles.signin} type="submit">{busy ? <><LoaderCircle size={18} className={styles.spinner} /> Please wait…</> : <>{view.step === 'signin' ? 'Sign in' : view.step === 'forgot' ? 'Send recovery code' : newPassword ? 'Save password and continue' : 'Continue'}<ArrowRight size={18} /></>}</button>}
      {view.step === 'complete' && <p role="status">Signed in. Opening your workspace…</p>}
      {view.step !== 'signin' && view.step !== 'complete' && <button type="button" className={styles.backButton} onClick={() => reset('signin')}>← Back to sign in</button>}
      {alternate && <a className={styles.alternate} href="/api/auth/login">Use secure alternate sign-in →</a>}
    </fieldset>
  </form>;
}
