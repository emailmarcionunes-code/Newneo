import AppShell from '@/components/AppShell';
import AgentIntroduction from '@/components/AgentIntroduction';
import {agentTemplates} from '@/lib/catalog';
import {notFound} from 'next/navigation';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!agentTemplates.some(a=>a.id===id))notFound();return <AppShell><AgentIntroduction templateId={id}/></AppShell>}
