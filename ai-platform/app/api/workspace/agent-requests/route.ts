import {getSession,sameOrigin} from '@/server/auth';
import {withVerifiedIdentity} from '@/server/database';
import {readJson,noStore} from '@/server/http';
import {RegistryError} from '@/server/registry';
import {saveAgentRequest} from '@/server/agent-requests';
async function handle(request?:Request){
 if(request&&!sameOrigin(request))return Response.json({error:'Invalid origin'},{status:403,headers:noStore});
 const s=await getSession();if(!s?.organizationId||!s.workspaceId)return Response.json({error:'Sign in and select a workspace.'},{status:401,headers:noStore});
 try{const body=request?await readJson(request):undefined;if(request&&body?.workspaceId!==s.workspaceId)return Response.json({error:'Workspace changed. Reload.'},{status:409,headers:noStore});const scope={organizationId:s.organizationId,workspaceId:s.workspaceId};const result=await withVerifiedIdentity<unknown>(s,(db,actor)=>request?saveAgentRequest(db,scope,actor,body?.brief):db.query('SELECT id,brief,status,created_at FROM newneo.agent_requests WHERE organization_id=$1 AND workspace_id=$2 ORDER BY created_at DESC LIMIT 50',[scope.organizationId,scope.workspaceId]).then(r=>r.rows));return Response.json(result,{status:request?201:200,headers:noStore})}catch(e){return Response.json({error:e instanceof RegistryError?e.message:'Request service unavailable. Please retry.'},{status:e instanceof RegistryError?e.status:503,headers:noStore})}
}
export const GET=()=>handle();export const POST=(r:Request)=>handle(r);
