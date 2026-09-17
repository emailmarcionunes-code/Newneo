import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {saveAgentRequest} from '../server/agent-requests';
import {registryInput,saveRegistry,readRegistry} from '../server/registry';
const agent={kind:'agent',name:'GAW assistant',description:'Support',configuration:{mission:'Answer questions',businessOwner:'GAW',targetUsers:'Team'}};
const skill={kind:'skill',name:'Document answers',description:'Answer from sources',configuration:{domain:'Knowledge',instructions:'Use verified documents and cite sources.'}};
test('registry rejects malformed configuration and strips untrusted runtime fields',()=>{
 assert.throws(()=>registryInput({...skill,name:''}));assert.throws(()=>registryInput({...agent,skillVersionIds:['invalid']}));
 assert.throws(()=>registryInput({...skill,configuration:{instructions:'x',domain:''}}));
 const result=registryInput({...agent,configuration:{...agent.configuration,provider:'unsafe',deployed:true}});
 assert.equal('provider' in result.configuration,false);assert.equal('deployed' in result.configuration,false);
});
test('versioned registry enforces tenant, role, optimistic locking and pinned snapshots',async()=>{
 const db=new PGlite();try{
 await db.exec('CREATE ROLE newneo_app');
 for(const file of ['001_platform.sql','002_identity_and_drafts.sql','005_account_profiles.sql','006_versioned_registry.sql','007_knowledge.sql','008_workspace_members.sql','009_registry_lifecycle.sql','021_agent_requests.sql'])await db.exec(await readFile(new URL('../db/migrations/'+file,import.meta.url),'utf8'));
 await db.exec('GRANT USAGE ON SCHEMA newneo TO newneo_app; GRANT SELECT ON newneo.identities,newneo.workspaces,newneo.workspace_memberships TO newneo_app; GRANT SELECT,INSERT,UPDATE ON newneo.agents,newneo.drafts TO newneo_app');
 const orgs=(await db.query<{id:string}>("INSERT INTO newneo.organizations(name) VALUES('A'),('B') RETURNING id")).rows;
 const work=async(org:string)=>(await db.query<{id:string}>("INSERT INTO newneo.workspaces(organization_id,name) VALUES($1,'Main') RETURNING id",[org])).rows[0].id;
 const a={organizationId:orgs[0].id,workspaceId:await work(orgs[0].id)},b={organizationId:orgs[1].id,workspaceId:await work(orgs[1].id)};
 const users=(await db.query<{id:string}>("INSERT INTO newneo.identities(issuer,subject) VALUES('https://example.test','editor'),('https://example.test','reader'),('https://example.test','other') RETURNING id")).rows;
 for(const [scope,user,edit,role] of [[a,users[0].id,true,'AI Engineer'],[a,users[1].id,false,'Read Only'],[b,users[2].id,true,'AI Engineer']] as const)await db.query('INSERT INTO newneo.workspace_memberships(organization_id,workspace_id,identity_id,can_edit_agents,role) VALUES($1,$2,$3,$4,$5)',[scope.organizationId,scope.workspaceId,user,edit,role]);
 await db.exec('SET ROLE newneo_app');
 async function tx<T>(user:string,fn:()=>Promise<T>){await db.exec('BEGIN');try{await db.query("SELECT set_config('newneo.identity_id',$1,true)",[user]);const value=await fn();await db.exec('COMMIT');return value}catch(e){await db.exec('ROLLBACK');throw e}}
 const editor=users[0].id,reader=users[1].id;
 const brief={outcome:'Request test',department:'IT',targetUsers:'Employees',systems:'ITSM',volume:'100/day',sensitivity:'Internal'};
 await tx(editor,()=>saveAgentRequest(db,a,editor,brief));
 assert.equal((await tx(editor,()=>db.query('SELECT id FROM newneo.agent_requests'))).rows.length,1);
 assert.equal((await tx(users[2].id,()=>db.query('SELECT id FROM newneo.agent_requests'))).rows.length,0);
 await assert.rejects(tx(reader,()=>saveAgentRequest(db,a,reader,brief)),/role cannot/);
 await assert.rejects(tx(editor,()=>saveAgentRequest(db,b,editor,brief)),/unavailable/);
 await assert.rejects(tx(editor,()=>saveAgentRequest(db,a,users[2].id,brief)));

 const foreign=await tx(users[2].id,()=>saveRegistry(db,b,users[2].id,skill));
 const s1=await tx(editor,()=>saveRegistry(db,a,editor,skill));
 const a1=await tx(editor,()=>saveRegistry(db,a,editor,{...agent,skillVersionIds:[s1.versionId]}));
 const s2=await tx(editor,()=>saveRegistry(db,a,editor,{...skill,id:s1.id,revision:1,name:'Revised skill'}));
 const state=await tx(editor,()=>readRegistry(db,a));
 assert.equal((state.agents as unknown[]).length,1);assert.equal((state.skills as unknown[]).length,1);
 assert.equal((state.bindings as {skill_version_id:string}[])[0].skill_version_id,s1.versionId);
 assert.equal((state.audit as unknown[]).length,3);
 await assert.rejects(tx(editor,()=>saveRegistry(db,a,editor,{...agent,id:a1.id,revision:1,skillVersionIds:[foreign.versionId]})),/available version/);
 assert.equal(((await tx(editor,()=>readRegistry(db,a))).agentVersions as unknown[]).length,1);
 const a2=await tx(editor,()=>saveRegistry(db,a,editor,{...agent,id:a1.id,revision:1,skillVersionIds:[s2.versionId]}));assert.equal(a2.number,2);
 await assert.rejects(tx(editor,()=>saveRegistry(db,a,editor,{...agent,id:a1.id,revision:1})),/newer version/);
 await assert.rejects(tx(editor,()=>saveRegistry(db,a,editor,{...agent,id:a1.id,revision:2,skillVersionIds:[s1.versionId,s2.versionId]})),/one available version/);
 await assert.rejects(tx(reader,()=>saveRegistry(db,a,reader,skill)),/role cannot/);
 await assert.rejects(tx(editor,()=>readRegistry(db,b)),/unavailable/);
 await assert.rejects(tx(editor,()=>db.query('UPDATE newneo.skill_versions SET number=99 WHERE id=$1',[s1.versionId])));
 await assert.rejects(tx(editor,()=>db.query('DELETE FROM newneo.registry_audit')));
 const readerState=await tx(reader,()=>readRegistry(db,a));assert.equal((readerState.agentVersions as unknown[]).length,2);
 assert.equal((readerState.access as {can_edit:boolean}).can_edit,false);
 }finally{await db.close()}
});
