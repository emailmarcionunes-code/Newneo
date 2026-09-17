import WorkspaceOverview from '@/components/WorkspaceOverview';
import AppShell from '@/components/AppShell';
import {Overview} from '@/components/hybrid/Inventory';
import '@/app/surfaces.css';
export default function Page(){return <AppShell><WorkspaceOverview><Overview/></WorkspaceOverview></AppShell>}
