import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.newneo.ai'),
  title: 'NEWNEO — Enterprise Agents & Skills',
  description: 'Configure enterprise agents, manage reusable skills and plan governed AI rollouts with NEWNEO.',
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'NEWNEO — Enterprise Agents & Skills',
    description: 'One workspace for enterprise agents, reusable skills and governed AI rollouts.',
    url: 'https://www.newneo.ai',
    siteName: 'Newneo',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
