
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
  const location = useLocation();

  const dev = import.meta.env.DEV && isDevMode();
  const path = location.pathname;

  // Development-only tools must never be available in production.
  if (path.startsWith('/dev')) {
    if (!import.meta.env.DEV) {
      return <Navigate to="/" replace />;
    }

    return (
      <Routes>
        <Route path="/dev/analysis" element={<DevAnalysis />} />
        <Route
          path="*"
          element={<Navigate to="/dev/analysis" replace />}
        />
      </Routes>
    );
  }

  // The teacher dashboard has its own sign-in flow.
  if (path.startsWith('/teacher')) {
    return (
      <Routes>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route
          path="*"
          element={<Navigate to="/teacher" replace />}
        />
      </Routes>
    );
  }

  if (loading) {
    return (
      <div
        className="min-h-screen"
        aria-label="Loading CubitX"
      />
    );
  }

  // Public routes for users who have not signed in.
  if (!session) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    );
  }

  // Use the parent consent state from AuthContext.
  // Do not rely on potentially stale user metadata.
  if (!dev && !hasConsent && path !== '/consent') {
    return <Navigate to="/consent" replace />;
  }

  // A signed-in parent with no children must add one.
  if (kids.length === 0 && path !== '/onboard') {
    return <Navigate to="/onboard" replace />;
  }

  // Show the child onboarding page.
  if (kids.length === 0 && path === '/onboard') {
    return (
      <>
        <Routes>
          <Route path="/onboard" element={<AddChild />} />
          <Route
            path="*"
            element={<Navigate to="/onboard" replace />}
          />
        </Routes>
        {dev && <DevBar />}
      </>
    );
  }

  // Require child selection when more than one child exists.
  if (kids.length > 1 && !activeChild && path !== '/play-who') {
    return <Navigate to="/play-who" replace />;
  }

  if (kids.length > 1 && !activeChild && path === '/play-who') {
    return (
      <>
        <Routes>
          <Route path="/play-who" element={<WhoIsPlaying />} />
          <Route
            path="*"
            element={<Navigate to="/play-who" replace />}
          />
        </Routes>
        {dev && <DevBar />}
      </>
    );
  }

  const isImmersive =
    path.startsWith('/mission/') ||
    path.startsWith('/play/');

  const isOnboard = path === '/onboard';

  return (
    <>
      <div className="min-h-screen flex flex-col relative z-10">
        {!isImmersive && !isOnboard && <TopBar />}

        <main
          className={`flex-1 ${
            isImmersive
              ? 'px-4 pt-5 pb-5'
              : 'px-4 pt-5 pb-24'
          }`}
        >
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/home" replace />}
            />
            <Route path="/home" element={<Home />} />
            <Route path="/mission/:id" element={<Mission />} />
            <Route
              path="/play/:tier/:day/:idx"
              element={<Play />}
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/parent" element={<ParentView />} />
            <Route path="/add-child" element={<AddChild />} />
            <Route path="/switch" element={<WhoIsPlaying />} />
            <Route path="/play-who" element={<WhoIsPlaying />} />
            <Route path="/onboard" element={<AddChild />} />
            <Route path="/consent" element={<Consent />} />
            <Route
              path="*"
              element={<Navigate to="/home" replace />}
            />
          </Routes>
        </main>

        {!isImmersive && <BottomNav />}
      </div>

      {dev && <DevBar />}
    </>
  );
}
