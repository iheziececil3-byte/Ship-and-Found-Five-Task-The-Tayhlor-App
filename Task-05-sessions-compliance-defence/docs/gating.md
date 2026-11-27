# Gating Strategy

## 1. Which one did I ship?
I shipped **Hard Gating** for Tayhlor. When a new user registers, their account is created, but they are immediately stopped at a verification screen. They cannot access the customer dashboard or place orders until they verify their email address and log in manually.

## 2. Why did I ship Hard Gating?
Tayhlor handles sensitive body measurements and financial transactions (a 70% upfront deposit). Hard gating ensures that every single order and payment is tied to a valid, verified email address. This is critical for two reasons:
1.  **Transactional Reliability:** We need to be certain that the user will receive their payment receipts and order-status updates.
2.  **Fraud Prevention:** It prevents bots or malicious actors from spamming the database with fake accounts and fake orders. The friction is worth the security.

## 3. What the other costs in completed registrations
The "other" option is Soft Gating (logging the user in immediately and showing a warning banner). Implementing Soft Gating would almost certainly **increase the registration completion rate**. 

Hard gating introduces immediate friction: if a user is on their phone, does not have access to their email app at that moment, or if the verification email goes to spam, they will abandon the signup process. By forcing the user to leave the app to check their inbox, we lose a percentage of users before they ever see the dashboard.

## 4. The regulatory or trust condition that would make me switch
I would switch to Soft Gating if Tayhlor expanded into a **low-risk, browsing-first model** (for example, selling ready-made garments where a user just wants to browse before committing).

However, I would maintain Hard Gating under specific regulatory conditions. If Tayhlor integrated direct bank transfers, or if we began storing medical-grade fitting records (like health tech), regulatory bodies (like NDPA or financial regulators) would mandate strict identity verification *before* any data access. In those industries, the "trust condition" is that an unverified account is a legal liability, making Soft Gating impossible.