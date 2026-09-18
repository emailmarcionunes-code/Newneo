import {getSession,sameOrigin} from '@/server/auth';
import {withOperationsIdentity as withVerifiedIdentity} from '@/server/product-access';
import {readMembers,updateMember} from '@/server/workspace-members';
import {RegistryError} from '@/server/registry';
import {noStore,readJson} from '@/server/http';
async function handle(request:Request,write=false){
 if(write&&!sameOrigin(request))return Response.json({error:'Invalid origin'},{status:403,headers:noStore});
 const session=await getSession();if(!session?.organizationId||!session.workspaceId)return Response.json({error:'Sign in and select a workspace.'},{status:401,headers:noStore});
 try{const body=write?await readJson(request).catch(()=>{throw new RegistryError(400,'Invalid request.')}):null;if(write&&body?.workspaceId!==session.workspaceId)throw new RegistryError(409,'Workspace changed. Reload before saving.');
 const s={organizationId:session.organizationId,workspaceId:session.workspaceId};const result=await withVerifiedIdentity<unknown>(session,db=>write?updateMember(db,s,body):readMembers(db,s,Number(new URL(request.url).searchParams.get('page')??0)));return Response.json(result,{headers:noStore});
 }catch(e){const code=(e as {code?:string}).code;const mapped:Record<string,[number,string]>={'42501':[403,'Your role cannot administer this workspace.'],'P0002':[404,'Member unavailable.'],'40001':[409,'Membership changed. Reload before saving.'],'23514':[409,'Keep at least one active Org Admin.'],'22023':[400,'Invalid member settings.']};const [status,error]=e instanceof RegistryError?[e.status,e.message]:mapped[code??'']??[503,'Member administration is temporarily unavailable.'];return Response.json({error},{status,headers:noStore})}
}
export const GET=(request:Request)=>handle(request);export const POST=(request:Request)=>handle(request,true);
