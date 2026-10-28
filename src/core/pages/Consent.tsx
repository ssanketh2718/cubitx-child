import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import {
  CONSENT_TEXT,
  CONSENT_VERSION,
  hashConsent,
  getClientMeta,
} from '../compliance/consent';
import {
  sendOtp,
  verifyOtp,
  normaliseMobile,
  isValidIndianMobile,
  isMockMode,
} from '../compliance/otp';

const BRAND = {
  surface: '#05091a',
  surface2: '#0a1228',
  blue: '#7b8dff',
  blueBright: '#9aaaff',
  blueSoft: '#a8b6ff',
  ink: '#ffffff',
  inkDim: 'rgba(255,255,255,0.62)',
  inkFaint: 'rgba(255,255,255,0.38)',
  inkGhost: 'rgba(255,255,255,0.14)',
  emerald: '#34d399',
  red: '#f87171',
  amber: '#fbbf24',
};

type Stage = 'form' | 'otp' | 'saving' | 'done';

export default function Consent() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [mobile, setMobile] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [stage, setStage] = useState<Stage>('form');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [devHint, setDevHint] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (!user) return null;

  const canSend =
    firstName.trim().length >= 2 &&
    surname.trim().length >= 1 &&
    isValidIndianMobile(mobile) &&
    agreed;

  const handleSend = async () => {
    if (sending) return;

    setError('');
    setSending(true);

    try {
      const res = await sendOtp(mobile);

      if (!res.ok) {
        setError(res.error ?? 'Could not send the code.');
        return;
      }

      if (res.devHint) setDevHint(res.devHint);
      setStage('otp');
    } catch {
      setError('Could not send the code. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (sending) return;

    setError('');
    setSending(true);

    try {
      const res = await verifyOtp(mobile, otp);

      if (!res.ok) {
        setError(res.error ?? 'Verification failed.');
        return;
      }

      // Mock OTP is only for testing the interface. It is not proof of
      // phone ownership and must never create a real consent record.
      if (isMockMode()) {
        setError(
          'Development mock OTP cannot record parental consent or update a real account. Configure a real server-side OTP provider before recording consent.'
        );
        return;
      }

      setStage('saving');

      const normalised = normaliseMobile(mobile);
      const mobileLast4 = normalised.slice(-4);
      const consentedAt = new Date().toISOString();
      const meta = getClientMeta();

      const auditHash = await hashConsent({
        parentId: user.id,
        version: CONSENT_VERSION,
        consentedAt,
        mobileLast4,
      });

      const { error: updateErr } = await supabase
        .from('parents')
        .update({
          first_name: firstName.trim(),
          surname: surname.trim(),
          mobile_last4: mobileLast4,
          mobile_verified: true,
          mobile_verified_at: consentedAt,
          consent_given: true,
          consent_version: CONSENT_VERSION,
          consented_at: consentedAt,
          consent_method: 'otp_mobile',
          consent_ip: meta.ip,
          consent_user_agent: meta.userAgent,
        })
        .eq('id', user.id);

      if (updateErr) {
        setStage('otp');
        setError('Could not save your consent. Please try again.');
        return;
      }

      const { error: logErr } = await supabase.from('consent_log').insert({
        parent_id: user.id,
        event: 'given',
        version: CONSENT_VERSION,
        method: 'otp_mobile',
        ip: meta.ip,
        user_agent: meta.userAgent,
        hash: auditHash,
      });

      if (logErr) {
        setStage('otp');
        setError(
          'Your details were updated, but the consent audit record failed. Please contact support before continuing.'
        );
        return;
      }

      const { error: metadataErr } = await supabase.auth.updateUser({
        data: { consent_given: true },
      });

      if (metadataErr) {
        // The database consent and audit log already succeeded. Do not
        // pretend that those operations were rolled back.
        console.error('Consent saved, but Auth metadata update failed.');
      }

      setStage('done');
      window.setTimeout(() => navigate('/onboard'), 1200);
    } catch {
      setStage('otp');
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{
        background: BRAND.surface,
        color: BRAND.ink,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div className="max-w-xl mx-auto">
        <img
          src="/cubitx-logo.jpg"
          alt="CubitX"
          className="h-9 w-auto mb-8"
        />

        {stage !== 'done' && (
          <>
            <div
              className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
              style={{ color: BRAND.blueBright }}
            >
              {CONSENT_TEXT.heading}
            </div>

            <h1 className="text-[26px] md:text-[30px] font-semibold leading-[1.2] tracking-tight mb-3">
              {CONSENT_TEXT.intro}
            </h1>

            <p
              className="text-[14px] leading-[1.7] mb-8"
              style={{ color: BRAND.inkDim }}
            >
              This takes a minute. We want you to know exactly what CubitX
              collects about your child — before you say yes.
            </p>
          </>
        )}

        {stage === 'form' && (
          <>
            <ConsentSections />

            <div
              className="rounded-2xl p-5 mt-6"
              style={{
                background: BRAND.surface2,
                border: `1px solid ${BRAND.inkGhost}`,
              }}
            >
              <div className="text-[13px] font-semibold mb-4">
                Your details
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label
                    className="text-[12px] font-semibold"
                    style={{ color: BRAND.inkDim }}
                  >
                    First name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Aarti"
                    autoComplete="given-name"
                    className="mt-1.5 w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                    style={{
                      background: 'rgba(0,0,0,0.25)',
                      border: `1px solid ${BRAND.inkGhost}`,
                      color: BRAND.ink,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="text-[12px] font-semibold"
                    style={{ color: BRAND.inkDim }}
                  >
                    Surname
                  </label>
                  <input
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Sharma"
                    autoComplete="family-name"
                    className="mt-1.5 w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                    style={{
                      background: 'rgba(0,0,0,0.25)',
                      border: `1px solid ${BRAND.inkGhost}`,
                      color: BRAND.ink,
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="text-[12px] font-semibold"
                  style={{ color: BRAND.inkDim }}
                >
                  Mobile number
                </label>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="98765 43210"
                  inputMode="numeric"
                  autoComplete="tel"
                  className="mt-1.5 w-full rounded-xl px-4 py-3 text-[14px] outline-none tabular-nums"
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: `1px solid ${BRAND.inkGhost}`,
                    color: BRAND.ink,
                  }}
                />
                <div
                  className="text-[11px] mt-1.5"
                  style={{ color: BRAND.inkFaint }}
                >
                  We send a one-time code to confirm it's you.
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-[3px] w-4 h-4 accent-[#7b8dff]"
                />

                <div
                  className="text-[12.5px] leading-[1.65]"
                  style={{ color: BRAND.inkDim }}
                >
                  {CONSENT_TEXT.confirmation.map((line, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </label>
            </div>

            {error && <ErrorBox message={error} />}

            <button
              onClick={handleSend}
              disabled={!canSend || sending}
              className="mt-6 w-full rounded-full py-4 text-[15px] font-bold transition disabled:opacity-30"
              style={{ background: BRAND.ink, color: BRAND.surface }}
            >
              {sending ? 'Sending code…' : 'Send verification code'}
            </button>

            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="mt-4 block w-full text-center text-[12px]"
              style={{ color: BRAND.inkFaint }}
            >
              ← Not now, sign out
            </button>
          </>
        )}

        {stage === 'otp' && (
          <>
            <div
              className="rounded-2xl p-5 mb-5"
              style={{
                background: BRAND.surface2,
                border: `1px solid ${BRAND.inkGhost}`,
              }}
            >
              <div className="text-[13px] font-semibold mb-2">
                Enter the code
              </div>

              <div
                className="text-[13px] mb-4"
                style={{ color: BRAND.inkDim }}
              >
                We sent a 6-digit code to{' '}
                <span style={{ color: BRAND.ink }}>{mobile}</span>.
              </div>

              <input
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="······"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                className="w-full text-center tracking-[0.5em] text-[24px] font-bold rounded-xl py-4 outline-none tabular-nums"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: `1px solid ${BRAND.inkGhost}`,
                  color: BRAND.ink,
                }}
              />

              {devHint && (
                <div
                  className="mt-3 rounded-xl px-3 py-2 text-[12px] font-semibold"
                  style={{
                    background: 'rgba(251,191,36,0.08)',
                    border: '1px solid rgba(251,191,36,0.28)',
                    color: BRAND.amber,
                  }}
                >
                  🧪 {devHint}{' '}
                  {isMockMode() ? '(mock mode — not a real SMS)' : ''}
                </div>
              )}
            </div>

            {error && <ErrorBox message={error} />}

            <button
              onClick={handleVerify}
              disabled={otp.length !== 6 || sending}
              className="mt-2 w-full rounded-full py-4 text-[15px] font-bold transition disabled:opacity-30"
              style={{ background: BRAND.ink, color: BRAND.surface }}
            >
              {sending ? 'Verifying…' : 'Verify and continue'}
            </button>

            <button
              onClick={() => {
                setStage('form');
                setOtp('');
                setError('');
              }}
              className="mt-4 block w-full text-center text-[12px]"
              style={{ color: BRAND.inkFaint }}
            >
              ← Change number
            </button>
          </>
        )}

        {stage === 'saving' && (
          <div className="text-center py-16">
            <div className="text-[40px] mb-4">🔒</div>
            <div className="text-[15px] font-semibold">
              Saving your consent…
            </div>
            <div
              className="text-[13px] mt-2"
              style={{ color: BRAND.inkDim }}
            >
              This is recorded permanently, so you have a full audit trail.
            </div>
          </div>
        )}

        {stage === 'done' && (
          <div className="text-center py-16">
            <div className="text-[56px] mb-4">✓</div>
            <div className="text-[20px] font-semibold mb-3">
              Consent recorded
            </div>
            <div
              className="text-[14px] leading-[1.7] max-w-md mx-auto"
              style={{ color: BRAND.inkDim }}
            >
              Thank you, {firstName}. You can now add your child and start.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConsentSections() {
  return (
    <div className="grid gap-4">
      {CONSENT_TEXT.sections.map((s, i) => (
        <div
          key={i}
          className="rounded-2xl p-5"
          style={{
            background: BRAND.surface2,
            border: `1px solid ${BRAND.inkGhost}`,
          }}
        >
          <div className="text-[13.5px] font-semibold mb-2">{s.title}</div>

          {'body' in s && s.body && (
            <div
              className="text-[13px] leading-[1.7]"
              style={{ color: BRAND.inkDim }}
            >
              {s.body}
            </div>
          )}

          {'items' in s && s.items && (
            <div className="grid gap-1.5">
              {s.items.map((item, j) => (
                <div
                  key={j}
                  className="flex items-start gap-2 text-[13px] leading-[1.65]"
                  style={{ color: BRAND.inkDim }}
                >
                  <span style={{ color: BRAND.blueBright }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      className="mt-4 rounded-xl px-4 py-3 text-[12.5px]"
      style={{
        background: 'rgba(248,113,113,0.12)',
        border: '1px solid rgba(248,113,113,0.3)',
        color: BRAND.red,
      }}
    >
      {message}
    </div>
  );
}