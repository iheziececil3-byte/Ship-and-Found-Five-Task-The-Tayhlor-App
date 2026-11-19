# Server-Side Rate Limiting

## Implementation

All current form-submission endpoints are rate limited in `src/middleware.ts` before they reach their route handlers:

| Endpoint | Form | Limit |
| :--- | :--- | :--- |
| `POST /api/auth/register` | Sign-up | 5 requests per minute per IP |
| `POST /api/auth/callback/credentials` | Sign-in | 5 requests per minute per IP |
| `POST /api/auth/password-reset` | Request reset link | 5 requests per minute per IP |
| `POST /api/auth/password-reset/confirm` | Set new password | 5 requests per minute per IP |

The limiter uses `@upstash/ratelimit` with a **sliding window** and Upstash Redis as the shared store. This is the production path and works across multiple server instances.

When Upstash credentials are absent, local development uses an in-memory sliding window so sign-up and sign-in still work without new secrets. That fallback is per server instance and is not used as the production design.

## Client identity

The IP is taken from the first value in `x-forwarded-for`, then from `req.ip`. If neither is available, requests share an `unknown` bucket rather than bypassing the limit.

## Responses

A blocked request receives:

- HTTP `429 Too Many Requests`
- a JSON error message
- `Retry-After`
- `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset`
- matching `X-RateLimit-*` compatibility headers

If the Upstash store fails after being configured, the middleware fails closed with HTTP `503` instead of silently allowing unlimited requests.
