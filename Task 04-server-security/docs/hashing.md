# Password Hashing: Why Fast Is Wrong

## 1. Chosen Password Hashing Algorithm

For Tayhlor, the password hashing algorithm currently used is **bcrypt**, with a cost factor of **12**.

The application uses the `bcryptjs` package to hash passwords and verify them during login.

- Hashing function: `bcrypt.hash(password, 12)`
- Verification function: `bcrypt.compare(password, hash)`
- Cost factor: `12`

bcrypt is suitable for password storage because it is deliberately computationally expensive. Unlike general-purpose hashing algorithms such as SHA-256, it is designed to make repeated password guessing more expensive.

## 2. Hashing the Same Password Twice

I hashed the same password twice using bcrypt with a cost factor of 12.

**Test password:** `Tayhlor-Test-Password-2026!`

**First hash:**
```text
$2a$12$ogxkHB1Xm/ag06D8kP2XTeXvNO9qBjtfgkSUPuZ2hUznAdATI7ktW
```

**Second hash:**
```text
$2a$12$TGXc/WjEvQjqQPAiRU/qee59b017wN/bSFAMmS5oiUhsfpkou4UDS
```

**Result:**
```text
Hashes are identical: false
```

**Why are they different?**

bcrypt generates a new random salt for each hashing operation. Therefore, hashing the same password twice produces different encoded hashes because each operation uses a different salt.

The salt is stored as part of the resulting bcrypt hash, so it does not need to be stored separately.

## 3. Benchmark: bcrypt vs SHA-256

I measured how long my laptop took to hash the same password 100 times using each algorithm.

The benchmark used:
- bcrypt with cost factor 12.
- SHA-256 using Node.js's built-in `crypto` module.
- 100 sequential hashing operations for each algorithm.

### Actual benchmark results

| Measurement | SHA-256 | bcrypt |
|---|---:|---:|
| Number of hashes | 100 | 100 |
| Total time | 0.000742 seconds | 29.171622 seconds |
| Average time per hash | 0.000007422 seconds | 0.291716 seconds |

**Result:** bcrypt was approximately **39,304 times slower** than SHA-256 in this benchmark on my laptop.

These measurements are specific to my machine and test conditions. They are not universal performance figures.

## 4. Estimated Password Guesses Per Second

To estimate how many password guesses could be tested per second, I used this formula:

\[
\text{Guesses per second} =
\frac{1}{\text{Average time per hash}}
\]

### A. SHA-256 calculation

My measured average time per SHA-256 hash was:

\[
0.000007422 \text{ seconds}
\]

Substituting into the formula:

\[
\frac{1}{0.000007422}
= 134,734.57
\]

Therefore:

**SHA-256 ≈ 134,735 guesses per second.**

### B. bcrypt calculation

My measured average time per bcrypt hash was:

\[
0.291716 \text{ seconds}
\]

Substituting into the formula:

\[
\frac{1}{0.291716}
= 3.42799
\]

Therefore:

**bcrypt ≈ 3.43 guesses per second.**

### Comparison

| Algorithm | Estimated guesses per second |
|---|---:|
| SHA-256 | 134,735 |
| bcrypt (cost 12) | 3.43 |

Based on these measurements, SHA-256 allowed approximately 39,304 times more sequential hashing attempts per second than bcrypt.

**Important limitation:** These are estimates based on my laptop's sequential benchmark. They do not represent a universal attacker's speed. An attacker could use more powerful hardware, optimized implementations, and parallel processing.

## 5. The inversion in my own words
A legitimate user normally enters their password once during login. The application verifies that password against the stored hash and returns the login result.

An attacker attempting to discover a password may need to test millions or billions of possible guesses.

If password hashing is extremely fast, the attacker can test guesses much more quickly, making password cracking easier.

bcrypt deliberately makes each hashing attempt computationally expensive. This adds some processing time for legitimate users, but makes repeated password guessing significantly more expensive for attackers.

In simple terms:

- A legitimate user needs one password verification during login.
- An attacker may need millions or billions of password guesses.
- Slowing down each hashing operation has a relatively small impact on legitimate login but substantially increases the cost of repeated guessing.

**The security principle:** We hash a password once during registration and verify it during login. An attacker may need to perform an enormous number of hashing attempts. Making each attempt slower costs the legitimate user very little but makes the attacker's job significantly harder.

## 5. Salting
**What salting does:** A salt is a random string of characters added to the password before it is hashed. This ensures that even if two users have the exact same password (like "password123"), their hashes will be completely different.
**Does bcrypt handle it?** Yes. bcrypt automatically generates and stores a unique salt for every hash. I do not need to generate the salt manually.
**What if I skipped it?** If I skipped salting, an attacker could use a "Rainbow Table" (a pre-computed list of common password hashes) to instantly reverse every password in the database. They could also see which users share the same password.