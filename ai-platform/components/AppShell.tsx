'use client';

import {usePathname} from 'next/navigation';
import Link from 'next/link';

const nav=[
  ['Overview','/'],['Agents','/agents'],['Knowledge','/knowledge'],['Tools & MCP','/tools'],['Models','/models'],['Evaluations','/evaluations'],['Deployments','/deployments'],['AgentOps','/agentops'],['Governance','/governance'],['Settings','/settings']
];

export default function AppShell({children}:{children:React.ReactNode}){
  const path=usePathname();
  return <div className="appShell">
    <aside className="sidebar">
      <div className="brand">newneo<span>•</span></div>
      <div className="brandSub">Enterprise AI Platform</div>
      <nav>{nav.map(([label,href])=><Link key={href} className={path===href||path.startsWith(href+'/')?'navItem active':'navItem'} href={href}>{label}</Link>)}</nav>
      <div className="workspaceCard"><div className="workspaceDot"/><div><b>Acme Corporation</b><span>Enterprise Workspace</span></div></div>
      <div className="sidebarFoot">Build. Deploy. Operate.</div>
    </aside>
    <section className="mainArea">
      <header className="topbar"><div className="search">Search agents, knowledge, tools, deployments…</div><div className="topActions"><span className="envPill">Production</span><div className="avatar">AM</div></div></header>
      <main className="content">{children}</main>
    </section>
  </div>
}
