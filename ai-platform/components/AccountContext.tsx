'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
type Workspace = { id: string; organization_id: string; organization_name: string; name: string; can_edit_agents: boolean; role?: string };
type Account = { error?: string; ready?: boolean; mode?: 'demo'; authenticated?: boolean; displayName?: string; workspaceId?: string; workspaces?: Workspace[] };
const Context = createContext<Account>({});
export function AccountProvider({children}: {children: ReactNode}) {
 const [account,setAccount] = useState<Account>({});
 useEffect(()=>{
  let active=true;
  const refresh=()=>fetch('/api/session',{cache:'no-store'}).then(async r=>{const value=await r.json();if(!r.ok)throw Error(value.error??'Workspace temporarily unavailable.');return value}).then(a=>{if(active)setAccount({...a, ready:true})}).catch(()=>{if(active)setAccount({ready:true,error:'Workspace access could not be loaded. Retry or sign in again.'})});
  refresh(); window.addEventListener('newneo-account-changed',refresh);
  return ()=>{active=false;window.removeEventListener('newneo-account-changed',refresh)};
 },[]);
 if (!account.ready) return <p role="status" style={{padding:24}}>Loading workspace…</p>;
 return <Context.Provider value={account}>{children}</Context.Provider>;
}
export function useAccount(){const account=useContext(Context);return {...account,workspace:account.workspaces?.find(w=>w.id===account.workspaceId) ?? (account.workspaces?.length===1?account.workspaces[0]:undefined)}}
