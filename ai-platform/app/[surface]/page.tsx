import { notFound } from 'next/navigation';
import AppShell from '@/components/AppShell';
import RegistrySurface from '@/components/RegistrySurface';
import OperationsSurface from '@/components/OperationsSurface';
import Models from '@/components/journeys/Models';
import {
  Evaluations,
  Deployments,
  AgentOps,
  FinOps,
} from '@/components/hybrid/Operations';
import { Reports, Playground, AuditLog } from '@/components/hybrid/Platform';
import { Resources } from '@/components/hybrid/Inventory';

import { surfaces } from '@/lib/surfaces';
import '../surfaces.css';
export default async function SurfacePage({
  params,
}: {
  params: Promise<{ surface: string }>;
}) {
  const { surface } = await params;
  const pages: Record<string, React.ReactNode> = {
    knowledge: <Resources />,
    tools: <Resources tools />,
    evaluations: <Evaluations />,
    deployments: <Deployments />,
    agentops: <AgentOps />,
    finops: <FinOps />,
    reports: <Reports />,
    playground: <Playground />,
    'audit-log': <AuditLog />,
    models: <Models />,
  };
  if (!Object.hasOwn(pages, surface)) notFound();
  return <AppShell>{pages[surface]}</AppShell>;
}
