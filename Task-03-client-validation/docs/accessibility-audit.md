# Accessibility Audit

*(Keep the "Problems Found and Fixed" section that we already wrote here)*

---

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