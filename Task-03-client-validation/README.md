# Task 3: The Form, Attacked from Both Sides

## What this task was
Task 3 focused on building a registration form that is usable by everyone (including screen reader users) and understanding the harsh reality that client-side validation is a convenience, not a security control. The goal was to build accessible error states, defend against bad data, and then prove that the server is defenceless without backend validation.

## What I built
1.  **Single-Page Authentication:** Collapsed the separate Login, Signup, and Password Reset pages into a single Next.js route (`/auth`) driven by URL query parameters (`?mode=login` or `?mode=signup`). This removed the white-flash reload and made the app feel like a modern SPA.
2.  **Information Design:** Removed redundant text next to the logo, collapsed two auth buttons into one "Get Started" button to reduce decision fatigue, and applied the Task 1 typography tokens to all buttons.
3.  **Client-Side Validation (4 Categories):** 
    *   *Empty Fields:* Inline errors on blur.
    *   *Length & Structure:* Full name requires 2 words, password requires 8 characters.
    *   *Format:* Real-time email validation on signup, but only on submit for login.
    *   *Sensitive Data:* Completely removed the password hint from the placeholder to prevent leaking the password shape.
4.  **Accessibility (WCAG):** Added `aria-invalid`, `aria-describedby`, and `role="alert"` to all inputs. Added caution icons next to errors so color is not the only indicator. 
5.  **The Number Input Fix:** Swapped the phone number field from `type="number"` to `type="text"` with `inputMode="numeric"` to prevent the leading zero from being stripped (e.g., `0902` becoming `902`).
6.  **The Attack:** Bypassed the React form entirely and sent a direct cURL request to the API with a fake email (`a@b`) and a 1-letter name.
7.  **The Rollback:** Used Git to roll back a temporary code removal by naming the specific commit ID, rather than asking the AI to "undo" the change.

## What I decided
*   **Real-time vs. Submit Validation:** I enforced real-time validation on the signup form because it is a new user entering data for the first time. I disabled real-time validation on the login form because checking format aggressively as someone types their password is annoying.
*   **Password vs. Visibility Toggle:** I removed the "Confirm Password" field and replaced it with an eye icon (visibility toggle) to improve the user experience. In a stricter industry (like banking), a confirm field would be better.
*   **Disabled vs. Hidden Button:** I implemented the hidden submit button first (where it only appears when the form is valid) but rejected it. A visible, disabled button (using `aria-disabled`) is better because it manages user expectations and explains *why* it is disabled via screen readers.

## What I got wrong
*   **The Client-Side Illusion:** I realized that no matter how many React validation rules I wrote, they were completely useless against a direct cURL request. The server accepted a user with the email `a@b` because there was no backend Zod validation at the time. This proved that client-side validation is only for UX, not security.
*   **The Screen Reader Gap:** When I ran a screen reader on my form, I realized it was completely skipping my disabled submit button. A blind user would tab past the button and think there was no way to submit. I had to fix this by changing the button to use `aria-disabled` instead of the native `disabled` attribute.

## How to run the tests
1. Run `npm run dev`.
2. Go to `/auth?mode=signup` and try switching to `?mode=login` to see the SPA behavior.
3. To test the number input fix, type `0902` into the phone field and ensure the zero is not dropped.
4. To test the cURL attack (from Task 3), send a request with an invalid email to `/api/auth/register`. (Note: In Task 4, we added Zod to the server, so the server will now reject it).