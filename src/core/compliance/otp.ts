// src/core/compliance/otp.ts

/**
 * OTP delivery is abstracted behind this interface so we can swap providers
 * (Textlocal / MSG91 / Twilio) without touching the UI.
 */

const PROVIDER = (import.meta.env.VITE_OTP_PROVIDER as string | undefined) ?? 'mock';
const MOCK_CODE = '123456';
const MOCK_KEY_PREFIX = 'cubitx-mock-otp';

export interface OtpResult {
  ok: boolean;
  error?: string;
  devHint?: string;
}

/** Basic Indian mobile validation: 10 digits, starts with 6-9. */
export function isValidIndianMobile(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(digits);
}

export function normaliseMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.slice(-10);
}

function mockKeyFor(mobile: string): string {
  return `${MOCK_KEY_PREFIX}:${normaliseMobile(mobile)}`;
}

export async function sendOtp(mobile: string): Promise<OtpResult> {
  if (!isValidIndianMobile(mobile)) {
    return { ok: false, error: 'Enter a valid 10-digit Indian mobile number.' };
  }

  if (PROVIDER === 'mock') {
    const normalised = normaliseMobile(mobile);
    // eslint-disable-next-line no-console
    console.info('[CubitX] Mock OTP for', normalised, '→', MOCK_CODE);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(mockKeyFor(normalised), MOCK_CODE);
    }
    return { ok: true, devHint: `Dev code: ${MOCK_CODE}` };
  }

  // Real provider — to be implemented once DLT is done.
  // TODO: POST to /api/send-otp on Supabase Edge Function.
  return { ok: false, error: 'OTP provider not configured yet.' };
}

export async function verifyOtp(mobile: string, code: string): Promise<OtpResult> {
  if (!isValidIndianMobile(mobile)) {
    return { ok: false, error: 'Invalid mobile number.' };
  }

  if (PROVIDER === 'mock') {
    if (typeof window === 'undefined') return { ok: false, error: 'Browser only.' };
    const key = mockKeyFor(mobile);
    const stored = window.localStorage.getItem(key);
    if (!stored) return { ok: false, error: 'Request a code first.' };
    if (stored !== code.trim()) return { ok: false, error: 'That code is not correct.' };
    window.localStorage.removeItem(key);
    return { ok: true };
  }

  // TODO: POST to /api/verify-otp on Supabase Edge Function.
  return { ok: false, error: 'OTP provider not configured yet.' };
}

export function isMockMode(): boolean {
  return PROVIDER === 'mock';
}