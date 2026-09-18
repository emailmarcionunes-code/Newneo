import { cookies } from 'next/headers';
import { appOrigin, cookieOptions, sameOrigin, sessionCookie, loginCookie, demoCookie } from '@/server/auth';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:'Invalid origin'}, {status:403});
  const jar = await cookies();
  // Demo grants no identity or tenant permissions. End any real session first.
  for (const name of [sessionCookie, loginCookie]) jar.set(name, '', {...cookieOptions(), maxAge:0});
  jar.set(demoCookie, 'acme', {...cookieOptions(), maxAge: 86400});
  return new Response(null, {status:303, headers:{Location:`${appOrigin()}/`, 'Cache-Control':'no-store'}});
}
