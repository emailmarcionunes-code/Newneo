import { cookies } from 'next/headers';
import * as oidc from 'openid-client';
import {
  appOrigin,
  cookieOptions,
  loginCookie,
  oidcConfiguration,
} from '@/server/auth';
import { seal } from '@/server/session-token';
export async function GET() {
  try {
    const config = await oidcConfiguration();
    const verifier = oidc.randomPKCECodeVerifier();
    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const url = oidc.buildAuthorizationUrl(config, {
      redirect_uri: `${appOrigin()}/api/auth/callback`,
      scope: 'openid profile',
      code_challenge: await oidc.calculatePKCECodeChallenge(verifier),
      code_challenge_method: 'S256',
      state,
      nonce,
    });
    (await cookies()).set(
      loginCookie,
      seal({ verifier, state, nonce }, 'login', Date.now() + 10 * 60 * 1000),
      { ...cookieOptions(), maxAge: 600 },
    );
    return new Response(null, {
      status: 302,
      headers: { Location: url.href, 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json(
      {
        error:
          'Login is not available. Configure the OIDC provider and database.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
