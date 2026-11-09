# Accessibility Audit

# Field-by-Field Written Audit

I audited every field against the five criteria to ensure the form is usable without a mouse or visual color cues.

### 1. Full Name Field
*   **Colour independence:** Pass. When an error occurs, a red caution icon appears alongside the red border.
*   **Keyboard reachability:** Pass. The field is reachable via the `Tab` key.
*   **Focus visibility:** Pass. The field displays a visible focus ring when tabbed into.
*   **Screen reader announcement:** Pass. Narrator reads: *"Full name, edit, Jane Doe required."*
*   **Error association:** Pass. When the field is left empty, Narrator reads: Please enter at least 2 names separated by a space (e.g. Jane Doe).

### 2. Email Address Field
*   **Colour independence:** Pass. Caution icon appears next to the red border.
*   **Keyboard reachability:** Pass. Reachable via `Tab`.
*   **Focus visibility:** Pass. Visible focus ring.
*   **Screen reader announcement:** Pass. Narrator reads: *"Email address, edit, name@example.com, required."*
*   **Error association:** Pass. Typing an invalid email triggers: *enter a valid email address."*

### 3. Phone Number Field
*   **Colour independence:** Pass. Caution icon is present.
*   **Keyboard reachability:** Pass. Reachable via `Tab`.
*   **Focus visibility:** Pass. Visible focus ring.
*   **Screen reader announcement:** Pass. Narrator reads: *"Phone number, edit 09081166271."*
*   **Error association:** Pass. Typing an incomplete number triggers: *"Phone number, Phone number must be an 11-digit Nigerian number  (e.g., 0908 116 6271)."*

### 4. Password Field
*   **Colour independence:** Pass. Caution icon is present.
*   **Keyboard reachability:** Pass. Reachable via `Tab`.
*   **Focus visibility:** Pass. Visible focus ring.
*   **Screen reader announcement:** Pass. Narrator reads: *"Password, edit, required, has pop up."*
*   **Error association:** Pass. (Note: Because we removed the length hint for security, the screen reader only announces the error *after* submission: *"Password, invalid entry, Password must be at least 8 characters."*)

### 5. Terms & Conditions Checkbox
*   **Colour independence:** Pass. Error is indicated by text, not just color.
*   **Keyboard reachability:** Pass. The spacebar toggles the checkbox.
*   **Focus visibility:** Pass. Visible focus ring on the box.
*   **Screen reader announcement:** Pass. Narrator reads: *"I have read and agree to Tayhlor's Terms & Conditions, checkbox, unchecked scan."*
*   **Error association:** Pass. If submission is attempted without checking, the form alert announces: no reply because create button is invalid till box is checked"*

### 6. Create Account Button
*   **Colour independence:** Pass. The button state is indicated by text and opacity, not just a color change.
*   **Keyboard reachability:** Pass. It is reachable via `Tab` (using `aria-disabled` instead of native `disabled`).
*   **Focus visibility:** Pass. The focus ring is visible.
*   **Screen reader announcement:** Pass. Narrator reads: *"it couldnt see it when i tab"*
*   **Error association:** N/A (Submit buttons do not have inline errors).


## Part 2: The Four Fixes(After fixes)

### 1. Error Announcement (Screen Reader)
*   **The Problem:** When a field had an error, the red border appeared, but the screen reader did not announce the error message when the user tabbed to the field.
*   **The Fix:** Added `aria-describedby` pointing to the error text ID, and `aria-invalid="true"` to the input.
*   **Screen Reader Transcript (After Fix):** *"Full name, edit, Jane Doe required. Please enter at least 2 names separated by a space."*

### 2. Color Independence
*   **The Problem:** Errors were only indicated by a red border. Users with red-green color blindness would not see the error state.
*   **The Fix:** Added a red caution icon (an exclamation mark SVG) next to every inline error message, ensuring color is not the only indicator.

### 3. Disabled Button Tab Order
*   **The Problem:** The "Create Account" button used the native HTML `disabled` attribute. Screen readers skip disabled buttons entirely. A blind user would tab past the button and think there was no way to submit the form.
*   **The Fix:** Removed the native `disabled` attribute and replaced it with `aria-disabled="true"`. Added CSS to make it look disabled and prevent mouse clicks, but kept it focusable via keyboard. Added `aria-describedby` to explain why it is disabled.
*   **Screen Reader Transcript (After Fix):** *"Create Account, button. You must accept the terms and conditions to enable this button. Disabled"*

### 4. Password Requirements Association
*   **The Problem:** The password requirements (8 characters) were removed from the visual UI to stop leaking data shape, meaning screen reader users had no idea what the requirements were until they submitted and failed.
*   **The Fix:** Added an `aria-describedby` to the password field that reads the requirement to the screen reader once the user focuses the field, without displaying it visually to attackers.
**Screen reader announcement:** Pass. Narrator reads: *"Password, edit, required, has pop up.password"*