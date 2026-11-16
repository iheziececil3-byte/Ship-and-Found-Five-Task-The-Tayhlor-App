# Database Schema Documentation

This document outlines the database schema for Tayhlor, built using Prisma and PostgreSQL. It details every table, column, data type, and relationship, ensuring the application is secure, auditable, and performant.

## 1. User and Authentication Tables

### `BUSINESS`
Stores the details of the single tailoring shop.
*   **Columns:**
    *   `id`: String (Text), Primary Key. Cannot be empty.
    *   `name`: String (Text). Cannot be empty.
    *   `phone`: String (Text). Can be empty.
    *   `address`: String (Text). Can be empty.
    *   `created_at`: DateTime (Timestamp). Cannot be empty.
*   **Relationships:** One-to-Many with `User`, `Order`, `Document`, `Chunk`.
*   **Indexes:** Primary key on `id`.
*   **Duplication:** None.

### `USER`
Stores customers and the tailor (admin).
*   **Columns:**
    *   `id`: String (Text), Primary Key. Cannot be empty.
    *   `business_id`: String (Text), Foreign Key. Cannot be empty.
    *   `email`: String (Text), Unique. Cannot be empty.
    *   `password_hash`: String (Text). Can be empty (for Google OAuth accounts).
    *   `google_subject`: String (Text), Unique. Can be empty.
    *   `email_verified_at`: DateTime (Timestamp). Can be empty (null until verified).
    *   `full_name`: String (Text). Cannot be empty.
    *   `phone`: String (Text). Can be empty.
    *   `role`: Enum (CUSTOMER, TAILOR). Cannot be empty.
    *   `created_at`: DateTime (Timestamp). Cannot be empty.
*   **Relationships:** Many-to-One with `Business`. One-to-Many with `Session`, `Measurement`, `Order`, `OrderStatusEvent`, `AssistantMessage`.
*   **Indexes:** 
    *   `id` (Primary Key).
    *   `email` (Unique Index): Speeds up login queries. Cost: Slower writes on signup.
*   **Duplication:** None.

### `SESSION`
Tracks active logins.
*   **Columns:**
    *   `id`: String (Text), Primary Key. Cannot be empty.
    *   `user_id`: String (Text), Foreign Key. Cannot be empty.
    *   `token_hash`: String (Text), Unique. Cannot be empty.
    *   `created_at`: DateTime (Timestamp). Cannot be empty.
    *   `expires_at`: DateTime (Timestamp). Cannot be empty.
    *   `revoked_at`: DateTime (Timestamp). Can be empty.
*   **Relationships:** Many-to-One with `User`.
*   **Indexes:** `user_id` (Foreign Key Index): Speeds up the query to find all sessions for a user when logging out of all devices. Cost: Slower writes on login.
*   **Duplication:** None.

## 2. Order and Business Logic Tables

### `MEASUREMENT`
Stores customer body measurements.
*   **Columns:**
    *   `id`: String (Text), Primary Key. Cannot be empty.
    *   `customer_id`: String (Text), Foreign Key. Cannot be empty.
    *   `label`: String (Text). Cannot be empty.
    *   `fields`: JSON. Cannot be empty.
    *   `created_at`: DateTime (Timestamp). Cannot be empty.
    *   `updated_at`: DateTime (Timestamp). Cannot be empty.
*   **Relationships:** Many-to-One with `User`. One-to-Many with `Order`.
*   **Indexes:** `customer_id` (Foreign Key Index): Speeds up fetching a user's measurements. Cost: Slower writes.
*   **Duplication:** None.

### `ORDER`
The core job ticket.
*   **Columns:**
    *   `id`: String (Text), Primary Key. Cannot be empty.
    *   `business_id`: String (Text), Foreign Key. Cannot be empty.
    *   `customer_id`: String (Text), Foreign Key. Cannot be empty.
    *   `measurement_id`: String (Text), Foreign Key. Can be empty.
    *   `garment_type`: String (Text). Cannot be empty.
    *   `description`: String (Text). Can be empty.
    *   `status`: Enum. Cannot be empty.
    *   `measurement_snapshot`: JSON. Cannot be empty.
    *   `quoted_amount`: Integer (Minor units/Kobo). Can be empty.
    *   `currency`: String (Text). Cannot be empty.
    *   `proposed_completion_at`: DateTime (Timestamp). Can be empty.
    *   `created_at`: DateTime (Timestamp). Cannot be empty.
    *   `updated_at`: DateTime (Timestamp). Cannot be empty.
*   **Relationships:** Many-to-One with `Business`, `User`, `Measurement`. One-to-Many with `OrderStatusEvent`, `Payment`, `PaymentAttempt`.
*   **Indexes:** 
    *   `customer_id` (Foreign Key Index): Speeds up loading a customer dashboard. Cost: Slower writes.
    *   `status` (Index): Speeds up filtering orders by status in the tailor dashboard. Cost: Slower writes.
*   **Duplication (Denormalization accepted):** The `measurement_snapshot` (JSON) duplicates the data found in the `MEASUREMENT` table. **Why accepted:** If a customer updates their chest size 3 months later, the tailor must still have a record of the exact measurements used when the order was cut. The snapshot prevents historical orders from being altered by future profile changes.

### `ORDER_STATUS_EVENT`
The audit log for orders.
*   **Columns:**
    *   `id`: String (Text), Primary Key. Cannot be empty.
    *   `order_id`: String (Text), Foreign Key. Cannot be empty.
    *   `actor_id`: String (Text), Foreign Key. Can be empty (allows user deletion without deleting logs).
    *   `from_status`: Enum. Can be empty.
    *   `to_status`: Enum. Cannot be empty.
    *   `note`: String (Text). Can be empty.
    *   `created_at`: DateTime (Timestamp). Cannot be empty.
*   **Relationships:** Many-to-One with `Order`, `User`.
*   **Indexes:** `order_id` (Foreign Key Index): Speeds up fetching an order's timeline. Cost: Slower writes.
*   **Duplication:** The `to_status` is duplicated in the `ORDER` table. **Why accepted:** The `ORDER` table holds the *current* state for fast reads. The `ORDER_STATUS_EVENT` table holds the *historical* state for auditing. Reading the current status from the Order table is much faster than querying the event log every time.

## 3. Money Tables

### `PAYMENT`
Records confirmed, successful money.
*   **Columns:**
    *   `id`: String (Text), Primary Key. Cannot be empty.
    *   `order_id`: String (Text), Foreign Key. Cannot be empty.
    *   `type`: Enum (DEPOSIT, BALANCE). Cannot be empty.
    *   `amount`: Integer (Minor units/Kobo). Cannot be empty.
    *   `currency`: String (Text). Cannot be empty.
    *   `provider`: String (Text). Cannot be empty.
    *   `provider_reference`: String (Text), Unique. Cannot be empty.
    *   `provider_transaction_id`: String (Text), Unique. Can be empty.
    *   `status`: Enum (PENDING, SUCCESSFUL, REFUNDED). Cannot be empty.
    *   `paid_at`: DateTime (Timestamp). Can be empty.
    *   `refunded_at`: DateTime (Timestamp). Can be empty.
    *   `created_at`: DateTime (Timestamp). Cannot be empty.
*   **Relationships:** Many-to-One with `Order`.
*   **Indexes:** `provider_reference` (Unique Index): Prevents duplicate webhook processing. `order_id` (Foreign Key): Speeds up fetching an order's payments.
*   **Duplication:** None.

### `PAYMENT_ATTEMPT`
Records failed, abandoned, or network-dropped payments. 
*   **Columns:**
    *   `id`: String (Text), Primary Key. Cannot be empty.
    *   `order_id`: String (Text), Foreign Key. Cannot be empty.
    *   `payment_id`: String (Text), Foreign Key. Can be empty.
    *   `type`: Enum. Cannot be empty.
    *   `amount`: Integer. Cannot be empty.
    *   `currency`: String. Cannot be empty.
    *   `provider_reference`: String (Text). Cannot be empty.
    *   `status`: Enum (FAILED, ABANDONED). Cannot be empty.
    *   `failure_code`: String (Text). Can be empty.
    *   `last_checked_at`: DateTime. Can be empty.
    *   `completed_at`: DateTime. Can be empty.
    *   `created_at`: DateTime (Timestamp). Cannot be empty.
*   **Relationships:** Many-to-One with `Order`, `Payment`.
*   **Indexes:** `provider_reference` (Index): Speeds up reconciliation jobs that check pending attempts. `order_id` (Foreign Key).
*   **Duplication:** None.

### The Money-Attempts Table Rationale (Tax Audit)

The `PAYMENT_ATTEMPT` table is separate from the `PAYMENT` table. It records attempts that failed, were abandoned, or died on a bad network. There are two reasons for this. First, drop-off data tells the business where it loses people, allowing the tailor to see if customers are abandoning checkout due to network errors or failed cards. Second, and more importantly, payment logs are the source of truth for litigation, government inquiries, and annual tax filing. If my tax authority asked me to account for a specific transaction from fourteen months ago, I would query the `PAYMENT` table to find the successful transaction and its unique `provider_reference`. I would then cross-reference that reference against the Paystack dashboard to provide a matching bank receipt. Because we also maintain the separate `PAYMENT_ATTEMPT` table, I can provide an unbroken audit trail showing exactly when the customer first tried to pay, what error occurred, and the exact timestamp of the final successful transaction. This guarantees we can account for every single kobo that moved through the business.

## 4. RAG and AI Tables

### `DOCUMENT`
Stores the shop's rules, FAQs, and policies.
*   **Columns:**
    *   `id`: String, Primary Key.
    *   `business_id`: String, Foreign Key.
    *   `title`: String.
    *   `content`: String.
    *   `status`: Enum (DRAFT, APPROVED).
    *   `approved_at`: DateTime. Can be empty.
    *   `created_at`: DateTime.
    *   `updated_at`: DateTime.
*   **Relationships:** Many-to-One with `Business`. One-to-Many with `Chunk`.
*   **Indexes:** `business_id` (Foreign Key).

### `CHUNK`
The embedded text pieces for the AI.
*   **Columns:**
    *   `id`: String, Primary Key.
    *   `document_id`: String, Foreign Key.
    *   `business_id`: String, Foreign Key.
    *   `chunk_index`: Integer.
    *   `content`: String.
    *   `embedding`: Vector (1536).
    *   `created_at`: DateTime.
*   **Relationships:** Many-to-One with `Document`, `Business`.
*   **Indexes:** `document_id` (Foreign Key). HNSW Vector Index on `embedding` for fast similarity search.

### `ASSISTANT_MESSAGE`
Logs AI interactions.
*   **Columns:**
    *   `id`: String, Primary Key.
    *   `user_id`: String, Foreign Key.
    *   `question`: String.
    *   `answer`: String.
    *   `grounded`: Boolean.
    *   `created_at`: DateTime.
*   **Relationships:** Many-to-One with `User`. One-to-Many with `AssistantSource`.

### `ASSISTANT_SOURCE`
The join table linking AI answers to the chunks they used.
*   **Columns:**
    *   `assistant_message_id`: String, Foreign Key.
    *   `chunk_id`: String, Foreign Key.
*   **Relationships:** Many-to-One with `AssistantMessage` and `Chunk`. (This creates a Many-to-Many relationship between Messages and Chunks).
*   **Indexes:** Composite Primary Key on `[assistant_message_id, chunk_id]`.
