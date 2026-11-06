# Task 2 Interview Answers

### 1. What is the difference between Git Flow and trunk-based development, and why have a lot of teams moved toward trunk-based?
Git Flow uses multiple long-lived branches (main, develop, feature, release, hotfix) and is designed for scheduled releases. Trunk-based development uses a single "trunk" (main) branch where developers commit frequently and use short-lived feature branches. Teams moved to trunk-based development because Git Flow creates heavy merge conflicts, slows down deployment, and delays feedback. Trunk-based development, when paired with automated testing and CI/CD, allows for continuous integration, faster releases, and smaller, easier-to-review pull requests.

### 2. What does `git push --force` actually do, and why is `--force-with-lease` generally safer?
`git push --force` overwrites the remote branch with your local branch, ignoring any commits that exist on the remote but not locally. If a colleague pushed work while you were rebasing, `--force` will permanently delete their commits. `--force-with-lease` is safer because it checks if the remote branch has changed since you last fetched. If someone else pushed new commits, the push is rejected, preventing you from accidentally destroying their work. It ensures you only overwrite the remote if you are fully up to date.

### 3. Why is rewriting history, through rebase, amend or force push, dangerous on a shared branch?
Rewriting history changes the commit hashes. If you rewrite history on a shared branch (like `main` or `develop`) and force push, everyone else's local copy will diverge from the remote. When they try to pull, Git will create massive, tangled merge conflicts because it sees the old commits and the new rewritten commits as entirely different histories. History rewriting should only be done on local, unpushed branches or branches that are exclusively yours. Once code is shared, history is permanent.

### 4. What is the difference between git merge and git rebase, and when would you actually pick one over the other?
`git merge` combines two branches by creating a new "merge commit" that ties their histories together, preserving the exact timeline of when branches diverged. `git rebase` moves the entire feature branch to begin on the tip of the main branch, effectively rewriting history to make it look like the feature was built on top of the latest main. You pick merge when you want to preserve history and see exactly when a feature was integrated. You pick rebase locally to clean up a messy commit history before opening a pull request, ensuring a linear, easy-to-read log on the main branch.

### 5. What causes a merge conflict, and what is actually happening in the file when you see the conflict markers?
A merge conflict happens when two branches have modified the exact same line of a file, or when one branch modified a file while the other deleted it. Git cannot automatically determine which change to keep. Inside the file, Git inserts conflict markers: `<<<<<<< HEAD`, `=======`, and `>>>>>>> branch-name`. The code between `<<<<<<<` and `=======` is your current branch's version. The code between `=======` and `>>>>>>>` is the incoming branch's version. You resolve it by manually editing the file to keep the correct code and deleting the markers.

### 6. What is the difference between the working directory, the staging area and the repository?
The working directory is the actual folder on your computer where you are actively editing files. The staging area (or index) is a holding zone. When you run `git add`, you are moving changes from the working directory to the staging area, preparing them to be committed. The repository (or local repo) is the `.git` folder where Git permanently stores your committed snapshots. A file moves from Working Directory -> Staging Area -> Repository.

### 7. What is branch protection, and what does it typically enforce?
Branch protection is a GitHub feature that prevents accidental or unauthorized changes to critical branches like `main`. It typically enforces rules such as: requiring a pull request before merging, requiring at least one peer review approval, requiring status checks (like automated tests) to pass before merging, and forbidding force pushes or branch deletion. It ensures that bad code cannot be pushed directly to production.

### 8. Walk me through a technical project you built end to end.
I built Tayhlor, a full-stack tailoring management application for a single shop. I used Next.js, TypeScript, Prisma, and PostgreSQL. I started by writing a PRD and designing the database schema to handle users, measurements, orders, and payments. I then scaffolded the Next.js app using an AI agent, ensuring it consumed my custom Figma design system. I implemented the order state machine, ensuring customers could only pay deposits after a tailor accepted an order. I integrated Paystack for payments, using webhooks and server-side verification to prevent fraud. Finally, I added a RAG-based AI FAQ assistant using Gemini and pgvector to answer customer questions only from approved business documents.

### 9. Tell me about a time when something you built broke in production.
During the scaffold of Tayhlor, I added a signup form that appeared to work perfectly. The UI showed a success message and redirected the user. However, when I checked the database, no rows were being created. The server was returning a 200 OK instead of a 201 Created. The issue was that the Prisma client was misconfigured, and the error was being swallowed by a try-catch block that still returned a success response to the frontend. I fixed it by adding proper error logging and ensuring the API route returned a 500 status code on database failure. I also added a database write test to the CI pipeline.

### 10. How do you approach learning a new technical platform or codebase quickly when starting a new engagement?
I start by reading the documentation and the README to understand the architecture and how to run the app locally. I then look at the folder structure and the database schema to understand the data model. I trace a single feature end-to-end—from the UI component, through the API route, down to the database query—to see how the stack connects. Finally, I look at the tests and the git history to understand the coding standards and past decisions. I prefer to make a small, non-breaking change first (like fixing a typo or adding a log) to verify my local environment is working.

### 11. What is the difference between code that is correct and code that is complete?
Correct code works for the happy path and passes its immediate tests. Complete code handles the edge cases, gracefully handles errors, is readable by others, is secure, and is properly documented. A login form can be "correct" if it logs in a user with the right password. It is only "complete" when it handles wrong passwords, rate limits brute force attacks, validates email formats, prevents SQL injection, and logs the activity.

### 12. How do you design software for a customer who will need to maintain it after you are gone?
I prioritize clear documentation and strict, standard conventions. I write a comprehensive README with exact setup instructions. I comment complex business logic (like the payment verification flow). I use well-known frameworks (Next.js, Prisma) rather than obscure libraries, so the next developer can find help online. I ensure the codebase has automated tests so they can refactor safely. Most importantly, I avoid clever, undocumented tricks and stick to readable, explicit code.

### 13. Your first page load took a specific number of milliseconds. Where did that time go? Name the parts you can measure and the parts you are guessing about.
My first page load took 39,261 ms (about 39 seconds).

Measurable parts: This massive delay was primarily caused by the Next.js development server compiling the TypeScript files and bundling the Tailwind CSS on the fly for the very first time. Additionally, fetching the initial HTML, the CSS files, and the font files (Manrope) over the network took a measurable amount of time.

Guessing parts: I am guessing about the exact time the PostgreSQL database took to wake up from a cold start and establish the Prisma connection. I am also guessing about the time spent initializing the React hydration on the client side.

To measure these precisely, I would use the Next.js profiler to see the server-side rendering time, and the browser's Performance tab to trace the network waterfall and hydration timeline.

### 14. Your application reported success to the user while writing nothing to the database. Explain the mechanism that allowed that, and name the one check that would have caught it in thirty seconds.
The frontend likely had a `try/catch` block that showed a success toast, but the backend API route returned a 200 OK status even if the Prisma query failed. If the database was disconnected, the error was caught, but the server still sent a success response. The one check that would have caught it in thirty seconds is opening the database inspector (like Prisma Studio) and verifying the row ID and timestamp of the new record.

### 15. Wrong-answer analysis. A candidate says: "I always check my app is working by signing up a test user and confirming I get taken to the dashboard. If the dashboard loads, the backend is working." Say what is wrong with this, what it would miss, and what you would do instead.
This approach tests the frontend routing, not the backend functionality. It would miss silent database failures, where the user is redirected to the dashboard but no user record was actually created. It would also miss the fact that the "dashboard" might just be a static page rendering hardcoded data. Instead of just checking if the page loads, I would check the server logs for a 201 Created status code, and I would open the database inspector to verify that the user record exists with the correct timestamp and a properly hashed password.