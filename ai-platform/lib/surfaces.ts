import { knowledgeSources, toolConnectors } from './launch';
import { approvedEndpoints } from './configuration';
export type SurfaceRecord = {
  id: string;
  name: string;
  category: string;
  status: string;
  description: string;
  fields: [string, string][];
  details?: [string, string][];
};
export type Surface = {
  title: string;
  description: string;
  records: SurfaceRecord[];
  categories?: string[];
};
export const surfaces: Record<string, Surface> = {
  knowledge: {
    title: 'Knowledge',
    description:
      'Approved sources, readiness and access within your workspace.',
    records: knowledgeSources.map((source) => ({
      id: source.id,
      name: source.name,
      category: source.categories[0],
      status: 'Sample registry',
      description: source.detail,
      fields: [
        ['Scope', 'Customer Service workspace'],
        ['Permissions', 'Read-only reference'],
        ['Freshness', 'Not connected'],
        ['Indexing', 'Not started'],
      ],
      details: [
        ['Connection', 'No credentials configured.'],
        ['Sync history', 'No live sync runs.'],
        ['Content quality', 'No content has been ingested.'],
        ['Agents using this source', 'No live agent assignments.'],
      ],
    })),
  },
  tools: {
    title: 'Tools & MCP',
    description:
      'Distinguish available connectors, technical actions and workspace approvals.',
    records: toolConnectors.map((tool) => ({
      id: tool.id,
      name: tool.name,
      category: tool.id === 'api' ? 'MCP Servers' : 'Enterprise Integrations',
      status: 'Not connected',
      description: tool.caption ?? tool.detail,
      fields: [
        ['Owner', 'Demo organization'],
        ['Environment', 'Development'],
        ['Authentication', 'Not configured'],
        ['Health check', 'Not run'],
      ],
      details: (tool.actions ?? []).map((action) => [
        action.name,
        `${action.access} · ${action.approved ? 'Approved in sample registry' : 'Not approved'} · ${action.requiresApproval ? 'Human approval required' : 'Subject to agent governance'}. No live execution grant.`,
      ]),
    })),
  },
  models: {
    title: 'Models',
    description: 'Approved model endpoints and execution environments.',
    records: approvedEndpoints.map((model) => ({
      id: model.id,
      name: model.name,
      category: 'Customer Cloud',
      status: 'Sample endpoint',
      description:
        'Organization default reference; no provider credentials configured.',
      fields: [
        ['Provider', 'Organization-approved provider'],
        ['Runtime', model.executionModel],
        ['Region', model.region],
        ['Cost profile', model.estimatedCost],
        ['Performance', model.expectedLatency],
        ['Data classifications', 'Not verified for live use'],
      ],
      details: [
        [
          'Default inheritance',
          'The Launch Guide uses the organization default unless a supported endpoint is selected.',
        ],
        [
          'Production readiness',
          'Credentials, access policy and endpoint verification remain required.',
        ],
      ],
    })),
  },
  evaluations: {
    title: 'Evaluations',
    description:
      'Reusable suites, failed cases and regression evidence before promotion.',
    records: [
      {
        id: 'support-regression',
        name: 'Customer Service regression',
        category: 'Regression',
        status: 'Needs review · sample',
        description:
          'Candidate v1.3: 50 reference cases, 46 passed, 3 require review, 1 failed.',
        fields: [
          ['Agent', 'Customer Service Agent'],
          ['Overall result', 'Fail · sample'],
          ['Previous version', 'v1.2 · passed reference'],
          ['Recommended action', 'Review failed cases before promotion'],
        ],
        details: [
          ['Functional', '46 passed / 50 reference cases.'],
          [
            'RAG / Groundedness',
            'Reference quality 96%; not a live measurement.',
          ],
          ['Tool execution', 'No live tool evaluation performed.'],
          ['Governance', 'Mandatory controls must pass before production.'],
          ['Security', 'No live security suite executed.'],
          ['Business KPI', 'No measured business KPI test available.'],
          [
            'Failed case',
            'Sample: answer did not cite the current support policy.',
          ],
          [
            'Regression comparison',
            'Candidate v1.3 requires review; v1.2 remains the production reference.',
          ],
        ],
      },
    ],
  },
  deployments: {
    title: 'Deployments',
    description:
      'Track promotion requests and deployment evidence across environments.',
    records: [
      {
        id: 'candidate',
        name: 'Customer Service Agent · v1.3',
        category: 'Test',
        status: 'Blocked · sample',
        description:
          'Production promotion is blocked while evaluation cases require review.',
        fields: [
          ['Source', 'Test'],
          ['Target', 'Production'],
          ['Requested by', 'Ana Martinez · sample'],
          ['Approved by', 'Not approved'],
          ['Deployed at', 'Not deployed'],
        ],
        details: [
          [
            'Promotion',
            'Requires verified authorization and successful mandatory evaluations.',
          ],
          [
            'Rollback',
            'Requires a previously deployed version and an attached runtime.',
          ],
        ],
      },
      {
        id: 'reference',
        name: 'Customer Service Agent · v1.2',
        category: 'Production',
        status: 'Reference only',
        description: 'Illustrative deployment record; no agent is running.',
        fields: [
          ['Source', 'Test'],
          ['Target', 'Production'],
          ['Requested by', 'Ana Martinez · sample'],
          ['Approved by', 'Sample approver'],
          ['Deployed at', 'Sample timestamp only'],
        ],
        details: [
          [
            'Live actions',
            'No promotion, approval, rejection or rollback is sent to a runtime in this preview.',
          ],
        ],
      },
    ],
  },
  governance: {
    title: 'Governance',
    description: 'Organization controls, approvals and audit evidence.',
    categories: [
      'Policies',
      'Users & Roles',
      'Approvals',
      'Data Classifications',
      'Audit Log',
    ],
    records: [
      {
        id: 'policy',
        name: 'Production change control',
        category: 'Policies',
        status: 'Reference policy',
        description:
          'Production changes create a new version and require evaluation.',
        fields: [
          ['Scope', 'Organization'],
          ['Enforcement', 'Live policy service not connected'],
        ],
        details: [
          ['Allowed actions', 'Only approved tool actions may be granted.'],
          [
            'Human approval',
            'Required according to workspace and agent policy.',
          ],
          [
            'Sensitive data',
            'Apply approved data classifications before access.',
          ],
        ],
      },
      {
        id: 'roles',
        name: 'Organization roles',
        category: 'Users & Roles',
        status: 'Reference roles',
        description: 'Roles defined in the product specification.',
        fields: [
          ['Membership', 'Provisioned by a trusted administrator'],
          ['Authorization', 'Server-side enforcement required'],
        ],
        details: [
          'Organization Admin',
          'AI Platform Admin',
          'AI Engineer',
          'Business Owner',
          'Operator',
          'Reviewer / Approver',
          'Read Only',
        ].map((name) => [
          name,
          'Product role; no authority is granted by this preview.',
        ]),
      },
      {
        id: 'approval',
        name: 'Customer Service Agent · v1.3',
        category: 'Approvals',
        status: 'Blocked · sample',
        description: 'Evaluation review is outstanding.',
        fields: [
          ['Requested action', 'Promote to Production'],
          ['Decision', 'Not approved'],
        ],
        details: [
          [
            'Evidence',
            'One failed sample case and three cases requiring review.',
          ],
        ],
      },
      {
        id: 'classification',
        name: 'Data classifications',
        category: 'Data Classifications',
        status: 'Not configured',
        description: 'No organization classification policy is connected.',
        fields: [['Production access', 'Not granted']],
        details: [
          [
            'Next step',
            'Configure classifications and access policy with an organization administrator.',
          ],
        ],
      },
      {
        id: 'audit',
        name: 'Policy change reference',
        category: 'Audit Log',
        status: 'Sample event',
        description:
          'Human approval requirement changed in the demonstration timeline.',
        fields: [
          ['Actor', 'Demo administrator'],
          ['Scope', 'Customer Service workspace'],
          ['Evidence', 'Illustrative only'],
        ],
        details: [
          [
            'Audit boundary',
            'This sample event is not a persisted production audit record.',
          ],
        ],
      },
    ],
  },
};
export const fleet = [
  {
    id: 'customer-service',
    name: 'Customer Service Agent',
    health: 'Needs review',
    tasks: 2000,
    successful: 1840,
    cost: 120,
    kpi: '1,840 cases resolved',
    evaluation: 92,
    incidents: 1,
    latency: '1.8 s',
    escalations: 160,
  },
  {
    id: 'knowledge-assistant',
    name: 'Knowledge Assistant',
    health: 'Needs attention',
    tasks: 1800,
    successful: 1620,
    cost: 72,
    kpi: '80 estimated hours saved',
    evaluation: 90,
    incidents: 1,
    latency: '1.4 s',
    escalations: 144,
  },
  {
    id: 'it-support',
    name: 'IT Support Agent',
    health: 'Healthy',
    tasks: 1200,
    successful: 1140,
    cost: 48,
    kpi: '40 estimated hours saved',
    evaluation: 96,
    incidents: 0,
    latency: '1.2 s',
    escalations: 96,
  },
];
export const incidents = [
  {
    id: 'evaluation-review',
    severity: 'Medium',
    agent: 'Customer Service Agent',
    impact: 'Next production promotion is blocked.',
    cause: 'Candidate evaluation case did not cite the current policy.',
    evidence: 'Sample suite: 1 failed case, 3 requiring review.',
    action: 'Update the candidate and run the regression suite.',
    owner: 'Ana Martinez',
    status: 'Open',
  },
  {
    id: 'source-freshness',
    severity: 'Low',
    agent: 'Knowledge Assistant',
    impact: 'Answers may reference an older support policy.',
    cause: 'Source refresh is due in the sample registry.',
    evidence: 'Sample source status: update recommended.',
    action: 'Refresh the source, then evaluate groundedness.',
    owner: 'Ana Martinez',
    status: 'Open',
  },
];
export const fleetTotals = () =>
  fleet.reduce(
    (total, agent) => ({
      tasks: total.tasks + agent.tasks,
      successful: total.successful + agent.successful,
      cost: total.cost + agent.cost,
    }),
    { tasks: 0, successful: 0, cost: 0 },
  );
