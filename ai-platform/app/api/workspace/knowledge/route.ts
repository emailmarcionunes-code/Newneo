import {getSession,sameOrigin} from '@/server/auth';
import {withVerifiedIdentity} from '@/server/database';
import {readKnowledge,mutateKnowledge} from '@/server/knowledge';
import {RegistryError} from '@/server/registry';
import {readJson,noStore} from '@/server/http';
async function handle(request:Request,write=false){
 if(write&&!sameOrigin(request))return Response.json({error:'Invalid origin'},{status:403,headers:noStore});
 const session=await getSession();if(!session?.organizationId||!session.workspaceId)return Response.json({error:'Sign in and select a workspace.'},{status:401,headers:noStore});
 try{const body=write?await readJson(request).catch(()=>{throw new RegistryError(400,'Invalid request or document too large.')}):null;if(write&&body?.workspaceId!==session.workspaceId)throw new RegistryError(409,'Workspace changed. Reload before saving.');
 const scope={organizationId:session.organizationId,workspaceId:session.workspaceId};
 const data=await withVerifiedIdentity<unknown>(session,(db,actor)=>write?mutateKnowledge(db,scope,actor,body):readKnowledge(db,scope,new URL(request.url).searchParams));return Response.json(data,{status:write?201:200,headers:noStore});
 }catch(e){return Response.json({error:e instanceof RegistryError?e.message:'Knowledge storage is temporarily unavailable.'},{status:e instanceof RegistryError?e.status:503,headers:noStore})}
}
export const GET=(request:Request)=>handle(request);export const POST=(request:Request)=>handle(request,true);
