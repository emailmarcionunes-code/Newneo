import {getSession} from '@/server/auth';
import {withVerifiedIdentity} from '@/server/database';
import {noStore} from '@/server/http';
export async function GET(){
 const session=await getSession();if(!session)return Response.json({error:'Sign in to access financial controls.'},{status:401,headers:noStore});
 try{const result=await withVerifiedIdentity(session,async db=>(await db.query('SELECT newneo.read_cost_console() AS data')).rows[0].data);return Response.json(result,{headers:noStore})}
 catch(e){const forbidden=(e as {code?:string}).code==='42501';return Response.json({error:forbidden?'Financial controls are restricted to the platform owner.':'Financial controls are temporarily unavailable.'},{status:forbidden?403:503,headers:noStore})}
}
