1. Why is client-side validation not enough?

Answer: Client-side validation is a user experience feature, not a security control. It exists to give users immediate feedback, preventing them from submitting a form with a typo and waiting for a slow server response. However, it provides zero security because the browser environment is entirely under the user's control. An attacker can disable JavaScript, use browser developer tools to remove HTML attributes, or bypass the browser entirely by sending a raw HTTP request via cURL or Postman. If the server trusts the data it receives, the application is vulnerable to injection and data corruption. The server must always re-validate everything.

2. What security checks belong in the frontend, and what must the server enforce regardless?

Answer: The frontend should handle format validation (like checking if an email contains an @), required fields, and input length restrictions to improve user experience and reduce unnecessary network traffic. The server, however, must enforce everything. This includes format and length validation, but more importantly, it must enforce authorization (does this user have permission to do this?), data integrity (does this email already exist?), and sanitization (removing malicious scripts). The frontend prevents accidental mistakes; the server prevents malicious attacks.

3. The user interface hides the delete button for non-administrators. Is that enough?

Answer: No, it is absolutely not enough. Hiding a button in the UI is merely a visual convenience to stop users from clicking things they shouldn't. It does not stop an attacker from inspecting the network traffic to find the API endpoint that the delete button calls, and then triggering that endpoint manually. The server must independently verify the user's role and permissions for every single request. If an attacker sends a DELETE /api/users/123 request, the server must check their session token and confirm they are an admin before executing the deletion.

 4. What is the difference between validation, encoding and sanitisation?

Answer: Validation checks if the input meets specific rules before processing it, such as ensuring an email contains an @ symbol. If it fails, the data is rejected. Encoding converts special characters into a safe format to prevent them from being interpreted as code, which is crucial when displaying user input in HTML to stop Cross-Site Scripting (XSS). Sanitisation modifies the input to remove or clean malicious parts (like stripping <script> tags) while keeping the rest of the data. Validation rejects bad data; encoding neutralizes it for display; sanitisation cleans it up.

5. Why should you validate route parameters and query strings, not just the body?
 
 Answer: Route parameters (like /api/users/[id]) and query strings (like ?search=term) are just as vulnerable to injection and manipulation as the request body. An attacker can easily change an id parameter to access another user's data (Insecure Direct Object Reference), or inject SQL via a query string. If the server assumes the URL is safe just because it came from the browser's address bar, it opens the door to privilege escalation and database errors. Every piece of data entering the server must be validated.

 6. Explain what a single page application is, and how you make one discoverable by search engines.

Answer: A Single Page Application (SPA) loads a single HTML document and dynamically updates the content as the user interacts, without triggering full page reloads. This makes the app feel fast and fluid, as we did with the Tayhlor auth forms. However, search engine crawlers often struggle with SPAs because the content is rendered via JavaScript. To make an SPA discoverable, you must implement Server-Side Rendering (SSR) or Static Site Generation (SSG) using a framework like Next.js, which delivers fully rendered HTML to the crawler. You should also use dynamic metadata (title tags, descriptions) and provide a sitemap.

7. What are the advantages and disadvantages of a single page application against a multi-page application?
 
 Answer: The primary advantage of an SPA is speed and user experience. Because it only loads the shell once, navigating between views feels instantaneous and avoids the "white flash" of a traditional multi-page app. It also reduces server load. The disadvantages are initial load time (the JavaScript bundle can be large), complexity in managing state, and SEO challenges if not configured correctly. Multi-page applications (MPAs) are better for large, content-heavy sites where SEO is critical, but they feel slower and require full reloads for every action.

 8. Can you explain the four principles of the Web Content Accessibility Guidelines (WCAG)?

Answer: The four principles are Perceivable, Operable, Understandable, and Robust (POUR). Perceivable means users must be able to perceive the information, like providing alt text for images so blind users can hear them. Operable means users must be able to use the interface, like ensuring all buttons are reachable via keyboard. Understandable means the content and interface must be clear, like providing clear error messages. Robust means the content must work with a wide variety of assistive technologies, like ensuring screen readers can read the ARIA labels.

9.  Discuss the importance of semantic HTML in the context of accessibility.

Answer: Semantic HTML means using tags that describe their meaning (like <button>, <form>, <nav>, and <label>), rather than generic tags like <div> or <span> for everything. It is critical for accessibility because assistive technologies rely on these tags to understand the page structure. A screen reader knows that a <button> is clickable and a <label> describes an input field. If you use a <div> with an onClick handler, the screen reader sees nothing; it is invisible to keyboard users and assistive tech. Semantic HTML provides built-in accessibility.

10. Tell me about a time when you disagreed with what a customer wanted to build.

Answer: While designing the sign-up flow for Tayhlor, the proposed design included separate pages for login, signup, and password reset. I disagreed because separate pages cause full browser reloads, resulting in a "white flash" and a clunky experience. I proposed collapsing them into a Single Page Application (SPA) using conditional rendering and URL query parameters (?mode=login). I explained the growth reasoning: removing friction keeps users engaged. The customer agreed, and we implemented the SPA. It resulted in a faster, smoother user experience and proved that technical decisions should prioritize user flow.


11. . How would you explain to a non-technical executive why their AI implementation is not performing as expected?

Answer: I would use an analogy. I would say, "Imagine hiring a brilliant new assistant, but locking them in a room with no documents. When they guess the answers, they get it wrong." I would explain that AI models are prediction engines, not deterministic. They only know what we feed them. If the AI is hallucinating or giving bad answers, it is usually because our internal data is messy, outdated, or not properly connected to the AI's retrieval system. The fix is not a better AI model; the fix is cleaning our data pipelines and grounding the AI in verified documents.

12. One of your validation rules wrongly blocks a category of legitimate user. Name the rule, name the users, and defend the trade-off or say you got it wrong.

Answer: The rule is the "Full Name" validation, which requires at least two words separated by a space. This rule wrongly blocks users with mononyms (single names like "Cher" or "Beyoncé") and individuals from cultures where a single name is standard. I defend this trade-off because automated bots frequently fill name fields with single tokens like "a" or "test". The business also needs a real name to label physical garments. The cost to legitimate users is that they must enter a fake last name or contact the tailor directly. It is a knowing cost accepted to prevent database spam.

13. You sent a request directly to your own endpoint. Say exactly what happened and what it tells you about the eight rules you spent two days writing.

Answer: I sent a cURL request to /api/auth/register with an invalid email (a@b), a one-letter name, and a space-only password. The server accepted the request, created a user in the database, and returned a success message. This proves that none of my eight client-side rules were enforced on that request. The browser was bypassed entirely, rendering the React validation useless. It tells me that client-side validation is a convenience for user experience, not a security control. The server must independently validate every request.

14.  Wrong-answer analysis. A candidate says: "I use strong client-side validation with regex on every field, disable the submit button until everything is valid, and sanitise all inputs in the browser before sending them. That covers the main injection and bad-data risks." This is confident and substantially wrong. Say which parts are useless, which are actively misleading, and what the candidate has confused with what.

Answer: The candidate has confused client-side user experience with server-side security. First, client-side validation and disabling the submit button are useless against an attacker, who will bypass the browser entirely using cURL or Postman. Second, sanitising inputs in the browser is actively misleading. An attacker will simply send raw, malicious data directly to the API. The browser cannot sanitise data it never sees. Third, the candidate assumes the client is trustworthy. The correct approach is to validate and sanitize on the server, because the server is the only source of truth. The client-side checks are just a convenience.