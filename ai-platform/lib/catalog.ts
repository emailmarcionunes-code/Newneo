import type { AgentType } from '../components/Assets';

export type AgentTemplate = {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  objective: string;
  targetUsers: string;
  tags: string[];
  categories: string[];
  outcomes: string[];
};
export const catalogFilters = [
  'All',
  'Customer Service',
  'IT',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Marketing',
];
export const agentTemplates: AgentTemplate[] = [
  {
    id: 'customer-service',
    type: 'service',
    name: 'Customer Service Agent',
    description:
      'Answer questions, resolve issues and create tickets automatically.',
    objective:
      'Helps customers with product questions, account issues and order status.',
    targetUsers: 'Customers (external)',
    tags: ['Support', 'ITSM', 'FAQ'],
    categories: ['Customer Service'],
    outcomes: [
      'Reduce support tickets',
      'Improve customer satisfaction',
      '24/7 availability',
      'Faster resolution times',
    ],
  },
  {
    id: 'it-support',
    type: 'it',
    name: 'IT Support Agent',
    description: 'Help employees with IT issues and access requests.',
    objective: 'Help employees with IT issues and access requests.',
    targetUsers: 'Employees (internal)',
    tags: ['IT', 'Productivity', 'Access'],
    categories: ['IT'],
    outcomes: [
      'Reduce repetitive support workload',
      'Improve service consistency',
      'Preserve approvals and auditability',
    ],
  },
  {
    id: 'knowledge-assistant',
    type: 'assistant',
    name: 'Knowledge Assistant',
    description: 'Find and summarize information across your enterprise.',
    objective: 'Find and summarize information across your enterprise.',
    targetUsers: 'Employees (internal)',
    tags: ['Search', 'RAG', 'Enterprise'],
    categories: [],
    outcomes: [
      'Find trusted enterprise information',
      'Respect source permissions',
    ],
  },
  {
    id: 'sales-assistant',
    type: 'sales',
    name: 'Sales Assistant',
    description:
      'Support your sales team with insights, content and lead scoring.',
    objective:
      'Support your sales team with insights, content and lead scoring.',
    targetUsers: 'Employees (internal)',
    tags: ['Sales', 'CRM', 'Enablement'],
    categories: ['Sales'],
    outcomes: ['Support your sales team', 'Reuse approved content'],
  },
  {
    id: 'process-automation',
    type: 'automation',
    name: 'Process Automation',
    description: 'Execute and monitor complex business processes end-to-end.',
    objective: 'Execute and monitor complex business processes end-to-end.',
    targetUsers: 'Employees (internal)',
    tags: ['Operations', 'RPA', 'Workflow'],
    categories: ['Operations'],
    outcomes: ['Reduce repetitive work', 'Preserve approvals and auditability'],
  },
  {
    id: 'research-assistant',
    type: 'research',
    name: 'Research Assistant',
    description:
      'Analyze data, surface insights and generate structured reports.',
    objective:
      'Analyze data, surface insights and generate structured reports.',
    targetUsers: 'Employees (internal)',
    tags: ['Research', 'Analytics', 'Reports'],
    categories: [],
    outcomes: ['Surface insights', 'Generate structured reports'],
  },
];
export const customTemplate: AgentTemplate = {
  id: 'custom',
  type: 'automation',
  name: 'Custom Agent',
  description: '',
  objective: '',
  targetUsers: 'Employees (internal)',
  categories: [],
  tags: [],
  outcomes: [],
};
export function getTemplate(id?: string | null) {
  return id === 'custom'
    ? customTemplate
    : (agentTemplates.find((agent) => agent.id === id) ?? agentTemplates[0]);
}
export function filterAgents(category: string) {
  return category === 'All'
    ? agentTemplates
    : agentTemplates.filter((agent) => agent.categories.includes(category));
}
