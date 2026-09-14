import { notFound } from 'next/navigation';
import AppShell from '@/components/AppShell';
import RegistrySurface from '@/components/RegistrySurface';
import OperationsSurface from '@/components/OperationsSurface';
import { surfaces } from '@/lib/surfaces';
import '../surfaces.css';
export default async function SurfacePage({
  params,
}: {
  params: Promise<{ surface: string }>;
}) {
  const { surface } = await params;
  if (surface === 'agentops' || surface === 'finops')
    return (
      <AppShell>
        <OperationsSurface finops={surface === 'finops'} />
      </AppShell>
    );
  if (!Object.hasOwn(surfaces, surface)) notFound();
  return (
    <AppShell>
      <RegistrySurface key={surface} surface={surface} />
    </AppShell>
  );
}
