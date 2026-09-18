import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {readWorkspaceAudit} from '../server/workspace-audit';
import {documentInput,readKnowledge,mutateKnowledge} from '../server/knowledge';
test('knowledge validates bounded text and preserves tenant isolation, immutable content and archive history',async()=>{
 const db=new PGlite();try{
 await db.exec('CREATE ROLE newneo_app');
 for(const file of ['001_platform.sql','002_identity_and_drafts.sql','005_account_profiles.sql','006_versioned_registry.sql','007_knowledge.sql','008_workspace_members.sql','009_registry_lifecycle.sql','010_source_runs.sql','011_configuration_reviews.sql','012_retrieval_evaluations.sql'])await db.exec(await readFile(new URL('../db/migrations/'+file,import.meta.url),'utf8'));
 await db.exec('GRANT USAGE ON SCHEMA newneo TO newneo_app; GRANT SELECT ON newneo.identities,newneo.workspaces,newneo.workspace_memberships TO newneo_app; GRANT SELECT,INSERT,UPDATE ON newneo.agents,newneo.drafts TO newneo_app');
 const orgs=(await db.query<{id:string}>("INSERT INTO newneo.organizations(name) VALUES('A'),('B') RETURNING id")).rows;
 const work=async(org:string)=>(await db.query<{id:string}>("INSERT INTO newneo.workspaces(organization_id,name) VALUES($1,'Main') RETURNING id",[org])).rows[0].id;
 const a={organizationId:orgs[0].id,workspaceId:await work(orgs[0].id)},b={organizationId:orgs[1].id,workspaceId:await work(orgs[1].id)};
 const users=(await db.query<{id:string}>("INSERT INTO newneo.identities(issuer,subject) VALUES('https://example.test','editor'),('https://example.test','reader'),('https://example.test','other') RETURNING id")).rows;
 for(const [scope,user,edit,role] of [[a,users[0].id,true,'AI Engineer'],[a,users[1].id,false,'Read Only'],[b,users[2].id,true,'AI Engineer']] as const)await db.query('INSERT INTO newneo.workspace_memberships(organization_id,workspace_id,identity_id,can_edit_agents,role) VALUES($1,$2,$3,$4,$5)',[scope.organizationId,scope.workspaceId,user,edit,role]);
 await db.exec('SET ROLE newneo_app');
 async function tx<T>(user:string,fn:()=>Promise<T>){await db.exec('BEGIN');try{await db.query("SELECT set_config('newneo.identity_id',$1,true)",[user]);const value=await fn();await db.exec('COMMIT');return value}catch(e){await db.exec('ROLLBACK');throw e}}
 const editor=users[0].id,reader=users[1].id;

 assert.throws(()=>documentInput({title:'A',body:'é'.repeat(10001)}));
 assert.throws(()=>documentInput({title:'A',body:'bad\0content'}));
 const doc={action:'import',title:'GAW policy',body:'Vacation policy: requests require manager approval.'};
 const saved=await tx(editor,()=>mutateKnowledge(db,a,editor,doc));
 await assert.rejects(tx(editor,()=>mutateKnowledge(db,a,editor,doc)),/already exists/);
 await assert.rejects(tx(reader,()=>mutateKnowledge(db,a,reader,{...doc,body:'other'})),/role cannot/);
 const result=await tx(reader,()=>readKnowledge(db,a,new URLSearchParams({q:'vacation'})));
 assert.equal('total' in result&&result.total,1);
 await assert.rejects(tx(users[2].id,()=>readKnowledge(db,b,new URLSearchParams({id:saved.id}))),/unavailable/);
 await assert.rejects(tx(editor,()=>db.query('UPDATE newneo.knowledge_documents SET body=$1 WHERE id=$2',['altered',saved.id])));
 await assert.rejects(tx(editor,()=>db.query('DELETE FROM newneo.knowledge_audit')));
 await tx(editor,()=>mutateKnowledge(db,a,editor,{action:'archive',id:saved.id}));
 const after=await tx(reader,()=>readKnowledge(db,a,new URLSearchParams({q:'vacation'})));
 assert.equal('total' in after&&after.total,0);
 assert.equal('audit' in after&&after.audit?.length,2);
 const audit=await tx(reader,()=>readWorkspaceAudit(db,a,new URLSearchParams({kind:'knowledge'})));assert.equal(audit.total,2);
 const foreignAudit=await tx(users[2].id,()=>readWorkspaceAudit(db,b,new URLSearchParams()));assert.equal(foreignAudit.total,0);
 const archived=await tx(reader,()=>readKnowledge(db,a,new URLSearchParams({id:saved.id})));
 assert.equal('document' in archived&&archived.document?.body,doc.body);
 await assert.rejects(tx(editor,()=>mutateKnowledge(db,a,editor,{action:'archive',id:saved.id})),/unavailable/);
 }finally{await db.close()}
});
