# Validation Rules and Derivations

## 1. Full Name
*   **The rule:** Must be at least 2 characters long and contain at least two words separated by a space.
*   **What goes wrong without it:** Bots and automated scripts often fill name fields with single tokens (like "a" or "test"). Without this rule, the database fills with fake accounts. Furthermore, the tailor needs a real, full name to label the physical garment and avoid handing it to the wrong customer.
*   **Who it wrongly blocks:** People with mononyms (single names like "Cher", "Prince", or "Beyoncé"). It also blocks cultures where a single name is standard. They will have to enter a fake last name or contact the tailor directly to bypass the system.

## 2. Password
*   **The rule:** Must be at least 8 characters long.
*   **What goes wrong without it:** Short passwords are easily cracked by brute-force attacks. If a hacker steals the database, they can guess a 4-character password in seconds.
*   **Who it wrongly blocks:** People who prefer short, easy-to-remember passwords. It forces users to create longer passwords, which they might forget, leading to more password reset requests.
*   *UI Note:* The password hint is only shown once the user starts typing, to avoid overwhelming them on first load.

## 3. Email Address
*   **The rule:** Must contain an `@` character and a domain (e.g., `user@domain.com`). Validated in real-time on the sign-up form.
*   **What goes wrong without it:** If a user types `userdomain.com` (missing the `@`), the system cannot send them the email verification code or order receipts.
*   **Who it wrongly blocks:** No one, really. The rule only checks the *format*, not if the email actually exists. A user with a very unusual but valid email format might get blocked if our regex is too strict. 

Sentence 1 hits the technical reality: Knowing an inbox exists doesn't mean the person at the keyboard owns it. You still have to send a code to prove ownership.

Sentence 2 hits the security reality: If your app says "This email is already registered" on a sign-up form, an attacker can write a script to test a million emails and figure out exactly who your customers are. This is called user enumeration, and it's a major security flaw