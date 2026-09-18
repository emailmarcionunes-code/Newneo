import {createHash} from 'node:crypto';
import type {SqlClient,WorkspaceScope} from './agent-repository';
import {registryAccess,RegistryError} from './registry';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const scopeArgs=(s:WorkspaceScope)=>[s.organizationId,s.workspaceId];
async function permission(db:SqlClient,s:WorkspaceScope){await registryAccess(db,s);const permitted=(await db.query('SELECT newneo.can_run_sources($1,$2) AS allowed',scopeArgs(s))).rows[0].allowed;if(!permitted)throw new RegistryError(403,'Your role cannot run source queries or configuration checks.');}
async function version(db:SqlClient,s:WorkspaceScope,id:unknown){
 if(typeof id!=='string'||!uuid.test(id))throw new RegistryError(400,'Select an agent version.');
 const row=(await db.query('SELECT v.id,v.configuration FROM newneo.agent_versions v JOIN newneo.agents a ON a.id=v.agent_id AND a.organization_id=v.organization_id AND a.workspace_id=v.workspace_id WHERE v.organization_id=$1 AND v.workspace_id=$2 AND v.id=$3 AND a.archived_at IS NULL',[...scopeArgs(s),id])).rows[0];
 if(!row)throw new RegistryError(404,'Active agent version unavailable.');return row;
}
export async function runSourceQuery(db:SqlClient,s:WorkspaceScope,actor:string,value:unknown){
 await permission(db,s);const v=value as Record<string,unknown>|null;
 if(!v||typeof v.id!=='string'||!uuid.test(v.id)||typeof v.query!=='string'||!v.query.trim()||v.query.length>200||v.query.includes('\0')||typeof v.agentVersionId!=='string'||!uuid.test(v.agentVersionId))throw new RegistryError(400,'Provide a request ID, agent version and query of up to 200 characters.');
 const query=v.query.trim();const hash=createHash('sha256').update(JSON.stringify([v.agentVersionId,query])).digest('hex');const args=scopeArgs(s);
 // Serialize per workspace for idempotency and bounded pilot retention.
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,23))',[s.workspaceId]);
 const prior=(await db.query('SELECT * FROM newneo.source_runs WHERE organization_id=$1 AND workspace_id=$2 AND id=$3',[...args,v.id])).rows[0];
 if(prior){if(prior.request_hash!==hash||prior.actor_id!==actor)throw new RegistryError(409,'Request ID already used for another operation.');return {...prior,replayed:true};}
 await version(db,s,v.agentVersionId);
 const count=Number((await db.query('SELECT count(*) AS n FROM newneo.source_runs WHERE organization_id=$1 AND workspace_id=$2',args)).rows[0].n);if(count>=10000)throw new RegistryError(409,'Pilot run history limit reached. Contact the platform administrator.');
 const docs=(await db.query('SELECT d.id FROM newneo.knowledge_bindings b JOIN newneo.knowledge_documents d ON d.id=b.document_id AND d.organization_id=b.organization_id AND d.workspace_id=b.workspace_id WHERE b.organization_id=$1 AND b.workspace_id=$2 AND b.agent_version_id=$3 AND d.archived_at IS NULL',[...args,v.agentVersionId])).rows;
 if(!docs.length)throw new RegistryError(409,'This version has no active knowledge sources. Save a new agent version with approved documents.');
 const started=Date.now();
 const hits=(await db.query("SELECT id,title,left(body,1200) AS excerpt FROM newneo.knowledge_documents WHERE organization_id=$1 AND workspace_id=$2 AND id=ANY($3::uuid[]) AND archived_at IS NULL AND search_vector @@ plainto_tsquery('simple',$4) ORDER BY ts_rank(search_vector,plainto_tsquery('simple',$4)) DESC,id LIMIT 5",[...args,docs.map(d=>d.id),query])).rows;
 return (await db.query('INSERT INTO newneo.source_runs(id,organization_id,workspace_id,agent_version_id,actor_id,query,request_hash,result,duration_ms) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',[v.id,...args,v.agentVersionId,actor,query,hash,JSON.stringify(hits),Date.now()-started])).rows[0];
}
export async function checkConfiguration(db:SqlClient,s:WorkspaceScope,actor:string,value:unknown){
 await permission(db,s);const input=value as Record<string,unknown>|null;const row=await version(db,s,input?.agentVersionId);const args=[...scopeArgs(s),row.id];
 const sources=(await db.query('SELECT d.id,d.archived_at FROM newneo.knowledge_bindings b JOIN newneo.knowledge_documents d ON d.id=b.document_id AND d.organization_id=b.organization_id AND d.workspace_id=b.workspace_id WHERE b.organization_id=$1 AND b.workspace_id=$2 AND b.agent_version_id=$3',args)).rows;
 const skills=(await db.query('SELECT s.id,s.archived_at FROM newneo.skill_bindings b JOIN newneo.skill_versions v ON v.id=b.skill_version_id JOIN newneo.skills s ON s.id=v.skill_id WHERE b.organization_id=$1 AND b.workspace_id=$2 AND b.agent_version_id=$3',args)).rows;
 const checks=[
  {name:'Business mission',passed:Boolean((row.configuration as Record<string,unknown>).mission),detail:'Mission recorded in this immutable version.'},
  {name:'Knowledge available',passed:sources.length>0&&sources.every(d=>!d.archived_at),detail:`${sources.length} linked sources; ${sources.filter(d=>d.archived_at).length} archived.`},
  {name:'Skills available',passed:skills.length>0&&skills.every(d=>!d.archived_at),detail:`${skills.length} pinned skills; ${skills.filter(d=>d.archived_at).length} archived.`},
 ];
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,24))',[s.workspaceId]);
 const n=Number((await db.query('SELECT count(*) AS n FROM newneo.configuration_checks WHERE organization_id=$1 AND workspace_id=$2',scopeArgs(s))).rows[0].n);if(n>=10000)throw new RegistryError(409,'Pilot check history limit reached.');
 return (await db.query('INSERT INTO newneo.configuration_checks(organization_id,workspace_id,agent_version_id,actor_id,checks) VALUES($1,$2,$3,$4,$5) RETURNING *',[...args,actor,JSON.stringify(checks)])).rows[0];
}
export async function readSourceRuns(db:SqlClient,s:WorkspaceScope,page=0){
 const access=await registryAccess(db,s);if(!Number.isSafeInteger(page)||page<0||page>10000)throw new RegistryError(400,'Invalid page.');const args=scopeArgs(s);
 const allowed=(await db.query('SELECT newneo.can_run_sources($1,$2) AS allowed',args)).rows[0].allowed;
 const total=Number((await db.query('SELECT count(*) AS n FROM newneo.source_runs WHERE organization_id=$1 AND workspace_id=$2',args)).rows[0].n);
 const runs=(await db.query('SELECT r.*,v.number,v.configuration->>\'name\' AS agent_name FROM newneo.source_runs r JOIN newneo.agent_versions v ON v.id=r.agent_version_id WHERE r.organization_id=$1 AND r.workspace_id=$2 ORDER BY r.created_at DESC,r.id LIMIT 25 OFFSET $3',[...args,page*25])).rows;
 const checks=(await db.query("SELECT c.*,v.number,v.configuration->>'name' AS agent_name FROM newneo.configuration_checks c JOIN newneo.agent_versions v ON v.id=c.agent_version_id WHERE c.organization_id=$1 AND c.workspace_id=$2 ORDER BY c.created_at DESC,c.id LIMIT 25",args)).rows;
 const stats=(await db.query("SELECT count(*) AS runs_24h,count(*) FILTER(WHERE jsonb_array_length(result)>0) AS matched_24h,round(avg(duration_ms)) AS avg_search_ms FROM newneo.source_runs WHERE organization_id=$1 AND workspace_id=$2 AND created_at>=now()-interval '24 hours'",args)).rows[0];
 return {access:{...access,can_run:Boolean(allowed)},total,page,runs,checks,stats};
}
