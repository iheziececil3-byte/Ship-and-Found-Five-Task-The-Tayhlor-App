# Security Controls Considered but Not Implemented

A senior engineer knows that security is about trade-offs. Here are four security controls I considered for Tayhlor but deliberately chose not to implement in version 1.

### 1. Multi-Factor Authentication (MFA / 2FA)
*   **What it is:** Requiring a user to enter a code from an authenticator app (like Google Authenticator) in addition to their password when logging in.
*   **Why it was not worth it now:** The Tayhlor MVP is for a single local tailoring shop. MFA adds significant friction to the login process (users lose their phones, get locked out, and need support). The business risk of a customer's measurement profile being stolen does not currently justify the support cost of MFA.
*   **What would have to change:** If Tayhlor scales to a multi-tenant SaaS platform with thousands of users and stores highly sensitive payment data, MFA would become mandatory.

### 2. CAPTCHA on Registration and Login
*   **What it is:** Using a service like Cloudflare Turnstile or Google reCAPTCHA to stop automated bots from spamming the signup form.
*   **Why it was not worth it now:** CAPTCHAs frustrate users and hurt conversion rates. Because we implemented strict IP rate limiting (5 requests per minute) and breached password checks, a bot cannot easily spam the system. 
*   **What would have to change:** If we noticed a massive spike in fake signups from distributed botnets (which rotate IPs to bypass rate limits), we would implement a CAPTCHA.

### 3. Hardware Security Key (WebAuthn / Passkeys)
*   **What it is:** Allowing users to log in using their device's biometrics (FaceID, TouchID) or a physical YubiKey instead of a password.
*   **Why it was not worth it now:** Passkeys are the future of authentication, but implementing them requires a complex fallback system and significant UI changes. The target user base for a local tailor is not yet ready for passkeys.
*   **What would have to change:** If Tayhlor targets tech-savvy users or requires high-security access (e.g., a fintech platform), we would make passkeys the primary login method.

### 4. Audit Logging for Read Operations
*   **What it is:** Logging every single time a user views a page or reads a record (e.g., "Tailor viewed Customer A's measurements").
*   **Why it was not worth it now:** We currently log every *write* and *status change* (which is critical for financial auditing). Logging every *read* operation would bloat the database and slow down the application. 
*   **What would have to change:** If the tailor employed multiple assistants with different levels of trust, we would need strict read-audit logs to track who looked at what.