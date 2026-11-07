import React from 'react';

export function TermsContent() {
  return (
    <div className="space-y-8 text-primary font-sans leading-relaxed">
      <div>
        <p className="text-fluid-badge text-secondary font-medium">
          Last updated: 7 November 2026
        </p>
      </div>

      {/* Section 1 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          1. Introduction
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          These Terms govern your access to and use of Tayhlor (&quot;the Service&quot;), a tailoring
          management application. By creating an account, you agree to these Terms. If you do not
          agree, do not use the Service.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          2. Who we are
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          Tayhlor is operated for a single tailoring shop. The shop owner (the &quot;Tailor&quot;) acts as
          the administrator of the Service. For data protection purposes, the Tailor acts as the
          Data Controller for the personal data of Customers collected through the Service.
        </p>
      </section>

      {/* Section 3 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          3. Eligibility &amp; accounts
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          You must be at least 18 years old to create an account. You are responsible for keeping
          your login credentials secure and for all activity under your account. Notify the Tailor
          immediately of any unauthorised access.
        </p>
      </section>

      {/* Section 4 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          4. The Service
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          Tayhlor allows Customers to create accounts, store body measurements, submit clothing
          orders, track order progress, and make payments. The Tailor reviews, accepts, and prices
          orders. The Service also provides an AI FAQ assistant that answers questions using only
          approved business documents.
        </p>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          5. Order Approval &amp; Payment Terms
        </h3>
        <ul className="space-y-2 list-none pl-0 text-fluid-body-sm text-secondary">
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary">5.1</span>
            <span>A Customer submits an order with status <strong className="text-primary font-medium">SUBMITTED</strong>. No payment is possible at this stage.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary">5.2</span>
            <span>The Tailor reviews the order. If accepted, the Tailor enters an exact quoted total and a proposed completion date. The status becomes <strong className="text-primary font-medium">ACCEPTED</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary">5.3</span>
            <span>The Customer pays a 70% deposit of the quoted total. Work begins only after the deposit is confirmed.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary">5.4</span>
            <span>When the garment is ready, the status becomes <strong className="text-primary font-medium">READY_FOR_COLLECTION</strong>. The Customer pays the remaining 30% balance upon collection and fitting.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary">5.5</span>
            <span>If the Tailor declines the order, status becomes <strong className="text-primary font-medium">DECLINED</strong>. No payment is possible.</span>
          </li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className="space-y-3">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          6. Cancellation &amp; Refunds
        </h3>
        <ul className="space-y-2 list-none pl-0 text-fluid-body-sm text-secondary">
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary">6.1</span>
            <span>A Customer may cancel before the Tailor accepts the order (<strong className="text-primary font-medium">SUBMITTED</strong> status). No payment is involved.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary">6.2</span>
            <span>A Customer may cancel after paying the deposit. The Customer is entitled to a full refund of the amount paid.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary">6.3</span>
            <span>Refunds are processed manually by the Tailor via the payment provider. The Service records the status as <strong className="text-primary font-medium">REFUNDED</strong> only after the Tailor confirms the refund has been issued.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-primary">6.4</span>
            <span>A Customer cannot cancel after the Tailor has started work (<strong className="text-primary font-medium">IN_PROGRESS</strong> status).</span>
          </li>
        </ul>
      </section>

      {/* Section 7 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          7. Acceptable Use
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          You agree not to use the Service to: (a) violate any law; (b) infringe the privacy
          rights of others; (c) upload malware or attempt to disrupt the Service; (d) attempt to
          access another Customer&apos;s records.
        </p>
      </section>

      {/* Section 8 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          8. Your Data &amp; Ownership
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          You retain ownership of the personal data you provide (name, email, phone, measurements).
          The Tailor uses this data solely to operate the Service (fulfilling orders, sending
          status updates, processing payments).
        </p>
      </section>

      {/* Section 9 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          9. Lawful Basis for Processing (Nigeria Data Protection Act 2023)
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          We process personal data on the following lawful bases:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-fluid-body-sm text-secondary">
          <li>
            <strong className="text-primary font-medium">Contract:</strong> To provide the Service you signed up for.
          </li>
          <li>
            <strong className="text-primary font-medium">Legitimate interests:</strong> To secure the Service, prevent fraud, and send notifications.
          </li>
          <li>
            <strong className="text-primary font-medium">Legal obligation:</strong> To comply with tax and law-enforcement requests.
          </li>
        </ul>
      </section>

      {/* Section 10 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          10. Your Rights as a Data Subject (NDPA 2023)
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          Under the Nigeria Data Protection Act 2023, you have the right to access your personal
          data; rectify inaccuracies; erase your data, subject to retention requirements for
          financial records; and lodge a complaint with the Nigeria Data Protection Commission (NDPC).
        </p>
      </section>

      {/* Section 11 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          11. Data Retention
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          Order and payment records are retained for compliance with financial regulations.
          Measurement data is retained while your account is active. You may request deletion of
          your account, but data linked to active orders or completed financial transactions will be
          retained as required by law.
        </p>
      </section>

      {/* Section 12 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          12. AI FAQ Assistant
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          The AI assistant answers only from approved business documents. It does not access your
          order records, payments, or personal data. If no verified answer exists, the assistant
          declines to answer and provides the Tailor&apos;s contact details.
        </p>
      </section>

      {/* Section 13 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          13. Sub-processors
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          We use carefully selected sub-processors to deliver the Service, including:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-fluid-body-sm text-secondary">
          <li>
            <strong className="text-primary font-medium">Vercel PostgreSQL (via Prisma ORM)</strong> — database and data storage.
          </li>
          <li>
            <strong className="text-primary font-medium">Paystack</strong> — payment processing.
          </li>
          <li>
            <strong className="text-primary font-medium">Resend</strong> — transactional email delivery.
          </li>
          <li>
            <strong className="text-primary font-medium">Google Gemini</strong> — AI chat and embeddings.
          </li>
        </ul>
        <p className="text-fluid-body-sm text-secondary mt-2">
          We require each sub-processor to maintain protection at least equivalent to what we owe you.
        </p>
      </section>

      {/* Section 14 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          14. Suspension &amp; Termination
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          We may suspend or terminate your account if you breach these Terms, fail to pay, or use the
          Service unlawfully. You may delete your account at any time; doing so cancels future
          billing and triggers data erasure as described in Section 11.
        </p>
      </section>

      {/* Section 15 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          15. Disclaimers &amp; Limitation of Liability
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          The Service is provided &quot;as is&quot;. To the fullest extent permitted by law we disclaim all
          implied warranties. Our aggregate liability arising out of or related to these Terms is
          limited to the amounts you paid us in the 12 months preceding the claim. Nothing in these
          Terms excludes liability that cannot be excluded by law.
        </p>
      </section>

      {/* Section 16 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          16. Indemnity
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          You agree to indemnify and hold us harmless from any claims arising out of your unlawful
          use of the Service or breach of these Terms, including claims by your clients arising from
          your handling of their personal data.
        </p>
      </section>

      {/* Section 17 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          17. Changes to these Terms
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          We may update these Terms from time to time. Material changes will be notified by email or
          in-app banner at least 14 days before taking effect. Continued use after the effective
          date constitutes acceptance.
        </p>
      </section>

      {/* Section 18 */}
      <section className="space-y-2">
        <h3 className="font-display font-semibold text-fluid-title text-primary">
          18. Governing Law
        </h3>
        <p className="text-fluid-body-sm text-secondary">
          These Terms are governed by the laws of the Federal Republic of Nigeria.
        </p>
      </section>
    </div>
  );
}

