import Link from 'next/link';
import { NewneoWordmark } from '@/components/NewneoLogo';

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: 'minmax(360px, 0.9fr) minmax(420px, 1.1fr)',
        background: '#f8fafc',
      }}
    >
      <section
        style={{
          background: '#0B1220',
          color: '#fff',
          padding: '52px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <NewneoWordmark />
        <div>
          <h1 style={{ fontSize: 42, lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: 18 }}>
            Enterprise AI,<br />mission-ready.
          </h1>
          <p style={{ maxWidth: 420, color: '#94a3b8', fontSize: 16, lineHeight: 1.65 }}>
            Build, govern, evaluate, deploy and operate enterprise AI agents with production-grade control.
          </p>
        </div>
        <p style={{ color: '#475569', fontSize: 12 }}>NEWNEO · Enterprise AI Platform</p>
      </section>

      <section style={{ display: 'grid', placeItems: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 28, letterSpacing: '-0.03em', marginBottom: 8 }}>Welcome back</h2>
            <p style={{ color: '#64748b' }}>Sign in to your NEWNEO workspace.</p>
          </div>

          <Link
            href="/api/auth/login"
            style={{
              width: '100%',
              minHeight: 46,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 9,
              background: '#2563EB',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgb(15 23 42 / 8%)',
            }}
          >
            Continue with Enterprise SSO
          </Link>

          <p style={{ marginTop: 18, color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
            Authentication is handled by your organization identity provider.
          </p>
        </div>
      </section>
    </main>
  );
}
