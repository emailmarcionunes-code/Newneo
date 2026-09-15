import AppShell from '@/components/AppShell';
import LaunchGuide from '@/components/LaunchGuide';
export default async function LaunchAgent({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  return (
    <AppShell>
      <LaunchGuide key={template ?? 'customer-service'} templateId={template} />
    </AppShell>
  );
}
