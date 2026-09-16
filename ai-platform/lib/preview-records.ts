import { previewSourceRows } from './source-preview';
import type { LaunchDraft } from './launch';
import { hybridAgents } from './hybrid-data';
export const deploymentRecords = [
  {
    id: 'DEP-204',
    agentId: 'customer-service',
    version: 'v2.4',
    environment: 'Production',
    by: 'j.silva',
    when: 'Today 12:04',
    duration: '2m 14s',
    status: 'Success',
  },
  {
    id: 'DEP-198',
    agentId: 'it-support',
    version: 'v1.8',
    environment: 'Production',
    by: 't.ferreira',
    when: 'Aug 28',
    duration: '1m 42s',
    status: 'Success',
  },
  {
    id: 'DEP-193',
    agentId: 'sales-assistant',
    version: 'v1.3',
    environment: 'Staging',
    by: 'a.costa',
    when: 'Sep 14',
    duration: '2m 04s',
    status: 'Success',
  },
  {
    id: 'DEP-181',
    agentId: 'sales-assistant',
    version: 'v1.2',
    environment: 'Production',
    by: 'a.costa',
    when: 'Sep 5',
    duration: '3m 12s',
    status: 'Rolled back',
  },
  {
    id: 'DEP-175',
    agentId: 'knowledge-assistant',
    version: 'v3.1',
    environment: 'Production',
    by: 'r.lima',
    when: 'Jul 15',
    duration: '2m 08s',
    status: 'Success',
  },
  {
    id: 'DEP-169',
    agentId: 'customer-service',
    version: 'v2.3',
    environment: 'Production',
    by: 'auto',
    when: 'Aug 20',
    duration: '2m 14s',
    status: 'Success',
  },
];
export function productionVersion(agentId: string) {
  return (
    deploymentRecords.find(
      (r) =>
        r.agentId === agentId &&
        r.environment === 'Production' &&
        r.status === 'Success',
    )?.version ?? 'v1.0'
  );
}
export function nextVersion(agentId: string) {
  const [major, minor] = productionVersion(agentId)
    .slice(1)
    .split('.')
    .map(Number);
  return `v${major}.${minor + 1}`;
}
export function evaluationRecords(agentId: string) {
  const score = hybridAgents.find((a) => a.id === agentId)?.score ?? 94;
  const version = productionVersion(agentId);
  return [
    { id: 'EV-204', version, score, when: 'Today 10:42' },
    { id: 'EV-198', version: `${version}-rc1`, score: 78, when: 'Yesterday' },
    {
      id: 'EV-181',
      version: `v${version.slice(1).split('.')[0]}.${Math.max(0, Number(version.split('.')[1]) - 1)}`,
      score: 91,
      when: 'Sep 10',
    },
  ];
}
export const workspaceSpend = hybridAgents.reduce((sum, a) => sum + a.cost, 0);
export const workspaceTasks = hybridAgents.reduce(
  (sum, a) => sum + (Number(a.tasks.replaceAll(',', '')) || 0),
  0,
);
export const incidentRecords = [
  {
    id: 'inc-001',
    agentId: 'sales-assistant',
    title: 'High latency detected',
    severity: 'High',
    status: 'Open',
  },
  {
    id: 'inc-002',
    agentId: 'process-automation',
    title: 'Tool execution failed',
    severity: 'Medium',
    status: 'Investigating',
  },
];
export function agentConfiguration(
  ui: Record<string, unknown> | undefined,
  id: string,
) {
  const values = ['mission', 'model', 'owner'].map(
    (k) => ui?.[`agent:${id}:${k}`] ?? '',
  );
  const launch = ui?.[`agent:${id}:launch`] as LaunchDraft | undefined;
  if (launch)
    values.push(
      JSON.stringify({
        knowledge: launch.knowledge,
        tools: launch.tools,
        infrastructure: launch.infrastructure,
        governance: launch.governance,
        sources: previewSourceRows(ui)
          .filter((r) => launch.knowledge.includes(r[0]))
          .map((r) => [r[0], r[5]]),
      }),
    );
  return JSON.stringify(values);
}

export const workspaceReadiness = Math.round(
  hybridAgents.reduce((sum, a) => sum + a.score, 0) / hybridAgents.length,
);
