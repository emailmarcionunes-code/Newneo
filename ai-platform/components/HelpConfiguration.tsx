'use client';
import {useAccount} from './AccountContext';
import {useState} from 'react';
import Link from 'next/link';
import WorkspaceHelp from './WorkspaceHelp';
export default function HelpConfiguration(){
 const account=useAccount();
 const [role,setRole]=useState('Operator');
 return <section className="helpConfiguration"><header><h1>Configure Help</h1><p>Neo is available to everyone. Help topics follow each member’s assigned access automatically.</p></header><div className="panel"><h2>Help by access level</h2><p>User: Workspace guidance. AI Operator: Workspace and daily Operations. Administrator: all guidance, including organization settings and FinOps.</p><Link href={account.mode==='demo'?'/settings#team':'/settings#workspace-members'}>Manage member access →</Link><p>Use this preview to review the guidance for each role. Previewing does not change permissions or member settings.</p><label>Preview access level <select value={role} onChange={e=>setRole(e.target.value)}><option value="Operator">User</option><option value="AI Platform Admin">AI Operator</option><option value="Org Admin">Administrator</option></select></label></div><section className="helpPreview" aria-label="Help preview"><WorkspaceHelp previewRole={role}/></section></section>
}
