// src/core/compliance/consent.ts

export const CONSENT_VERSION = '1.0';

export interface ConsentRecord {
  parentId: string;
  firstName: string;
  surname: string;
  mobileLast4: string;
  mobileVerified: true;
  version: string;
  method: 'otp_mobile';
  ip: string | null;
  userAgent: string;
  consentedAt: string;
  auditHash: string;
}

/**
 * Canonical consent text. Any change here MUST bump CONSENT_VERSION.
 * Old versions remain valid for parents who consented to them —
 * they are only re-prompted if we materially change what we collect.
 */
export const CONSENT_TEXT = {
  heading: 'CubitX — Parental Consent',
  intro: 'You are giving consent on behalf of your child. Please read carefully.',
  sections: [
    {
      title: 'What we collect about your child',
      items: [
        'First name',
        'Class (5–10)',
        'Their answers to thinking missions — including text, choices, and how long they spent on each',
      ],
    },
    {
      title: 'What we do NOT collect',
      items: [
        'Date of birth',
        'Photographs',
        'Location',
        'Contact list',
        'Any information beyond what is needed to show you how your child is progressing',
      ],
    },
    {
      title: 'Why we collect it',
      body: 'To show you how your child thinks — their reasoning, curiosity, and habits — so you can support them at home.',
    },
    {
      title: 'Who sees it',
      body: 'Only you. No other parent, no advertiser, no third party. CubitX staff cannot read your child\'s answers.',
    },
    {
      title: 'How long we keep it',
      body: 'While your account is active. Auto-deleted 12 months after your last login, unless you delete it earlier.',
    },
    {
      title: 'Your rights',
      items: [
        'Access — download everything we hold, anytime',
        'Correct — fix any mistakes',
        'Delete — remove your child\'s data permanently',
        'Withdraw consent — stop all processing at any time',
      ],
    },
    {
      title: 'Data Protection Officer',
      body: 'hello@cubitx.in',
    },
  ],
  confirmation: [
    'I am the parent or legal guardian of this child.',
    'I am 18 years or older.',
    'I have read and understood what CubitX collects and why.',
    'I give my voluntary consent under Section 9(1) of the DPDP Act, 2023.',
  ],
};

/**
 * SHA-256 hash of a canonicalised consent record.
 * Deterministic — same inputs always produce the same hash.
 */
export async function hashConsent(input: {
  parentId: string;
  version: string;
  consentedAt: string;
  mobileLast4: string;
  previousHash?: string;
}): Promise<string> {
  const canonical = [
    input.parentId,
    input.version,
    input.consentedAt,
    input.mobileLast4,
    input.previousHash ?? 'genesis',
  ].join('|');

  const buf = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Best-effort client fingerprint for the audit log. Not used for tracking. */
export function getClientMeta(): { ip: string | null; userAgent: string } {
  return {
    ip: null, // Filled in server-side later via Supabase Edge Function
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : 'unknown',
  };
}
