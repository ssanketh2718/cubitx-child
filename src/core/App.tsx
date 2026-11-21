import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useChild } from './auth/ChildContext';
import { isDevMode } from './auth/devMode';

import DevBar from './components/DevBar';
import TopBar from './components/TopBar';

import Home from './pages/Home';
import ThinkingSheets from './pages/ThinkingSheets';
import Mission from './pages/Mission';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import AddChild from './pages/AddChild';
import ParentView from './pages/ParentView';
import TryAtHome from './pages/TryAtHome';
import WhoIsPlaying from './pages/WhoIsPlaying';
import Play from './pages/Play';
import Consent from './pages/Consent';
import TeacherDashboard from './pages/TeacherDashboard';
import DevAnalysis from './pages/DevAnalysis';
import BaselineDiscoveryMission from '../features/missions/components/BaselineDiscoveryMission';

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
      <div className="min-h-screen bg-[#F7F6F1] flex items-center justify-center text-[#142033]">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#142033] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {import.meta.env.DEV && (
          <Route path="/dev/*" element={<DevAnalysis />} />
        )}

        <Route path="/teacher" element={<TeacherDashboard />} />

        {!session ? (
          <>
            <Route path="/signin" element={<SignIn />} />
            <Route path="*" element={<Landing />} />
          </>
        ) : !dev && !hasConsent ? (
          <>
            <Route path="/consent" element={<Consent />} />
            <Route path="*" element={<Navigate to="/consent" replace />} />
          </>
        ) : kids.length === 0 ? (
          <>
            <Route path="/onboard" element={<AddChild />} />
            <Route path="*" element={<Navigate to="/onboard" replace />} />
          </>
        ) : kids.length > 1 && !activeChild ? (
          <>
            <Route path="/play-who" element={<WhoIsPlaying />} />
            <Route path="/switch" element={<WhoIsPlaying />} />
            <Route path="*" element={<Navigate to="/play-who" replace />} />
          </>
        ) : (
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
  const isImmersive =
    path.startsWith('/mission/') ||
    path.startsWith('/play/') ||
    path === '/baseline';

  return (
    <div className="min-h-screen flex flex-col relative z-10 w-full bg-[#F7F6F1]">
      {!isImmersive && <TopBar />}

      <main
        className={`flex-1 ${
          isImmersive ? 'px-0 pt-0 pb-0' : 'px-4 pt-6 pb-16'
        }`}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/sheets" element={<ThinkingSheets />} />
          <Route path="/baseline" element={<BaselineDiscoveryMission />} />
          <Route path="/mission/:id" element={<Mission />} />
          <Route path="/play/:tier/:day/:idx" element={<Play />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/parent" element={<ParentView />} />
          <Route path="/try-at-home" element={<TryAtHome />} />
          <Route path="/add-child" element={<AddChild />} />
          <Route path="/switch" element={<WhoIsPlaying />} />
          <Route path="/play-who" element={<WhoIsPlaying />} />
          <Route path="/onboard" element={<AddChild />} />
          <Route path="/consent" element={<Consent />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  );
}