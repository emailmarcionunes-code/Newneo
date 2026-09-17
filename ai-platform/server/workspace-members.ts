import type {SqlClient,WorkspaceScope} from './agent-repository';
import {registryAccess,RegistryError} from './registry';
export const workspaceRoles=['Org Admin','AI Platform Admin','AI Engineer','Business Owner','Operator','Reviewer / Approver','Read Only'] as const;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function readMembers(db:SqlClient,s:WorkspaceScope,page=0){
 const access=await registryAccess(db,s);if(!Number.isSafeInteger(page)||page<0||page>10000)throw new RegistryError(400,'Invalid page.');
 const admin=Boolean((await db.query('SELECT newneo.can_manage_members($1,$2) AS allowed',[s.organizationId,s.workspaceId])).rows[0].allowed);
 if(!admin)return {access:{...access,can_manage_members:false},members:[],total:0,page};
 const result=(await db.query('SELECT newneo.list_workspace_members($1,$2,$3) AS result',[s.organizationId,s.workspaceId,page])).rows[0].result as Record<string,unknown>;
 return {...result,access:{...access,can_manage_members:true}};
}
export async function updateMember(db:SqlClient,s:WorkspaceScope,value:unknown){
 const v=value as Record<string,unknown>|null;
 if(!v||typeof v.id!=='string'||!uuid.test(v.id)||!Number.isSafeInteger(v.revision)||Number(v.revision)<1||typeof v.role!=='string'||!(workspaceRoles as readonly string[]).includes(v.role)||typeof v.active!=='boolean'||typeof v.reason!=='string'||!v.reason.trim()||v.reason.length>500)throw new RegistryError(400,'Check member, role, revision and reason.');
 return (await db.query('SELECT newneo.change_workspace_member($1,$2,$3,$4,$5,$6,$7) AS result',[s.organizationId,s.workspaceId,v.id,v.revision,v.role,v.active,v.reason.trim()])).rows[0].result;
}
