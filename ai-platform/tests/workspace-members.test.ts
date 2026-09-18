import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {readMembers,updateMember} from '../server/workspace-members';
import {registryAccess} from '../server/registry';
test('member administration enforces roles, tenant boundaries, revocation, revisions and last administrator',async()=>{
 const db=new PGlite();try{
 await db.exec('CREATE ROLE newneo_app');
 for(const file of ['001_platform.sql','002_identity_and_drafts.sql','005_account_profiles.sql','006_versioned_registry.sql','007_knowledge.sql','008_workspace_members.sql'])await db.exec(await readFile(new URL('../db/migrations/'+file,import.meta.url),'utf8'));
 await db.exec('GRANT USAGE ON SCHEMA newneo TO newneo_app; GRANT SELECT ON newneo.identities,newneo.workspaces,newneo.workspace_memberships TO newneo_app');
 const orgs=(await db.query<{id:string}>("INSERT INTO newneo.organizations(name) VALUES('A'),('B') RETURNING id")).rows;
 const ws=async(org:string)=>(await db.query<{id:string}>("INSERT INTO newneo.workspaces(organization_id,name) VALUES($1,'Main') RETURNING id",[org])).rows[0].id;
 const a={organizationId:orgs[0].id,workspaceId:await ws(orgs[0].id)},b={organizationId:orgs[1].id,workspaceId:await ws(orgs[1].id)};
 const users=(await db.query<{id:string;subject:string}>("INSERT INTO newneo.identities(issuer,subject) VALUES('https://example.test','admin'),('https://example.test','editor'),('https://example.test','foreign') RETURNING id,subject")).rows;
 for(const [s,u,role] of [[a,users[0],'Org Admin'],[a,users[1],'AI Engineer'],[b,users[2],'Org Admin']] as const)await db.query('INSERT INTO newneo.workspace_memberships(organization_id,workspace_id,identity_id,can_edit_agents,role) VALUES($1,$2,$3,true,$4)',[s.organizationId,s.workspaceId,u.id,role]);
 await db.exec('SET ROLE newneo_app');
 async function tx<T>(index:number,fn:()=>Promise<T>,subject=users[index].subject){await db.exec('BEGIN');try{await db.query("SELECT set_config('newneo.identity_id',$1,true),set_config('newneo.issuer','https://example.test',true),set_config('newneo.subject',$2,true)",[users[index].id,subject]);const result=await fn();await db.exec('COMMIT');return result}catch(e){await db.exec('ROLLBACK');throw e}}
 const input={id:users[1].id,revision:1,role:'Read Only',active:true,reason:'Least privilege'};
 assert.equal((await tx(0,()=>readMembers(db,a))).total,2);
 assert.equal((await tx(1,()=>readMembers(db,a))).access.can_manage_members,false);
 await assert.rejects(tx(1,()=>updateMember(db,a,input)),/not permitted/);
 await assert.rejects(tx(0,()=>updateMember(db,a,input),'editor'),/not permitted/);
 await assert.rejects(tx(2,()=>updateMember(db,b,input)),/unavailable/);
 await assert.rejects(tx(0,()=>db.query("UPDATE newneo.workspace_memberships SET role='Org Admin'")),/permission denied/);
 await assert.rejects(tx(0,()=>db.query('SELECT newneo.require_workspace_admin($1,$2)',[a.organizationId,a.workspaceId])),/permission denied/);
 await tx(0,()=>updateMember(db,a,input));
 assert.equal((await tx(1,()=>registryAccess(db,a))).can_edit,false);
 await assert.rejects(tx(0,()=>updateMember(db,a,input)),/changed/);
 await tx(0,()=>updateMember(db,a,{...input,revision:2,active:false}));
 await assert.rejects(tx(1,()=>registryAccess(db,a)),/unavailable|permitted|member|access/i);
 await tx(0,()=>updateMember(db,a,{...input,revision:3,role:'AI Engineer'}));
 assert.equal((await tx(1,()=>registryAccess(db,a))).can_edit,true);
 await assert.rejects(tx(0,()=>updateMember(db,a,{...input,id:users[0].id,active:false})),/at least one/);
 await tx(0,()=>updateMember(db,a,{...input,revision:4,role:'AI Engineer'}));
 const audit=await tx(0,()=>db.query('SELECT * FROM newneo.membership_audit'));assert.equal(audit.rows.length,3);
 await assert.rejects(tx(0,()=>db.query('DELETE FROM newneo.membership_audit')),/permission denied/);
 assert.equal((await tx(2,()=>db.query('SELECT * FROM newneo.membership_audit'))).rows.length,0);
 }finally{await db.close()}
});
