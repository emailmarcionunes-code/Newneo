import { createHmac, createHash } from 'node:crypto';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

export class AuthError extends Error {
  constructor(public code: string) { super(code); }
}
export type AuthState = {
  username: string; challenge: string; session?: string;
  requiredAttributes?: string[]; choices?: string[];
};
export type AuthView = {
  step: 'signin' | 'code' | 'new-password' | 'select-mfa' | 'setup-mfa' | 'reset' | 'complete';
  message?: string; requiredAttributes?: string[]; choices?: string[]; secret?: string;
};
type ProviderResult = {
  AuthenticationResult?: { IdToken?: string };
  ChallengeName?: string; Session?: string; ChallengeParameters?: Record<string, string>;
  SecretCode?: string; Status?: string;
};
type Provider = (action: string, body: Record<string, unknown>) => Promise<ProviderResult>;
type Claims = { iss: string; sub: string; exp: number };
type Verify = (token: string) => Promise<Claims>;
export type AuthOutcome = { view: AuthView; state?: AuthState; identity?: Claims };
const codeChallenges: Record<string, string> = {
  SOFTWARE_TOKEN_MFA: 'SOFTWARE_TOKEN_MFA_CODE', SMS_MFA: 'SMS_MFA_CODE', EMAIL_OTP: 'EMAIL_OTP_CODE', SMS_OTP: 'SMS_OTP_CODE',
};
function config() {
  const issuer = process.env.OIDC_ISSUER_URL ?? '';
  const match = /^https:\/\/cognito-idp\.([a-z0-9-]+)\.amazonaws\.com\/([a-z0-9-]+_[A-Za-z0-9]+)$/.exec(issuer);
  const clientId = process.env.OIDC_CLIENT_ID;
  const secret = process.env.OIDC_CLIENT_SECRET;
  if (!match || !clientId || !secret) throw new AuthError('Unavailable');
  return { issuer, endpoint: new URL(issuer).origin, pool: match[2], clientId, secret };
}
function secretHash(username: string) {
  const { clientId, secret } = config();
  return createHmac('sha256', secret).update(username + clientId).digest('base64');
}
export const cognitoRequest: Provider = async (action, body) => {
  const response = await fetch(config().endpoint, {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/x-amz-json-1.1', 'X-Amz-Target': `AWSCognitoIdentityProviderService.${action}` },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new AuthError(String(result.__type ?? 'Unavailable').split('#').pop()!);
  return result;
};
let verifier: ReturnType<typeof CognitoJwtVerifier.create> | undefined;
export const verifyIdentity: Verify = async token => {
  const c = config();
  verifier ??= CognitoJwtVerifier.create({ userPoolId: c.pool, tokenUse: 'id', clientId: c.clientId });
  const claims = await verifier.verify(token);
  if (claims.iss !== c.issuer || !claims.sub || claims.exp * 1000 <= Date.now()) throw new AuthError('NotAuthorizedException');
  return { iss: claims.iss, sub: claims.sub, exp: claims.exp };
};
function field(input: Record<string, unknown>, name: string, max = 256) {
  const value = input[name];
  if (typeof value !== 'string' || !value || value.length > max) throw new AuthError('InvalidInput');
  return value;
}
function list(value: string | undefined) {
  if (!value) return [];
  try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []; }
  catch { throw new AuthError('Unavailable'); }
}

// The provider determines the next step. A browser cannot select or skip a challenge.
export async function nativeAuth(input: Record<string, unknown>, state: AuthState | null, call: Provider = cognitoRequest, verify: Verify = verifyIdentity): Promise<AuthOutcome> {
  const c = config();
  async function finish(result: ProviderResult, username: string): Promise<AuthOutcome> {
    if (result.AuthenticationResult?.IdToken) {
      const identity = await verify(result.AuthenticationResult.IdToken);
      return { view: { step: 'complete' }, identity };
    }
    const challenge = result.ChallengeName;
    if (!challenge || !result.Session) throw new AuthError('UnsupportedChallenge');
    const parameters = result.ChallengeParameters ?? {};
    const next: AuthState = { username: parameters.USERNAME || parameters.USER_ID_FOR_SRP || username, challenge, session: result.Session };
    if (codeChallenges[challenge]) return { state: next, view: { step: 'code', message: challenge === 'SOFTWARE_TOKEN_MFA' ? 'Enter the code from your authenticator app.' : 'Enter the verification code sent to your registered contact.' } };
    if (challenge === 'NEW_PASSWORD_REQUIRED') {
      next.requiredAttributes = list(parameters.requiredAttributes).map(v => v.replace(/^userAttributes\./, ''));
      return { state: next, view: { step: 'new-password', requiredAttributes: next.requiredAttributes } };
    }
    if (challenge === 'SELECT_MFA_TYPE') {
      next.choices = list(parameters.MFAS_CAN_CHOOSE).filter(v => v in codeChallenges);
      if (!next.choices.length) throw new AuthError('UnsupportedChallenge');
      return { state: next, view: { step: 'select-mfa', choices: next.choices } };
    }
    if (challenge === 'MFA_SETUP' && list(parameters.MFAS_CAN_SETUP).includes('SOFTWARE_TOKEN_MFA')) {
      const setup = await call('AssociateSoftwareToken', { Session: next.session });
      if (!setup.Session || !setup.SecretCode) throw new AuthError('Unavailable');
      next.session = setup.Session;
      return { state: next, view: { step: 'setup-mfa', secret: setup.SecretCode } };
    }
    throw new AuthError('UnsupportedChallenge');
  }
  if (input.action === 'signin') {
    const username = field(input, 'email').trim();
    const password = field(input, 'password');
    let result = await call('InitiateAuth', { ClientId: c.clientId, AuthFlow: 'USER_AUTH', AuthParameters: { USERNAME: username, PASSWORD: password, PREFERRED_CHALLENGE: 'PASSWORD', SECRET_HASH: secretHash(username) } });
    // Some pool configurations return the preferred password challenge explicitly.
    if (result.ChallengeName === 'PASSWORD' && result.Session) {
      const canonical = result.ChallengeParameters?.USERNAME || username;
      result = await call('RespondToAuthChallenge', { ClientId: c.clientId, Session: result.Session, ChallengeName: 'PASSWORD', ChallengeResponses: { USERNAME: canonical, SECRET_HASH: secretHash(canonical), PASSWORD: password } });
    }
    return finish(result, username);
  }
  if (input.action === 'forgot') {
    const username = field(input, 'email').trim();
    try { await call('ForgotPassword', { ClientId: c.clientId, Username: username, SecretHash: secretHash(username) }); }
    catch (e) {
      if (!(e instanceof AuthError) || !['UserNotFoundException', 'InvalidParameterException', 'NotAuthorizedException'].includes(e.code)) throw e;
    }
    return { state: { username, challenge: 'RESET_PASSWORD' }, view: { step: 'reset', message: 'If this account can be recovered, a code has been sent to its registered contact.' } };
  }
  if (!state) throw new AuthError('Expired');
  if (input.action === 'reset' && state.challenge === 'RESET_PASSWORD') {
    await call('ConfirmForgotPassword', { ClientId: c.clientId, Username: state.username, SecretHash: secretHash(state.username), ConfirmationCode: field(input, 'code', 32), Password: field(input, 'password') });
    return { view: { step: 'signin', message: 'Password updated. Sign in with your new password.' } };
  }
  if (input.action !== 'challenge' || !state.session || state.challenge === 'RESET_PASSWORD') throw new AuthError('InvalidInput');
  const responses: Record<string, string> = { USERNAME: state.username, SECRET_HASH: secretHash(state.username) };
  let session = state.session;
  if (codeChallenges[state.challenge]) responses[codeChallenges[state.challenge]] = field(input, 'code', 32);
  else if (state.challenge === 'NEW_PASSWORD_REQUIRED') {
    responses.NEW_PASSWORD = field(input, 'password');
    const attributes = input.attributes;
    for (const name of state.requiredAttributes ?? []) {
      if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) throw new AuthError('InvalidInput');
      responses[`userAttributes.${name}`] = field(attributes as Record<string, unknown>, name, 2048);
    }
  } else if (state.challenge === 'SELECT_MFA_TYPE') {
    const choice = field(input, 'choice');
    if (!state.choices?.includes(choice)) throw new AuthError('InvalidInput');
    responses.ANSWER = choice;
  } else if (state.challenge === 'MFA_SETUP') {
    const checked = await call('VerifySoftwareToken', { Session: session, UserCode: field(input, 'code', 32), FriendlyDeviceName: 'NEWNEO authenticator' });
    if (checked.Status !== 'SUCCESS' || !checked.Session) throw new AuthError('CodeMismatchException');
    session = checked.Session;
  } else throw new AuthError('UnsupportedChallenge');
  return finish(await call('RespondToAuthChallenge', { ClientId: c.clientId, Session: session, ChallengeName: state.challenge, ChallengeResponses: responses }), state.username);
}

// Additional protection for this single-instance deployment; Cognito applies its own throttling.
// Before horizontal scaling, replace this bounded process-local limiter with a shared store.
export class AuthLimiter {
  private entries = new Map<string, { count: number; until: number }>();
  allow(key: string, limit: number, windowMs: number, now = Date.now()) {
    for (const [k, entry] of this.entries) if (entry.until <= now) this.entries.delete(k);
    const hash = createHash('sha256').update(key.toLowerCase().trim()).digest('hex');
    const entry = this.entries.get(hash);
    if (!entry) {
      if (this.entries.size >= 10000) return false;
      this.entries.set(hash, { count: 1, until: now + windowMs }); return true;
    }
    return ++entry.count <= limit;
  }
}
export function authMessage(error: unknown) {
  const code = error instanceof AuthError ? error.code : 'Unavailable';
  const messages: Record<string, string> = {
    NotAuthorizedException: 'Email or password is incorrect. Please try again.',
    UserNotFoundException: 'Email or password is incorrect. Please try again.',
    UserNotConfirmedException: 'Contact your workspace administrator to complete your account invitation.',
    PasswordResetRequiredException: 'Please use “Forgot password?” to reset your password before signing in.',
    InvalidPasswordException: 'This password does not meet your organization’s policy. Use a longer password with uppercase, lowercase, numbers and symbols.',
    PasswordHistoryPolicyViolationException: 'Choose a password you have not used before.',
    CodeMismatchException: 'That verification code is incorrect. Please try again.',
    ExpiredCodeException: 'That code expired. Start again to request a new one.',
    Expired: 'This sign-in attempt expired. Please start again.',
    InvalidInput: 'Check the required fields and try again.',
    TooManyRequestsException: 'Too many attempts. Please wait a few minutes and try again.',
    LimitExceededException: 'Too many attempts. Please wait a few minutes and try again.',
    UnsupportedChallenge: 'Your account requires another sign-in method. Use the secure alternate sign-in below.',
  };
  return messages[code] ?? 'Sign-in is temporarily unavailable. Please try again shortly.';
}
