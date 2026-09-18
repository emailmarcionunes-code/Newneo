'use client';
import {useAccount} from './AccountContext';
import Link from 'next/link';
import {Plug,Cpu,ShieldCheck,ScrollText,WalletCards,UsersRound} from 'lucide-react';
const sections=[
  {title:'People & access',description:'Users, workspace membership and access levels.',href:'#workspace-members',Icon:UsersRound},
  {title:'Connections',description:'Enterprise integrations and tool connections.',href:'/tools',Icon:Plug},
  {title:'Models',description:'Approved AI providers and model endpoints.',href:'/models',Icon:Cpu},
  {title:'Governance',description:'Policies, configuration reviews and approvals.',href:'/governance',Icon:ShieldCheck},
  {title:'Audit Log',description:'Organization access and configuration history.',href:'/audit-log',Icon:ScrollText},
  {title:'FinOps',description:'Company-wide usage, costs and financial controls.',href:'/finops',Icon:WalletCards},
];
export default function SettingsNavigation(){const account=useAccount();return <section className="settingsDirectory" aria-label="Administration settings"><header><h2>Settings</h2><p>Administrator controls · Operations focuses on day-to-day agent work.</p></header><div>{sections.map(({title,description,href,Icon})=><Link key={href} href={href==='#workspace-members'&&account.mode==='demo'?'/settings#team':href}><span className="referenceIcon"><Icon size={19} strokeWidth={1.5}/></span><span><strong>{title}</strong><small>{description}</small></span><span aria-hidden="true">→</span></Link>)}</div></section>}
