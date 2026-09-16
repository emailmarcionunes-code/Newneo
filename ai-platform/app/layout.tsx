import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './globals.css';
import './wizard.css';
import './journeys.css';
import './hybrid-v4.css';
import './hybrid-audit.css';
import { PreviewStateProvider } from '@/components/journeys/PreviewState';

export const metadata: Metadata = {
  title: 'Newneo AI Platform',
  description: 'Build, govern, deploy and operate enterprise AI.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PreviewStateProvider>{children}</PreviewStateProvider>
      </body>
    </html>
  );
}
