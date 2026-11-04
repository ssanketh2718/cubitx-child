import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { curriculumTierFrom } from '../../missions/tiers';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

export default function Profile() {
  const navigate = useNavigate();

  const user = useApp((s) => s.user);
  const streak = useApp((s) => s.getStreak());
  const isTrialActive = useApp((s) => s.isTrialActive);
  const getTrialDaysLeft = useApp((s) => s.getTrialDaysLeft);

  const [showSwitchModal, setShowSwitchModal] = useState(false);

  // Adult Gate State for direct access to Parent Insights from Profile
  const [showGate, setShowGate] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);

  const gateProblem = { num1: 17, num2: 4, answer: 68 };

  const handleOpenParentInsights = () => {
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
    if (parseInt(gateAnswer.trim(), 10) === gateProblem.answer) {
      sessionStorage.setItem('parent_gate_unlocked', 'true');
      setShowGate(false);
      navigate('/parent');
    } else {
      setGateError(true);
      setGateAnswer('');
    }
  };

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Explorer';
  const initialLetter = firstName.charAt(0).toUpperCase();
  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();

  const curriculumTier = user ? curriculumTierFrom(user.tier) : 1;
  const tierLabel = curriculumTier === 1 ? 'Standards 5–7' : 'Standards 8–10';

  const userData = user as Record<string, unknown> | null;
  const registeredParent = typeof userData?.parentName === 'string' ? userData.parentName : 'San S';
  const emailContact = typeof userData?.email === 'string' 
    ? userData.email 
    : typeof userData?.phone === 'string' 
    ? userData.phone 
    : 'ssanketh2718@gmail.com';

  return (
    <div className="relative -mt-6 -mx-4 min-h-screen bg-[#FAF9F5] px-4 pb-32 pt-5 text-[#111827] font-sans selection:bg-[#EDE9FE] selection:text-[#6D28D9]">
      <TopBar />

      <main className="relative z-10 mx-auto max-w-2xl space-y-6 pt-4">

        {/* ── 1. STUDENT PROFILE CARD ── */}
        <section className="rounded-[32px] border border-[#E7E5E0] bg-white p-6 sm:p-8 shadow-sm border-b-4 border-b-[#DDD9D2]">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            
            {/* Monogram Crest */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#111827] text-white shadow-md font-black text-2xl">
              {initialLetter}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px] font-black text-white">
                ✓
              </span>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-[#111827] tracking-tight">
                  {user?.name || 'Explorer'}
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#F3E8FF] text-[#6D28D9] border border-[#E9D5FF]">
                  Student Profile
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-500">
                Class {user?.grade || '6'} · {tierLabel}
              </p>

              {/* Status Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
                  <span>🔥</span> {streak} Day Streak
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-[#6D28D9] text-xs font-bold shadow-xs">
                  <span>✦</span> Tier {curriculumTier}
                </span>
                {trialActive && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                    <span>⏳</span> {trialDaysLeft} Days Trial Left
                  </span>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ── 2. ACCOUNT MANAGEMENT CARD ── */}
        <section className="rounded-3xl border border-[#E7E5E0] bg-white p-6 sm:p-7 shadow-sm border-b-4 border-b-[#DDD9D2] space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-[#111827]">
              Account Management
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Family Hub
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="font-semibold text-slate-500">Registered Parent</span>
              <span className="font-extrabold text-[#111827]">
                {registeredParent}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
              <span className="font-semibold text-slate-500">Email Contact</span>
              <span className="font-extrabold text-[#111827]">
                {emailContact}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
              <span className="font-semibold text-slate-500">Active Profiles</span>
              <span className="font-extrabold text-[#111827]">
                2 of 3 Allowed
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowSwitchModal(true)}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold transition cursor-pointer shadow-xs text-center"
            >
              Switch Student Profile
            </button>

            <button
              type="button"
              onClick={handleOpenParentInsights}
              className="w-full py-3 px-4 rounded-xl bg-[#111827] hover:bg-[#6D28D9] text-white text-xs font-extrabold transition cursor-pointer shadow-md text-center flex items-center justify-center gap-1.5"
            >
              <span>Open Parent Insights</span>
              <span>↗</span>
            </button>
          </div>
        </section>

        {/* ── 3. SAFETY & DATA INTEGRITY ── */}
        <section className="rounded-2xl border border-slate-200 bg-[#FAF9F5] p-4 text-xs font-medium text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">
            Protected Child Learning Environment
          </p>
          <p className="text-[11px] leading-relaxed text-slate-500">
            CubitX complies with DPDP Section 9 principles. We do not track location, serve advertisements, or profile behavioral traits. All exploratory and diagnostic data remains strictly purpose-limited to cognitive progress reporting.
          </p>
        </section>

      </main>

      {/* ── SWITCH STUDENT MODAL ── */}
      {showSwitchModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowSwitchModal(false)}
        >
          <div
            className="w-full max-w-sm space-y-4 rounded-3xl border border-[#E7E5E0] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111827]">
                Switch Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowSwitchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-2xl border-2 border-[#6D28D9] bg-purple-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#111827] text-white flex items-center justify-center font-bold">
                    {initialLetter}
                  </div>
                  <div>
                    <span className="block text-xs font-black text-[#111827]">
                      {user?.name || 'Explorer'}
                    </span>
                    <span className="block text-[10px] font-semibold text-[#6D28D9]">
                      Active Now · Class {user?.grade || '6'}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#6D28D9] font-black">●</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-[#FAF9F5] opacity-75">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-300 text-slate-600 flex items-center justify-center font-bold">
                    S2
                  </div>
                  <div>
                    <span className="block text-xs font-black text-[#111827]">
                      Second Explorer
                    </span>
                    <span className="block text-[10px] font-semibold text-slate-500">
                      Standard 8
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSwitchModal(false)}
                  className="text-xs font-bold text-[#6D28D9] underline cursor-pointer"
                >
                  Select
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSwitchModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── ADULT GATE MODAL ── */}
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
                {gateProblem.num1} × {gateProblem.num2} = ?
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

      <BottomNav />
    </div>
  );
}