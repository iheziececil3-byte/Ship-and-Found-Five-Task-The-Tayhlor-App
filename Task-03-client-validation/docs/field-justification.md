# Field Justification

Every field on the registration form must serve a purpose. If a field is not used by the business and does not harm the user if it is wrong, it should be removed.

## 1. Full Name
*   **Why it is needed:** To identify the customer and greet them properly.
*   **What the business does with it:** The tailor uses this name to label the handwritten measurement notebook, the order tickets, and the garment tags.
*   **What happens if the user gets it wrong:** If the name is misspelled or a nickname is used, the tailor may hand the finished garment to the wrong person or lose track of the order in the physical shop.

## 2. Email Address
*   **Why it is needed:** It is the primary login identifier and the channel for communication.
*   **What the business does with it:** Used for account authentication, sending email verification codes, sending order status updates, and sending payment receipts.
*   **What happens if the user gets it wrong:** The user cannot log in, cannot reset their password, and will never receive their order status notifications. 

## 3. Phone Number
*   **Why it is needed:** To contact the customer for urgent, time-sensitive updates during production.
*   **What the business does with it:** If an order is ready early, or if there is an issue with the fabric, the tailor calls or sends a WhatsApp message. 
*   **What happens if the user gets it wrong:** The tailor cannot reach the customer. The customer might miss their fitting appointment, causing delays for everyone.

## 4. Password
*   **Why it is needed:** To protect the customer's private data (measurements, order history, payment status).
*   **What the business does with it:** The system hashes it (using bcrypt) and stores the hash. The plain text is never saved.
*   **What happens if the user gets it wrong:** If it is too weak, an attacker could guess it. If they forget it, they are locked out of their dashboard.

## 5. Terms and Conditions Checkbox
*   **Why it is needed:** We are collecting personal data (measurements, phone numbers) and taking money (deposits). The user must legally consent to this.
*   **What the business does with it:** Protects the business from legal disputes regarding data privacy and payment policies.
*   **What happens if the user gets it wrong:** If they do not check it, the account is not created. This ensures active consent.

