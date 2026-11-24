# Task 2: Repository and Scaffold

## What this task was
Task 2 focused on taking an application from nothing to a working, version-controlled repository. The goal was to prove that I could control an AI agent using context files, scaffold a Next.js application from scratch, diagnose what was actually running (versus what just looked like it was running), and set up professional Git workflows.

## What I built
1.  **Agent Context:** Wrote a strict `AGENTS.md` and `PRD.md` to force the AI agent to read the design system and plan before writing code.
2.  **Scaffolding:** Used the agent to build the initial Next.js app, capturing the agent's plan and assumptions *before* approving the code generation.
3.  **Diagnostics (The False Success):** Added a signup form and proved it wrote to the database by capturing the row ID in Prisma Studio. Then, deliberately broke the database connection and proved that the frontend still showed a success message (a "false success").
4.  **The Three Breakages:** 
    *   *Nested Folder:* Fixed the project folder being nested inside itself.
    *   *Port Conflict:* Killed a zombie process holding port 3000.
    *   *404 Error:* Caused and diagnosed a blank page routing error.
5.  **Information Design:** 
    *   Added dynamic page titles and Open Graph tags.
    *   Removed redundant text next to the logo to reduce visual clutter.
    *   Collapsed the "Log In" and "Sign Up" buttons into a single "Get Started" action.
    *   Set a `max-width` on the main heading to prevent it from stretching across the screen.
    *   Used `clamp()` to make the heading text responsive on mobile.
6.  **Git Workflow:** Created a feature branch, opened a Pull Request with a real description, merged it, and created a second branch that was deleted without merging (proving the ability to abandon bad ideas).

## What I decided
*   **Trunk-based Git:** I used short-lived feature branches (like `feature/information-design`) and merged them into `main` quickly. This prevents massive merge conflicts and keeps the project history clean.
*   **The Working Tree:** I drew the pipeline from my local machine to GitHub, marking exactly where code becomes visible to the user and where mistakes can no longer be undone quietly.

## What I got wrong
*   **The False Success:** I assumed that because the UI showed a green success banner after signing up, the database was working. It wasn't until I looked at the server logs (no `201 Created`) and Prisma Studio (no rows) that I realized the backend was broken. 
*   **The Readme:** My first README was a guess. I gave it to a friend, and they got stuck on step 3 because I forgot to mention an environment variable. I had to fix the README to make it actually runnable.

## How to run the tests
1. Clone the repository.
2. Run `npm install`.
3. Copy the `.env.example` to `.env` and add your database URL.
4. Run `npm run dev` and visit `http://localhost:3000`.
5. To see the Git history graph, run `git log --graph --oneline --all`.