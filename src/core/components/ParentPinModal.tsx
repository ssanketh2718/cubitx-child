import { useEffect, useState } from 'react';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';

const PIN_STORAGE_KEY = 'cubitx_parent_pin_v1';
const BIOMETRIC_CRED_KEY = 'cubitx_parent_bio_id_v1';

interface ParentPinModalProps {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  targetLabel?: string;
}

export default function ParentPinModal({
  open,
  onClose,
  onUnlocked,
  targetLabel = 'Parent Area',
}: ParentPinModalProps) {
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioLinked, setBioLinked] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPinInput('');
    setSetupPin('');
    setConfirmPin('');
    setError('');

    try {
      const existing = window.localStorage.getItem(PIN_STORAGE_KEY);
      setSavedPin(existing);
      setBioLinked(Boolean(window.localStorage.getItem(BIOMETRIC_CRED_KEY)));
    } catch {
      setSavedPin(null);
    }

    if (
      typeof window !== 'undefined' &&
      'PublicKeyCredential' in window &&
      typeof navigator.credentials?.create === 'function'
    ) {
      setBioAvailable(true);
    }
  }, [open]);

  if (!open) return null;

  const unlockSuccess = () => {
    triggerSoftConfirm(true);
    sessionStorage.setItem('parent_gate_unlocked', 'true');
    onUnlocked();
  };

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(setupPin)) {
      setError('Enter a 4-digit numeric PIN.');
      return;
    }
    if (setupPin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    try {
      window.localStorage.setItem(PIN_STORAGE_KEY, setupPin);
      setSavedPin(setupPin);
      unlockSuccess();
    } catch {
      setError('Unable to save PIN on this device.');
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === savedPin) {
      unlockSuccess();
    } else {
      triggerDialTick(true);
      setError('Incorrect 4-digit PIN.');
      setPinInput('');
    }
  };

  const handleEnableAndVerifyBiometric = async () => {
    setError('');
    try {
      const challenge = new Uint8Array(16);
      crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'CubitX Parent Space' },
          user: {
            id: userId,
            name: 'parent@cubitx.in',
            displayName: 'CubitX Parent',
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 45000,
        },
      })) as PublicKeyCredential | null;

      if (credential) {
        window.localStorage.setItem(BIOMETRIC_CRED_KEY, credential.id);
        setBioLinked(true);
        unlockSuccess();
      }
    } catch {
      setError('Fingerprint / biometric unlock was cancelled or not set up on this device. Use your 4-digit PIN.');
    }
  };

  const handleQuickBiometricUnlock = async () => {
    setError('');
    const credId = window.localStorage.getItem(BIOMETRIC_CRED_KEY);
    if (!credId || typeof navigator.credentials?.get !== 'function') {
      setError('Enter your 4-digit PIN below.');
      return;
    }
    try {
      const challenge = new Uint8Array(16);
      crypto.getRandomValues(challenge);
      const rawBytes = Uint8Array.from(atob(credId.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
        c.charCodeAt(0)
      );
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ id: rawBytes, type: 'public-key' }],
          userVerification: 'required',
          timeout: 45000,
        },
      });
      if (assertion) {
        unlockSuccess();
      }
    } catch {
      setError('Biometric check did not complete. Enter your 4-digit PIN.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#142033]/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[32px] border border-[#142033]/15 bg-[#F7F6F1] p-7 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1 text-center">
          <span className="inline-block rounded-full bg-[#087F80]/12 px-3 py-1 font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#087F80]">
            PARENT LOCK · {targetLabel}
          </span>
          <h2 className="font-display text-2xl font-extrabold text-[#142033] pt-1">
            {savedPin ? 'Enter Parent PIN' : 'Set a 4-Digit Parent PIN'}
          </h2>
          <p className="text-xs text-[#586579]">
            {savedPin
              ? 'Keeps Parent Insights and Try at Home private from child play.'
              : 'Create a 4-digit PIN once so only parents open insights and home prompts.'}
          </p>
        </div>

        {error && (
          <p className="rounded-2xl border border-[#F07868]/40 bg-[#F07868]/15 px-3.5 py-2.5 text-center text-xs font-bold text-[#9E3324]">
            {error}
          </p>
        )}

        {!savedPin ? (
          <form onSubmit={handleCreatePin} className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              autoFocus
              placeholder="New 4-digit PIN"
              value={setupPin}
              onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full rounded-2xl border border-[#142033]/15 bg-white p-3.5 text-center font-mono-tech text-xl font-bold tracking-[0.45em] text-[#142033]"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              placeholder="Confirm 4-digit PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full rounded-2xl border border-[#142033]/15 bg-white p-3.5 text-center font-mono-tech text-xl font-bold tracking-[0.45em] text-[#142033]"
            />
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-[#142033]/15 bg-white py-3 text-xs font-bold text-[#142033] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full bg-[#142033] py-3 text-xs font-extrabold text-white hover:bg-[#087F80] cursor-pointer"
              >
                Save PIN ↗
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyPin} className="space-y-3.5">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              autoFocus
              placeholder="• • • •"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full rounded-2xl border border-[#142033]/15 bg-white p-3.5 text-center font-mono-tech text-2xl font-bold tracking-[0.5em] text-[#142033]"
            />

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-[#142033]/15 bg-white py-3 text-xs font-bold text-[#142033] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full bg-[#142033] py-3 text-xs font-extrabold text-white hover:bg-[#087F80] cursor-pointer"
              >
                Unlock ↗
              </button>
            </div>

            {bioAvailable && (
              <div className="pt-2 border-t border-[#142033]/10">
                <button
                  type="button"
                  onClick={() =>
                    void (bioLinked
                      ? handleQuickBiometricUnlock()
                      : handleEnableAndVerifyBiometric())
                  }
                  className="w-full rounded-full border border-[#087F80]/30 bg-[#087F80]/10 py-2.5 text-xs font-extrabold text-[#087F80] hover:bg-[#087F80] hover:text-white transition cursor-pointer"
                >
                  {bioLinked
                    ? 'Unlock with Fingerprint / Passkey'
                    : 'Set up Fingerprint / Passkey'}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                window.localStorage.removeItem(PIN_STORAGE_KEY);
                setSavedPin(null);
                setPinInput('');
                setError('');
              }}
              className="w-full pt-1 text-center text-[11px] font-semibold text-[#586579] underline cursor-pointer"
            >
              Reset 4-digit PIN
            </button>
          </form>
        )}
      </div>
    </div>
  );
}