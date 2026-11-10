# Roll Back Without Hallucination

## 1. Commit List (Before Rollback)

```text
e6f8742 temp(auth): remove server-side zod validation for testing
95e6cc8 docs(task-03): add step 8 attack evidence and client-side-is-not-security report
3a3d124 feat(auth): add disabled submit button with terms click feedback and update validation docs
ca20efd docs(task-03): update accessibility audit with after-fix transcripts and normalize evidence extensions
5ac75bb feat(a11y): replace native disabled with aria-disabled and screen-reader hint on submit button
8dcbb82 docs(task-03): add accessibility audit, enumeration documentation, and screen reader evidence
```

## 2. Specific Commit ID Chosen

- **`95e6cc8`** (`docs(task-03): add step 8 attack evidence and client-side-is-not-security report`)

I chose `95e6cc8` because it preserves all Step 8 documentation and evidence while keeping server-side Zod validation intact before the temporary change (`e6f8742`) was introduced.

## 3. Command Run

```bash
git reset --hard 95e6cc8
```

Output:

```text
HEAD is now at 95e6cc8 docs(task-03): add step 8 attack evidence and client-side-is-not-security report
```

This restored server-side Zod validation in `src/app/api/auth/register/route.ts` and `src/lib/auth.ts` cleanly.

## 4. Why Naming the Commit ID Is Safer Than Describing the Change in Words

Naming an exact commit ID points to a single, immutable snapshot of the repository, eliminating any guesswork about how many commits back to go or which files belong in the rollback. Describing a change in words forces the person or agent to interpret commit messages and guess your intent, which risks reverting the wrong changes or accidentally discarding valid work like the Step 8 documentation.

