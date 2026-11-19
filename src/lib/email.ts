import { PASSWORD_RESET_TTL_MINUTES } from './password-reset';

const RESEND_EMAILS_ENDPOINT = 'https://api.resend.com/emails';

export function isPasswordResetEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function sendPasswordResetEmail(input: {
  to: string;
  fullName: string;
  resetUrl: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error('Password reset email is not configured');
  }

  const response = await fetch(RESEND_EMAILS_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
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
    }),
  });

  if (!response.ok) {
    throw new Error('Password reset email request failed');
  }
}
