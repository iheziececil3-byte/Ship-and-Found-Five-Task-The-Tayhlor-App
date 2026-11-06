# Single Page Application (SPA) Rationale

## 1. Why instant form switching matters
When a user clicks a link to switch between logging in and creating an account, they expect instant feedback. By collapsing separate pages into a single route controlled by a URL query parameter (`?mode=login` or `?mode=signup`), we avoid a full page reload. The browser does not have to re-download the HTML, CSS, and JavaScript bundles. This keeps the application feeling snappy, reduces server load, and removes the "white flash" that breaks a user's concentration.

## 2. The user experience before
Previously, Tayhlor had three separate physical routes (`/auth/signin`, `/auth/signup`, and a planned reset page). If a user clicked "Sign Up" from the login page, the browser would make a full network request for a brand-new HTML document. This caused a visible loading delay and a white screen flash. It felt clunky, especially on slower mobile connections.

## 3. One case where separate pages would be the better choice
While a SPA is better for auth flows, separate pages (Multi-Page Application) are better for heavy, distinct content where SEO is critical. For example, if Tayhlor added a public blog or a large marketing campaign landing page, those should be separate static pages. A blog post needs a unique URL that can be shared, indexed by Google, and loaded quickly without pulling in the entire React application bundle.