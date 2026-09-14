import AppShell from '@/components/AppShell';
import Link from 'next/link';

const agents=[
  ['CS','Customer Service Agent','Answer questions, resolve issues and create tickets.',['Support','ITSM','FAQ']],
  ['IT','IT Support Agent','Help employees with IT issues and access requests.',['IT','Productivity','Access']],
  ['KA','Knowledge Assistant','Find and summarize information across the enterprise.',['Search','RAG','Enterprise']],
  ['SA','Sales Assistant','Support sales teams with insights and content.',['Sales','CRM','Enablement']],
  ['PA','Process Automation','Execute and monitor governed business processes.',['Operations','Workflow','Automation']],
  ['RA','Research Assistant','Analyze data and create structured insights.',['Research','Analytics','Reports']]
];

export default function Agents(){return <AppShell><div className="pageHead"><div><span className="eyebrow">Agent Catalog</span><h1>Start with an outcome, not a blank canvas.</h1><p>Choose an approved agent pattern and configure only what your use case needs. Advanced options remain available when they matter.</p></div><button className="button primary">+ Create Custom Agent</button></div><div className="filterRow"><button className="chip active">All</button><button className="chip">Featured</button><button className="chip">Customer Service</button><button className="chip">IT</button><button className="chip">Sales</button><button className="chip">HR</button><button className="chip">Finance</button><button className="chip">Operations</button></div><section className="agentGrid">{agents.map(([icon,name,desc,tags])=><article className="agentCard" key={name as string}><div className="agentIcon">{icon}</div><h3>{name}</h3><p>{desc}</p><div className="tags">{(tags as string[]).map(tag=><span className="tag" key={tag}>{tag}</span>)}</div><Link className="button secondary" href="/agents/launch">Use this agent →</Link></article>)}</section></AppShell>}
