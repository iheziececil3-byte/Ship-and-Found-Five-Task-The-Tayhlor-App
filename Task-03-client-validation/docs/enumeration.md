# Enumeration and Sensitive Data

## 1. Which field, and why its shape is sensitive
**Password:** The password field previously displayed a hint saying "Must be at least 8 characters" before the user even typed anything. I completely removed this text. The length and format of a password are sensitive because they determine how vulnerable the account is to brute-force attacks. Giving clues about the special data is the same reason a failed login says "incorrect details" rather than naming which half was wrong.

## 2. What an attacker gains from knowing the shape
If an attacker knows the exact minimum length and required characters, they can tune their brute-force and dictionary attacks. Instead of guessing randomly, they can start their attack at exactly 8 characters and ignore anything shorter. By removing the hint entirely, we do not hand automated scripts a free blueprint of our password policy.

## 3. The trade-off accepted
Completely removing the hint makes the form significantly harder for legitimate users. A user has no idea what the password requirements are until they type one, hit submit, and get rejected. This could cause frustration, especially for users who try to use a short password and have to keep guessing what the rules are. However, I believe this trade-off is worth it for a few reasons. First, the security benefit of not leaking the exact format to bots is high. Second, modern password managers will generate strong passwords anyway. Third, the Zod server validation will still catch a bad password and return a clear error message explaining what went wrong *after* submission, balancing security with helpfulness.