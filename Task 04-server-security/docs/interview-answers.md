01
I hash passwords because it is the only safe way to store them. If a database is compromised and passwords are stored in plain text or reversible encryption, the attacker can immediately read them and use them to access other accounts. Hashing is a one-way mathematical function, meaning it cannot be reversed. When a user logs in, the server hashes their input and compares it to the stored hash. This ensures that even if the database is stolen, the actual passwords remain a secret.

02
I use bcrypt instead of SHA-256 because bcrypt is deliberately slow, while SHA-256 is designed to be fast. In my own testing, SHA-256 hashed a password in 0.000007 milliseconds, which means an attacker could try billions of guesses per second using a modern GPU. bcrypt took roughly 291 milliseconds. By using a slow algorithm, the server only takes a fraction of a second to log a user in, but an attacker trying to brute-force the stolen database is slowed down to just a few guesses per second.

03
A salt is a unique, random string of characters added to a password before it is hashed. I need it because without a salt, two users with the same password would have the exact same hash. An attacker could use a "Rainbow Table" (a pre-computed dictionary of common hashes) to instantly reverse them, or spot that multiple users share the same password. A salt ensures that even if two users have the same password, their hashes are completely different.

04
I use a work factor of 12 for bcrypt. This means it runs 2^12 (4,096) iterations. I chose 12 because, on my machine, it takes about 291 milliseconds to hash a password. This is fast enough that a legitimate user won't notice a delay when logging in, but it is slow enough that an attacker with a stolen database would only be able to try about 3 passwords per second per CPU core. If I went to 14, my server might buckle under heavy traffic; if I went to 10, it would be too fast for modern GPUs.

05
Adaptive hashing (like bcrypt) is the correct choice because it is a one-way function designed to be slow, making brute-force attacks impractical. Plain text is wrong because anyone with database access can read the passwords. SHA-256 is wrong because it is too fast; an attacker can compute billions of hashes per second. AES-256 is wrong for a different reason: it is a two-way encryption algorithm. If an attacker steals the database and the decryption key, they can reverse the encryption and read every password in plain text. Adaptive hashing cannot be reversed.

06
Client-side validation is a user experience feature, not a security control. It exists to give users immediate feedback, preventing them from submitting a form with a typo and waiting for a slow server response. However, it provides zero security because the browser environment is entirely under the user's control. An attacker can disable JavaScript, use browser developer tools to remove HTML attributes, or bypass the browser entirely by sending a raw HTTP request via cURL. If the server trusts the data it receives, the application is vulnerable. The server must always re-validate everything.

07
The frontend should handle basic format validation (like checking if an email contains an @), required fields, and input length restrictions to improve user experience and reduce unnecessary network traffic. The server, however, must enforce everything. This includes format and length validation, but more importantly, it must enforce authorization (does this user have permission to do this?), data integrity (does this email already exist in the database?), and sanitization (removing malicious scripts). The frontend prevents accidental mistakes; the server prevents malicious attacks.

08
No, hiding a button is absolutely not enough. Hiding a button in the UI is merely a visual convenience to stop users from clicking things they shouldn't. It does not stop an attacker. An attacker will inspect the network traffic to find the API endpoint that the delete button calls, and then trigger that endpoint manually using cURL or Postman. The server must independently verify the user's role and permissions for every single request. If an attacker sends a DELETE /api/users/123 request, the server must check their session token and confirm they are an admin before executing the deletion.

09
Validation checks if the input meets specific rules before processing it. If it fails, the data is rejected (e.g., ensuring an email contains an @). Sanitisation modifies the input to remove or clean malicious parts (like stripping <script> tags) while keeping the rest of the data. Encoding converts special characters into a safe format to prevent them from being interpreted as code, which is crucial when displaying user input in HTML to stop Cross-Site Scripting (XSS). Validation rejects bad data; sanitisation cleans it; encoding neutralizes it for display.

10
Replacing the raw request body with the parsed and validated data eliminates the risk of a developer accidentally using the raw, unvalidated input. If both are available, someone might accidentally reference req.body instead of validatedData deep inside a function. By overwriting the body with the Zod-parsed data (e.g., req.body = parsedData), you ensure that any subsequent code can only access sanitized, correctly typed, and validated values. It is a defensive programming practice that removes an entire class of accidental vulnerabilities.

11
Route parameters (like /api/users/[id]) and query strings (like ?search=term) are just as vulnerable to injection and manipulation as the request body. An attacker can easily change an id parameter to access another user's data (Insecure Direct Object Reference), or inject SQL via a query string. If the server assumes the URL is safe just because it came from the browser's address bar, it opens the door to privilege escalation and database errors. Every piece of data entering the server, regardless of where it comes from, must be validated.

12
To rate limit unauthenticated requests, I would use the client's IP address. The first header a developer usually reaches for is x-forwarded-for, because it contains the IP address when a request passes through a proxy or load balancer. The problem is that this header is entirely controlled by the client and can be easily spoofed. An attacker can add a fake x-forwarded-for header to every request, pretending to be a different IP each time, which completely bypasses the rate limit. A secure system must rely on the IP address actually seen by the server (like req.ip), or better yet, use a robust proxy like Cloudflare that strips spoofed headers.

13
For a production API, I would choose a Sliding Window or Token Bucket algorithm. I would avoid a Fixed Window algorithm because of the "boundary burst" problem. In a fixed window, if the limit is 100 requests per minute, a user could send 100 requests at 12:00:59 and another 100 requests at 12:01:00. They just sent 200 requests in two seconds, but the algorithm allows it because they fell into two different minute windows. A sliding window smooths this out, ensuring the rate is consistent over any rolling period.

14
In-memory counters only work if you have a single server. In a production environment with multiple servers behind a load balancer, in-memory counters fail because the user's requests are distributed across different machines. If the limit is 5 requests, and you have 3 servers, the user could make 4 requests to Server A and 4 requests to Server B, and neither server would trigger the limit. A shared store like Redis solves this by acting as a single, central source of truth. Every server checks and increments the same counter, ensuring the limit is enforced globally.

15
A rate limiter should return a 429 Too Many Requests status code. 403 Forbidden is the wrong choice because it means the user does not have permission to access the resource at all, regardless of how slowly they ask. 429 specifically communicates that the user is allowed to access the resource, but they have exceeded the allowed frequency. This distinction is important because 429 allows the client to read the Retry-After header, wait the specified number of seconds, and try the request again successfully.

16
For Tayhlor, I would choose to fail open. If the rate limit store (like Upstash Redis) goes down, the application should allow the requests to proceed and log an alert. The justification is that Tayhlor is a tailoring management app, not a high-security banking application. The business cost of completely locking every customer out of their account because a background service is down far outweighs the risk of a temporary spike in requests. However, if I were building a financial application, I would fail closed, prioritizing security over availability.

17
On my machine, SHA-256 takes 0.000007 milliseconds, meaning an attacker could test 134,734 passwords per second per CPU core. bcrypt takes 291 milliseconds, meaning an attacker can only test about 3.4 passwords per second. If an attacker steals my user table, those bcrypt hashes are practically useless to them. Even with a powerful GPU, the sheer slowness of bcrypt means it would take decades to crack a reasonably strong password. The 291ms delay is unnoticeable to a user logging in, but it is a brick wall for an attacker.

18
When checking for breached passwords via HaveIBeenPwned, the application uses SHA-1 to hash the password. It then splits the hash into a 5-character prefix and a suffix. It sends only the 5-character prefix to the API. The API replies with a massive list of hash suffixes that start with that prefix. The application checks locally if its suffix matches any in the list. This protects the user because the API never knows the full hash. The naive version would send the full hash or plain-text password to the API, which leaks the user's exact password if the API is compromised or logs the requests.

19First error: The candidate used SHA-256, which is far too fast. Salting prevents Rainbow Table attacks, but it does not prevent brute-force attacks. A modern GPU can compute billions of SHA-256 hashes per second, so an attacker can easily brute-force weak passwords even with the salt. They should have used an adaptive hashing algorithm like bcrypt.
Second error: The candidate relies solely on IP rate limiting. Attackers can easily bypass this using proxy networks or a botnet to rotate IPs. Rate limiting must also be applied to the account (email) and combined with breached password checks.
The candidate has misunderstood the threat model. They think hashing and rate limiting make brute-forcing impossible, but they have actually left the back door wide open by using a fast hashing algorithm.