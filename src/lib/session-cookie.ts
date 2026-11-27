/**
 * Cookie configuration shared by NextAuth (Google sign-in and sign-out) and the
 * app-owned sign-in route. Keeping one source avoids a cookie-name mismatch.
 */
export function useSecureSessionCookies(): boolean {
  const configuredUrl = process.env.NEXTAUTH_URL;
  return (
    process.env.NODE_ENV === 'production' ||
    (typeof configuredUrl === 'string' && configuredUrl.startsWith('https://'))
  );
}

export function getSessionCookieName(): string {
  return `${useSecureSessionCookies() ? '__Secure-' : ''}next-auth.session-token`;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: useSecureSessionCookies(),
    sameSite: 'lax' as const,
    path: '/',
  };
}
