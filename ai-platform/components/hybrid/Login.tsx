'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import { NewneoWordmark } from '../NewneoLogo';
import styles from './Login.module.css';
import LoginForm from './LoginForm';

export default function Login() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const reason = query.get('reason') || query.get('login');
    const messages: Record<string, string> = {
      unavailable: 'Sign-in is temporarily unavailable. Please try again shortly.',
      failed: 'We could not complete your sign-in. Please try again.',
      expired: 'Your session expired. Sign in again to continue.',
    };
    if (reason && messages[reason]) setMessage(messages[reason]);
  }, []);
  return (
    <main className={styles.page}>
      <section className={styles.story} aria-label="NEWNEO platform">
        <a href="https://www.newneo.ai" aria-label="NEWNEO website"><NewneoWordmark /></a>
        <div className={styles.storyContent}>
          <span className={styles.eyebrow}>YOUR ENTERPRISE AI WORKSPACE</span>
          <h1>One workspace.<br /><span>More possibilities.</span></h1>
          <p>Bring your agents, skills and enterprise knowledge together. Build with purpose. Operate with control.</p>
          <div className={styles.features}>
            <div><Layers3 size={20} /><span>Build agents. Expand their skills.</span></div>
            <div><ShieldCheck size={20} /><span>Keep governance at the center.</span></div>
            <div><Sparkles size={20} /><span>Turn knowledge into action.</span></div>
          </div>
        </div>
        <small>NEWNEO · Enterprise AI, connected.</small>
      </section>
      <section className={styles.entry} aria-labelledby="login-title">
        <a className={styles.back} href="https://www.newneo.ai">← Back to website</a>
        <div className={styles.card}>
          <span className={styles.label}>NEWNEO PLATFORM</span>
          <h2 id="login-title">Welcome back.</h2>
          <p>Your next chapter starts here.<br />Sign in to your workspace to continue.</p>
          {message && <div className={styles.notice} role="alert">{message}</div>}
          <LoginForm />
          <div className={styles.secure}><ShieldCheck size={16} />Secure sign-in with your work account</div>
          <div className={styles.help}>
            <strong>First time here?</strong>
            <p>Use the email address and temporary password from your invitation. You’ll choose your own password on your first visit.</p>
            <a href="https://www.newneo.ai/contact">Need access? Contact us <ArrowRight size={14} /></a>
          </div>
        </div>
        <small className={styles.footer}>Your workspace. Your agents. Your next move.</small>
      </section>
    </main>
  );
}
