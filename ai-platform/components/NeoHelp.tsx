'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {usePathname} from 'next/navigation';
import {X,Send} from 'lucide-react';
import {useAccount} from './AccountContext';
import {usePreviewValue} from './journeys/PreviewState';
import {demoProductRole} from '@/lib/product-access';
import {answerNeoHelp} from '@/lib/neo-help';
type Message={from:'neo'|'user';text:string};
const greeting:Message={from:'neo',text:'How can I help you?'};
export default function NeoHelp(){
 const [open,setOpen]=useState(false);
 const [messages,setMessages]=useState<Message[]>([greeting]);
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
 useEffect(()=>{setMessages([greeting]);setDraft('');setTopic(undefined)},[role,account.workspaceId,account.mode]);
 useEffect(()=>{if(open)log.current?.scrollTo({top:log.current.scrollHeight})},[messages,open]);
 useEffect(()=>{
  if(!open)return;
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus()}};
  const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false)};
  document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);
  return()=>{document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside)};
 },[open]);
 const send=(e:FormEvent)=>{e.preventDefault();const text=draft.trim();if(!text)return;const reply=answerNeoHelp(text,role,topic);setMessages(m=>[...m.slice(-38),{from:'user',text},{from:'neo',text:reply.text}]);setTopic(reply.topic);setDraft('');input.current?.focus()};
 return <div className="neoHelp" ref={root}>
  {open&&<section id="neo-help-panel" role="dialog" aria-label="Neo Help" className="neoHelpPanel neoChatPanel"><header><div><strong>Neo</strong><span>Product guide · {role==='Org Admin'?'Administrator':role==='AI Platform Admin'?'AI Operator':'Workspace'}</span></div><button aria-label="Close Help" onClick={()=>{setOpen(false);trigger.current?.focus()}}><X size={18}/></button></header><div ref={log} className="neoChatMessages" role="log" aria-label="Conversation with Neo" aria-live="polite">{messages.map((m,i)=><div key={i} className={`neoChatMessage ${m.from}`}><span>{m.from==='neo'?'Neo':'You'}</span><p>{m.text}</p></div>)}</div><form className="neoChatComposer" onSubmit={send}><label className="sr-only" htmlFor="neo-help-question">Ask Neo</label><textarea ref={input} id="neo-help-question" aria-label="Ask Neo" value={draft} maxLength={1500} rows={2} placeholder="Ask a question… / Digite sua pergunta…" onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit()}}}/><button type="submit" aria-label="Send message to Neo" disabled={!draft.trim()}><Send size={18}/></button></form><p className="neoChatNotice">Guided help based on the product guide. No account actions. Don’t share passwords or secrets.</p></section>}
  <button ref={trigger} className="neoHelpTrigger" aria-label="How can I help you?" aria-expanded={open} aria-controls={open?'neo-help-panel':undefined} onPointerEnter={e=>{if(e.pointerType==='mouse')setOpen(true)}} onClick={()=>{setOpen(true);requestAnimationFrame(()=>input.current?.focus())}}><span className="neoHelpFace" aria-hidden="true"/></button>
 </div>
}
