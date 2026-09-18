import {databaseAvailable} from '@/server/database';
import {noStore} from '@/server/http';
export const dynamic='force-dynamic';
export async function GET(){const ready=await databaseAvailable();return Response.json({ready},{status:ready?200:503,headers:noStore})}
