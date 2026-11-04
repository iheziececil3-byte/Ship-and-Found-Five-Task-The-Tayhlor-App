# The Working Tree and Git Branches

## What breaks when a tree has one branch?

When a project uses only one branch for all development, every change is made directly to the same line of development.

This creates several risks:

1. **Unstable main branch:** Incomplete or defective work can affect the main branch before it has been properly reviewed and tested.
2. **Changes become mixed together:** Different features and fixes can become difficult to isolate, review, and troubleshoot.
3. **Testing becomes harder:** A developer may struggle to test one feature independently without including unrelated changes.
4. **Collaboration becomes riskier:** Multiple developers working on the same branch can interfere with each other's changes or create unnecessary merge conflicts.
5. **Rollback and troubleshooting become less straightforward:** When several unrelated changes are committed together, identifying which change introduced a problem becomes more difficult.

Feature branches provide separation. Each feature can be developed and tested independently before it is reviewed and merged into `main`.

For example, `feature/signup` can contain signup-related work while `feature/database` contains database-related work. Once the changes are ready and have passed the necessary checks, they can be merged into `main`.

A feature branch does not guarantee that code is correct. It provides isolation and makes review and integration more controlled.

## Why does this matter more after the first deployment?

Before deployment, mistakes are generally limited to the development environment and the people working on the project.

After deployment, the application becomes available to real users. A defective change can affect their experience, interrupt important operations, or cause incorrect data to be created or modified.

The consequences can extend beyond the code itself. For example:

- Users may submit forms that fail.
- Existing functionality may stop working.
- Incorrect information may be stored.
- Users may receive incorrect notifications.
- Business operations may be interrupted.

A deployment can sometimes be rolled back to an earlier version, but rollback does not automatically reverse everything that happened while the defective version was live.

For example, reverting code does not necessarily undo a database change, recover lost information, or reverse an email that has already been sent.

This is why protecting `main`, reviewing feature branches, testing changes, and deploying deliberately become increasingly important as soon as real users depend on the application.

## Conclusion

The working tree represents the movement of changes from local development through Git commits and GitHub to production.

Branches help separate development work, protect the main line of development, and make changes easier to review and integrate.

The goal is not simply to have multiple branches. It is to control how changes move from development into the version that users depend on.