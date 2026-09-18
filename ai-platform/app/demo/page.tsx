import type { Metadata } from 'next';
import { NewneoWordmark } from '@/components/NewneoLogo';
import styles from '@/components/hybrid/Login.module.css';
export const metadata: Metadata = {
  title: 'NEWNEO · Product demo',
  robots: { index: false, follow: false },
};
export default function DemoPage() {
  return <main style={{minHeight:'100svh',display:'grid',placeItems:'center',padding:24,background:'#f8fafc'}}>
    <section className={styles.card} aria-labelledby="demo-title">
      <NewneoWordmark />
      <p className={styles.label} style={{marginTop:36}}>PRODUCT DEMONSTRATION</p>
      <h1 id="demo-title" style={{fontSize:36,letterSpacing:'-.04em',margin:'16px 0'}}>Meet your AI workspace.</h1>
      <p>Explore NEWNEO as Ana Martinez at Acme Corp. Try agents, skills and workflows with sample data.</p>
      <form action="/api/demo" method="post" className={styles.demo}>
        <button type="submit">Start demo →</button>
        <small>No account required. No live actions or paid executions.</small>
        <small>Starting the demo signs out your current workspace in this browser.</small>
      </form>
      <div className={styles.help}><a href="/login">Sign in to your workspace →</a></div>
    </section>
  </main>;
}
