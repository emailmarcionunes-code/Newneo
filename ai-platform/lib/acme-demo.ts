'use client';
import {useEffect,useMemo,useState} from 'react';
import {hybridAgents} from './hybrid-data';

const scenarios = [
 ['customer-service','Where is order AC-2048?','Order fulfillment guide','Order AC-2048 has shipped. Tracking and delivery details were located in the fulfillment knowledge base.'],
 ['it-support','How do I restore VPN access?','Employee IT handbook','Verify the device certificate, reconnect using the corporate VPN profile and escalate recurring authentication failures to IT.'],
 ['knowledge-assistant','What is our travel reimbursement policy?','Acme travel policy','Submit receipts within 30 days. Manager approval is required for expenses outside the published regional limits.'],
 ['sales-assistant','Summarize the Northstar renewal opportunity','CRM account playbook','The renewal is scheduled for next month. Procurement requested a revised proposal and a security review.'],
 ['process-automation','Check purchase request PO-3812','Procurement operating procedure','Budget owner approval is complete. The purchase request is awaiting vendor onboarding verification.'],
 ['research-assistant','Compare customer feedback this month','Customer research digest','Customers most often request faster onboarding, clearer reporting and self-service access to account information.'],
 ['customer-service','Which returns qualify for a refund?','Returns and refunds policy','Eligible products can be returned within the policy window with proof of purchase and an approved return authorization.'],
 ['it-support','Prepare onboarding access for a new employee','Access provisioning checklist','The checklist includes identity verification, role-based access, device enrollment and manager approval.'],
 ['knowledge-assistant','Find the latest information security guidelines','Security policy library','The approved guidelines cover data classification, access reviews, incident reporting and retention.'],
 ['sales-assistant','Find approved enterprise pricing guidance','Sales enablement library','Use the current price book and submit non-standard discounts for commercial approval.'],
 ['process-automation','Review outstanding supplier documents','Supplier onboarding checklist','Tax registration and banking verification are available. The compliance questionnaire still requires review.'],
 ['research-assistant','Summarize market expansion findings','Market intelligence report','The research highlights demand in customer service, internal IT support and document-intensive operations.'],
];
/** Browser-only simulated tenant activity. Never writes to workspace APIs. */
export function useAcmeDemo(enabled:boolean){
 const [clock,setClock]=useState(0);
 useEffect(()=>{if(!enabled)return;const tick=()=>setClock(Date.now());tick();const timer=setInterval(tick,15000);return()=>clearInterval(timer)},[enabled]);
 return useMemo(()=>{
  const now=clock||Date.UTC(2026,8,18,12),bucket=Math.floor(now/15000);
  const work=Array.from({length:120},(_,i)=>{
   const index=(bucket-i+scenarios.length)%scenarios.length;
   const [agent_id,query,title,excerpt]=scenarios[index];
   const created_at=new Date(bucket*15000-(i<20?i*15000:20*15000+(i-19)*4*3600000)).toISOString();
   return {id:`acme-${bucket-i}`,query,agent_id,agent_name:hybridAgents.find(a=>a.id===agent_id)!.name,created_at,result:[{id:`source-${index}`,title,excerpt},{id:`reference-${index}`,title:'Acme operating standards',excerpt:'Use the approved workflow and retain supporting references with the work record.'}]};
  });
  const agents=hybridAgents.map((a,i)=>{const items=work.filter(w=>w.agent_id===a.id);return {id:a.id,name:a.name,searches:items.length,matched:items.filter(w=>w.result.length).length,latency:420+i*135,users:3+i,latest:items[0]?.created_at??new Date(now).toISOString()}});
  const days=new Map<string,number>();for(const w of work){const day=w.created_at.slice(0,10);days.set(day,(days.get(day)||0)+1)}
  return {work,agents,trend:[...days].sort(([a],[b])=>a.localeCompare(b)).map(([day,searches])=>({day,searches})),requests:[{id:'acme-request-1',status:'Pending review',created_at:new Date(now-3600000).toISOString()},{id:'acme-request-2',status:'Preparing sources',created_at:new Date(now-86400000).toISOString()}]};
 },[clock]);
}
export const acmeSources=(id:string)=>scenarios.filter(s=>s[0]===id).map((s,i)=>({id:`${id}-source-${i}`,title:s[2]}));
