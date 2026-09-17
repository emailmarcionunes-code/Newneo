import AppShell from '@/components/AppShell';
import BusinessWorkspace from '@/components/BusinessWorkspace';
export default function Page() {
  return (
    <AppShell>
      <BusinessWorkspace view="home" />
    </AppShell>
  );
}
