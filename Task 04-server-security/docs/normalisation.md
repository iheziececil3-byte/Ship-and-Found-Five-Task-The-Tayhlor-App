# Normalisation and Trimming

## Email Addresses
Email addresses are normalised to lowercase and trimmed of all whitespace on registration, login, and password reset. The Zod schemas were updated to trim and lowercase the email *before* validating the format. This ensures that a user who types "John.Doe@Example.com " on their phone can successfully log in by typing "john.doe@example.com" on their laptop. 

## Passwords
Passwords are trimmed of leading and trailing whitespace, but they are never lowercased. 

**Why we trim passwords but do not lowercase them:**
We trim passwords to prevent silent login failures caused when a user accidentally copies an invisible trailing space from a password manager. We do not lowercase passwords because passwords are case-sensitive by design, and altering the user's chosen case would change their secret and weaken the security of the hash.