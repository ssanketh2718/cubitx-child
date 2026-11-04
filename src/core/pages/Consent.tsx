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

type Stage = 'form' | 'saving' | 'done';

export default function Consent() {
  const navigate = useNavigate();
  const { user, signOut, refreshParent } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [stage, setStage] = useState<Stage>('form');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const parentEmail = user.email || 'authenticated email';

  const canSave =
    firstName.trim().length >= 2 &&
    surname.trim().length >= 1 &&
    agreed;

  const handleSaveConsent = async () => {
    if (saving) return;

    setError('');
    setSaving(true);
    setStage('saving');

    try {
      const consentedAt = new Date().toISOString();
      const meta = getClientMeta();

      const auditHash = await hashConsent({
        parentId: user.id,
        version: CONSENT_VERSION,
        consentedAt,
        mobileLast4: 'EMAIL',
      });

      const { error: updateErr } = await supabase
        .from('parents')
        .update({
          first_name: firstName.trim(),
          surname: surname.trim(),
          email: parentEmail,
          consent_given: true,
          consent_version: CONSENT_VERSION,
          consented_at: consentedAt,
          consent_method: 'email_verified',
          consent_ip: meta.ip,
          consent_user_agent: meta.userAgent,
        })
        .eq('id', user.id);

      if (updateErr) {
        console.error('Supabase parent update error:', updateErr);
        setStage('form');
        setError(`Could not save your consent: ${updateErr.message}`);
        setSaving(false);
        return;
      }

      const { error: logErr } = await supabase.from('consent_log').insert({
        parent_id: user.id,
        event: 'given',
        version: CONSENT_VERSION,
        method: 'email_verified',
        ip: meta.ip,
        user_agent: meta.userAgent,
        hash: auditHash,
      });

      if (logErr) {
        console.error('Consent audit log error:', logErr);
        setStage('form');
        setError(
          'Your details were updated, but the consent audit record failed. Please contact support before continuing.'
        );
        setSaving(false);
        return;
      }

      const { error: metadataErr } = await supabase.auth.updateUser({
        data: { consent_given: true },
      });

      if (metadataErr) {
        console.error('Consent saved, but Auth metadata update failed.');
      }

      await refreshParent();

      setStage('done');
      window.setTimeout(() => navigate('/onboard', { replace: true }), 1200);
    } catch (err: any) {
      console.error('Consent flow exception:', err);
      setStage('form');
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05091a] text-white px-4 py-10 font-sans flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto space-y-6">
        <header className="text-center sm:text-left">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#9aaaff] mb-2">
            {CONSENT_TEXT.heading}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {CONSENT_TEXT.intro}
          </h1>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">
            This takes a minute. We want you to know exactly what CubitX collects about your child — before you say yes.
          </p>
        </header>

        {stage === 'form' && (
          <div className="space-y-4">
            <ConsentSections />

            <div className="rounded-3xl border border-[#16244a] bg-[#0a1228] p-6 shadow-2xl sm:p-8 space-y-5">
              <h2 className="text-lg font-bold text-white">Your verified account details</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first-name" className="mb-2 block text-sm font-semibold text-gray-300">
                    First name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Aarti"
                    autoComplete="given-name"
                    required
                    className="w-full rounded-xl border border-[#1e2e5c] bg-[#0f1a38] px-4 py-3 text-white outline-none focus:border-[#7b8dff]"
                  />
                </div>

                <div>
                  <label htmlFor="surname" className="mb-2 block text-sm font-semibold text-gray-300">
                    Surname
                  </label>
                  <input
                    id="surname"
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Sharma"
                    autoComplete="family-name"
                    required
                    className="w-full rounded-xl border border-[#1e2e5c] bg-[#0f1a38] px-4 py-3 text-white outline-none focus:border-[#7b8dff]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Parent Email (Authenticated)
                </label>
                <div className="w-full rounded-xl border border-[#1e2e5c] bg-[#0f1a38]/50 px-4 py-3 text-[#9aaaff] text-sm">
                  {parentEmail}
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Verified securely via your sign-in method.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none pt-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#1e2e5c] bg-[#0f1a38] accent-[#7b8dff]"
                />
                <div className="text-xs text-gray-300 space-y-1.5 leading-relaxed">
                  {CONSENT_TEXT.confirmation.map((line, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-[#7b8dff]">•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </label>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              onClick={handleSaveConsent}
              disabled={!canSave || saving}
              className="w-full rounded-xl bg-[#7b8dff] px-4 py-4 font-bold text-[#05091a] transition hover:bg-[#9aaaff] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {saving ? 'Recording consent…' : 'I agree and give consent'}
            </button>

            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="block w-full text-center text-xs text-gray-500 hover:text-gray-400 pt-2"
            >
              ← Not now, sign out
            </button>
          </div>
        )}

        {stage === 'saving' && (
          <div className="rounded-3xl border border-[#16244a] bg-[#0a1228] p-12 text-center space-y-3 shadow-2xl">
            <div className="text-3xl animate-pulse">🔒</div>
            <div className="text-lg font-bold">Saving your consent…</div>
            <p className="text-sm text-gray-400">This is recorded permanently with a cryptographic audit trail.</p>
          </div>
        )}

        {stage === 'done' && (
          <div className="rounded-3xl border border-[#16244a] bg-[#0a1228] p-12 text-center space-y-3 shadow-2xl">
            <div className="text-4xl text-[#34d399]">✓</div>
            <div className="text-xl font-bold">Consent recorded</div>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Thank you, {firstName}. You can now add your child and start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConsentSections() {
  return (
    <div className="space-y-4">
      {CONSENT_TEXT.sections.map((s, i) => (
        <div key={i} className="rounded-3xl border border-[#16244a] bg-[#0a1228] p-6 space-y-2 shadow-xl">
          <h3 className="text-sm font-bold text-white">{s.title}</h3>

          {'body' in s && s.body && (
            <p className="text-xs text-gray-400 leading-relaxed">{s.body}</p>
          )}

          {'items' in s && s.items && (
            <div className="space-y-1.5 pt-1">
              {s.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed">
                  <span className="text-[#7b8dff]">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="rounded-3xl border border-[#16244a] bg-[#0a1228] p-6 flex items-center justify-between shadow-xl">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Data Protection Officer</h4>
          <p className="text-xs text-[#9aaaff] mt-0.5">hello@cubitx.in</p>
        </div>
        <div className="text-xl">🛡️</div>
      </div>
    </div>
  );
}