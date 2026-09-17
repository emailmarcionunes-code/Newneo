import {getSession,sameOrigin} from '@/server/auth';
import {withVerifiedIdentity} from '@/server/database';
import {readRegistry,saveRegistry,changeRegistry,RegistryError} from '@/server/registry';
import {readJson,noStore} from '@/server/http';
async function handle(request?:Request){
 if(request&&!sameOrigin(request))return Response.json({error:'Invalid origin'},{status:403,headers:noStore});
 const session=await getSession();if(!session?.organizationId||!session.workspaceId)return Response.json({error:'Sign in and select a workspace in Settings.'},{status:401,headers:noStore});
 let body:Record<string,unknown>|undefined;if(request){try{body=await readJson(request)}catch{return Response.json({error:'Invalid request'},{status:400,headers:noStore})}if(!body||body.workspaceId!==session.workspaceId)return Response.json({error:'Workspace changed. Reload before saving.'},{status:409,headers:noStore});}
 try{const scope={organizationId:session.organizationId,workspaceId:session.workspaceId};const data=await withVerifiedIdentity(session,(db,actor)=>request?(body?.action?changeRegistry(db,scope,actor,body):saveRegistry(db,scope,actor,body)):readRegistry(db,scope));return Response.json(data,{status:request?201:200,headers:noStore})}
 catch(e){return Response.json({error:e instanceof RegistryError?e.message:'Workspace storage is temporarily unavailable.'},{status:e instanceof RegistryError?e.status:503,headers:noStore})}
}
export const GET=()=>handle();export const POST=(request:Request)=>handle(request);
