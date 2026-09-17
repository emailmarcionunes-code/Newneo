 'use client';
import {useEffect,useState,type ReactNode} from 'react';
import Link from 'next/link';
import {useAccount} from './AccountContext';
import {Bot,Activity,ShieldCheck,Clock3,RefreshCw,TrendingUp} from 'lucide-react';
import './WorkspaceRegistry.css';
import {Metrics,PageTitle,Table,Status} from './hybrid/UI';
import {Tabs} from './journeys/Shared';
type Registry={agents:{id:string;name:string;archived_at?:string|null}[];skills:{archived_at?:string|null}[];agentVersions:{agent_id:string;number:number}[];audit:{id:string;kind:string;action:string;created_at:string}[]};
type Snapshot={registry?:Registry;documents?:number;reviews?:{pending:string;approved:string;total:string};evaluationRuns?:{results:{passed:boolean}[]}[];suites?:number};
export default function WorkspaceOverview({children}:{children:ReactNode}){const account=useAccount();if(account.mode==='demo')return <>{children}</>;if(!account.authenticated||!account.workspaceId)return <section className="surfacePage hybridPage registry"><h1>Welcome to NEWNEO</h1><p>Select your workspace to continue.</p><Link href="/welcome">Open your workspace →</Link></section>;return <Overview key={account.workspaceId} name={account.workspace?.organization_name??'Your organization'}/>}
function Overview({name}:{name:string}){
 const [data,setData]=useState<Snapshot>({});const [errors,setErrors]=useState<string[]>([]);const [loading,setLoading]=useState(true);const [reload,setReload]=useState(0);
 useEffect(()=>{const abort=new AbortController();setLoading(true);setErrors([]);
 const endpoints=[['Registry','/api/workspace/registry'],['Knowledge','/api/workspace/knowledge'],['Governance','/api/workspace/reviews'],['Evaluations','/api/workspace/retrieval-evaluations']];
 Promise.allSettled(endpoints.map(async ([label,url])=>{const r=await fetch(url,{cache:'no-store',signal:abort.signal});if(!r.ok)throw Error(`${label} could not be loaded`);return r.json()})).then(results=>{if(abort.signal.aborted)return;const value=(i:number)=>{const r=results[i];return r.status==='fulfilled'?r.value:undefined};setData({registry:value(0),documents:value(1)?.total,reviews:value(2)?.stats,evaluationRuns:value(3)?.runs,suites:value(3)?.suites?.length});setErrors(results.flatMap(r=>r.status==='rejected'?[r.reason.message]:[]));setLoading(false)});return()=>abort.abort()},[reload]);
 const agents=data.registry?.agents.filter(a=>!a.archived_at)??[];
 const labels:Record<string,string>={'version-created':'New version saved',created:'Configuration created',archived:'Configuration archived',restored:'Configuration restored'};
 const latest=data.evaluationRuns?.[0];const cases=latest?.results??[];const passed=cases.filter(c=>c.passed).length;
 return <div className="overviewFidelity liveWorkspaceOverview" data-reference="user-command-center-2026-09-16">
 <header className="overviewTitle"><div><h1>Command Center</h1><p>Platform health · {name}</p></div><button className="overviewRefresh" disabled={loading} onClick={()=>setReload(n=>n+1)}><RefreshCw size={15}/> {loading?'Refreshing…':'Refresh'}</button></header>
 {errors.length>0&&<p role="alert">{errors.join(' · ')}. <button className="button secondary" onClick={()=>setReload(n=>n+1)}>Retry</button></p>}
 <section className="overviewReferenceMetrics" aria-label="Key metrics">{[
 ['Agents live','—',`${agents.length} configured · Not deployed`,'blue'],
 ['Tasks today','—','No execution data','neutral'],
 ['Success rate','—','No execution data','neutral'],
 ['Avg latency','—','No execution data','neutral'],
 ['AI spend','—','Billing data unavailable','neutral'],
 ['Incidents','—','Monitoring not connected','neutral']
 ].map(([label,value,note,tone])=><article key={label}><h2>{label}</h2><strong className={tone}>{value}</strong><p>{note}</p></article>)}</section>
 <div className="overviewReferencePanels">
 <section className="overviewHealthPanel"><header><h2><Bot/>Agent Health</h2><Link href="/agents">View all →</Link></header>
 <ul className="overviewAgentList">{agents.map(a=><li key={a.id}><span className="overviewHealthDot warning" role="img" aria-label="Not deployed"/><Link className="overviewAgentIdentity" href={`/agents/${a.id}`}><strong>{a.name}</strong><small>Not deployed</small></Link><div><strong>v{Math.max(0,...(data.registry?.agentVersions??[]).filter(v=>v.agent_id===a.id).map(v=>v.number))}</strong><small>version</small></div><div><strong>—</strong><small>tasks</small></div><div><strong>—</strong><small>success</small></div><div><strong>—</strong><small>latency</small></div></li>)}</ul>
 {!agents.length&&<p className="liveOverviewEmpty">{loading?'Loading your agents…':data.registry?'Your agent configurations will appear here.':'Agent data unavailable.'}</p>}

 </section>
 <section className="overviewActivityPanel"><header><h2><Activity/>Activity</h2><Link href="/audit-log">View all →</Link></header><ul>{(data.registry?.audit??[]).slice(0,7).map(a=><li key={a.id}><span className="overviewEventDot blue"/><div><Link href="/audit-log">{labels[a.action]??a.action.replaceAll('-',' ')} · {a.kind}</Link><time dateTime={a.created_at}>{new Date(a.created_at).toLocaleString()}</time></div></li>)}</ul>{!data.registry?.audit.length&&<p className="liveOverviewEmpty">{loading?'Loading activity…':'No activity available.'}</p>}</section>
 <div className="overviewSummaryPanels">
 <section><h2><ShieldCheck/>Governance</h2><div className="overviewProgressLabel"><span>Compliance score</span><strong>—</strong></div><div className="overviewProgressFoot"><span>{data.reviews?.approved??'—'} approved reviews</span><span>{data.reviews?.pending??'—'} pending reviews</span></div><Link href="/governance">View governance →</Link></section>
 <section><h2><TrendingUp/>Evaluations</h2><div className="overviewProgressLabel"><span>Avg readiness</span><strong>—</strong></div><div className="overviewProgressFoot"><span>{data.suites??'—'} retrieval suites</span><span>{latest?`${passed}/${cases.length} source checks passed`:'No results yet'}</span></div><Link href="/evaluations">View evaluations →</Link></section>
 <section><h2><Clock3/>NEWNEO Insights</h2><Link className="overviewInsight" href="/deployments"><span>N</span><p>Your workspace is taking shape. Complete service activation and deployment validation to start processing live tasks.</p></Link></section>
 </div></div><p className="overviewDemoNote">Live workspace · Configuration and source-search data · AI execution pending activation</p></div>
}
export function WorkspaceOperation({children,title}:{children:ReactNode;title:string}) {
 const account=useAccount();const [tab,setTab]=useState('Tools');const [environment,setEnvironment]=useState('All');
 if(account.mode==='demo')return <>{children}</>;
 const tools=title==='Tools & MCP',deploy=title==='Deployments';
 return <section className={`surfacePage hybridPage registry ${deploy?'deploymentsPage':''}`}>
 <PageTitle title={title} description={tools?'Tool integrations and Model Context Protocol servers':deploy?'Agent deployment history and environment status':'Foundation models and approved endpoints'}><Link className="button secondary" href="/settings">Connection settings</Link></PageTitle>
 {tools?<><Metrics items={[["Connected tools","—","Connection not activated"],["MCP servers","—","Connection not activated"],["Tool calls (24h)","—"],["Success rate","—"]]}/><Tabs names={['Tools','MCP Servers']} current={tab} onChange={setTab}/><div role="tabpanel" id="journey-panel" aria-labelledby={`journey-tab-${tab==='Tools'?0:1}`}><Table caption={tab} headers={tab==='Tools'?['Tool','Provider','Permission','Risk','Status','Last used']:['Server','Version','Transport','Status','Tools']} rows={[]} emptyMessage={tab==='Tools'?'No live tool connections are available. Configure and validate a connection before enabling agent actions.':'No MCP servers are connected to this workspace.'}/></div></>:deploy?<><div className="environmentSummaryGrid">{['Production','Staging','Development'].map(name=><article key={name}><header><h2>{name}</h2><Status>Not connected</Status></header><p>No verified deployments</p></article>)}</div><div className="surfaceHeading"><h2>Deployment history</h2><div className="referenceSegments">{['All','Production','Staging','Development'].map(name=><button key={name} className={environment===name?'active':''} aria-pressed={environment===name} onClick={()=>setEnvironment(name)}>{name}</button>)}</div></div><Table caption="Deployment history" headers={['Agent','Version','Environment','Status','Deployed by','Deployed at']} rows={[]} emptyMessage={`No verified ${environment==='All'?'':environment.toLowerCase()+' '}deployments. Saved configurations are available in Agents.`}/><Link href="/agents">Review agent configurations →</Link></>:<Table caption="Model endpoints" headers={['Model','Provider','Context','Approval','Status']} rows={[]} emptyMessage="No validated model endpoints are connected to this workspace."/>}
 <p className="hybridDataNote">Live workspace · Service activation required</p></section>
}
