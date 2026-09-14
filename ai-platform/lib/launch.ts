import { getTemplate } from './catalog';
import {
  defaultRuntime,
  defaultGovernance,
  parseRuntime,
  parseGovernance,
  runtimeIsReady,
  type RuntimeSelection,
  type GovernanceSelection,
} from './configuration';

export const launchSteps = [
  'Use Case',
  'Knowledge',
  'Tools',
  'Model',
  'Governance',
  'Evaluate',
  'Deploy',
] as const;
export type ToolAction = {
  id: string;
  name: string;
  access: 'Read' | 'Write';
  approved: boolean;
  requiresApproval: boolean;
};
export type Integration = {
  id: string;
  name: string;
  categories: string[];
  caption?: string;
  detail: string;
  actions?: ToolAction[];
};
export const knowledgeFilters = [
  'All',
  'Documents',
  'Collaboration',
  'Databases',
  'Web',
  'Custom',
];
export const toolFilters = [
  'All',
  'Business Apps',
  'Communication',
  'Productivity',
  'Custom (MCP)',
];
// Approved demo registry: replace this adapter with the organization-scoped backend.
// Attaching a source is not OAuth, ingestion, or a grant of tool actions.
export const knowledgeSources: Integration[] = [
  {
    id: 'sharepoint',
    name: 'SharePoint',
    categories: ['Documents', 'Collaboration'],
    detail: 'acme.sharepoint.com',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    categories: ['Documents'],
    detail: 'Acme shared documents',
  },
  {
    id: 'confluence',
    name: 'Confluence',
    categories: ['Collaboration'],
    detail: 'acme.atlassian.net',
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    categories: ['Documents'],
    detail: 'Acme shared documents',
  },
  {
    id: 'notion',
    name: 'Notion',
    categories: ['Documents', 'Collaboration'],
    detail: 'Acme knowledge base',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    categories: ['Databases'],
    detail: 'Acme approved knowledge',
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    categories: ['Databases'],
    detail: 'acme.service-now.com',
  },
  {
    id: 'api',
    name: 'Custom API',
    categories: ['Custom', 'Web'],
    detail: 'Acme approved knowledge API',
  },
];
export const toolConnectors: Integration[] = [
  {
    id: 'servicenow',
    name: 'ServiceNow',
    categories: ['Business Apps'],
    caption: 'Create and update tickets',
    detail: 'Create tickets, check status',
    actions: [
      {
        id: 'search',
        name: 'Search Incident',
        access: 'Read',
        approved: true,
        requiresApproval: false,
      },
      {
        id: 'create',
        name: 'Create Incident',
        access: 'Write',
        approved: true,
        requiresApproval: false,
      },
      {
        id: 'update',
        name: 'Update Incident',
        access: 'Write',
        approved: true,
        requiresApproval: true,
      },
      {
        id: 'close',
        name: 'Close Incident',
        access: 'Write',
        approved: false,
        requiresApproval: true,
      },
    ],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    categories: ['Business Apps'],
    caption: 'Search and update records',
    detail: 'Search and update records',
    actions: [
      {
        id: 'search',
        name: 'Search records',
        access: 'Read',
        approved: true,
        requiresApproval: false,
      },
      {
        id: 'update',
        name: 'Update records',
        access: 'Write',
        approved: true,
        requiresApproval: true,
      },
    ],
  },
  {
    id: 'sap',
    name: 'SAP',
    categories: ['Business Apps'],
    caption: 'Read business data',
    detail: 'Read business data',
    actions: [
      {
        id: 'read',
        name: 'Read business data',
        access: 'Read',
        approved: true,
        requiresApproval: false,
      },
    ],
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    categories: ['Communication', 'Productivity'],
    caption: 'Send messages',
    detail: 'Send notifications',
    actions: [
      {
        id: 'notify',
        name: 'Send notifications',
        access: 'Write',
        approved: true,
        requiresApproval: false,
      },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    categories: ['Communication', 'Productivity'],
    caption: 'Send notifications',
    detail: 'Send notifications',
    actions: [
      {
        id: 'notify',
        name: 'Send notifications',
        access: 'Write',
        approved: true,
        requiresApproval: false,
      },
    ],
  },
  {
    id: 'api',
    name: 'Custom API / MCP',
    categories: ['Custom (MCP)'],
    caption: 'Connect any approved system',
    detail: 'Approved API / MCP actions',
    actions: [
      {
        id: 'read',
        name: 'Read approved records',
        access: 'Read',
        approved: true,
        requiresApproval: false,
      },
    ],
  },
];
export type LaunchDraft = {
  schemaVersion: 1;
  organizationId: 'acme-demo';
  workspaceId: 'customer-service-demo';
  templateId: string;
  step: number;
  name: string;
  description: string;
  targetUsers: string;
  industry: string;
  knowledge: string[];
  tools: Record<string, string[]>;
  runtime: RuntimeSelection;
  governance: GovernanceSelection;
  savedAt?: string;
};
export function createDraft(templateId?: string | null): LaunchDraft {
  const template = getTemplate(templateId);
  const service = template.id === 'customer-service';
  return {
    schemaVersion: 1,
    organizationId: 'acme-demo',
    workspaceId: 'customer-service-demo',
    templateId: template.id,
    step: 0,
    name: template.id === 'custom' ? '' : template.name,
    description: template.objective,
    targetUsers: template.targetUsers,
    industry: 'Technology',
    runtime: defaultRuntime(),
    governance: defaultGovernance(),
    knowledge: service ? ['sharepoint', 'servicenow', 'confluence'] : [],
    tools: service
      ? { servicenow: ['search', 'create'], teams: ['notify'] }
      : {},
  };
}
export const draftKey = (templateId: string) =>
  `newneo:launch:v1:acme-demo:customer-service-demo:${getTemplate(templateId).id}`;
export function approvedActions(connectorId: string, ids: string[]) {
  const actions =
    toolConnectors.find((tool) => tool.id === connectorId)?.actions ?? [];
  return [...new Set(ids)].filter((id) =>
    actions.some((action) => action.id === id && action.approved),
  );
}
export function parseDraft(
  raw: string,
  templateId: string,
): LaunchDraft | null {
  try {
    const value = JSON.parse(raw);
    if (
      !value ||
      value.schemaVersion !== 1 ||
      value.templateId !== templateId ||
      value.organizationId !== 'acme-demo' ||
      value.workspaceId !== 'customer-service-demo'
    )
      return null;
    if (
      !['name', 'description', 'targetUsers', 'industry'].every(
        (key) => typeof value[key] === 'string',
      ) ||
      !Number.isInteger(value.step) ||
      value.step < 0 ||
      value.step > 5
    )
      return null;
    if (
      !Array.isArray(value.knowledge) ||
      !value.knowledge.every((id: unknown) => typeof id === 'string') ||
      !value.tools ||
      typeof value.tools !== 'object' ||
      Array.isArray(value.tools)
    )
      return null;
    const tools: Record<string, string[]> = {};
    for (const [id, actions] of Object.entries(value.tools)) {
      if (
        !Array.isArray(actions) ||
        !actions.every((action) => typeof action === 'string')
      )
        return null;
      const allowed = approvedActions(id, actions);
      if (allowed.length) tools[id] = allowed;
    }
    // Additive migration: existing milestone-one drafts keep their storage key.
    const runtime =
      value.runtime === undefined
        ? defaultRuntime()
        : parseRuntime(value.runtime);
    const governance =
      value.governance === undefined
        ? defaultGovernance()
        : parseGovernance(value.governance);
    let step = value.step;
    if (
      !runtime ||
      !runtimeIsReady(runtime) ||
      (value.runtime === undefined && step > 3)
    )
      step = Math.min(step, 3);
    if (!governance || (value.governance === undefined && step > 4))
      step = Math.min(step, 4);
    return {
      ...createDraft(templateId),
      runtime: runtime ?? defaultRuntime(),
      governance: governance ?? defaultGovernance(),
      name: value.name,
      description: value.description,
      targetUsers: value.targetUsers,
      industry: value.industry,
      step: value.name.trim() && value.description.trim() ? step : 0,
      knowledge: [...new Set<string>(value.knowledge)].filter((id) =>
        knowledgeSources.some((source) => source.id === id),
      ),
      tools,
      savedAt: typeof value.savedAt === 'string' ? value.savedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function toolSummary(tool: Integration, actionIds: string[]) {
  if (
    tool.id === 'servicenow' &&
    actionIds.length === 2 &&
    actionIds.includes('search') &&
    actionIds.includes('create')
  )
    return 'Create tickets, check status';
  return (
    actionIds
      .map((id) => tool.actions?.find((action) => action.id === id)?.name)
      .filter(Boolean)
      .join(', ') || 'No actions selected'
  );
}
