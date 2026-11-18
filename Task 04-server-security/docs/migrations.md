# Database Migrations in Tayhlor

## 1. Why migrations are forward-only

I treat database migrations as a version-controlled history of changes to my database structure.

A migration describes a specific change that moves the database from one known state to another. For example, when I added the required `nickname` field to the `User` model, I could not simply add it as required immediately because existing users already had records without a nickname.

I had to introduce the field as optional, populate the existing records, and then make it required through a subsequent migration.

This demonstrated why migrations should move the database forward in controlled steps.

Forward-only does not mean that mistakes can never be corrected. It means I do not casually rewrite database history or attempt to reverse an already-applied migration by editing its original SQL. If a successfully applied migration needs correcting, I create a new migration that moves the database into the desired state.

This approach preserves a consistent and understandable migration history across development, testing, and production environments.

## 2. Why I never edit a migration that has already run successfully

Once a migration has been successfully applied to a database, I treat its migration file as immutable.

There are several reasons for this:

- **Migration history:** Prisma records applied migrations in the database, including information used to track their integrity.
- **Different environments:** A migration may already have been applied to another developer's database or a production database. Editing the file does not automatically update those databases.
- **Reproducibility:** Someone setting up the project from scratch should get the same database structure as someone whose database has been maintained through existing migrations.
- **Consistency:** Editing an already-applied migration can cause the migration files in the repository to disagree with the actual database history.

If I discover a problem in an already-applied migration, I create another migration to correct it rather than rewriting the original.

There is an important exception: a migration that failed before successfully completing may require recovery. Prisma provides `migrate resolve` to mark a failed migration as rolled back or applied, depending on the actual database state. After resolving a failed migration appropriately, its SQL may need correction before it is retried. This is a controlled recovery procedure, not permission to rewrite successfully applied migrations.

## 3. Why I run migrations manually instead of allowing an AI agent to apply them

I use AI coding agents to help inspect my Prisma schema, prepare migration files, review SQL, and explain the changes being proposed.

However, I retain responsibility for applying migrations to the database.

My agent can propose a database change, but it must stop before executing commands that apply migrations or modify the database. I review the proposed SQL and decide when to execute the migration myself.

I follow this approach because database migrations can have consequences beyond changing application code:

- A migration can fail because existing data does not satisfy a new constraint.
- A poorly designed migration can cause data loss.
- A migration can affect the wrong database environment.
- A database reset or destructive command can remove records that cannot easily be recovered.
- An AI agent may misunderstand the current database state or the consequences of a proposed change.

Keeping migration execution under my control gives me an opportunity to inspect the proposed change, understand its impact, and make an informed decision before the database is modified.

The principle is simple: the agent can prepare and explain the change, but I own the decision to apply it.

## 4. The cost of running migrations manually

Manual migration execution provides greater control, but it is not free.

It introduces additional work and operational risks:

- **Slower development:** I have to review the migration, switch to the appropriate terminal, and execute the command myself.
- **Context switching:** I move between the coding agent, terminal, database tools, and application to complete one database change.
- **Human error:** I could forget to apply a pending migration or accidentally execute commands in the wrong order.
- **Deployment delays:** In a team or production environment, waiting for the responsible person to review and apply migrations can slow down releases.
- **Coordination overhead:** Other developers may be unable to work with the latest application changes until their databases have been updated.

Manual execution therefore does not automatically make migrations safe. It transfers the final execution decision to a human, who must still follow a disciplined process.

To reduce these risks, I use migration run sheets, review migration SQL before execution, check migration status, and keep evidence of important migration operations.

