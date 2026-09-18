export const sourceProfiles: Record<
  string,
  {
    type: string;
    docs: number;
    coverage: number;
    permission: string;
    description: string;
  }
> = {
  confluence: {
    type: 'Wiki',
    docs: 8247,
    coverage: 94,
    permission: 'Space ACLs',
    description:
      'Product documentation, support policies and operating procedures.',
  },
  sharepoint: {
    type: 'Documents',
    docs: 12403,
    coverage: 88,
    permission: 'Microsoft 365 groups',
    description: 'Approved enterprise documents and shared team libraries.',
  },
  'google-drive': {
    type: 'Documents',
    docs: 0,
    coverage: 0,
    permission: 'Drive file permissions',
    description:
      'Shared documents awaiting renewed organization authorization.',
  },
  servicenow: {
    type: 'Knowledge base',
    docs: 5621,
    coverage: 92,
    permission: 'Knowledge roles',
    description: 'Published IT service articles and resolution guidance.',
  },
  salesforce: {
    type: 'CRM',
    docs: 9870,
    coverage: 61,
    permission: 'Object and record ACLs',
    description: 'Approved CRM records, account context and customer history.',
  },
  notion: {
    type: 'Wiki',
    docs: 2109,
    coverage: 79,
    permission: 'Workspace ACLs',
    description: 'Team knowledge, research notes and internal handbooks.',
  },
  onedrive: {
    type: 'Documents',
    docs: 1540,
    coverage: 74,
    permission: 'Shared folder ACLs',
    description: 'Organization-approved shared documents.',
  },
  api: {
    type: 'Custom API',
    docs: 860,
    coverage: 70,
    permission: 'Scoped read access',
    description: 'Organization-approved structured knowledge endpoint.',
  },
  zendesk: {
    type: 'Tickets',
    docs: 34218,
    coverage: 100,
    permission: 'Ticket visibility',
    description:
      'Published support articles and permission-filtered ticket resolutions.',
  },
};
