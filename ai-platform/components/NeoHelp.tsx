'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {usePathname} from 'next/navigation';
import {X,Send,History,MessageCircle} from 'lucide-react';
import {useAccount} from './AccountContext';
import {usePreviewValue} from './journeys/PreviewState';
import {demoProductRole} from '@/lib/product-access';
import {answerNeoHelp} from '@/lib/neo-help';
type Exchange={id:number;question:string;answer:string};
export default function NeoHelp(){
 const [open,setOpen]=useState(false);
 const [history,setHistory]=useState<Exchange[]>([]);
 const [showHistory,setShowHistory]=useState(false);
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
 useEffect(()=>{setHistory([]);setShowHistory(false);setDraft('');setTopic(undefined)},[role,account.workspaceId,account.mode]);
 useEffect(()=>{if(open)log.current?.scrollTo({top:log.current.scrollHeight})},[history,open,showHistory]);
 useEffect(()=>{
  if(!open)return;
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus()}};
  const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false)};
  document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);
  return()=>{document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside)};
 },[open]);
 const send=(e:FormEvent)=>{e.preventDefault();const text=draft.trim();if(!text)return;const reply=answerNeoHelp(text,role,topic);setHistory(h=>[...h.slice(-19),{id:++nextId.current,question:text,answer:reply.text}]);setShowHistory(false);setTopic(reply.topic);setDraft('');input.current?.focus()};
 const latest=history.at(-1);
 return <div className="neoHelp" ref={root} onPointerEnter={cancelCollapse} onPointerLeave={e=>{if(e.pointerType==='mouse'){cancelCollapse();leaveTimer.current=setTimeout(()=>setOpen(false),180)}}}>
  {open&&<section id="neo-help-panel" role="dialog" aria-label="Neo Help" className="neoHelpPanel neoChatPanel"><header><div><strong>Neo</strong><span>Product guide · {role==='Org Admin'?'Administrator':role==='AI Platform Admin'?'AI Operator':'Workspace'}</span></div><button aria-label="Close Help" onClick={()=>{setOpen(false);trigger.current?.focus()}}><X size={18}/></button></header><nav className="neoChatTabs" aria-label="Help conversation views"><button type="button" aria-pressed={!showHistory} onClick={()=>setShowHistory(false)}><MessageCircle size={15}/>Chat</button><button type="button" aria-pressed={showHistory} onClick={()=>setShowHistory(true)}><History size={15}/>History ({history.length})</button></nav>{showHistory?<div className="neoChatHistory" aria-label="Question history"><p>Recent questions in this session</p>{history.length?[...history].reverse().map(item=><details key={item.id}><summary>{item.question}</summary><div><strong>Neo</strong><p>{item.answer}</p></div></details>):<p>No questions yet. Ask Neo to start a conversation.</p>}</div>:<div ref={log} className="neoChatMessages" role="log" aria-label="Conversation with Neo" aria-live="polite">{latest?<><div className="neoChatMessage user"><span>You</span><p>{latest.question}</p></div><div className="neoChatMessage neo"><span>Neo</span><p>{latest.answer}</p></div></>:<div className="neoChatMessage neo"><span>Neo</span><p>How can I help you?</p></div>}</div>}<form className="neoChatComposer" onSubmit={send}><label className="sr-only" htmlFor="neo-help-question">Ask Neo</label><textarea ref={input} id="neo-help-question" aria-label="Ask Neo" value={draft} maxLength={1500} rows={2} placeholder="Ask a question… / Digite sua pergunta…" onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit()}}}/><button type="submit" aria-label="Send message to Neo" disabled={!draft.trim()}><Send size={18}/></button></form><p className="neoChatNotice">Guided help based on the product guide. No account actions. Don’t share passwords or secrets.</p></section>}
  <button ref={trigger} className="neoHelpTrigger" aria-label="How can I help you?" aria-expanded={open} aria-controls={open?'neo-help-panel':undefined} onPointerEnter={e=>{if(e.pointerType==='mouse')setOpen(true)}} onClick={()=>{setOpen(true);requestAnimationFrame(()=>input.current?.focus())}}><span className="neoHelpFace" aria-hidden="true"/></button>
 </div>
}
