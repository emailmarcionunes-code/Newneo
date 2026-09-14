import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppShell from '@/components/AppShell';

// These registries are explicitly design-pending in NEWNEO_PRODUCT_SURFACE_ROADMAP.
// Keep navigation usable without presenting invented registry screens as approved.
const surfaces: Record<string, string> = {
  knowledge: 'Knowledge',
  tools: 'Tools & MCP',
  models: 'Models',
  evaluations: 'Evaluations',
  deployments: 'Deployments',
  agentops: 'AgentOps',
  finops: 'FinOps',
  settings: 'Settings',
};
export default async function PendingSurface({
  params,
}: {
  params: Promise<{ surface: string }>;
}) {
  const { surface } = await params;
  const title = Object.hasOwn(surfaces, surface)
    ? surfaces[surface]
    : undefined;
  if (!title) notFound();
  return (
    <AppShell>
      <div className="pageHead">
        <div>
          <h1>{title}</h1>
          <p>This workspace view is not available in this preview.</p>
        </div>
      </div>
      <Link className="button primary" href="/agents">
        Browse Agent Catalog →
      </Link>
    </AppShell>
  );
}
