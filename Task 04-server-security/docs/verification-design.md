# Email Verification Design

## 1. Code Generation
The 6-digit verification code is generated using Node's `crypto.randomInt(100000, 1000000)`. 

I chose this over the standard `Math.random()` because `Math.random()` is a pseudorandom number generator (PRNG). PRNGs are deterministic and, if an attacker can figure out the seed or observe enough outputs, they can predict future codes. `crypto.randomInt()` is a cryptographically secure pseudorandom number generator (CSPRNG). It uses the operating system's entropy pool to guarantee that every code generated is truly random and completely unpredictable.

*(Note: During development, I found a bug in my own code where the upper bound was set to `999999`. This meant the code could never actually generate `999999`. I fixed this to `1000000` to ensure a true 1-in-a-million chance for every combination).*

## 2. Expiry Justification
I set the verification code to expire in **7 minutes**.

**Why 7 minutes:**
*   **User Experience (Too short):** If the code expires in 2 minutes, the user might not have time to open their email app, wait for the email to arrive, and copy the code. This causes frustration and makes users abandon the signup process.
*   **Security (Too long):** If the code lasts for 30 minutes, an attacker has a massive window to brute-force the 6-digit code or intercept it. 
*   7 minutes is the sweet spot. It gives a real human being enough time to check their phone and type the code, but it minimizes the attack surface for a malicious actor. 

## 3. The Attack Note (What an attacker could do)
Given the 7-minute expiry window and our rate limit (5 attempts per 10 minutes per IP), what happens if an attacker tries to guess the code?

If an attacker tries to brute-force a 6-digit code, there are 1,000,000 possible combinations. If the server had **no rate limiting**, an attacker could write a script to try all 1,000,000 combinations in a few seconds, guaranteeing they find the right code before the 7 minutes are up.

Because we implemented a strict rate limit of **5 requests per 10 minutes**, an attacker can only guess 5 codes before their IP is blocked. The mathematical probability of guessing the correct 6-digit code in just 5 attempts is **0.0005%**. Therefore, even with a 7-minute window, the rate limit makes brute-forcing the code practically impossible.

