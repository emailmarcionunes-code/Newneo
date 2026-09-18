# Authenticated Overview and custom authentication domain

Published the authenticated Overview using the same overviewFidelity layout and responsive styles as the approved demo. Uses workspace registry, knowledge, reviews and source-search evaluation APIs independently; partial errors are reported without replacing real data with samples. AI execution and spend remain explicitly unavailable.

Validation: production Docker/Next build passed; authenticated GAW browser inspection confirms six compact metrics and Agent Health / Activity / Governance, Evaluations, Insights composition. Health endpoint ready.

Cognito custom domain: login.newneo.ai, managed login version 2, TLS_V1_2_2021. ACM certificate c6f2e845-5076-43d2-b982-1b3e7dfdffef in us-east-1, non-exportable. DNS validation and login CNAME configured at Cloudflare in DNS-only mode. Alias d14uq89fr0pser.cloudfront.net. Original issuer retained. Public discovery now advertises login.newneo.ai; app restarted to clear cached discovery. Browser verified /api/auth/login redirects to login.newneo.ai with PKCE/state/nonce. No authentication policies, credentials, data, or paid-execution gates changed.

Managed login form uses NEWNEO logo, petroleum button, 20px corner radius and subtle border. Browser login completion requires user's credentials and was not performed as part of visual validation.
