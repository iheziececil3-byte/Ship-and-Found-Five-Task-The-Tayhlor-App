import { createHash } from 'node:crypto';

const HIBP_RANGE_ENDPOINT = 'https://api.pwnedpasswords.com/range';
const HIBP_USER_AGENT = 'Tayhlor/password-breach-check';
const HIBP_TIMEOUT_MS = 5_000;

/**
 * Checks a candidate password against Have I Been Pwned using the k-anonymity
 * range API. Only the first five characters of the SHA-1 hash leave this
 * server; the password and its full hash are never transmitted or logged.
 *
 * Throws when the lookup cannot be completed so callers never silently accept
 * a password whose breach status is unknown.
 */
export async function isPasswordBreached(password: string): Promise<boolean> {
  const digest = createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();
  const prefix = digest.slice(0, 5);
  const suffix = digest.slice(5);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HIBP_TIMEOUT_MS);

  try {
    const response = await fetch(`${HIBP_RANGE_ENDPOINT}/${prefix}`, {
      headers: {
        'User-Agent': HIBP_USER_AGENT,
        'Add-Padding': 'true',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Breach lookup returned HTTP ${response.status}`);
    }

    const body = await response.text();

    for (const line of body.split(/\r?\n/)) {
      const separator = line.indexOf(':');

      if (separator === -1) {
        continue;
      }

      if (line.slice(0, separator).trim().toUpperCase() === suffix) {
        return true;
      }
    }

    return false;
  } catch {
    throw new Error('Breach lookup is unavailable');
  } finally {
    clearTimeout(timeout);
  }
}
