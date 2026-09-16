import AppShell from '@/components/AppShell';
import { GlobalSkillDetail } from '@/components/GlobalSkills';
import '@/app/surfaces.css';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <GlobalSkillDetail id={id} />
    </AppShell>
  );
}
