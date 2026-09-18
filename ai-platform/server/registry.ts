import type {SqlClient, WorkspaceScope} from './agent-repository';
export type RegistryKind = 'agent' | 'skill';
export class RegistryError extends Error { constructor(public status:number,message:string){super(message)} }
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function field(v:unknown,max:number,required=false){if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw new RegistryError(400,'Check required fields and length limits.');return v.trim()}
function planField(v:unknown){
 if(v===undefined)return '[]';
 const raw=field(v,12000);let names:unknown;try{names=JSON.parse(raw)}catch{throw new RegistryError(400,'Invalid blueprint plan.')}
 if(!Array.isArray(names)||names.length>40||names.some(n=>typeof n!=='string'||!n.trim()||n.length>200)||new Set(names).size!==names.length)throw new RegistryError(400,'Invalid blueprint plan.');
 return JSON.stringify(names);
}
function modelProfileField(v:unknown){
 if(v===undefined)return '{}';const raw=field(v,2000);let p:Record<string,unknown>;try{p=JSON.parse(raw)}catch{throw new RegistryError(400,'Invalid model profile.')}
 if(!p||Array.isArray(p)||typeof p!=='object')throw new RegistryError(400,'Invalid model profile.');
 const allowed:Record<string,unknown>={};for(const [key,options] of Object.entries({reasoning:['high','medium'],latency:['fast','standard'],costSensitivity:['high','medium','low'],toolUse:['high','medium'],contextRequirement:['long','medium']})){if(p[key]!==undefined){if(!options.includes(String(p[key])))throw new RegistryError(400,'Invalid model requirements.');allowed[key]=p[key]}}
 for(const key of ['multimodal','private'])if(p[key]!==undefined){if(typeof p[key]!=='boolean')throw new RegistryError(400,'Invalid model requirements.');allowed[key]=p[key]}
 return JSON.stringify(allowed);
}
export function registryInput(value:unknown){
 if(!value||typeof value!=='object')throw new RegistryError(400,'Invalid configuration.');
 const v=value as Record<string,unknown>; if(v.kind!=='agent'&&v.kind!=='skill')throw new RegistryError(400,'Invalid resource type.');
 if(v.id!==undefined&&(typeof v.id!=='string'||!uuid.test(v.id)||!Number.isInteger(v.revision)||Number(v.revision)<1))throw new RegistryError(400,'Invalid resource revision.');
 if(!v.configuration||typeof v.configuration!=='object'||Array.isArray(v.configuration))throw new RegistryError(400,'Invalid configuration.');
 const c=v.configuration as Record<string,unknown>;
 const configuration=v.kind==='agent'?{mission:field(c.mission,2000,true),businessOwner:field(c.businessOwner??'',200),expectedVolume:field(c.expectedVolume??'',200),dataRestrictions:field(c.dataRestrictions??'',2000),targetUsers:field(c.targetUsers??'',500),infrastructure:field(c.infrastructure??'',100),model:field(c.model??'',200),governanceNotes:field(c.governanceNotes??'',2000),blueprintTemplateId:field(c.blueprintTemplateId??'custom',100),successMetrics:field(c.successMetrics??'',2000),criticality:field(c.criticality??'Medium',20),modelPreference:field(c.modelPreference??'Balanced',50),modelProfile:modelProfileField(c.modelProfile),environment:field(c.environment??'Staging',30),skillPlan:planField(c.skillPlan),knowledgePlan:planField(c.knowledgePlan),toolPlan:planField(c.toolPlan),governancePlan:planField(c.governancePlan),evaluationPlan:planField(c.evaluationPlan)}:{instructions:field(c.instructions,8000,true),domain:field(c.domain,100,true),inputDescription:field(c.inputDescription??'',2000),outputDescription:field(c.outputDescription??'',2000)};
 const ids=v.skillVersionIds??[]; if(!Array.isArray(ids)||ids.length>100||ids.some(id=>typeof id!=='string'||!uuid.test(id))||new Set(ids).size!==ids.length||(v.kind==='skill'&&ids.length))throw new RegistryError(400,'Invalid skill versions.');
 const documentIds=v.documentIds??[];if(!Array.isArray(documentIds)||documentIds.length>100||documentIds.some(id=>typeof id!=='string'||!uuid.test(id))||new Set(documentIds).size!==documentIds.length||(v.kind==='skill'&&documentIds.length))throw new RegistryError(400,'Invalid knowledge documents.');
 return {kind:v.kind,id:v.id as string|undefined,revision:v.revision as number|undefined,name:field(v.name,120,true),description:field(v.description??'',2000),configuration,skillVersionIds:ids as string[],documentIds:documentIds as string[]};
}
export async function registryAccess(db:SqlClient,s:WorkspaceScope){
 const r=await db.query(`SELECT role, newneo.can_author(organization_id,workspace_id) AS can_edit FROM newneo.workspace_memberships WHERE organization_id=$1 AND workspace_id=$2 AND identity_id=nullif(current_setting('newneo.identity_id',true),'')::uuid`,[s.organizationId,s.workspaceId]);
 if(!r.rows.length)throw new RegistryError(403,'Workspace unavailable.');return r.rows[0];
}
export async function readRegistry(db:SqlClient,s:WorkspaceScope){
 const access=await registryAccess(db,s); const result:Record<string,unknown>={access};
 for(const [key,table] of Object.entries({agents:'agents',skills:'skills',agentVersions:'agent_versions',skillVersions:'skill_versions',bindings:'skill_bindings',knowledgeBindings:'knowledge_bindings',audit:'registry_audit'}))result[key]=(await db.query(`SELECT * FROM newneo.${table} WHERE organization_id=$1 AND workspace_id=$2${key==='audit'?' ORDER BY created_at DESC LIMIT 50':''}`,[s.organizationId,s.workspaceId])).rows;
 result.documents=(await db.query('SELECT id,title,archived_at FROM newneo.knowledge_documents WHERE organization_id=$1 AND workspace_id=$2 ORDER BY title',[s.organizationId,s.workspaceId])).rows;
 return result;
}
// Caller owns the transaction: conflict, invalid binding and audit failures roll back together.
export async function saveRegistry(db:SqlClient,s:WorkspaceScope,actor:string,value:unknown){
 const v=registryInput(value);const access=await registryAccess(db,s);if(!access.can_edit)throw new RegistryError(403,'Your workspace role cannot create or edit configurations.');
 const scope=[s.organizationId,s.workspaceId];let id=v.id,revision=1;
 if(id){const old=await db.query(`SELECT revision,archived_at FROM newneo.${v.kind}s WHERE organization_id=$1 AND workspace_id=$2 AND id=$3 FOR UPDATE`,[...scope,id]);if(!old.rows.length)throw new RegistryError(404,'Resource unavailable.');if(old.rows[0].archived_at)throw new RegistryError(409,'Restore this archived configuration before editing.');if(old.rows[0].revision!==v.revision)throw new RegistryError(409,'A newer version exists. Reload before saving.');revision=Number(v.revision)+1;await db.query(`UPDATE newneo.${v.kind}s SET name=$4,description=$5,revision=revision+1,updated_at=now() WHERE organization_id=$1 AND workspace_id=$2 AND id=$3`,[...scope,id,v.name,v.description]);}
 else{id=String((await db.query(`INSERT INTO newneo.${v.kind}s(organization_id,workspace_id,name,description) VALUES($1,$2,$3,$4) RETURNING id`,[...scope,v.name,v.description])).rows[0].id)}
 const number=Number((await db.query(`SELECT coalesce(max(number),0)+1 AS n FROM newneo.${v.kind}_versions WHERE organization_id=$1 AND workspace_id=$2 AND ${v.kind}_id=$3`,[...scope,id])).rows[0].n);
 const versionId=String((await db.query(`INSERT INTO newneo.${v.kind}_versions(organization_id,workspace_id,${v.kind}_id,number,configuration,created_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,[...scope,id,number,JSON.stringify({...v.configuration,name:v.name,description:v.description}),actor])).rows[0].id);
 const seen=new Set<string>();for(const skillId of v.skillVersionIds){const skill=await db.query('SELECT v.skill_id FROM newneo.skill_versions v JOIN newneo.skills s ON s.id=v.skill_id AND s.organization_id=v.organization_id AND s.workspace_id=v.workspace_id WHERE v.organization_id=$1 AND v.workspace_id=$2 AND v.id=$3 AND s.archived_at IS NULL FOR SHARE OF s',[...scope,skillId]);if(!skill.rows.length||seen.has(String(skill.rows[0].skill_id)))throw new RegistryError(400,'Choose one available version per skill.');seen.add(String(skill.rows[0].skill_id));await db.query('INSERT INTO newneo.skill_bindings(organization_id,workspace_id,agent_version_id,skill_version_id) VALUES($1,$2,$3,$4)',[...scope,versionId,skillId]);}
 for(const documentId of v.documentIds){const doc=await db.query('SELECT id FROM newneo.knowledge_documents WHERE organization_id=$1 AND workspace_id=$2 AND id=$3 AND archived_at IS NULL FOR SHARE',[...scope,documentId]);if(!doc.rows.length)throw new RegistryError(400,'Choose available knowledge documents.');await db.query('INSERT INTO newneo.knowledge_bindings(organization_id,workspace_id,agent_version_id,document_id) VALUES($1,$2,$3,$4)',[...scope,versionId,documentId]);}
 await db.query('INSERT INTO newneo.registry_audit(organization_id,workspace_id,actor_id,kind,resource_id,version_id,action) VALUES($1,$2,$3,$4,$5,$6,$7)',[...scope,actor,v.kind,id,versionId,v.id?'version-created':'created']);
 return {id,revision,versionId,number};
}

export async function changeRegistry(db:SqlClient,s:WorkspaceScope,actor:string,value:unknown){
 const v=value as Record<string,unknown>|null;
 if(!v||!['archive','restore','restore-version'].includes(String(v.action))||(v.kind!=='agent'&&v.kind!=='skill')||typeof v.id!=='string'||!uuid.test(v.id)||!Number.isSafeInteger(v.revision)||Number(v.revision)<1)throw new RegistryError(400,'Invalid lifecycle action.');
 const access=await registryAccess(db,s);if(!access.can_edit)throw new RegistryError(403,'Your role cannot change configurations.');
 const args=[s.organizationId,s.workspaceId,v.id];const row=(await db.query(`SELECT revision,archived_at FROM newneo.${v.kind}s WHERE organization_id=$1 AND workspace_id=$2 AND id=$3 FOR UPDATE`,args)).rows[0];
 if(!row)throw new RegistryError(404,'Configuration unavailable.');if(row.revision!==v.revision)throw new RegistryError(409,'Configuration changed. Reload before saving.');
 if(v.action==='restore-version'){
  if(row.archived_at)throw new RegistryError(409,'Restore this archived configuration before editing.');
  if(typeof v.sourceVersionId!=='string'||!uuid.test(v.sourceVersionId))throw new RegistryError(400,'Invalid source version.');
  const source=(await db.query(`SELECT id,configuration FROM newneo.${v.kind}_versions WHERE organization_id=$1 AND workspace_id=$2 AND ${v.kind}_id=$3 AND id=$4`,[...args,v.sourceVersionId])).rows[0];if(!source)throw new RegistryError(404,'Source version unavailable.');
  const config=source.configuration as Record<string,unknown>;
  const skillVersionIds=v.kind==='agent'?(await db.query('SELECT skill_version_id FROM newneo.skill_bindings WHERE organization_id=$1 AND workspace_id=$2 AND agent_version_id=$3',[...args.slice(0,2),source.id])).rows.map(r=>r.skill_version_id):[];
  const documentIds=v.kind==='agent'?(await db.query('SELECT document_id FROM newneo.knowledge_bindings WHERE organization_id=$1 AND workspace_id=$2 AND agent_version_id=$3',[...args.slice(0,2),source.id])).rows.map(r=>r.document_id):[];
  return saveRegistry(db,s,actor,{kind:v.kind,id:v.id,revision:v.revision,name:config.name,description:config.description,configuration:config,skillVersionIds,documentIds});
 }
 const archive=v.action==='archive';if(Boolean(row.archived_at)===archive)return {id:v.id,revision:row.revision,changed:false};
 await db.query(`UPDATE newneo.${v.kind}s SET archived_at=${archive?'now()':'NULL'},revision=revision+1,updated_at=now() WHERE organization_id=$1 AND workspace_id=$2 AND id=$3`,args);
 await db.query('INSERT INTO newneo.registry_audit(organization_id,workspace_id,actor_id,kind,resource_id,action) VALUES($1,$2,$3,$4,$5,$6)',[s.organizationId,s.workspaceId,actor,v.kind,v.id,archive?'archived':'restored']);
 return {id:v.id,revision:Number(row.revision)+1,changed:true};
}
