# README Test

## Reviewer Feedback

**Test status:** Preliminary review completed; practical setup test pending.

The README was shared with someone who had not previously worked on the project. The reviewer read through the documentation and provided the following feedback.

### 1. Areas That Need Clarification

The reviewer identified two sections that could be clearer:

**Authentication Infrastructure**

The reviewer requested clearer explanations of the NextAuth v4 configuration in `src/lib/auth.ts`, including the JWT session strategy, seven-day inactivity expiration (ACC-08), role augmentation (`CUSTOMER` and `TAILOR`), and Credentials provider integration.

**Database Model Operationalization**

The reviewer requested clarification that although the schema and baseline migration define all nine domain models, only the `User` model is currently queried and mutated by live application code.

The remaining eight models, including `Order`, `Measurement`, `Payment`, and `Fitting`, do not yet have corresponding runtime API routes, server actions, or mutation pipelines.

### 2. Getting Started Instructions

The reviewer read through the getting-started instructions and reported:

> "If you wanted me to run the 'get started' part, I have not done that yet as my laptop battery is low. I read through the steps to run and it was straightforward."

The reviewer therefore found the instructions straightforward to read but did not execute them or attempt to run the application.

### 3. Outstanding Test

The practical setup test is still pending.

When the reviewer is available, they will be asked to follow the getting-started instructions independently and report any difficulties encountered.

### 4. Planned Follow-up

After the practical test:

- Record the reviewer's actual setup experience and any difficulties encountered.
- Update this document with the additional findings.
- Revise the main README to address the confirmed clarity issues and practical testing feedback.
