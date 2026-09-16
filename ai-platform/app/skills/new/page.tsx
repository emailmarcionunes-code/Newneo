import AppShell from '@/components/AppShell';
import { GlobalSkillBuilder } from '@/components/GlobalSkills';
import '@/app/surfaces.css';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; agent?: string }>;
}) {
  const { source, agent } = await searchParams;
  return (
    <AppShell>
      <GlobalSkillBuilder sourceId={source} returnAgent={agent} />
    </AppShell>
  );
}
