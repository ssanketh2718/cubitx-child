// src/core/compliance/consent.ts

export const CONSENT_VERSION = '1.1';

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
        'First name (stored separately from mission records using a pseudonymous ID)',
        'Class (5–10)',
        'Their mission choices, optional short written answers, and approved learning events needed to generate parent insights',
      ],
    },
    {
      title: 'What we do NOT collect',
      items: [
        'Date of birth or government IDs',
        'Photographs, audio, or video recordings',
        'Keystroke patterns, hover tracking, or behavioural advertising profiles',
        'Precise location or contact lists',
        'Public cognitive rankings or comparisons against other children',
      ],
    },
    {
      title: 'Why we collect it',
      body: 'To show you observable examples of how your child investigates, reasons, and revises ideas — so you can support them at home.',
    },
    {
      title: 'Who sees it',
      body: 'You, and authorised CubitX educators or trained reviewers who inspect a sample of pseudonymous responses to keep feedback fair and accurate. No advertisers, no other parents, and no unauthorised third parties.',
    },
    {
      title: 'How long we keep it',
      body: 'While your account is active. Auto-deleted 12 months after your last login, unless you request deletion earlier.',
    },
    {
      title: 'Your rights',
      items: [
        'Access — view and export the records we hold for your child',
        'Correct — fix any mistakes in your family or child profile',
        'Delete — permanently remove your child’s data',
        'Withdraw consent — stop processing at any time',
      ],
    },
    {
      title: 'Data Protection Contact',
      body: 'hello@cubitx.in',
    },
  ],
  confirmation: [
    'I am the parent or legal guardian of this child.',
    'I am 18 years or older.',
    'I have read and understood what CubitX collects, how it is reviewed, and why.',
    'I give my voluntary parental consent for my child to use CubitX.',
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

/** Best-effort client metadata for the audit log. Not used for tracking. */
export function getClientMeta(): { ip: string | null; userAgent: string } {
  return {
    ip: null, // Filled in server-side via Supabase Edge Function
    userAgent:
      typeof navigator !== 'undefined'
        ? navigator.userAgent.slice(0, 200)
        : 'unknown',
  };
}