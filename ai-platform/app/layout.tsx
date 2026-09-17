import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isOperationsPath } from '@/lib/product-access';
import { canOpenOperations } from '@/server/product-access';
import { demoCookie } from '@/server/auth';
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
  title: 'NEWNEO Workspace',
  robots: { index: false, follow: false },
  description: 'Work with AI specialists across your business.',
  icons: {
    icon: '/icon.svg?brand=official',
    shortcut: '/icon.svg?brand=official',
    apple: '/icon.svg?brand=official',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = (await headers()).get('x-newneo-path') ?? '';
  if (
    isOperationsPath(path) &&
    (await cookies()).get(demoCookie)?.value !== 'acme' &&
    !(await canOpenOperations(path === '/finops'))
  )
    redirect('/workspace?access=operations');
  return (
    <html lang="en">
      <body>
        <SidebarStateProvider>
          <AccountProvider>
            <PreviewStateProvider>{children}</PreviewStateProvider>
          </AccountProvider>
        </SidebarStateProvider>
      </body>
    </html>
  );
}
