# Rate Limiting

## 1. The Threshold
I implemented a rate limit of **5 requests per 1 minute** per IP address on the registration, login, and password reset routes. 
**Why this number:** A legitimate human user will rarely need to create more than one account per minute. Allowing 5 attempts gives room for network retries or typos, while stopping automated bots from spamming the database. The counter is stored in Upstash Redis in production, with an in-memory fallback for local development.

## 2. Triggering the Limit
I sent 6 rapid requests to the registration endpoint from my terminal to exhaust the limit. On the 6th request, the server returned a `429 Too Many Requests` status code. I then attempted to sign up in the browser. The frontend caught the `429` status and displayed the error message: "Too many requests. Please wait a moment before trying again." (See `13-rate-limit-triggered.png` and `13-rate-limit-triggered.txt`).

## 3. Defeating the Limit
To prove that IP-based rate limiting is not foolproof, I spoofed the `x-forwarded-for` header in my cURL request to `8.8.8.8`. The server trusted this header, believed the request was coming from a new IP address, and allowed the request through. Instead of a `429 Too Many Requests`, the server returned a `409 Conflict` (because the email was a duplicate), proving the rate limit was bypassed. (See `14-rate-limit-defeated.txt`).

## 4. Why IP alone is insufficient
IP-based rate limiting is insufficient because attackers can easily spoof headers or use a botnet (a network of compromised computers) to rotate through thousands of different IP addresses. Serious applications use a combination of identifiers:
- **Email address:** Limit the number of login attempts per email address to stop targeted brute-force attacks.
- **Hardware identifiers:** Use a fingerprinting library to identify the device, not just the IP.
- **Shared storage (Redis):** In production, the rate limit counters must be stored in a shared database (like Upstash Redis) so that if you have multiple servers, they all share the same counter. If you use in-memory counters, a user could just hit a different server to bypass the limit.

## 5. The Trade-off
A strict IP rate limit can accidentally block a legitimate user on a shared campus or office network where hundreds of people share the same IP. If one person gets blocked, everyone on that network gets blocked. To mitigate this, I used a sliding window algorithm (which is more forgiving than a fixed window) and set the limit high enough (5 per minute) to allow normal human retries. I also added a `Retry-After` header so the client knows exactly when they can try again.