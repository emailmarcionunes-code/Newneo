'use client';
import { hybridAgents } from '@/lib/hybrid-data';
import { usePreview } from './PreviewState';
export function useWorkspaceAgents() {
  const { state } = usePreview();
  const added = state.ui?.['workspace:agents'];
  const agents = [
    ...hybridAgents,
    ...(Array.isArray(added)
      ? added.filter(
          (a): a is (typeof hybridAgents)[number] =>
            !!a &&
            typeof a.id === 'string' &&
            typeof a.name === 'string' &&
            typeof a.model === 'string' &&
            typeof a.tasks === 'string',
        )
      : []),
  ];
  return agents.map((a) => {
    const release = state.releases.find(
      (r) =>
        r.agentId === a.id && r.target === 'Production' && r.state === 'Active',
    );
    if (!a.id.startsWith('preview-')) return a;
    const other = state.releases.find(
      (r) => r.agentId === a.id && r.state === 'Active',
    );
    return { ...a, status: release ? 'Live' : other ? 'Staging' : 'Paused' };
  });
}
