import WorkspaceSourceOps from '@/components/WorkspaceSourceOps';
import { notFound } from 'next/navigation';
import WorkspaceKnowledge from '@/components/WorkspaceKnowledge';
import WorkspaceAudit from '@/components/WorkspaceAudit';
import {WorkspaceOperation} from '@/components/WorkspaceOverview';
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
    knowledge: <WorkspaceKnowledge><Resources /></WorkspaceKnowledge>,
    tools: <WorkspaceOperation title="Tools & MCP"><Resources tools /></WorkspaceOperation>,
    evaluations: <WorkspaceSourceOps view="checks"><Evaluations /></WorkspaceSourceOps>,
    deployments: <WorkspaceOperation title="Deployments"><Deployments /></WorkspaceOperation>,
    agentops: <WorkspaceSourceOps view="operations"><AgentOps /></WorkspaceSourceOps>,
    finops: <WorkspaceSourceOps view="costs"><FinOps /></WorkspaceSourceOps>,
    reports: <WorkspaceSourceOps view="reports"><Reports /></WorkspaceSourceOps>,
    playground: <WorkspaceSourceOps view="playground"><Playground /></WorkspaceSourceOps>,
    'audit-log': <WorkspaceAudit><AuditLog /></WorkspaceAudit>,
    models: <WorkspaceOperation title="Models"><Models /></WorkspaceOperation>,
  };
  if (!Object.hasOwn(pages, surface)) notFound();
  return <AppShell>{pages[surface]}</AppShell>;
}
