import {RegistrySurface} from '@/components/WorkspaceRegistry';
import AppShell from '@/components/AppShell';
import HybridDetail from '@/components/hybrid/Details';
import '@/app/surfaces.css';
export default function Page(){return <AppShell><RegistrySurface kind="agent" id="customer-service"><HybridDetail kind="agents" id="customer-service"/></RegistrySurface></AppShell>}
