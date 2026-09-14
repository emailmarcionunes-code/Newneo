import AppShell from '@/components/AppShell';
import RegistrySurface from '@/components/RegistrySurface';
import '../surfaces.css';
export default function Governance() {
  return (
    <AppShell>
      <RegistrySurface surface="governance" />
    </AppShell>
  );
}
