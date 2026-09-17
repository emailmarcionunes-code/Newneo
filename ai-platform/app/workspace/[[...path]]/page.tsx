import AppShell from '@/components/AppShell';
import BusinessWorkspace from '@/components/BusinessWorkspace';
import { notFound } from 'next/navigation';
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  const [view = 'home', id] = path;
  if (
    ![
      'home',
      'agents',
      'discover',
      'work',
      'reports',
      'analytics',
      'profile',
      'help',
    ].includes(view) ||
    path.length > 2
  )
    notFound();
  return (
    <AppShell>
      <BusinessWorkspace key={path.join('/')} view={view} id={id} />
    </AppShell>
  );
}
