import { cookies } from 'next/headers';
import {
  cookieOptions,
  sameOrigin,
  sessionCookie,
  loginCookie,
} from '@/server/auth';
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ error: 'Invalid origin' }, { status: 403 });
  const jar = await cookies();
  for (const name of [sessionCookie, loginCookie])
    jar.set(name, '', { ...cookieOptions(), maxAge: 0 });
  return Response.json(
    { signedOut: true },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
