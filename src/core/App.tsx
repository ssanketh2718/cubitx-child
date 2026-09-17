import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Onboard from './pages/Onboard';
import Home from './pages/Home';
import Mission from './pages/Mission';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import ParentView from './pages/ParentView';
import { useApp } from './store';

export default function App() {
  const user = useApp((s) => s.user);
  const location = useLocation();

  const isMission = location.pathname.startsWith('/mission/');
  const isOnboard = location.pathname === '/onboard';

  // No user → show Landing, Onboard, or redirect
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/onboard" element={<Onboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Logged-in user
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {!isMission && !isOnboard && <TopBar />}
      <main className={`flex-1 ${isMission ? 'px-4 pt-5 pb-5' : 'px-4 pt-5 pb-24'}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/mission/:id" element={<Mission />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/parent" element={<ParentView />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      {!isMission && <BottomNav />}
    </div>
  );
}