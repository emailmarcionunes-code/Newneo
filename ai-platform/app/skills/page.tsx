import {RegistrySurface} from '@/components/WorkspaceRegistry';
import AppShell from '@/components/AppShell';
import { GlobalSkills } from '@/components/GlobalSkills';
import '@/app/surfaces.css';
export default function Page() {
  return (
    <AppShell>
      <RegistrySurface kind="skill"><GlobalSkills /></RegistrySurface>
    </AppShell>
  );
}
