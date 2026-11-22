import * as nodemailer from 'nodemailer';
import { PASSWORD_RESET_TTL_MINUTES } from './password-reset';
import { VERIFICATION_CODE_TTL_MINUTES } from './verification-code';

// Task 01 design tokens used in outgoing HTML email: navy key colour and the
// Manrope body font. Email clients do not load the app's CSS, so the values
// are inlined here rather than referenced through CSS custom properties.
const EMAIL_NAVY = '#101B2D';
const EMAIL_FONT_STACK = 'Manrope, "Segoe UI", Arial, sans-serif';

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromAddress: string;
  fromName: string;
};

function parseFromAddress(
  value: string,
  fallbackName: string
): { address: string; name: string } {
  const displayNameMatch = value.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);

  if (!displayNameMatch) {
    return { address: value, name: fallbackName };
  }

  const parsedName = displayNameMatch[1]
    .trim()
    .replace(/^["']|["']$/g, '');

  return {
    address: displayNameMatch[2].trim(),
    name: parsedName || fallbackName,
  };
}

function readSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const portValue = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();
  const rawFrom = process.env.SMTP_FROM_EMAIL?.trim();
  const configuredFromName = process.env.SMTP_FROM_NAME?.trim() || 'Tayhlor';
  const from = rawFrom ? parseFromAddress(rawFrom, configuredFromName) : null;
  const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();

  if (!host || !portValue || !user || !password || !from?.address) {
    return null;
  }

  const port = Number(portValue);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }

  return {
    host,
    port,
    secure: secureValue === 'true' || secureValue === '1',
    user,
    password,
    fromAddress: from.address,
    fromName: from.name,
  };
}

export function isEmailConfigured(): boolean {
  return readSmtpConfig() !== null;
}

export function isPasswordResetEmailConfigured(): boolean {
  return isEmailConfigured();
}

export function isVerificationEmailConfigured(): boolean {
  return isEmailConfigured();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Single SMTP send path for the project. Every email in Tayhlor goes through
 * this function, so switching providers only requires changing env config.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const config = readSmtpConfig();

  if (!config) {
    throw new Error('SMTP email is not configured');
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  await transporter.sendMail({
    from: {
      name: config.fromName,
      address: config.fromAddress,
    },
    to: input.to,
    subject: input.subject,
    text: input.text,
    ...(input.html ? { html: input.html } : {}),
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  fullName: string;
  resetUrl: string;
}): Promise<void> {
  await sendEmail({
    to: input.to,
    subject: 'Reset your Tayhlor password',
    text: [
      `Hello ${input.fullName},`,
      '',
      'We received a request to reset your Tayhlor password.',
      `Use this link within ${PASSWORD_RESET_TTL_MINUTES} minutes. It can be used once.`,
      '',
      input.resetUrl,
      '',
      "If you didn't request this, you can ignore this email.",
      'If you signed up with Google, use Google sign-in instead.',
    ].join('\n'),
  });
}

export async function sendVerificationEmail(input: {
  to: string;
  fullName: string;
  code: string;
}): Promise<void> {
  const safeName = escapeHtml(input.fullName);
  const html = `
    <div style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; max-width: 560px; margin: 0 auto; padding: 32px; background-color: #ffffff;">
      <h1 style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; font-size: 24px; font-weight: 600; margin: 0 0 20px;">
        Verify your Tayhlor email
      </h1>
      <p style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
        Hello ${safeName},
      </p>
      <p style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        Use the code below to verify your email address. It expires in ${VERIFICATION_CODE_TTL_MINUTES} minutes.
      </p>
      <div style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; font-size: 32px; font-weight: 600; letter-spacing: 8px; padding: 16px; border: 1px solid ${EMAIL_NAVY}; border-radius: 8px; text-align: center;">
        ${input.code}
      </div>
      <p style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">
        If you did not create a Tayhlor account, you can ignore this email.
      </p>
    </div>
  `;

  await sendEmail({
    to: input.to,
    subject: 'Your Tayhlor verification code',
    text: [
      `Hello ${input.fullName},`,
      '',
      'Use the code below to verify your email address.',
      `It expires in ${VERIFICATION_CODE_TTL_MINUTES} minutes.`,
      '',
      input.code,
      '',
      'If you did not create a Tayhlor account, you can ignore this email.',
    ].join('\n'),
    html,
  });
}

/**
 * Starts the SMTP send without awaiting it so the registration response is
 * not held open by email delivery. Failures are logged, never surfaced to the
 * browser, and never stored as a verified email.
 */
export function sendVerificationEmailInBackground(input: {
  to: string;
  fullName: string;
  code: string;
}): void {
  void sendVerificationEmail(input).catch((error) => {
    console.error('Verification email background send failed:', error);
  });
}

export async function sendWelcomeEmail(input: {
  to: string;
  fullName: string;
}): Promise<void> {
  const safeName = escapeHtml(input.fullName);
  const html = `
    <div style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; max-width: 560px; margin: 0 auto; padding: 32px; background-color: #ffffff;">
      <div style="width: 48px; height: 48px; border-radius: 50%; background-color: ${EMAIL_NAVY}; color: #ffffff; font-family: ${EMAIL_FONT_STACK}; font-size: 24px; font-weight: 600; line-height: 48px; text-align: center; margin-bottom: 24px;">
        T
      </div>
      <h1 style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; font-size: 26px; font-weight: 600; margin: 0 0 16px;">
        Welcome to Tayhlor
      </h1>
      <p style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
        Hello ${safeName},
      </p>
      <p style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
        Welcome to Tayhlor. We're glad you're here.
      </p>
      <p style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
        Your account is ready. You can keep your measurements, submit garment orders, and follow each order's progress in one place.
      </p>
      <div style="font-family: ${EMAIL_FONT_STACK}; color: ${EMAIL_NAVY}; font-size: 13px; line-height: 1.6; margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        We're happy to have you with us.<br />
        The Tayhlor Team
      </div>
    </div>
  `;

  await sendEmail({
    to: input.to,
    subject: 'Welcome to Tayhlor',
    text: [
      `Hello ${input.fullName},`,
      '',
      "Welcome to Tayhlor. We're glad you're here.",
      '',
      "Your account is ready. You can keep your measurements, submit garment orders, and follow each order's progress in one place.",
      '',
      "We're happy to have you with us.",
      'The Tayhlor Team',
    ].join('\n'),
    html,
  });
}

/**
 * Starts the welcome email without awaiting it so account creation is not
 * delayed by SMTP delivery. Failures are logged and never surfaced to the user.
 */
export function sendWelcomeEmailInBackground(input: {
  to: string;
  fullName: string;
}): void {
  void sendWelcomeEmail(input).catch((error) => {
    console.error('Welcome email background send failed:', error);
  });
}
