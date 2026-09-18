import {createHash} from 'node:crypto';
import type {SqlClient,WorkspaceScope} from './agent-repository';
import {registryAccess,RegistryError} from './registry';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function documentInput(value:unknown){
 const v=value as Record<string,unknown>|null;
 if(!v||typeof v.title!=='string'||!v.title.trim()||v.title.length>160||typeof v.body!=='string'||!v.body.trim()||Buffer.byteLength(v.body)>20000||v.body.includes('\0'))throw new RegistryError(400,'Provide a title and plain text up to 20 KB.');
 const body=v.body.trim();return {title:v.title.trim(),body,checksum:createHash('sha256').update(body).digest('hex')};
}
export async function readKnowledge(db:SqlClient,s:WorkspaceScope,params:URLSearchParams){
 const access=await registryAccess(db,s);const scope=[s.organizationId,s.workspaceId];const q=(params.get('q')??'').trim();
 if(q.length>200)throw new RegistryError(400,'Search is limited to 200 characters.');
 const page=Number(params.get('page')??0);if(!Number.isSafeInteger(page)||page<0||page>10000)throw new RegistryError(400,'Invalid page.');
 const id=params.get('id');if(id&&!uuid.test(id))throw new RegistryError(400,'Invalid document.');
 if(id){const row=(await db.query('SELECT id,title,body,checksum,created_at,archived_at FROM newneo.knowledge_documents WHERE organization_id=$1 AND workspace_id=$2 AND id=$3',[...scope,id])).rows[0];if(!row)throw new RegistryError(404,'Document unavailable.');return {document:row,access}}
 const where="organization_id=$1 AND workspace_id=$2 AND archived_at IS NULL AND ($3='' OR search_vector @@ plainto_tsquery('simple',$3))";
 const total=Number((await db.query(`SELECT count(*) AS count FROM newneo.knowledge_documents WHERE ${where}`,[...scope,q])).rows[0].count);
 const documents=(await db.query(`SELECT id,title,checksum,created_at,octet_length(body) AS bytes,substring(body,1,240) AS excerpt FROM newneo.knowledge_documents WHERE ${where} ORDER BY ts_rank(search_vector,plainto_tsquery('simple',$3)) DESC,created_at DESC,id LIMIT 25 OFFSET $4`,[...scope,q,page*25])).rows;
 const audit=(await db.query('SELECT id,document_id,action,created_at FROM newneo.knowledge_audit WHERE organization_id=$1 AND workspace_id=$2 ORDER BY created_at DESC LIMIT 20',scope)).rows;
 return {documents,total,page,access,audit};
}
export async function mutateKnowledge(db:SqlClient,s:WorkspaceScope,actor:string,value:unknown){
 const access=await registryAccess(db,s);if(!access.can_edit)throw new RegistryError(403,'Your role cannot change knowledge.');
 const v=value as Record<string,unknown>|null;const scope=[s.organizationId,s.workspaceId];
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,7))',[s.workspaceId]);
 if(v?.action==='archive'){
  if(typeof v.id!=='string'||!uuid.test(v.id))throw new RegistryError(400,'Invalid document.');
  const row=(await db.query('UPDATE newneo.knowledge_documents SET archived_at=now() WHERE organization_id=$1 AND workspace_id=$2 AND id=$3 AND archived_at IS NULL RETURNING id',[...scope,v.id])).rows[0];
  if(!row)throw new RegistryError(404,'Active document unavailable.');
  await db.query("INSERT INTO newneo.knowledge_audit(organization_id,workspace_id,document_id,actor_id,action) VALUES($1,$2,$3,$4,'archived')",[...scope,v.id,actor]);return {id:v.id,archived:true};
 }
 if(v?.action!=='import')throw new RegistryError(400,'Invalid action.');const input=documentInput(v);
 const prior=(await db.query('SELECT id,archived_at FROM newneo.knowledge_documents WHERE organization_id=$1 AND workspace_id=$2 AND checksum=$3',[...scope,input.checksum])).rows[0];
 if(prior)throw new RegistryError(409,'This content already exists in the workspace, including archived documents.');
 const total=Number((await db.query('SELECT count(*) AS count FROM newneo.knowledge_documents WHERE organization_id=$1 AND workspace_id=$2',scope)).rows[0].count);
 if(total>=1000)throw new RegistryError(409,'Pilot document capacity reached. Contact your administrator.');
 const id=String((await db.query('INSERT INTO newneo.knowledge_documents(organization_id,workspace_id,title,body,checksum,created_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',[...scope,input.title,input.body,input.checksum,actor])).rows[0].id);
 await db.query("INSERT INTO newneo.knowledge_audit(organization_id,workspace_id,document_id,actor_id,action) VALUES($1,$2,$3,$4,'imported')",[...scope,id,actor]);return {id};
}
