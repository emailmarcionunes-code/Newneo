'use client';
import type {ReactNode} from 'react';
import {PageTitle, Metrics} from './UI';
import {Tabs, Panel} from '../journeys/Shared';
export const skillViews=['List','Pipeline','Matrix','Intelligence'];
/** Shared visual shell; each mode supplies its own data and actions. */
export default function SkillInventoryLayout({metrics,action,note,view,onView,children}:{metrics:[string,string,string?][];action:ReactNode;note?:ReactNode;view:string;onView:(view:string)=>void;children:ReactNode}) {
 return <div className="surfacePage hybridPage skillsWorkspace"><PageTitle title="Skills" description="Skills your agents can use.">{action}</PageTitle><Metrics items={metrics}/>{note && <p className="skillsDemoNote">{note}</p>}<Tabs names={skillViews} current={view} onChange={onView}/><Panel names={skillViews} current={view}>{children}</Panel></div>;
}
