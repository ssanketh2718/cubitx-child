import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useChild } from './auth/ChildContext';
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
  const {
    session,
    children: kids,
    loading,
    hasConsent,
  } = useAuth();

  const { activeChild } = useChild();
  const dev = import.meta.env.DEV && isDevMode();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05091a] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Development tools */}
        {import.meta.env.DEV && (
          <Route path="/dev/*" element={<DevAnalysis />} />
        )}

        {/* Teacher dashboard */}
        <Route path="/teacher" element={<TeacherDashboard />} />

        {/* Unauthenticated Stack */}
        {!session ? (
          <>
            <Route path="/signin" element={<SignIn />} />
            <Route path="*" element={<Landing />} />
          </>
        ) : !dev && !hasConsent ? (
          /* Consent Guard */
          <>
            <Route path="/consent" element={<Consent />} />
            <Route path="*" element={<Navigate to="/consent" replace />} />
          </>
        ) : kids.length === 0 ? (
          /* Onboarding Guard (No children yet) */
          <>
            <Route path="/onboard" element={<AddChild />} />
            <Route path="*" element={<Navigate to="/onboard" replace />} />
          </>
        ) : kids.length > 1 && !activeChild ? (
          /* Multi-child Selector Guard */
          <>
            <Route path="/play-who" element={<WhoIsPlaying />} />
            <Route path="/switch" element={<WhoIsPlaying />} />
            <Route path="*" element={<Navigate to="/play-who" replace />} />
          </>
        ) : (
          /* Main Authenticated Application Layout */
          <Route path="*" element={<MainLayout />} />
        )}
      </Routes>

      {dev && <DevBar />}
    </>
  );
}

function MainLayout() {
  const location = useLocation();
  const path = location.pathname;
  const isImmersive = path.startsWith('/mission/') || path.startsWith('/play/');

  return (
    <div className="min-h-screen flex flex-col relative z-10 w-full">
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
          <Route path="/play-who" element={<WhoIsPlaying />} />
          <Route path="/onboard" element={<AddChild />} />
          <Route path="/consent" element={<Consent />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      {!isImmersive && <BottomNav />}
    </div>
  );
}