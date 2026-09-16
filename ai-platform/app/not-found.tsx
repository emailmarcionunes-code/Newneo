import Link from 'next/link';
import { NewneoWordmark } from '@/components/NewneoLogo';
export default function NotFound() {
  return (
    <main className="recoveryPage">
      <div className="recoveryBrand">
        <NewneoWordmark />
      </div>
      <section className="panel">
        <p>404 · Page not found</p>
        <h1>This page is unavailable</h1>
        <p>The link may be outdated or the record may no longer exist.</p>
        <Link className="button primary" href="/">
          Return to Overview
        </Link>
      </section>
    </main>
  );
}
