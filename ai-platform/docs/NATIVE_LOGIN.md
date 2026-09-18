# NEWNEO native sign-in

The approved split-screen `/login` page now contains the authentication form. Its default path posts to `/api/auth/native` and stays on `app.newneo.ai` for password sign-in, first-login password changes, MFA and password recovery. Cognito remains the identity provider. The existing OAuth/PKCE endpoints remain available only as an alternate path for unsupported/federated challenges; the normal form does not redirect to managed login.

## Security and behavior

- Uses the pool's existing `ALLOW_USER_AUTH` choice-based flow with `PREFERRED_CHALLENGE=PASSWORD`. No pool/client settings, password policies, MFA policies or user accounts were changed.
- Requests are same-origin POSTs with bounded JSON bodies and no-store responses. Client secret and Cognito tokens remain server-side; passwords are passed over HTTPS and never persisted or logged by the handler.
- Cognito determines each challenge. Continuation state is encrypted/authenticated in a short-lived HttpOnly, Secure, SameSite cookie. It is isolated from the application session and cleared on completion, cancellation or logout. Normal challenge lifetime is three minutes, matching this app client.
- Supports password, new-password-required (including required attributes), authenticator/SMS/email codes, MFA method selection and time-based authenticator enrollment. Unsupported methods fail closed with an explicit alternate sign-in link.
- ID tokens are verified by `aws-jwt-verify` against Cognito signing keys, issuer, audience, token use and expiry before creating the existing NEWNEO session. Session membership/authorization continues through the existing `/welcome` workspace resolver.
- Recovery gives the same response for unavailable/nonexistent accounts and does not create a session after resetting a password.
- Additional rate limits: 15 account attempts per five minutes, three recovery requests per 15 minutes and 300 aggregate requests per minute. The bounded limiter is process-local, appropriate to the current single-instance deployment. It must move to a shared store before horizontal scaling; Cognito's throttling remains independent.
- No refresh token is retained. Session lifetime remains at most one hour, as in the previous flow.

## Validation

Unit coverage exercises verified-token gating, canonical usernames, mandatory MFA, required attributes, recovery, MFA setup, unsupported/expired state, purpose-separated encrypted cookies, throttling and generic errors. Typecheck and production build also run.

Production `USER_AUTH` was probed using a fictitious account: Cognito returned the expected `NotAuthorizedException`, confirming the flow is enabled without changing AWS settings. A real credential/MFA completion must be performed by the account holder; no real password is used by automation.

## Operations

Uses the existing `OIDC_ISSUER_URL`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `SESSION_SECRET`, `APP_ORIGIN` and database configuration. No new AWS service or IAM credential is required. Rollback can restore the previous app image/source; OAuth sign-in endpoints are retained.

Hosted verification (2026-09-18): container healthy; cross-origin POST rejected with HTTP 403 and no-store; fictitious credentials rejected in the native form while URL stayed `/login`; recovery navigation stayed in the branded page; desktop and 390px mobile layouts inspected with no horizontal overflow. Test suite: 71 passed, one environment-dependent test skipped. The account holder's successful real login remains the final end-to-end confirmation.
