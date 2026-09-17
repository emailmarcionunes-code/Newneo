import { cookies } from 'next/headers';
import * as oidc from 'openid-client';
import { seal, unseal } from './session-token';
export const sessionCookie = 'newneo_session';
export const demoCookie = 'newneo_demo';
export const loginCookie = 'newneo_login';
export type Session = {
  issuer: string;
  subject: string;
  expiresAt: number;
  organizationId?: string;
  workspaceId?: string;
};
export function appOrigin() {
  const url = new URL(process.env.APP_ORIGIN ?? 'http://localhost:3100');
  if (
    url.protocol !== 'https:' &&
    !['localhost', '127.0.0.1'].includes(url.hostname)
  )
    throw new Error('HTTPS is required.');
  return url.origin;
}
export const cookieOptions = () => ({
  httpOnly: true,
  secure: new URL(appOrigin()).protocol === 'https:',
  sameSite: 'lax' as const,
  path: '/',
});
export function authConfigured() {
  return Boolean(
    process.env.OIDC_ISSUER_URL &&
    process.env.OIDC_CLIENT_ID &&
    process.env.OIDC_CLIENT_SECRET &&
    process.env.SESSION_SECRET &&
    process.env.DATABASE_URL &&
    process.env.APP_ORIGIN,
  );
}
let configuration: Promise<oidc.Configuration> | undefined;
export function oidcConfiguration() {
  if (!authConfigured()) throw new Error('Authentication is not configured.');
  const issuer = new URL(process.env.OIDC_ISSUER_URL!);
  if (issuer.protocol !== 'https:')
    throw new Error('OIDC issuer must use HTTPS.');
  if (!configuration)
    configuration = oidc
      .discovery(
        issuer,
        process.env.OIDC_CLIENT_ID!,
        process.env.OIDC_CLIENT_SECRET!,
      )
      .catch((error) => {
        configuration = undefined;
        throw error;
      });
  return configuration;
}
export async function getSession(): Promise<Session | null> {
  if ((await cookies()).get(demoCookie)?.value === 'acme') return null;
  const value = unseal((await cookies()).get(sessionCookie)?.value, 'session');
  if (
    !value ||
    typeof value.issuer !== 'string' ||
    typeof value.subject !== 'string' ||
    typeof value.expiresAt !== 'number' ||
    value.expiresAt <= Date.now()
  )
    return null;
  if (value.issuer !== process.env.OIDC_ISSUER_URL) return null;
  return value as Session;
}
export async function writeSession(session: Session) {
  (await cookies()).set(demoCookie, '', {...cookieOptions(), maxAge:0});
  (await cookies()).set(
    sessionCookie,
    seal(session, 'session', session.expiresAt),
    {
      ...cookieOptions(),
      maxAge: Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000)),
    },
  );
}
export function sameOrigin(request: Request) {
  return request.headers.get('origin') === appOrigin();
}
