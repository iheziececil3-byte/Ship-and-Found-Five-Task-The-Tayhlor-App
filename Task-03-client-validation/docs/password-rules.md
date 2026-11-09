## 4. The Submit Button (Hidden vs. Disabled)

**Why we chose the Disabled Version:**
I implemented the hidden version first (where the button only appears when the form is completely valid) and captured evidence of it. However, I rejected this approach. Hiding the submit button leaves users confused. They finish typing and wonder, "What do I do next?" because the expected action (the button) is missing.

I implemented the disabled version instead. The button is visible by default but greyed out until the form is valid. As proven in the accessibility audit, it uses `aria-disabled` so screen readers can explain *why* it is disabled. Showing the disabled button is better because it manages the user's expectations. It proves the button exists and shows the user exactly where they need to click once they finish the form.