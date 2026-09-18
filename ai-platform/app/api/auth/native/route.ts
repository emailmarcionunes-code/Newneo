import { cookies } from 'next/headers';
import { authConfigured, cookieOptions, sameOrigin, writeSession, loginCookie } from '@/server/auth';
import { AuthError, AuthLimiter, AuthState, authMessage, nativeAuth } from '@/server/native-auth';
import { seal, unseal } from '@/server/session-token';
import { noStore, readJson } from '@/server/http';

export const runtime = 'nodejs';
const challengeCookie = 'newneo_auth_challenge';
const limiter = new AuthLimiter();
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Invalid origin' }, { status: 403, headers: noStore });
  if (!authConfigured()) return Response.json({ error: 'Sign-in is temporarily unavailable.' }, { status: 503, headers: noStore });
  const jar = await cookies();
  const clear = () => jar.set(challengeCookie, '', { ...cookieOptions(), maxAge: 0 });
  try {
    const input = await readJson(request);
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AuthError('InvalidInput');
    if (input.action === 'cancel') { clear(); return Response.json({ step: 'signin' }, { headers: noStore }); }
    const value = unseal(jar.get(challengeCookie)?.value, 'native-auth');
    const state = value && typeof value.username === 'string' && typeof value.challenge === 'string' ? value as AuthState : null;
    const username = ['signin', 'forgot'].includes(input.action) ? input.email : state?.username;
    if (typeof username !== 'string' || !username || username.length > 256) throw new AuthError(state ? 'InvalidInput' : 'Expired');
    if (!limiter.allow('global', 300, 60000) || !limiter.allow(`account:${username}`, 15, 300000) || (input.action === 'forgot' && !limiter.allow(`recovery:${username}`, 3, 900000))) throw new AuthError('TooManyRequestsException');
    if (input.action === 'signin' || input.action === 'forgot') clear();
    const result = await nativeAuth(input, state);
    if (result.identity) {
      const { iss, sub, exp } = result.identity;
      await writeSession({ issuer: iss, subject: sub, expiresAt: Math.min(exp * 1000, Date.now() + 3600000) });
      jar.set(loginCookie, '', { ...cookieOptions(), maxAge: 0 });
    }
    if (result.state) {
      const maxAge = result.state.challenge === 'RESET_PASSWORD' ? 600 : 180;
      const token = seal(result.state, 'native-auth', Date.now() + maxAge * 1000);
      if (token.length > 3800) throw new AuthError('Unavailable');
      jar.set(challengeCookie, token, { ...cookieOptions(), maxAge });
    } else clear();
    return Response.json(result.view, { headers: noStore });
  } catch (error) {
    const code = error instanceof AuthError ? error.code : 'Unavailable';
    if (code === 'Expired' || code === 'UnsupportedChallenge') clear();
    return Response.json({ error: authMessage(error), restart: code === 'Expired', alternate: code === 'UnsupportedChallenge' }, { status: ['TooManyRequestsException', 'LimitExceededException'].includes(code) ? 429 : 400, headers: noStore });
  }
}
