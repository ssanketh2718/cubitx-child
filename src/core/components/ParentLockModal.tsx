import { useEffect, useState } from 'react';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';

interface ParentLockModalProps {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  onForgotReset?: () => void;
}

const PIN_HASH_KEY = 'cubitx-parent-pin-hash';
const BIOMETRIC_CRED_KEY = 'cubitx-parent-biometric-id';

async function hashPin(pin: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(`cubitx-pin-v1:${pin}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return `fallback:${pin}`;
}

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export default function ParentLockModal({
  open,
  onClose,
  onUnlocked,
  onForgotReset,
}: ParentLockModalProps) {
  const [hasSavedPin, setHasSavedPin] = useState<boolean>(() =>
    Boolean(localStorage.getItem(PIN_HASH_KEY))
  );
  const [step, setStep] = useState<'enter' | 'create' | 'confirm'>(() =>
    localStorage.getItem(PIN_HASH_KEY) ? 'enter' : 'create'
  );
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState<boolean>(() =>
    Boolean(localStorage.getItem(BIOMETRIC_CRED_KEY))
  );
  const [bioBusy, setBioBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const saved = Boolean(localStorage.getItem(PIN_HASH_KEY));
    setHasSavedPin(saved);
    setStep(saved ? 'enter' : 'create');
    setPin('');
    setFirstPin('');
    setError('');
    setBioEnabled(Boolean(localStorage.getItem(BIOMETRIC_CRED_KEY)));

    if (
      typeof window !== 'undefined' &&
      'PublicKeyCredential' in window &&
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
        'function'
    ) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((ok) => setBioAvailable(ok))
        .catch(() => setBioAvailable(false));
    }
  }, [open]);

  const completeUnlock = () => {
    triggerSoftConfirm(true);
    sessionStorage.setItem('parent_gate_unlocked', 'true');
    onUnlocked();
  };

  const enrollBiometric = async () => {
    if (!bioAvailable || bioBusy) return;
    setBioBusy(true);
    setError('');
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      const cred = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'CubitX Parent Access' },
          user: {
            id: userId,
            name: 'parent@cubitx',
            displayName: 'CubitX Parent',
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (cred) {
        localStorage.setItem(BIOMETRIC_CRED_KEY, bufferToBase64(cred.rawId));
        setBioEnabled(true);
        completeUnlock();
      }
    } catch {
      setError('Fingerprint / Face ID could not be set up. Use your 4-digit PIN.');
    } finally {
      setBioBusy(false);
    }
  };

  const verifyBiometric = async () => {
    const savedCredId = localStorage.getItem(BIOMETRIC_CRED_KEY);
    if (!bioAvailable || !savedCredId || bioBusy) return;
    setBioBusy(true);
    setError('');
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [
            {
              type: 'public-key',
              id: base64ToUint8Array(savedCredId).buffer as ArrayBuffer,
            },
          ],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (assertion) {
        completeUnlock();
      }
    } catch {
      setError('Biometric check cancelled. Enter your 4-digit PIN.');
    } finally {
      setBioBusy(false);
    }
  };

  const handleDigit = async (digit: string) => {
    if (pin.length >= 4) return;
    triggerDialTick(true);
    setError('');
    const next = pin + digit;
    setPin(next);

    if (next.length < 4) return;

    if (step === 'create') {
      setFirstPin(next);
      setPin('');
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      if (next !== firstPin) {
        triggerDialTick(false);
        setError('PINs did not match. Try again.');
        setPin('');
        setFirstPin('');
        setStep('create');
        return;
      }
      const hashed = await hashPin(next);
      localStorage.setItem(PIN_HASH_KEY, hashed);
      setHasSavedPin(true);
      completeUnlock();
      return;
    }

    // step === 'enter'
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    const enteredHash = await hashPin(next);
    if (storedHash && enteredHash === storedHash) {
      completeUnlock();
    } else {
      triggerDialTick(false);
      setError('Wrong PIN. Please try again.');
      setPin('');
    }
  };

  const handleBackspace = () => {
    if (!pin.length) return;
    triggerDialTick(false);
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (/^\d$/.test(e.key)) {
        void handleDigit(e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (!open) return null;

  const heading =
    step === 'create'
      ? 'Set a 4-digit Parent PIN'
      : step === 'confirm'
      ? 'Confirm your 4-digit PIN'
      : 'Parent Access';

  const subtitle =
    step === 'create'
      ? 'Keeps Parent View and Try at Home separate from your child’s space.'
      : step === 'confirm'
      ? 'Enter the same 4 digits once more to save.'
      : 'Enter your 4-digit PIN or use fingerprint / Face ID.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#142033]/65 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="parent-lock-title"
        className="w-full max-w-sm rounded-3xl border border-[#142033]/15 bg-[#F7F6F1] p-7 shadow-2xl space-y-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1.5">
          <span className="inline-block rounded-full bg-[#087F80]/10 px-3 py-1 font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#087F80]">
            GROWN-UPS ONLY
          </span>
          <h2
            id="parent-lock-title"
            className="font-display text-2xl font-extrabold text-[#142033]"
          >
            {heading}
          </h2>
          <p className="text-xs text-[#586579] leading-relaxed">{subtitle}</p>
        </div>

        {/* 4-DOT PIN DISPLAY */}
        <div className="flex items-center justify-center gap-3.5 py-1">
          {[0, 1, 2, 3].map((idx) => {
            const filled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`h-4 w-4 rounded-full border-2 transition-all duration-150 ${
                  filled
                    ? 'scale-110 border-[#087F80] bg-[#087F80]'
                    : 'border-[#142033]/25 bg-white'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p role="alert" className="text-xs font-bold text-[#9E3324]">
            {error}
          </p>
        )}

        {/* TACTILE KEYPAD */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => void handleDigit(digit)}
              className="h-14 rounded-2xl border border-[#142033]/12 bg-white font-display text-xl font-extrabold tabular-nums text-[#142033] hover:border-[#087F80] active:scale-95 transition cursor-pointer"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={onClose}
            className="h-14 rounded-2xl border border-[#142033]/10 bg-transparent text-xs font-bold text-[#586579] hover:text-[#142033] cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleDigit('0')}
            className="h-14 rounded-2xl border border-[#142033]/12 bg-white font-display text-xl font-extrabold tabular-nums text-[#142033] hover:border-[#087F80] active:scale-95 transition cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            aria-label="Delete last digit"
            onClick={handleBackspace}
            className="h-14 rounded-2xl border border-[#142033]/10 bg-[#EFECE3] text-sm font-extrabold text-[#142033] hover:bg-[#142033] hover:text-white active:scale-95 transition cursor-pointer"
          >
            ⌫
          </button>
        </div>

        {/* FINGERPRINT / FACE ID */}
        {bioAvailable && hasSavedPin && (
          <div className="pt-1">
            {bioEnabled ? (
              <button
                type="button"
                disabled={bioBusy}
                onClick={() => void verifyBiometric()}
                className="cx-action-pill w-full bg-[#142033] py-3 text-xs text-white hover:bg-[#087F80] cursor-pointer disabled:opacity-60"
              >
                {bioBusy ? 'Checking…' : 'Use Fingerprint / Face ID'}
              </button>
            ) : (
              <button
                type="button"
                disabled={bioBusy}
                onClick={() => void enrollBiometric()}
                className="w-full rounded-full border border-[#087F80]/30 bg-[#087F80]/8 py-2.5 text-xs font-bold text-[#087F80] hover:bg-[#087F80] hover:text-white transition cursor-pointer disabled:opacity-60"
              >
                {bioBusy ? 'Setting up…' : 'Enable Fingerprint / Face ID'}
              </button>
            )}
          </div>
        )}

        {hasSavedPin && onForgotReset && (
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(PIN_HASH_KEY);
              localStorage.removeItem(BIOMETRIC_CRED_KEY);
              onForgotReset();
            }}
            className="text-[11px] font-semibold text-[#586579] underline hover:text-[#142033] cursor-pointer"
          >
            Forgot PIN? Sign out to reset
          </button>
        )}
      </div>
    </div>
  );
}
