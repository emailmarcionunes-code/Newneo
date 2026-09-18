import AppShell from '@/components/AppShell';
import Link from 'next/link';
import HelpConfiguration from '@/components/HelpConfiguration';
export default function Page(){return <AppShell><Link href="/settings">← Settings</Link><HelpConfiguration/></AppShell>}
