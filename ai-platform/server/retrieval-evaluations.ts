import {randomUUID} from 'node:crypto';
import type {SqlClient,WorkspaceScope} from './agent-repository';
import {registryAccess,RegistryError} from './registry';
import {runSourceQuery} from './source-runs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Case={query:string;expectedDocumentId:string};
export async function createRetrievalSuite(db:SqlClient,s:WorkspaceScope,actor:string,value:unknown){
 const access=await registryAccess(db,s);if(!access.can_edit)throw new RegistryError(403,'Your role cannot create evaluation suites.');
 const v=value as Record<string,unknown>|null;
 if(!v||typeof v.name!=='string'||!v.name.trim()||v.name.length>100||typeof v.agentVersionId!=='string'||!uuid.test(v.agentVersionId)||!Array.isArray(v.cases)||!v.cases.length||v.cases.length>10)throw new RegistryError(400,'Provide a suite name, agent version and 1–10 test cases.');
 const cases=v.cases.map((c:Case)=>{if(!c||typeof c.query!=='string'||!c.query.trim()||c.query.length>200||c.query.includes('\0')||typeof c.expectedDocumentId!=='string'||!uuid.test(c.expectedDocumentId))throw new RegistryError(400,'Each case needs search words and an expected source.');return {query:c.query.trim(),expectedDocumentId:c.expectedDocumentId}});
 if(new Set(cases.map(c=>c.query.toLocaleLowerCase())).size!==cases.length)throw new RegistryError(400,'Use a different query for each test case.');
 const args=[s.organizationId,s.workspaceId];await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,26))',[s.workspaceId]);
 const count=Number((await db.query('SELECT count(*) AS n FROM newneo.retrieval_suites WHERE organization_id=$1 AND workspace_id=$2',args)).rows[0].n);if(count>=200)throw new RegistryError(409,'Pilot suite limit reached.');
 const sources=(await db.query('SELECT d.id FROM newneo.agent_versions v JOIN newneo.agents a ON a.id=v.agent_id JOIN newneo.knowledge_bindings b ON b.agent_version_id=v.id JOIN newneo.knowledge_documents d ON d.id=b.document_id WHERE v.organization_id=$1 AND v.workspace_id=$2 AND v.id=$3 AND a.archived_at IS NULL AND d.archived_at IS NULL',[...args,v.agentVersionId])).rows.map(r=>r.id);
 if(!cases.every(c=>sources.includes(c.expectedDocumentId)))throw new RegistryError(409,'Every expected source must be active and pinned to this active agent version.');
 return (await db.query('INSERT INTO newneo.retrieval_suites(organization_id,workspace_id,agent_version_id,actor_id,name,cases) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[...args,v.agentVersionId,actor,v.name.trim(),JSON.stringify(cases)])).rows[0];
}
export async function runRetrievalEvaluation(db:SqlClient,s:WorkspaceScope,actor:string,value:unknown){
 await registryAccess(db,s);const args=[s.organizationId,s.workspaceId];if(!(await db.query('SELECT newneo.can_run_sources($1,$2) AS allowed',args)).rows[0].allowed)throw new RegistryError(403,'Your role cannot run evaluations.');
 const v=value as Record<string,unknown>|null;if(!v||typeof v.id!=='string'||!uuid.test(v.id)||typeof v.suiteId!=='string'||!uuid.test(v.suiteId))throw new RegistryError(400,'Provide an evaluation request ID and suite.');
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,26))',[s.workspaceId]);
 const previous=(await db.query('SELECT * FROM newneo.retrieval_evaluations WHERE organization_id=$1 AND workspace_id=$2 AND id=$3',[...args,v.id])).rows[0];if(previous){if(previous.suite_id!==v.suiteId||previous.actor_id!==actor)throw new RegistryError(409,'Request ID already used.');return {...previous,replayed:true}}
 const suite=(await db.query('SELECT * FROM newneo.retrieval_suites WHERE organization_id=$1 AND workspace_id=$2 AND id=$3',[...args,v.suiteId])).rows[0];if(!suite)throw new RegistryError(404,'Evaluation suite unavailable.');
 const count=Number((await db.query('SELECT count(*) AS n FROM newneo.retrieval_evaluations WHERE organization_id=$1 AND workspace_id=$2',args)).rows[0].n);if(count>=2000)throw new RegistryError(409,'Pilot evaluation history limit reached.');
 const results=[];
 for(const c of suite.cases as Case[]){const run=await runSourceQuery(db,s,actor,{id:randomUUID(),agentVersionId:suite.agent_version_id,query:c.query});const hits=run.result as {id:string}[];results.push({...c,runId:run.id,returnedDocumentIds:hits.map(h=>h.id),passed:hits.some(h=>h.id===c.expectedDocumentId)})}
 return (await db.query('INSERT INTO newneo.retrieval_evaluations(id,organization_id,workspace_id,suite_id,actor_id,results) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[v.id,...args,v.suiteId,actor,JSON.stringify(results)])).rows[0];
}
export async function readRetrievalEvaluations(db:SqlClient,s:WorkspaceScope,page=0){
 const access=await registryAccess(db,s);if(!Number.isSafeInteger(page)||page<0||page>10000)throw new RegistryError(400,'Invalid page.');const args=[s.organizationId,s.workspaceId];
 const suites=(await db.query("SELECT s.*,v.number,v.configuration->>'name' AS agent_name,a.archived_at FROM newneo.retrieval_suites s JOIN newneo.agent_versions v ON v.id=s.agent_version_id JOIN newneo.agents a ON a.id=v.agent_id WHERE s.organization_id=$1 AND s.workspace_id=$2 ORDER BY s.created_at DESC,s.id LIMIT 200",args)).rows;
 const runs=(await db.query('SELECT e.*,s.name FROM newneo.retrieval_evaluations e JOIN newneo.retrieval_suites s ON s.id=e.suite_id WHERE e.organization_id=$1 AND e.workspace_id=$2 ORDER BY e.created_at DESC,e.id LIMIT 25 OFFSET $3',[...args,page*25])).rows;
 const total=Number((await db.query('SELECT count(*) AS n FROM newneo.retrieval_evaluations WHERE organization_id=$1 AND workspace_id=$2',args)).rows[0].n);
 const allowed=(await db.query('SELECT newneo.can_run_sources($1,$2) AS allowed',args)).rows[0].allowed;
 return {suites,runs,total,page,access:{...access,can_run:Boolean(allowed)}};
}
