'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {usePathname} from 'next/navigation';
import {X,Send} from 'lucide-react';
import {useAccount} from './AccountContext';
import {usePreviewValue} from './journeys/PreviewState';
import {demoProductRole} from '@/lib/product-access';
import {answerNeoHelp} from '@/lib/neo-help';
import {neoDay,readNeoMemory,nextNeoMidnight,type NeoExchange} from '@/lib/neo-help-memory';
export default function NeoHelp(){
 const [open,setOpen]=useState(false);
 const [history,setHistory]=useState<NeoExchange[]>([]);
 const [latest,setLatest]=useState<NeoExchange>();
 const [memoryReady,setMemoryReady]=useState(false);
 const day=useRef(neoDay());
 const leaveTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const nextId=useRef(0);
 const cancelCollapse=()=>{if(leaveTimer.current){clearTimeout(leaveTimer.current);leaveTimer.current=null}};
 const [draft,setDraft]=useState('');
 const [topic,setTopic]=useState<string>();
 const account=useAccount();
 const [demoRole]=usePreviewValue('demo:role','Administrator');
 const role=account.mode==='demo'?demoProductRole(demoRole):account.workspace?.role;
 const root=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const input=useRef<HTMLTextAreaElement>(null);
 const log=useRef<HTMLDivElement>(null);
 const path=usePathname();
 useEffect(()=>setOpen(false),[path]);
 useEffect(()=>()=>{if(leaveTimer.current)clearTimeout(leaveTimer.current)},[]);
 const memoryKey=JSON.stringify(['newneo:neo-help:v1',account.mode??'live',account.workspaceId??'',account.displayName??'demo',role??'']);
 useEffect(()=>{
  const today=neoDay();day.current=today;
  let restored:NeoExchange[]=[];
  try{restored=readNeoMemory(localStorage.getItem(memoryKey),today);localStorage.setItem(memoryKey,JSON.stringify({day:today,exchanges:restored}))}catch{}
  setHistory(restored);setLatest(undefined);nextId.current=restored.reduce((n,x)=>Math.max(n,x.id),0);setTopic(restored.at(-1)?.topic);setDraft('');setMemoryReady(true);
  let timer:ReturnType<typeof setTimeout>;
  const check=()=>{
   const current=neoDay();
   if(current!==day.current){day.current=current;setHistory([]);setLatest(undefined);setTopic(undefined);setDraft('');try{localStorage.setItem(memoryKey,JSON.stringify({day:current,exchanges:[]}))}catch{}}
   clearTimeout(timer);timer=setTimeout(check,nextNeoMidnight()+50);
  };
  check();window.addEventListener('focus',check);document.addEventListener('visibilitychange',check);
  return()=>{clearTimeout(timer);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check)};
 },[memoryKey]);
 useEffect(()=>{if(open)log.current?.scrollTo({top:log.current.scrollHeight})},[history,open]);
 useEffect(()=>{
  if(!open)return;
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus()}};
  const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false)};
  document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);
  return()=>{document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside)};
 },[open]);
 const send=(e:FormEvent)=>{
  e.preventDefault();const text=draft.trim();if(!text||!memoryReady)return;
  const today=neoDay();const previous=today===day.current?history:[];
  const recall=/\b(antes|anterior|anteriores|relembre|lembra|previous|earlier|remember)\b/i.test(text);
  const reply=recall?{text:previous.length?`Hoje você perguntou: ${previous.slice(-5).map(x=>`“${x.question}”`).join('; ')}. Quer retomar algum desses assuntos?`:'Ainda não há perguntas anteriores neste dia. Como posso ajudar?',topic:previous.at(-1)?.topic}:answerNeoHelp(text,role,today===day.current?topic:undefined);
  const updated=[...previous.slice(-19),{id:++nextId.current,question:text,answer:reply.text,topic:reply.topic}];
  day.current=today;setHistory(updated);setLatest(updated.at(-1));setTopic(reply.topic);setDraft('');
  try{localStorage.setItem(memoryKey,JSON.stringify({day:today,exchanges:updated}))}catch{}
  input.current?.focus();
 };
 return <div className="neoHelp" ref={root} onPointerEnter={cancelCollapse} onPointerLeave={e=>{if(e.pointerType==='mouse'){cancelCollapse();leaveTimer.current=setTimeout(()=>setOpen(false),180)}}}>
  {open&&<section id="neo-help-panel" role="dialog" aria-label="Neo Help" className="neoHelpPanel neoChatPanel"><header><div><strong>Neo</strong><span>Product guide · {role==='Org Admin'?'Administrator':role==='AI Platform Admin'?'AI Operator':'Workspace'}</span></div><button aria-label="Close Help" onClick={()=>{setOpen(false);trigger.current?.focus()}}><X size={18}/></button></header><div ref={log} className="neoChatMessages" role="log" aria-label="Conversation with Neo" aria-live="polite">{latest?<><div className="neoChatMessage user"><span>You</span><p>{latest.question}</p></div><div className="neoChatMessage neo"><span>Neo</span><p>{latest.answer}</p></div></>:<div className="neoChatMessage neo"><span>Neo</span><p>Como posso ajudar?</p></div>}</div><form className="neoChatComposer" onSubmit={send}><label className="sr-only" htmlFor="neo-help-question">Ask Neo</label><textarea ref={input} id="neo-help-question" aria-label="Ask Neo" value={draft} maxLength={1500} rows={2} placeholder="Ask a question… / Digite sua pergunta…" onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit()}}}/><button type="submit" aria-label="Send message to Neo" disabled={!draft.trim()||!memoryReady}><Send size={18}/></button></form><p className="neoChatNotice">Ajuda guiada · Memória neste navegador, renovada à meia-noite. Não envie senhas ou segredos.</p></section>}
  <button ref={trigger} className="neoHelpTrigger" aria-label="Como posso ajudar?" aria-expanded={open} aria-controls={open?'neo-help-panel':undefined} onPointerEnter={e=>{if(e.pointerType==='mouse')setOpen(true)}} onClick={()=>{setOpen(true);requestAnimationFrame(()=>input.current?.focus())}}><span className="neoHelpFace" aria-hidden="true"/></button>
 </div>
}
