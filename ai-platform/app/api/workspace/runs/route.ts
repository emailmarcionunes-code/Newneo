import {getSession,sameOrigin} from '@/server/auth';
import {withOperationsIdentity as withVerifiedIdentity} from '@/server/product-access';
import {RegistryError} from '@/server/registry';
import {readSourceRuns,runSourceQuery,checkConfiguration} from '@/server/source-runs';
import {readJson,noStore} from '@/server/http';
async function handle(request:Request,write=false){
 if(write&&!sameOrigin(request))return Response.json({error:'Invalid origin'},{status:403,headers:noStore});
 const session=await getSession();if(!session?.organizationId||!session.workspaceId)return Response.json({error:'Sign in and select a workspace.'},{status:401,headers:noStore});
 try{const body=write?await readJson(request).catch(()=>{throw new RegistryError(400,'Invalid request.')}):null;
 if(write&&body?.workspaceId!==session.workspaceId)throw new RegistryError(409,'Workspace changed. Reload before running.');
 if(write&&!['search','check'].includes(String(body?.action)))throw new RegistryError(400,'Invalid action.');
 const scope={organizationId:session.organizationId,workspaceId:session.workspaceId};
 const result=await withVerifiedIdentity(session,(db,actor)=>write?(body?.action==='check'?checkConfiguration(db,scope,actor,body):runSourceQuery(db,scope,actor,body)):readSourceRuns(db,scope,Number(new URL(request.url).searchParams.get('page')??0)));
 return Response.json(result,{headers:noStore});
 }catch(e){return Response.json({error:e instanceof RegistryError?e.message:'Source operations are temporarily unavailable.'},{status:e instanceof RegistryError?e.status:503,headers:noStore})}
}
export const GET=(r:Request)=>handle(r);export const POST=(r:Request)=>handle(r,true);
