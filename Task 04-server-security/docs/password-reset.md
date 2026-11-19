# Password Reset (FR-03)

## Behaviour

Password reset by email is implemented for email/password accounts.

- `POST /api/auth/password-reset` accepts an email address and sends a reset link through Resend.
- `POST /api/auth/password-reset/confirm` accepts the link token and a new password.
- The reset link expires after 30 minutes, as required by FR-03.
- The link is single-use. Changing the password invalidates every earlier reset link for that account.
- Google-only accounts have no password hash, so no reset link is generated for them. The response remains generic so the endpoint cannot be used to enumerate accounts.

## Why no password-reset table was added

The signed token contains:

- the user ID,
- a version marker derived from the current password hash,
- issue and expiry times,
- a random token ID.

It is signed with `NEXTAUTH_SECRET` using HMAC-SHA256. On confirmation, the version marker is compared with the account's current password hash, and the database update uses a conditional `updateMany` on the original hash. Only one concurrent request can change the password, so replay cannot succeed.

This satisfies the single-use requirement without a new Prisma model or migration in v1.

## Configuration

`RESEND_API_KEY` and `RESEND_FROM_EMAIL` must be set. If either is missing, the request endpoint returns a configuration error rather than claiming that an email was sent.

The link base URL comes from `NEXTAUTH_URL`, with the request origin as a local fallback.
