# Breached Password Checks

## 1. How it works (K-Anonymity)
When a user registers or changes their password, the server hashes the password using SHA-1. It then splits the hash into two parts: a 5-character prefix and a suffix. The server sends *only the 5-character prefix* to the HaveIBeenPwned (HIBP) API using the "Add-Padding" header. The API responds with a list of thousands of hash suffixes that match that prefix, along with the number of times each has been breached. The server then checks locally if our suffix exists in that list. If it does, the password is breached.

This mechanism ensures that the user's actual password, and even the full hash of the password, is never sent over the network. The API only sees a 5-character prefix, which is shared by thousands of different passwords.

## 2. Why the naive version is unacceptable
A naive version would send the plain-text password directly to the API, or send the full hash of the password. Sending the plain text password is a massive privacy violation, because the API provider would know the user's exact password. Sending the full hash is also dangerous, because if the API server is compromised, the attacker could attempt to reverse the hash. K-Anonymity protects the user's privacy by never revealing the full secret to any third party.

## 3. Failure Handling
I configured the breach check to **fail closed**. If the HIBP API is unreachable or times out (after 5 seconds), the registration request returns a `503 Service Unavailable` with the message: "We could not verify this password right now." It does not allow the password through. This is a deliberate security choice: if we cannot verify the password is safe, we do not accept it.