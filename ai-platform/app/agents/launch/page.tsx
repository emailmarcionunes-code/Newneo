import {RegistrySurface} from '@/components/WorkspaceRegistry';
import {redirect} from 'next/navigation';
import AppShell from '@/components/AppShell';
import LaunchGuide from '@/components/LaunchGuide';
export default async function LaunchAgent({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  if(!template||template==='custom')redirect('/agents/request');
  return (
    <AppShell>
      <RegistrySurface kind="agent" create templateId={template}><LaunchGuide key={template ?? 'customer-service'} templateId={template} /></RegistrySurface>
    </AppShell>
  );
}
