import WorkspaceMembers from '@/components/WorkspaceMembers';
import AppShell from '@/components/AppShell';
import {Settings} from '@/components/hybrid/Platform';
import '@/app/surfaces.css';
export default function Page(){return <AppShell><Settings/><WorkspaceMembers/></AppShell>}
