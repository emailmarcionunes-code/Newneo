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
  complexity?: string;
  tagline?: string;
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
    categories: ['Operations'],
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
    categories: ['Operations'],
    outcomes: ['Surface insights', 'Generate structured reports'],
  },
];
const broaderCatalog: [string, AgentType, string, string, string, string][] = [
  [
    'customer-feedback',
    'service',
    'Voice of Customer Agent',
    'Customer Service',
    'Analyze feedback and route product signals.',
    'Medium',
  ],
  [
    'customer-onboarding',
    'service',
    'Customer Onboarding Agent',
    'Customer Service',
    'Guide customers through approved onboarding steps.',
    'Medium',
  ],
  [
    'incident-response',
    'it',
    'Incident Response Agent',
    'IT',
    'Triage incidents and recommend approved runbooks.',
    'High',
  ],
  [
    'access-requests',
    'it',
    'Access Request Agent',
    'IT',
    'Prepare access requests for human approval.',
    'High',
  ],
  [
    'revenue-intelligence',
    'sales',
    'Revenue Intelligence Agent',
    'Sales',
    'Surface at-risk deals and pipeline insights.',
    'High',
  ],
  [
    'sales-enablement',
    'sales',
    'Sales Enablement Agent',
    'Sales',
    'Find approved answers and content for opportunities.',
    'Low',
  ],
  [
    'employee-onboarding',
    'assistant',
    'Employee Onboarding Agent',
    'HR',
    'Guide new hires through tasks and policy questions.',
    'Medium',
  ],
  [
    'employee-self-service',
    'assistant',
    'Employee Self-Service Agent',
    'HR',
    'Answer HR policy questions with source citations.',
    'Low',
  ],
  [
    'procurement',
    'automation',
    'Procurement Agent',
    'Finance',
    'Prepare purchase requests and vendor comparisons.',
    'High',
  ],
  [
    'invoice-review',
    'research',
    'Invoice Review Agent',
    'Finance',
    'Identify invoice exceptions for finance review.',
    'Medium',
  ],
  [
    'compliance-monitor',
    'research',
    'Compliance Monitor',
    'Finance',
    'Review transactions against approved controls.',
    'High',
  ],
  [
    'operations-planning',
    'automation',
    'Operations Planning Agent',
    'Operations',
    'Summarize capacity and flag workflow bottlenecks.',
    'Medium',
  ],
  [
    'marketing-insights',
    'research',
    'Marketing Insights Agent',
    'Marketing',
    'Summarize campaign performance and customer themes.',
    'Low',
  ],
  [
    'content-review',
    'assistant',
    'Content Review Agent',
    'Marketing',
    'Review campaign content against brand and policy.',
    'Medium',
  ],
];
agentTemplates.push(
  ...broaderCatalog.map(
    ([id, type, name, category, objective, complexity]) => ({
      id,
      type,
      name,
      description: objective,
      objective,
      targetUsers: 'Employees (internal)',
      tags: [category, 'Governed', 'Demo'],
      categories: [category],
      outcomes: [objective, 'Preserve approvals and auditability'],
      complexity,
      tagline: objective,
    }),
  ),
);
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
