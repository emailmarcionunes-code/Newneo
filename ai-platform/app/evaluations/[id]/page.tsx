import {WorkspaceOperation} from '@/components/WorkspaceOverview';
import AppShell from '@/components/AppShell';
import HybridDetail from '@/components/hybrid/Details';
import '@/app/surfaces.css';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <AppShell><WorkspaceOperation title="Evaluations"><HybridDetail kind="evaluations" id={id}/></WorkspaceOperation></AppShell>}
