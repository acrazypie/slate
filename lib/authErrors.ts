import type { Dictionary } from './i18n/dictionaries';
import { fill } from './i18n/format';

type AuthErrorKey = keyof Dictionary['authErrors'];

// Supabase returns auth errors in English. The ones a person can actually run
// into are mapped to translated messages here; anything else gets a generic
// message instead of raw API text.
const MESSAGES: [RegExp, AuthErrorKey][] = [
  [/invalid login credentials/i, 'invalidCredentials'],
  [/email not confirmed/i, 'emailNotConfirmed'],
  [/user already registered/i, 'alreadyRegistered'],
  [/password should be at least (\d+)/i, 'passwordTooShort'],
  [/same password|different from the old/i, 'samePassword'],
  [/rate limit|too many requests|only request this after/i, 'rateLimit'],
  [/invalid.*email|unable to validate email/i, 'invalidEmail'],
  [/session missing|not authenticated|jwt/i, 'linkExpired'],
  [/failed to fetch|network/i, 'network'],
];

/** `t` is the current dictionary, from `useI18n()`. */
export function authErrorMessage(message: string, t: Dictionary): string {
  for (const [pattern, key] of MESSAGES) {
    const match = message.match(pattern);
    if (match) return fill(t.authErrors[key], { count: match[1] ?? '' });
  }
  return t.authErrors.generic;
}
