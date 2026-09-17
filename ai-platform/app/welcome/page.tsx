'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useAccount} from '@/components/AccountContext';
import {NewneoWordmark} from '@/components/NewneoLogo';
import './welcome.css';
export default function Welcome(){
 const account=useAccount();const attempted=useRef(false);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function select(workspaceId:string){setBusy(true);setError('');try{const r=await fetch('/api/workspace/select',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspaceId})});if(!r.ok)throw Error('We could not open your workspace. Please try again.');window.location.replace('/')}catch(e){setError(e instanceof Error?e.message:'Please try again.');setBusy(false)}}
 useEffect(()=>{if(!account.ready||attempted.current)return;attempted.current=true;if(account.workspaceId&&account.workspaces?.some(w=>w.id===account.workspaceId)){window.location.replace('/');return}if(account.authenticated&&account.workspaces?.length===1)void select(account.workspaces[0].id)},[account.ready,account.authenticated,account.workspaceId,account.workspaces]);
 const single=account.workspaces?.length===1;
 return <main className="workspaceWelcome"><Link href="https://www.newneo.ai" aria-label="NEWNEO website"><NewneoWordmark/></Link><section>
 <span className="welcomeEyebrow">YOUR NEWNEO WORKSPACE</span>
 <h1>{account.error?'Let’s reconnect':!account.authenticated?'Welcome to NEWNEO':account.workspaces?.length?single?'Welcome back.':'Choose your workspace':'Your account is ready.'}</h1>
 <p>{account.error?'Your workspace access could not be loaded.':!account.authenticated?'Sign in with your work account to continue.':account.workspaces?.length?single?`Opening ${account.workspaces[0].organization_name}…`:'Select the organization you want to work with.':'Your organization has not assigned a workspace yet. Ask your administrator to send you an invitation.'}</p>
 {error&&<p role="alert">{error}</p>}
 {account.error?<button onClick={()=>window.location.reload()}>Try again</button>:!account.authenticated?<Link className="welcomePrimary" href="/login">Sign in →</Link>:<div>{account.workspaces?.map(w=><button disabled={busy} key={w.id} onClick={()=>select(w.id)}><strong>{w.organization_name}</strong><span>{w.name}</span><b>{busy?'Opening…':'Open workspace →'}</b></button>)}</div>}
 {account.authenticated&&!account.workspaces?.length&&<Link className="welcomePrimary" href="https://www.newneo.ai/contact">Contact NEWNEO →</Link>}
 <small>No additional profile form is required. Your workspace access is managed by your organization.</small>
 </section></main>
}
