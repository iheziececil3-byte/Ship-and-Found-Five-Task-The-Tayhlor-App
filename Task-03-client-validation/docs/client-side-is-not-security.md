Yes my server accepted the curl request i sent.

# Client-Side is Not Security

## 1. The Request and the Response
To test the security of the application, I bypassed the browser entirely and sent a raw HTTP POST request directly to the registration endpoint using cURL. I intentionally sent malformed data: a single-letter name, an invalid email (`a@b`), a password of spaces, and an invalid phone number.

**The exact command:**
```bash
curl.exe -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "@attack.json"
```

The server's response:
{"message":"Account created successfully.","user":{"id":"cmwakbd6s0000qbxg2ayhsaca","fullName":"a","email":"a@b","role":"CUSTOMER","createdAt":"2026-11-10T10:43:49.252Z"}}

Which client-side rules were enforced?
I wrote 8 client-side validation rules (name length, name format, email format, phone format, password length, terms acceptance, required fields, and character restrictions).

On this direct request, zero of those 8 rules were enforced. The JavaScript validation that runs in the browser was completely bypassed because the request did not come from the browser.

What this proves about client validation and security
This proves that client-side validation is a convenience for user experience, not a security control. When I tried to type this bad data into the browser form, the React code blocked me with red errors. But when I used cURL, the server accepted the bad data, created a user with an invalid email, and returned a 201 Created response. If a hacker wants to bypass your form, they will just use cURL. The server must never trust the client.

What I will do about it in Task 4
I will restore the server-side validation using Zod schemas (which I temporarily removed for this attack). In Task 4, I will ensure that every incoming request is validated against a strict schema before it touches the database. I will also add rate limiting and breached password checks.