# Known Defects

The bootcamp requires honest documentation of defects. A perfect submission implies the project is trivial or misrepresented. Below are real defects found in the Tayhlor application during Task 3.

### Defect 1: Client-Side Validation Relies on the User's Browser
*   **File Location:** `src/app/auth/page.tsx` (Form submission logic)
*   **Description:** All 8 validation rules for the signup form (name length, email format, password rules, etc.) are enforced using React state and client-side JavaScript. 
*   **Production Cost:** As proven in Step 8, an attacker can completely bypass these rules using a tool like cURL. If the server-side Zod validation fails or is accidentally removed during an update, the database will be flooded with fake accounts (like `a@b`), corrupting the user base and breaking email notifications. 
*   **Planned Fix:** This was mitigated by restoring the server-side Zod validation, but the architectural flaw remains: the client is doing the heavy lifting for UX, and the server is the only real security. In Task 4, we will implement rate limiting to stop attackers from even reaching the server.

### Defect 2: Password Field Lacks a Confirm Password or Entropy Meter
*   **File Location:** `src/app/auth/page.tsx` (Password input)
*   **Description:** To improve user experience, we removed the "Confirm Password" field and relied on a visibility toggle (the eye icon). We also removed the visual hints to prevent leaking the shape of the password.
*   **Production Cost:** If a user makes a typo in their password and does not click the eye icon to check it, they will create an account with a password they do not know. They will be immediately locked out and forced to use the password reset flow, creating unnecessary friction and support tickets.
*   **Planned Fix:** While the visibility toggle is a good UX compromise, a stricter industry (like banking) would mandate a Confirm Password field to guarantee accuracy. For v1, we accept this risk to reduce signup drop-off.

### Defect 3: Screen Readers Struggle with the Custom Error Alerts
*   **File Location:** `src/app/auth/page.tsx` (ARIA live regions)
*   **Description:** When multiple validation errors occur at once, the `role="alert"` live region can interrupt itself or read the errors out of order for screen reader users. 
*   **Production Cost:** A blind user might hear "Email is invalid" before hearing "Full name is required," causing confusion. If the alert interrupts the screen reader too aggressively, the user might lose their place in the form.
*   **Planned Fix:** In a future iteration, instead of a single live region at the bottom, we should link each error directly to its input using `aria-describedby` (which we did) and move focus to the *first* invalid field on submit (which we implemented), rather than relying on the live region to announce everything at once. 