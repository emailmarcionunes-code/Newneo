import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NewNeo — Enterprise AI Operations',
  description: 'Design, deploy and operate enterprise AI agents across your business.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
