import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://newneo.ai'),
  title: 'Newneo — Enterprise AI Engineering',
  description: 'Newneo builds and operates enterprise AI — from AI infrastructure and compute to production agents and AgentOps.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Newneo — Enterprise AI Engineering',
    description: 'From AI infrastructure and compute to production agents and ongoing AgentOps.',
    url: 'https://newneo.ai',
    siteName: 'Newneo',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
