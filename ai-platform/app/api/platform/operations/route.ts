import {getSession} from '@/server/auth';
import {withVerifiedIdentity} from '@/server/database';
import {noStore} from '@/server/http';
import {readOperationsStatus} from '@/server/operations-status';
export async function GET(){const session=await getSession();if(!session)return Response.json({error:'Sign in to view platform health.'},{status:401,headers:noStore});try{await withVerifiedIdentity(session,db=>db.query('SELECT newneo.require_platform_owner()'));const status=await readOperationsStatus();return Response.json({status,monitoring:status?'current':'unavailable-or-stale'},{headers:noStore})}catch(e){const forbidden=(e as {code?:string}).code==='42501';return Response.json({error:forbidden?'Platform-owner access is required.':'Platform health is temporarily unavailable.'},{status:forbidden?403:503,headers:noStore})}}
