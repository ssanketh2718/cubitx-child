import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Adult Gate State for Parent Insights
  const [showGate, setShowGate] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);

  const problem = { num1: 17, num2: 4, answer: 68 };

  const handleParentTabClick = () => {
    if (currentPath === '/parent') return;

    const isUnlocked = sessionStorage.getItem('parent_gate_unlocked') === 'true';
    if (isUnlocked) {
      navigate('/parent');
    } else {
      setShowGate(true);
      setGateAnswer('');
      setGateError(false);
    }
  };

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateAnswer.trim(), 10) === problem.answer) {
      sessionStorage.setItem('parent_gate_unlocked', 'true');
      setShowGate(false);
      navigate('/parent');
    } else {
      setGateError(true);
      setGateAnswer('');
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E7E5E0] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
          
          {/* Expedition Tab */}
          <button
            type="button"
            onClick={() => navigate('/home')}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              currentPath === '/home' || currentPath.startsWith('/play')
                ? 'text-[#6D28D9]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-lg">🗺</span>
            <span className="text-[11px] font-black uppercase tracking-wider">
              Expedition
            </span>
          </button>

          {/* Parent Insights Tab */}
          <button
            type="button"
            onClick={handleParentTabClick}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              currentPath === '/parent'
                ? 'text-[#6D28D9]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-lg">🔒</span>
            <span className="text-[11px] font-black uppercase tracking-wider">
              Parent Insights
            </span>
          </button>

          {/* Profile Tab (Natural & Standard) */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              currentPath === '/profile'
                ? 'text-[#6D28D9]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-lg">👤</span>
            <span className="text-[11px] font-black uppercase tracking-wider">
              Profile
            </span>
          </button>

        </div>
      </nav>

      {/* Adult Gate Modal */}
      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl border border-[#E7E5E0] bg-white p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6D28D9] flex items-center justify-center text-xl mx-auto">
              🔒
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6D28D9]">
                Grown-ups Only
              </span>
              <h2 className="text-lg font-extrabold text-[#111827]">
                Parent Insights Verification
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Please solve this quick problem to access diagnostic records and dinner table prompts:
              </p>
            </div>

            <form onSubmit={handleVerifyGate} className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-[#FAF9F5] p-3 text-lg font-black text-slate-800">
                {problem.num1} × {problem.num2} = ?
              </div>

              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                placeholder="Enter answer"
                value={gateAnswer}
                onChange={(e) => setGateAnswer(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-center text-base font-bold text-[#111827] focus:border-[#6D28D9] focus:outline-none"
              />

              {gateError && (
                <p className="text-[11px] font-bold text-rose-600">
                  That does not match. Please try again.
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGate(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#111827] hover:bg-[#6D28D9] text-white text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Enter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}