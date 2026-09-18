'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {X} from 'lucide-react';
import WorkspaceHelp from './WorkspaceHelp';
export default function NeoHelp(){
 const [open,setOpen]=useState(false);
 const root=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const close=useRef<HTMLButtonElement>(null);
 const path=usePathname();
 useEffect(()=>setOpen(false),[path]);
 useEffect(()=>{
  if(!open)return;
  close.current?.focus();
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus()}};
  const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false)};
  document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);
  return()=>{document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside)};
 },[open]);
 return <div className="neoHelp" ref={root}>
  {open&&<section id="neo-help-panel" role="dialog" aria-label="Neo Help" className="neoHelpPanel"><header><div><strong>Neo</strong><span>Your NEWNEO guide</span></div><button ref={close} aria-label="Close Help" onClick={()=>{setOpen(false);trigger.current?.focus()}}><X size={18}/></button></header><div className="neoHelpBody"><WorkspaceHelp compact/></div></section>}
  <button ref={trigger} className="neoHelpTrigger" aria-label="Help with Neo" aria-expanded={open} aria-controls={open?'neo-help-panel':undefined} onClick={()=>setOpen(!open)}><span className="neoHelpFace" aria-hidden="true"/><span>Help</span></button>
 </div>
}
