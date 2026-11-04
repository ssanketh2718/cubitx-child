import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function SignIn() {
  const navigate = useNavigate();
  // Ensure these match the actual function names exported from your AuthContext
  const { signInWithOtp, verifyOtp, signInWithOAuth } = useAuth(); 

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await signInWithOtp({ email });
      if (error) throw error;
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setError('');

    try {
      const { error } = await verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
      // AuthContext routing logic will automatically push them to /onboard or /home
      navigate('/onboard'); 
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const { error } = await signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F8F4', padding: '20px', fontFamily: '"DM Sans", sans-serif' }}>
      
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(17,23,43,0.05)', border: '1px solid rgba(23,26,23,0.08)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <img src="/cubitx-logo.jpg" alt="CubitX" style={{ height: '32px', margin: '0 auto 25px', display: 'block', filter: 'invert(1) grayscale(100%)', mixBlendMode: 'multiply' }} />
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 10px', color: '#11172B', fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.03em' }}>
            {step === 'email' ? 'Welcome to CubitX' : 'Check your email'}
          </h1>
          <p style={{ fontSize: '14px', color: '#626B67', margin: 0 }}>
            {step === 'email' ? 'Sign in or create an account to continue.' : `We sent a code to ${email}`}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#11172B' }}>Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '15px', backgroundColor: '#7042C8', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'background-color 0.2s' }}
            >
              {loading ? 'Sending code...' : 'Continue with Email'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="otp" style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#11172B' }}>Enter 6-digit Code</label>
              <input
                id="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '18px', letterSpacing: '4px', textAlign: 'center', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || otp.length < 6}
              style={{ width: '100%', padding: '15px', backgroundColor: '#080D20', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '15px', fontWeight: '800', cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer', opacity: (loading || otp.length < 6) ? 0.7 : 1 }}
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setStep('email')}
              style={{ background: 'none', border: 'none', color: '#7042C8', fontSize: '13px', fontWeight: '700', cursor: 'pointer', padding: '10px' }}
            >
              Change email address
            </button>
          </form>
        )}

        {step === 'email' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0', color: '#9CA3AF', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
              <span style={{ padding: '0 15px' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              style={{ width: '100%', padding: '14px', backgroundColor: '#fff', color: '#11172B', border: '1px solid #D1D5DB', borderRadius: '100px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background-color 0.2s' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}
      </div>
      
      <p style={{ marginTop: '25px', fontSize: '11px', color: '#9CA3AF', textAlign: 'center', maxWidth: '300px', lineHeight: '1.6' }}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}