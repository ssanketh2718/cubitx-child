import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useApp } from './store';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useAuth } from './auth/AuthContext';
import { isDevMode } from './auth/devMode';
import DevBar from './components/DevBar';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Mission from './pages/Mission';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import AddChild from './pages/AddChild';
import ParentView from './pages/ParentView';
import WhoIsPlaying from './pages/WhoIsPlaying';
import Play from './pages/Play';
import Consent from './pages/Consent';
import TeacherDashboard from './pages/TeacherDashboard';
import DevAnalysis from './pages/DevAnalysis';

export default function App() {
  const { session, loading: authLoading } = useAuth();
  const location = useLocation();
  const dev = isDevMode();
  
  // Use the Zustand user instead of 'kids' to prevent undefined crashes
  const user = useApp((s) => s.user); 
  const setSupabaseId = useApp((s) => s.setSupabaseId);

  const [authInitialized, setAuthInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for URL hash errors
    if (window.location.hash.includes('error=')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const description = params.get('error_description') || 'Magic link is invalid or expired.';
      setAuthError(description.replace(/\+/g, ' '));
      window.history.replaceState(null, '', window.location.pathname);
    }

    // 2. Establish auth session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) setSupabaseId(session.user.id);
      } catch (err: any) {
        console.warn("Auth initialization warning:", err.message);
      } finally {
        setAuthInitialized(true);
      }
    };

    initAuth();

    // 3. Only reset on explicit SIGNED_OUT to prevent loop crashes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        useApp.getState().reset();
      } else if (session?.user) {
        setSupabaseId(session.user.id);
      }
      setAuthInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [setSupabaseId]);

  if (authError) {
    return (
      <div className="min-h-screen bg-[#05091a] text-white flex items-center justify-center p-6">
        <div className="bg-[#0f1a38] border border-amber-500/30 p-6 rounded-2xl max-w-sm text-center space-y-4">
          <p className="text-amber-400 font-bold">Authentication Error</p>
          <p className="text-sm text-gray-300">{authError}</p>
          <a href="/signin" className="inline-block bg-[#5b7fff] text-white px-5 py-2.5 rounded-xl font-semibold text-sm">Request New Link</a>
        </div>
      </div>
    );
  }

  if (authLoading || !authInitialized) {
    return (
      <div className="min-h-screen bg-[#05091a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#5b7fff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Dev routes
  if (location.pathname.startsWith('/dev/')) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/dev/analysis" element={<DevAnalysis />} />
          <Route path="*" element={<Navigate to="/dev/analysis" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  // Teacher route
  if (location.pathname.startsWith('/teacher')) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="*" element={<Navigate to="/teacher" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  const isImmersive = location.pathname.startsWith('/mission/') || location.pathname.startsWith('/play/') || location.pathname === '/consent';
  const isOnboard = location.pathname === '/onboard' || location.pathname === '/add-child';

  if (!session) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  const consentGiven = dev || !!(session.user.user_metadata as any)?.consent_given;

  if (!consentGiven && location.pathname !== '/consent') {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/consent" element={<Consent />} />
          <Route path="*" element={<Navigate to="/consent" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  // Infinite Loop Protection using 'user' instead of 'kids'
  if (!user && !isOnboard) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="*" element={<Navigate to="/onboard" replace />} />
        </Routes>
        <DevBar />
      </ErrorBoundary>
    );
  }

  if (isOnboard) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/onboard" element={<AddChild />} />
          <Route path="/add-child" element={<AddChild />} />
          <Route path="*" element={<Navigate to="/onboard" replace />} />
        </Routes>
        <DevBar />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col relative z-10">
        {!isImmersive && <TopBar />}
        <main className={`flex-1 ${isImmersive ? 'px-4 pt-5 pb-5' : 'px-4 pt-5 pb-24'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/mission/:id" element={<Mission />} />
            <Route path="/play/:tier/:day/:idx" element={<Play />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/parent" element={<ParentView />} />
            <Route path="/add-child" element={<AddChild />} />
            <Route path="/switch" element={<WhoIsPlaying />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
        {!isImmersive && <BottomNav />}
      </div>
      <DevBar />
    </ErrorBoundary>
  );
}