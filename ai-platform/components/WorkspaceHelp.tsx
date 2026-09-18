'use client';
import Link from 'next/link';
import {useAccount} from './AccountContext';
import {usePreviewValue} from './journeys/PreviewState';
import {demoProductRole, hasCapability} from '@/lib/product-access';

export default function WorkspaceHelp({compact=false}:{compact?:boolean}) {
  const account=useAccount();
  const [demoRole]=usePreviewValue('demo:role','Administrator');
  const role=account.mode==='demo'?demoProductRole(demoRole):account.workspace?.role;
  const operator=hasCapability(role,'operations:view');
  const admin=role==='Org Admin';
  if(compact) return <><strong>{admin?'Administrator help':operator?'AI Operator help':'Workspace help'}</strong><p>{admin?'Manage workspace access, organization settings and financial controls.':operator?'Prepare agents, review evaluations and follow daily operations.':'Discover specialists, use your agents and follow your work.'}</p><Link href="/workspace/help">Open Help →</Link></>;
  return <>
    <header><h1>Help</h1><p>Guidance for your {admin?'Administrator':operator?'AI Operator':'User'} access.</p></header>
    <div className="workspaceHelpGrid">
      <article className="panel"><h2>Workspace</h2><ol><li>Browse Discover to find a specialist for your task.</li><li>Open My Agents to review capabilities and connected sources.</li><li>Use an available agent and find your results in Work.</li><li>Follow your activity in Analytics and Reports.</li></ol><p>Need another capability or access? Send a request from the Agent’s Work tab. The Operations team reviews the request and prepares the agent.</p><Link href="/workspace/agents">Open My Agents →</Link></article>
      {operator&&<article className="panel"><h2>Daily Operations</h2><p>Prepare agents and skills, maintain knowledge and review requests from the workspace.</p><ol><li>Review agent configuration and required connections.</li><li>Use Evaluations to check results before deployment.</li><li>Follow deployments, AgentOps activity and operational reports.</li><li>Ask an Administrator for provider, access or policy changes.</li></ol><Link href="/operations">Open Operations →</Link></article>}
      {admin&&<article className="panel"><h2>Administration</h2><p>Use Settings for organization-wide controls.</p><ul><li>People & access: assign User, AI Operator or Administrator access.</li><li>Connections and Models: manage enterprise integrations and providers.</li><li>Governance and Audit Log: review policies, approvals and history.</li><li>FinOps: review available company usage and cost information.</li></ul><Link href="/settings">Open Settings →</Link></article>}
    </div>
    <p className="muted">Available actions depend on your workspace’s connected services and activation status.</p>
  </>;
}
