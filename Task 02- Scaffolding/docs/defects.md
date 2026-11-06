# Known Defects

The bootcamp requires honest documentation of defects. A perfect submission implies the project is trivial or misrepresented. Below are real defects found in the Tayhlor application during Task 2.

### Defect 1: Missing Rate Limiting on the Authentication Route
*   **File Location:** `src/app/auth/page.tsx` (and associated server actions)
*   **Description:** The unified authentication page (collapsed in Task 3) accepts an unlimited number of login and signup attempts. There is no middleware or rate limiter currently protecting the auth endpoints.
*   **Production Cost:** An attacker could write a simple script to brute-force customer passwords or spam the system with thousands of fake account registrations. This would degrade server performance, potentially crash the database, and compromise customer accounts.
*   **Planned Fix:** This will be addressed in Task 4 (Server Security) by implementing IP and email-based rate limiting using a shared store (like Upstash Redis).

### Defect 2: Client-Side Validation is Not Enforced on the Server
*   **File Location:** `src/app/auth/page.tsx` (Form validation logic)
*   **Description:** The signup and login forms use client-side HTML validation (e.g., `<input type="email" required>`). However, the backend API route/server action does not currently validate the shape or length of the incoming payload.
*   **Production Cost:** An attacker can bypass the browser entirely using a tool like cURL or Postman and send malformed data directly to the endpoint. This could result in empty rows in the database, extremely long strings that break the UI layout, or invalid email formats that corrupt the mailing list.
*   **Planned Fix:** This will be fixed in Task 4 by installing Zod and creating a strict schema validation at the server boundary before any database query runs.

### Defect 3: Manual Refund Process Creates a "False Success" State
*   **File Location:** `src/app/api/payments/refund/route.ts` (Planned/Scaffolded route)
*   **Description:** When a customer cancels an order after paying the deposit, the database status changes to `REFUNDED`, but the actual money is not sent back through the Paystack API automatically. The system relies on the tailor to log into the Paystack dashboard and manually issue the refund.
*   **Production Cost:** The customer sees "Refunded" on their dashboard, but they have no money. If the tailor forgets to process the manual refund in Paystack, the business looks like a scam. It damages trust and can lead to legal complaints. 
*   **Planned Fix:** While the PRD explicitly states v1 uses manual refunds for simplicity, the UI should be updated to show "Refund Pending: Tailor is processing" instead of "REFUNDED" to prevent misleading the customer.