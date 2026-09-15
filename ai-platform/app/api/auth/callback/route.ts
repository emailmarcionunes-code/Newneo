import { cookies } from 'next/headers';
import * as oidc from 'openid-client';
import {
  appOrigin,
  cookieOptions,
  loginCookie,
  oidcConfiguration,
  writeSession,
} from '@/server/auth';
import { unseal } from '@/server/session-token';
export async function GET(request: Request) {
  const jar = await cookies();
  const login = unseal(jar.get(loginCookie)?.value, 'login');
  jar.set(loginCookie, '', { ...cookieOptions(), maxAge: 0 });
  try {
    if (
      !login ||
      typeof login.verifier !== 'string' ||
      typeof login.state !== 'string' ||
      typeof login.nonce !== 'string'
    )
      throw new Error('Missing login transaction');
    const current = new URL(`${appOrigin()}/api/auth/callback`);
    current.search = new URL(request.url).search;
    const tokens = await oidc.authorizationCodeGrant(
      await oidcConfiguration(),
      current,
      {
        pkceCodeVerifier: login.verifier,
        expectedState: login.state,
        expectedNonce: login.nonce,
        idTokenExpected: true,
      },
    );
    const claims = tokens.claims();
    if (!claims?.sub || claims.iss !== process.env.OIDC_ISSUER_URL)
      throw new Error('Invalid identity');
    const expiresAt = Math.min(Date.now() + 3600_000, claims.exp * 1000);
    if (expiresAt <= Date.now()) throw new Error('Expired identity');
    await writeSession({ issuer: claims.iss, subject: claims.sub, expiresAt });
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appOrigin()}/settings`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appOrigin()}/settings?login=failed`,
        'Cache-Control': 'no-store',
      },
    });
  }
}
