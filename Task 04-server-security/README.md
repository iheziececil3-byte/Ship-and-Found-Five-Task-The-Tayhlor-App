# Task 4: Server Security

## What this task was
Task 4 focused on making the server the absolute source of truth. It covered database schema design, deliberate migrations, password hashing, rate limiting, and email verification. The goal was to prove that client-side validation is not security, and to implement the backend defences that hold when someone ignores the browser entirely.

## What I built
1.  **Schema & Migrations:** Added a `PaymentAttempt` table to track failed payments. Proved migration failures (adding a required column to a populated table) and fixed it using the three-step process. Deliberately triggered a drift error and fixed it.
2.  **Hashing:** Proved that bcrypt takes ~291ms while SHA-256 takes ~0.000007ms, explaining why slow hashing protects against brute-force attacks.
3.  **Normalisation:** Ensured emails are lowercased and trimmed on every route. Passwords are trimmed but not lowercased.
4.  **Zod Validation:** Measured Zod validation at ~7ms, proving it is not a performance bottleneck. Replaced all manual validation in route handlers with Zod schemas.
5.  **Server-Side Enforcement:** Repeated the Task 3 cURL attack (sending a fake email and 1-letter name) and proved the server now rejects the malformed data with a `400 Bad Request`.
6.  **Rate Limiting:** Implemented a sliding window rate limit of 5 requests per minute per IP. Triggered the limit (`429 Too Many Requests`) and defeated it by spoofing the `x-forwarded-for` header.
7.  **Breached Passwords:** Implemented K-Anonymity via the HaveIBeenPwned API to block breached passwords without sending the actual password over the network.
8.  **Email Verification:** Implemented a 6-digit code (expiring in 7 minutes) generated using `crypto.randomInt()`. Sent via Brevo SMTP (Nodemailer) in a background job. Added a resend feature and a recovery link on the login page.

## What I decided
*   **Rejected Resend's sandbox:** Resend restricted delivery to only the account owner's email. I switched to Brevo SMTP (using Nodemailer) to allow real users to receive emails.
*   **Fail-closed for Breached Passwords:** If the HIBP API is down, registration is blocked. This prevents users from slipping through with unverified passwords.
*   **Fire-and-forget over `after()`:** Because the project runs on Next.js 14, I used a fire-and-forget pattern (`void sendEmail().catch()`) for background emails. I documented the risk of this in `docs/defects.md`.
*   **7-minute Expiry:** Chosen as a balance between giving real users enough time to check their email and minimizing the attack window for brute-forcing the 6-digit code.

## What I got wrong
*   **The Migration Reset Trap:** I initially used `npx prisma migrate dev` for local development. However, when I tried to add a required column to a table with existing data, Prisma prompted me to *reset the entire database* (which would delete all my test users). To safely apply the queued migration without wiping my data, I switched to `npx prisma migrate deploy`. This taught me that `migrate dev` is powerful but dangerous, and `migrate deploy` is the safest way to apply queued migrations without destructive resets.
*   I forgot to capture the database state before running my first test signup, so I had to honestly recreate the "before" state.
*   I had to fix the random integer generation for the verification code because `randomInt(100000, 999999)` could never produce `999999`.
*   I originally forgot to add an entry point for the verification page on the login screen, locking out users who closed their tab. I fixed this by adding a "Need to verify your email?" link.

## How to run the tests
1. Ensure `.env` has `DATABASE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL` configured.
2. Run `npm run dev`.
3. To test the rate limit, send 6 rapid cURL requests to `/api/auth/register`.
4. To test the breached password check, sign up with the password `password123`.
5. To test verification, sign up, check your email for the 6-digit code, and enter it at `/auth/verify`.