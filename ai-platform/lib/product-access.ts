// Persona labels are presentation. Capabilities are the authorization contract.
export type ProductCapability =
  | 'operations:view'
  | 'agents:configure'
  | 'business:propose'
  | 'work:search'
  | 'members:manage';
const grants: Record<string, readonly ProductCapability[]> = {
  'Org Admin': [
    'operations:view',
    'agents:configure',
    'business:propose',
    'work:search',
    'members:manage',
  ],
  'AI Platform Admin': [
    'operations:view',
    'agents:configure',
    'business:propose',
    'work:search',
  ],
  'AI Engineer': ['agents:configure', 'business:propose', 'work:search'],
  Operator: ['work:search'],
  'Reviewer / Approver': ['work:search'],
  'Business Owner': ['business:propose'],
  'Read Only': [],
};
export const productCapabilities = (
  role?: string,
): readonly ProductCapability[] =>
  role && Object.hasOwn(grants, role) ? grants[role] : [];
export const hasCapability = (
  role: string | undefined,
  cap: ProductCapability,
) => productCapabilities(role).includes(cap);
export const demoProductRole = (role: string) =>
  ({
    Administrator: 'Org Admin',
    Creator: 'AI Engineer',
    Approver: 'Reviewer / Approver',
    Operator: 'Operator',
    Employee: 'Read Only',
    'Department Owner': 'Business Owner',
  })[role] ?? 'Read Only';
export const operationsRoots = [
  'agents',
  'skills',
  'knowledge',
  'tools',
  'models',
  'governance',
  'evaluations',
  'deployments',
  'agentops',
  'finops',
  'reports',
  'playground',
  'audit-log',
  'settings',
  'operations',
];
export const isOperationsPath = (path: string) =>
  operationsRoots.includes(path.split('/')[1]);
