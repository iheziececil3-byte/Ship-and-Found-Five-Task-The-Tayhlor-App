# Session Management

## 1. What is Session Hijacking?
Session hijacking is a type of cyberattack where an attacker steals a valid session token (like a cookie) from a legitimate user. Because the server uses this token to identify the logged-in user, the attacker can use the stolen token to impersonate the user. The server will treat the attacker as if they are the legitimate user, granting them access to private data (such as measurements, orders, and payment details) without needing to know the user's password.

## 2. How a stolen identifier is used
If an attacker steals a session cookie, they can inject it into their own browser or use a command-line tool like cURL. They send a request to the server with the stolen cookie in the HTTP headers. The server checks the session database, sees that the token is valid and not expired, and grants the attacker access. The application logs will show the action as being performed by the legitimate user, making it difficult to detect the breach.

## 3. What logging out does to it
When a user clicks "Log Out", the frontend sends a request to the backend. My backend immediately deletes the specific session row from the `Session` table in the database and clears the browser cookie. If an attacker had stolen that token 10 minutes earlier, it is now permanently useless. If they try to use it, the server will check the database, find no matching session row, and reject the request with a 401 Unauthorized error.

## 4. What my application does to limit the damage
If a session is stolen, my application limits the damage in four ways:
1.  **Fresh Tokens:** A brand new, cryptographically secure token is generated on every single sign-in. A token is never reused.
2.  **Hashed Tokens in Database:** The database only stores the SHA-256 *hash* of the session token, never the raw token. Even if an attacker gains read access to the database, they cannot steal active sessions because they only see the hashes.
3.  **Secure Cookie Flags:** 
    *   `HttpOnly` prevents JavaScript from reading the cookie (stopping XSS attacks).
    *   `Secure` ensures the cookie is only sent over HTTPS (stopping interception on public Wi-Fi).
    *   `SameSite=Lax` prevents the cookie from being sent on cross-site requests (stopping CSRF attacks).
4.  **Expiry:** Sessions expire after 7 days of inactivity. The attacker's window of opportunity is strictly limited. 