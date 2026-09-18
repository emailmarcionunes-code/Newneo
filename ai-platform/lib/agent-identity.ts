/** Presentation only. Identity does not imply readiness, permissions or execution. */
export const agentIdentities = {
  'customer-service': ['service', 'Customer Service Agent'],
  'it-support': ['it', 'IT Support Agent'],
  'knowledge-assistant': ['assistant', 'Knowledge Assistant'],
  'sales-assistant': ['sales', 'Sales Assistant'],
  'process-automation': ['automation', 'Process Automation'],
  'research-assistant': ['research', 'Research Assistant'],
  'customer-feedback': ['service', 'Voice of Customer Agent'],
  'customer-onboarding': ['service', 'Customer Onboarding Agent'],
  'incident-response': ['it', 'Incident Response Agent'],
  'access-requests': ['it', 'Access Request Agent'],
  'revenue-intelligence': ['sales', 'Revenue Intelligence Agent'],
  'sales-enablement': ['sales', 'Sales Enablement Agent'],
  'employee-onboarding': ['assistant', 'Employee Onboarding Agent'],
  'employee-self-service': ['assistant', 'Employee Self-Service Agent'],
  procurement: ['automation', 'Procurement Agent'],
  'invoice-review': ['research', 'Invoice Review Agent'],
  'compliance-monitor': ['research', 'Compliance Monitor'],
  'operations-planning': ['automation', 'Operations Planning Agent'],
  'marketing-insights': ['research', 'Marketing Insights Agent'],
  'content-review': ['research', 'Content Review Agent'],
} as const;
export function agentIdentity(identity?: string, name = '', fallback = 'automation') {
  const match = Object.entries(agentIdentities).find(([id, [,label]]) => id === identity || label.toLowerCase() === name.toLowerCase());
  if (match) return { key: match[0], type: match[1][0] };
  if (/document|knowledge|conhecimento|pesquisa documental/i.test(name)) return { key: 'knowledge-assistant', type: 'assistant' };
  return { key: fallback, type: fallback };
}
