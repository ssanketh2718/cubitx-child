import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Onboard from './pages/Onboard';
import Home from './pages/Home';
import Mission from './pages/Mission';
import Profile from './pages/Profile';
import { useApp } from './store';

export default function App() {
  const user = useApp((s) => s.user);
  const location = useLocation();
  const isOnboard = location.pathname === '/' || location.pathname === '/onboard';

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Onboard />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {!isOnboard && <TopBar />}
      <main className="flex-1 px-4 pt-5 pb-24">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/mission/:id" element={<Mission />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
