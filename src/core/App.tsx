import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useChild } from './auth/ChildContext';
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

export default function App() {
  const { session, children: kids, loading } = useAuth();
  const { activeChild } = useChild();
  const location = useLocation();

  const isMission = location.pathname.startsWith('/mission/');
  const isOnboard = location.pathname === '/onboard';

  if (loading) {
    return <div style={{ background: '#05091a', minHeight: '100vh' }} />;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (kids.length === 0) {
    return (
      <>
        <Routes>
          <Route path="/onboard" element={<AddChild />} />
          <Route path="*" element={<Navigate to="/onboard" replace />} />
        </Routes>
        <DevBar />
      </>
    );
  }

  if (kids.length > 1 && !activeChild) {
    return (
      <>
        <Routes>
          <Route path="/play" element={<WhoIsPlaying />} />
          <Route path="*" element={<Navigate to="/play" replace />} />
        </Routes>
        <DevBar />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col relative z-10">
        {!isMission && !isOnboard && <TopBar />}
        <main className={`flex-1 ${isMission ? 'px-4 pt-5 pb-5' : 'px-4 pt-5 pb-24'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/mission/:id" element={<Mission />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/parent" element={<ParentView />} />
            <Route path="/add-child" element={<AddChild />} />
            <Route path="/switch" element={<WhoIsPlaying />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
        {!isMission && <BottomNav />}
      </div>
      <DevBar />
    </>
  );
}