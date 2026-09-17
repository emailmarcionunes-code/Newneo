import {RegistrySurface} from '@/components/WorkspaceRegistry';
import AppShell from '@/components/AppShell';
import {Agents} from '@/components/hybrid/Inventory';
import '@/app/surfaces.css';
export default function Page(){return <AppShell><RegistrySurface kind="agent"><Agents/></RegistrySurface></AppShell>}
