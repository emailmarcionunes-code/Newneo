'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="recoveryPage">
      <section className="panel">
        <h1>We couldn’t load this screen</h1>
        <p>
          Your saved preview remains in this browser tab. Try again or return to
          the workspace.
        </p>
        <div className="resourceFooter">
          <button className="button primary" onClick={reset}>
            Try again
          </button>
          <Link className="button outline" href="/">
            Return to Overview
          </Link>
        </div>
      </section>
    </main>
  );
}
