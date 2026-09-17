import { AccountProvider } from '@/components/AccountContext';
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
import './visual-fidelity.css';
import './experience-quality.css';
import './make-refinement.css';
import './launch-reference.css';
import './desktop-density.css';
import { SidebarStateProvider } from '@/components/SidebarState';
import { PreviewStateProvider } from '@/components/journeys/PreviewState';

export const metadata: Metadata = {
  title: 'Newneo AI Platform',
  robots: { index: false, follow: false },
  description: 'Build, govern, deploy and operate enterprise AI.',
  icons: {
    icon: '/icon.svg?brand=official',
    shortcut: '/icon.svg?brand=official',
    apple: '/icon.svg?brand=official',
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
        <SidebarStateProvider>
          <AccountProvider><PreviewStateProvider>{children}</PreviewStateProvider></AccountProvider>
        </SidebarStateProvider>
      </body>
    </html>
  );
}
