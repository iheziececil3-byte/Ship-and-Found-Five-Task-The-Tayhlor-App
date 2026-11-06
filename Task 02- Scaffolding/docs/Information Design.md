# Information Design

## 1. What I removed and why
I removed the text label next to the logo in the navigation header, leaving only the logo and the brand name "Tayhlor". 
**Why:** The logo itself is universally understood to link to the home page. Adding extra descriptive text created visual clutter and invited redirection confusion.

## 2. What choice I collapsed and why
I removed the separate "Log In" and "Sign Up" buttons from the header and replaced them with a single primary button labelled "Get Started".
**Growth reasoning:** When a first-time visitor lands on the page, they do not know what the product does yet. Asking them to choose between "Log In" and "Sign Up" before they have even read the value proposition creates friction and increases bounce rates. By collapsing this into one action, we guide the user into the product first.

## 3. Heading Wrap (Max-Width)
I applied a `max-width` of `48rem` / `768px` (Tailwind `max-w-3xl`) to the main `<h1>` heading.

**Why:** Without a maximum width, the heading stretches across the entire screen, making it difficult to read and leaving awkward orphaned words (e.g., "precision.") isolated on their own line. Constraining the container to `48rem` (`max-w-3xl`) forces the 7-word headline into a balanced, deliberate two-line shape ("Bespoke tailoring, crafted / with timeless precision."), eliminating orphan words and creating an inverted visual hierarchy that naturally draws attention downward toward the primary call-to-action buttons.
*   **Bad wrap evidence:** `18-heading-wrap-bad.png`
*   **Good wrap evidence:** `19-heading-wrap-good.png`

## 4. Button Sizing
I sized my buttons using padding in `rem` units, not fixed width and height.
*   **Padding:** `0.75rem 1.5rem` (Tailwind `py-3 px-6`)
*   **Corner Radius:** `0.5rem` (Tailwind `rounded-lg`)

**Why:** I used `rem` padding instead of fixed pixel dimensions so that the buttons grow naturally if a user increases their browser's default text size. This maintains accessibility. I chose a `0.5rem` corner radius because it provides a modern, soft aesthetic that fits the bespoke tailoring brand.

## 5. Design System Verification
To ensure the agent actually consumed the design system from Task 1, I asked it directly: *"Which typography style class or CSS token did you apply to the main 'Get Started' button text?"*

**Agent's exact response:**
> We applied the design system's **`label-large`** typography style class to the main **"Get Started"** button and all other buttons on the landing page.
> 
> The `.label-large` class is defined in `src/styles/tokens.css` and maps directly to the design system's token scale:
> * `--type-label-large-font-family: var(--font-family-body);` (Manrope)
> * `--type-label-large-font-size: 14px;`
> * `--type-label-large-font-weight: 500;`
> * `--type-label-large-line-height: 19.6px;`
> * `--type-label-large-letter-spacing: -0.014px;`
> 
> The agent successfully updated "Get Started", "Sign Out", "Create Customer Account", "Sign In to Dashboard", "Access Atelier Orders", and "My Measurements" with this class.

**Conclusion:** The agent successfully applied the `label-large` typography style from the design system, proving the tokens were consumed correctly.