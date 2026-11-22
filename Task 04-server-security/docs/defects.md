# Known Defects (Task 4)

The bootcamp requires honest documentation of defects. A perfect submission implies the project is trivial or misrepresented. Below are real defects found in the Tayhlor application during Task 4.

### 1. Fire-and-forget Emails can be dropped
*   **File Location:** `src/app/api/auth/register/route.ts`
*   **Description:** The background email sending uses a `void sendEmail().catch()` pattern (the Next.js 14 way) instead of Next.js 15's `after()` API. 
*   **Production Cost:** In a serverless environment (like Vercel), the server might freeze immediately after returning the HTTP response. If this happens, the background email task is killed, and the user never receives their verification code.
*   **Planned Fix:** Upgrade the project to Next.js 15 and use the `after()` API, or integrate a dedicated background job queue (like Inngest) for guaranteed delivery.

### 2. Random Int Boundary Bug (Fixed)
*   **File Location:** `src/lib/verification-code.ts`
*   **Description:** The code generator originally used `crypto.randomInt(100000, 999999)`. In JavaScript, the upper bound is exclusive, meaning the code could never actually be `999999`.
*   **Production Cost:** An attacker could know with 100% certainty that the code is never `999999`, reducing the brute-force search space slightly. 
*   **Status:** Fixed. The upper bound was changed to `1000000`.

### 3. PRD Mismatch: Link vs. Code (Resolved)
*   **File Location:** `docs/tayhlor_prd_v0.4.md` / `src/app/api/auth/verify-email/route.ts`
*   **Description:** The PRD (FR-05) originally specified a single-use verification link valid for 24 hours. However, the implementation uses a 6-digit numeric code valid for 7 minutes. 
*   **Production Cost:** A 6-digit code is easier for users to type manually across devices, but requires strict rate-limiting against brute force attacks. 
*   **Status:** Resolved. The PRD (FR-05) and project rules (`accounts-and-access.md`, `AGENTS.md`) were updated to specify the 6-digit code expiring in 7 minutes as the single source of truth, and the verify route is strictly rate-limited.

### 4. Missing Entry Point (Fixed)
*   **File Location:** `src/app/auth/page.tsx`
*   **Description:** There was originally no "Verify your email" link on the login page. If a user closed the verification tab or refreshed their browser, they could not easily navigate back to the verify screen.
*   **Production Cost:** The user would be permanently locked out of their account and forced to contact support.
*   **Status:** Fixed. A "Need to verify your email?" link was added to the login and signup forms.

### 5. Verification Code Reuse (Tested, Not a Defect)
*   **File Location:** `src/app/api/auth/verify-email/route.ts`
*   **Description:** The bootcamp highlighted a common defect where a verification code could be reused after a successful verification. 
*   **Status:** **Not a defect in this build.** I tested this by verifying a code successfully, keeping a duplicate tab of the verify page open, and attempting to use the same code again. The server correctly rejected it with a `400 Bad Request`. The code is successfully nullified in the database immediately after the first successful use.