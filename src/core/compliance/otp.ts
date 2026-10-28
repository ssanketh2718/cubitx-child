
/**
 * OTP verification adapter.
 *
 * Production must use a real, server-side OTP provider.
 * Mock OTP is permitted only in a Vite development build.
 *
 * This file intentionally fails closed in production until a real
 * provider endpoint is implemented and configured.
 */

const PROVIDER =
  (import.meta.env.VITE_OTP_PROVIDER as string | undefined) ??
  'unconfigured';

const MOCK_CODE = '123456';
const MOCK_KEY_PREFIX = 'cubitx-dev-mock-otp';

const MOCK_ALLOWED = import.meta.env.DEV && PROVIDER === 'mock';

export interface OtpResult {
  ok: boolean;
  error?: string;
  devHint?: string;
}

/** Validate a 10-digit Indian mobile number. */
export function isValidIndianMobile(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(digits);
}

/** Return the last 10 digits of a formatted Indian mobile number. */
export function normaliseMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.slice(-10);
}

function mockKeyFor(mobile: string): string {
  return `${MOCK_KEY_PREFIX}:${normaliseMobile(mobile)}`;
}

export async function sendOtp(mobile: string): Promise<OtpResult> {
  if (!isValidIndianMobile(mobile)) {
    return {
      ok: false,
      error: 'Enter a valid 10-digit Indian mobile number.',
    };
  }

  if (!MOCK_ALLOWED) {
    return {
      ok: false,
      error:
        'Mobile verification is not configured. Please try again later or contact support.',
    };
  }

  if (typeof window === 'undefined') {
    return {
      ok: false,
      error: 'Development OTP is available only in a browser.',
    };
  }

  try {
    const normalised = normaliseMobile(mobile);
    window.localStorage.setItem(mockKeyFor(normalised), MOCK_CODE);

    return {
      ok: true,
      devHint: `Development test code: ${MOCK_CODE}`,
    };
  } catch {
    return {
      ok: false,
      error: 'Could not start development verification.',
    };
  }
}

export async function verifyOtp(
  mobile: string,
  code: string,
): Promise<OtpResult> {
  if (!isValidIndianMobile(mobile)) {
    return {
      ok: false,
      error: 'Invalid mobile number.',
    };
  }

  if (!/^\d{6}$/.test(code.trim())) {
    return {
      ok: false,
      error: 'Enter the six-digit verification code.',
    };
  }

  if (!MOCK_ALLOWED) {
    return {
      ok: false,
      error:
        'Mobile verification is not configured. Consent cannot be verified yet.',
    };
  }

  if (typeof window === 'undefined') {
    return {
      ok: false,
      error: 'Development OTP is available only in a browser.',
    };
  }

  try {
    const key = mockKeyFor(mobile);
    const stored = window.localStorage.getItem(key);

    if (!stored) {
      return {
        ok: false,
        error: 'Request a new development code first.',
      };
    }

    if (stored !== code.trim()) {
      return {
        ok: false,
        error: 'That code is not correct.',
      };
    }

    window.localStorage.removeItem(key);

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Could not verify the development code.',
    };
  }
}

export function isMockMode(): boolean {
  return MOCK_ALLOWED;
}
