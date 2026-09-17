import {getSession} from '@/server/auth';
import {withVerifiedIdentity} from '@/server/database';
import {readWorkspaceAudit} from '@/server/workspace-audit';
import {RegistryError} from '@/server/registry';
import {noStore} from '@/server/http';
export async function GET(request:Request){
 const session=await getSession();if(!session?.organizationId||!session.workspaceId)return Response.json({error:'Sign in and select a workspace.'},{status:401,headers:noStore});
 try{const s={organizationId:session.organizationId,workspaceId:session.workspaceId};return Response.json(await withVerifiedIdentity(session,db=>readWorkspaceAudit(db,s,new URL(request.url).searchParams)),{headers:noStore})}
 catch(e){return Response.json({error:e instanceof RegistryError?e.message:'Audit history is temporarily unavailable.'},{status:e instanceof RegistryError?e.status:503,headers:noStore})}
}
