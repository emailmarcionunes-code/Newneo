'use client';
import type {ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {FilterChip} from '../UI';
import {PageTitle,Table,DetailLink,IconLabel,Status,Tag} from './UI';
export type AgentInventoryRow={id:string;templateId?:string;name:string;status:string;version:string;tasks:ReactNode;success:ReactNode;latency:ReactNode;model?:string;owner:string;deployed:string};
/** Approved Agents inventory composition shared by demo and authenticated workspaces. */
export default function AgentInventoryView({rows,description,action,search,onSearch,filter,onFilter,filters,note,children}:{rows:AgentInventoryRow[];description:string;action:ReactNode;search:string;onSearch:(value:string)=>void;filter:string;onFilter:(value:string)=>void;filters:string[];note?:ReactNode;children?:ReactNode}){
 const router=useRouter();
 return <div className="surfacePage hybridPage agentsPage"><PageTitle title="Agents" description={description}>{action}</PageTitle>{children}<Table toolbar={<div className="hybridControls"><input aria-label="Search agents" placeholder="Search agents…" value={search} onChange={e=>onSearch(e.target.value)}/><div className="filterRow">{filters.map(value=><FilterChip key={value} active={filter===value} onClick={()=>onFilter(value)}>{value}</FilterChip>)}</div></div>} caption="All agents" headers={['Agent','Status','Version','Tasks/day','Success','Latency','Model','Owner','Deployed']} onRowClick={i=>router.push(`/agents/${rows[i].id}`)} rows={rows.map(a=>[<DetailLink key={a.id} href={`/agents/${a.id}`}><IconLabel identity={a.templateId??a.id}>{a.name}</IconLabel></DetailLink>,<Status key="status">{a.status}</Status>,<span key="version" className="referenceMono">{a.version}</span>,a.tasks,a.success,a.latency,a.model?<Tag key="model">{a.model}</Tag>:'—',a.owner,<span key="deployed" className="referenceMono">{a.deployed}</span>])} emptyMessage="No agents match the selected filters."/>{note && <p className="hybridDataNote">{note}</p>}</div>
}
