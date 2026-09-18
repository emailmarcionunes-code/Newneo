import type {SqlClient,WorkspaceScope} from './agent-repository';
import {registryAccess,RegistryError} from './registry';
import {checkConfiguration} from './source-runs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function requestConfigurationReview(db:SqlClient,s:WorkspaceScope,actor:string,value:unknown){
 const access=await registryAccess(db,s);if(!access.can_edit)throw new RegistryError(403,'Your role cannot request a configuration review.');
 const v=value as Record<string,unknown>|null;if(!v||typeof v.agentVersionId!=='string'||!uuid.test(v.agentVersionId)||typeof v.notes!=='string'||!v.notes.trim()||v.notes.length>1000)throw new RegistryError(400,'Choose a version and provide review notes.');
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,25))',[s.workspaceId]);
 const existing=(await db.query('SELECT id FROM newneo.configuration_reviews WHERE organization_id=$1 AND workspace_id=$2 AND agent_version_id=$3',[s.organizationId,s.workspaceId,v.agentVersionId])).rows[0];if(existing)throw new RegistryError(409,'This version already has a review. Revise the configuration to request another review.');
 const check=await checkConfiguration(db,s,actor,{agentVersionId:v.agentVersionId});if(!(check.checks as {passed:boolean}[]).every(c=>c.passed))throw new RegistryError(409,'Resolve configuration checks before requesting review.');
 return (await db.query('INSERT INTO newneo.configuration_reviews(organization_id,workspace_id,agent_version_id,check_id,requested_by,notes) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',[s.organizationId,s.workspaceId,v.agentVersionId,check.id,actor,v.notes.trim()])).rows[0];
}
export async function decideConfigurationReview(db:SqlClient,s:WorkspaceScope,actor:string,value:unknown){
 const access=await registryAccess(db,s);if(!['Org Admin','Reviewer / Approver'].includes(String(access.role)))throw new RegistryError(403,'An independent reviewer is required.');
 const v=value as Record<string,unknown>|null;if(!v||typeof v.reviewId!=='string'||!uuid.test(v.reviewId)||!['approved','rejected'].includes(String(v.decision))||typeof v.reason!=='string'||!v.reason.trim()||v.reason.length>1000)throw new RegistryError(400,'Provide a review, decision and reason.');
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,25))',[s.workspaceId]);
 const row=(await db.query('SELECT r.id,r.requested_by,av.created_by,a.archived_at FROM newneo.configuration_reviews r JOIN newneo.agent_versions av ON av.id=r.agent_version_id JOIN newneo.agents a ON a.id=av.agent_id WHERE r.organization_id=$1 AND r.workspace_id=$2 AND r.id=$3',[s.organizationId,s.workspaceId,v.reviewId])).rows[0];
 if(!row||row.archived_at)throw new RegistryError(404,'Active configuration review unavailable.');if(row.requested_by===actor||row.created_by===actor)throw new RegistryError(403,'You cannot review a configuration you authored or submitted.');
 if((await db.query('SELECT id FROM newneo.configuration_decisions WHERE organization_id=$1 AND workspace_id=$2 AND review_id=$3',[s.organizationId,s.workspaceId,v.reviewId])).rows.length)throw new RegistryError(409,'A decision is already recorded.');
 return (await db.query('INSERT INTO newneo.configuration_decisions(organization_id,workspace_id,review_id,actor_id,decision,reason) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',[s.organizationId,s.workspaceId,v.reviewId,actor,v.decision,v.reason.trim()])).rows[0];
}
export async function readConfigurationReviews(db:SqlClient,s:WorkspaceScope,actor:string,page=0){
 const access=await registryAccess(db,s);if(!Number.isSafeInteger(page)||page<0||page>10000)throw new RegistryError(400,'Invalid page.');const args=[s.organizationId,s.workspaceId];
 const reviews=(await db.query("SELECT r.*,v.configuration,v.number,v.created_by,a.archived_at,d.decision,d.reason,d.actor_id AS reviewer_id,d.created_at AS decided_at,c.checks FROM newneo.configuration_reviews r JOIN newneo.agent_versions v ON v.id=r.agent_version_id JOIN newneo.agents a ON a.id=v.agent_id JOIN newneo.configuration_checks c ON c.id=r.check_id LEFT JOIN newneo.configuration_decisions d ON d.review_id=r.id WHERE r.organization_id=$1 AND r.workspace_id=$2 ORDER BY r.created_at DESC,r.id LIMIT 25 OFFSET $3",[...args,page*25])).rows;
 const stats=(await db.query("SELECT count(*) AS total,count(*) FILTER(WHERE d.id IS NULL) AS pending,count(*) FILTER(WHERE d.decision='approved') AS approved,count(*) FILTER(WHERE d.decision='rejected') AS rejected FROM newneo.configuration_reviews r LEFT JOIN newneo.configuration_decisions d ON d.review_id=r.id WHERE r.organization_id=$1 AND r.workspace_id=$2",args)).rows[0];
 return {reviews,stats,page,access:{...access,actorId:actor,can_review:['Org Admin','Reviewer / Approver'].includes(String(access.role))}};
}
