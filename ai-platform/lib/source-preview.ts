import { sourceRows } from './hybrid-data';
export const sourceAgents: Record<string, string[]> = {
  confluence: ['customer-service', 'knowledge-assistant'],
  sharepoint: ['process-automation', 'knowledge-assistant'],
  zendesk: ['customer-service'],
  notion: ['research-assistant'],
  salesforce: ['sales-assistant'],
  'google-drive': [],
  servicenow: ['it-support'],
};
export const sourceDocuments: Record<string, string[]> = {
  confluence: ['Support policy', 'Product handbook', 'Escalation procedure'],
  sharepoint: ['Employee handbook', 'Security standard', 'Operations guide'],
  zendesk: ['Ticket resolution 1042', 'Customer FAQ', 'Refund guidance'],
  notion: ['Research index', 'Discovery notes', 'Editorial handbook'],
  salesforce: ['Account knowledge', 'Sales playbook', 'Opportunity guidance'],
  servicenow: [
    'Incident runbook',
    'Service catalogue',
    'Password reset procedure',
  ],
};
export function previewSourceRows(ui?: Record<string, unknown>) {
  const managed = (
    Array.isArray(ui?.['resources:knowledge']) ? ui['resources:knowledge'] : []
  ) as {
    id: string;
    name: string;
    category: string;
    connected: boolean;
    sync: string;
    provider: string;
  }[];
  const result = sourceRows.map((r) => [...r]);
  for (const item of managed) {
    const index = result.findIndex((r) => r[0] === item.id);
    const base =
      index >= 0
        ? result[index]
        : [
            item.id,
            item.name,
            item.category,
            '—',
            'Never',
            'Not synchronized',
            'None',
            '0%',
          ];
    const row = [...base];
    row[1] = item.name;
    row[5] = !item.connected
      ? 'Not connected'
      : item.sync === 'Ready'
        ? 'Live'
        : item.sync === 'Needs attention'
          ? 'Error'
          : 'Not synchronized';
    if (item.sync === 'Ready') row[4] = 'This session';
    if (row[5] !== 'Live') {
      row[3] = '—';
      row[7] = '0%';
    }
    if (index >= 0) result[index] = row;
    else result.push(row);
  }
  return result.map((r) =>
    ui?.[`source:${r[0]}:synced`] &&
    !managed.some(
      (m) => m.id === r[0] && (!m.connected || m.sync === 'Needs attention'),
    )
      ? [
          ...r.slice(0, 3),
          r[3] === '—' ? '3' : r[3],
          'This session',
          'Live',
          r[6],
          r[7] === '0%' ? '100%' : r[7],
        ]
      : r,
  );
}
