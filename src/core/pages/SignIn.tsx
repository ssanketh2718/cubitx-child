import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { enableDevMode } from '../auth/devMode';

const BRAND = {
  surface: '#05091a',
  surface2: '#0a1228',
  blue: '#7b8dff',
  blueBright: '#9aaaff',
  ink: '#ffffff',
  inkDim: 'rgba(255,255,255,0.62)',
  inkFaint: 'rgba(255,255,255,0.38)',
  inkGhost: 'rgba(255,255,255,0.14)',
};

export default function SignIn() {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmail = async () => {
    if (!email.includes('@')) return;
    setStatus('sending');
    const { error } = await signInWithEmail(email);
    if (error) {
      setErrorMsg(error);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  };

  const handleSkip = () => {
    enableDevMode();
    window.location.href = '/';
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5"
      style={{ background: BRAND.surface, color: BRAND.ink, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div
        className="w-full max-w-md rounded-[1.75rem] p-8 md:p-10"
        style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
      >
        <img src="/cubitx-logo.jpg" alt="CubitX" className="mx-auto h-10 w-auto" />

        {status === 'sent' ? (
          <div className="mt-8 text-center">
            <div className="text-[48px]">📬</div>
            <h1 className="mt-4 text-[22px] font-semibold">Check your email</h1>
            <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: BRAND.inkDim }}>
              We sent a sign-in link to <span style={{ color: BRAND.ink }}>{email}</span>.
              Tap it to continue.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-6 text-[13px] font-semibold"
              style={{ color: BRAND.blueBright }}
            >
              ← Use a different email
            </button>
          </div>
        ) : (
          <>
            <h1 className="mt-7 text-center text-[22px] font-semibold">Start your 30 days free</h1>
            <p className="mt-2 text-center text-[13px]" style={{ color: BRAND.inkDim }}>
              No card required
            </p>

            <button
              onClick={signInWithGoogle}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-full py-3.5 text-[14px] font-semibold transition hover:-translate-y-0.5"
              style={{ background: BRAND.ink, color: BRAND.surface }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1" style={{ background: BRAND.inkGhost }} />
              <span className="text-[11px]" style={{ color: BRAND.inkFaint }}>or</span>
              <div className="h-px flex-1" style={{ background: BRAND.inkGhost }} />
            </div>

            <div>
              <label className="text-[12px] font-semibold" style={{ color: BRAND.inkDim }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={status === 'sending'}
                className="mt-2 w-full rounded-xl px-4 py-3.5 text-[14px] outline-none"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: `1px solid ${BRAND.inkGhost}`,
                  color: BRAND.ink,
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleEmail()}
              />
            </div>

            {status === 'error' && (
              <div
                className="mt-3 rounded-xl px-4 py-3 text-[12.5px]"
                style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}
              >
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleEmail}
              disabled={!email.includes('@') || status === 'sending'}
              className="mt-6 w-full rounded-full py-3.5 text-[14px] font-bold transition disabled:opacity-40"
              style={{ background: BRAND.blue, color: BRAND.surface }}
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>

            <p className="mt-5 text-center text-[11px] leading-[1.6]" style={{ color: BRAND.inkFaint }}>
              By continuing you agree to our terms and privacy policy.
            </p>
          </>
        )}

        {/* Dev bypass */}
        <div className="mt-8 border-t pt-5" style={{ borderColor: BRAND.inkGhost }}>
          <button
            onClick={handleSkip}
            className="w-full text-center text-[12px] transition hover:text-white"
            style={{ color: BRAND.inkFaint }}
          >
            🧪 Skip sign-in (dev testing only)
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-4 block w-full text-center text-[12px]"
          style={{ color: BRAND.inkFaint }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
