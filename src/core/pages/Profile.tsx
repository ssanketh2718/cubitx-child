import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { useAuth } from '../auth/AuthContext';
import { curriculumTierFrom } from '../../missions/tiers';
import { analyzeThinking } from '../../features/parent-insights/thinkingAnalysis';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';

export default function Profile() {
  const navigate = useNavigate();
  const { parent, children: kids, signOut } = useAuth();

  const user = useApp((s) => s.user);
  const sessions = useApp((s) => s.sessions);
  const responses = useApp((s) => s.responses);
  const isTrialActive = useApp((s) => s.isTrialActive);
  const getTrialDaysLeft = useApp((s) => s.getTrialDaysLeft);

  const [showGate, setShowGate] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);

  const gateProblem = { num1: 17, num2: 4, answer: 68 };

  const handleOpenParentInsights = () => {
    triggerDialTick(true);
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
      triggerSoftConfirm(true);
      sessionStorage.setItem('parent_gate_unlocked', 'true');
      setShowGate(false);
      navigate('/parent');
    } else {
      triggerDialTick(false);
      setGateError(true);
      setGateAnswer('');
    }
  };

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Explorer';
  const initialLetter = firstName.charAt(0).toUpperCase();
  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();

  const curriculumTier = user ? curriculumTierFrom(user.tier) : 1;
  const tierLabel = curriculumTier === 1 ? 'Classes 5–7' : 'Classes 8–10';

  const registeredParent =
    parent?.name?.trim() ||
    [parent?.first_name, parent?.surname].filter(Boolean).join(' ') ||
    'Parent Account';
  const emailContact = parent?.email || 'Linked via account';

  const { studentSummary } = useMemo(
    () => analyzeThinking(sessions, responses, firstName),
    [sessions, responses, firstName]
  );

  return (
    <div className="min-h-screen bg-[#F7F6F1] pb-28 pt-2 text-[#142033] font-sans">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* STUDENT PROFILE CARD */}
        <section className="rounded-3xl border border-[#142033]/12 bg-white p-6 sm:p-8 shadow-[var(--shadow-artifact)]">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#142033] text-[#55E2CE] font-display font-extrabold text-2xl">
              {initialLetter}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#087F80] text-[10px] font-black text-white">
                ✓
              </span>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display text-2xl font-extrabold text-[#142033] tracking-tight">
                  {user?.name || 'Explorer'}
                </h1>
                <span className="font-mono-tech text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#087F80]/10 text-[#087F80]">
                  Student Profile
                </span>
              </div>

              <p className="text-xs font-semibold text-[#586579]">
                Class {user?.grade || '6'} · {tierLabel}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F7F6F1] border border-[#142033]/12 text-[#142033] text-xs font-bold tabular-nums">
                  {studentSummary.uniqueMissions} Missions Explored
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F7F6F1] border border-[#142033]/12 text-[#142033] text-xs font-bold tabular-nums">
                  {studentSummary.activeDays} Active Days
                </span>
                {trialActive && trialDaysLeft !== null && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FEF6E4] border border-[#F5B942]/50 text-[#8A5A00] text-xs font-bold tabular-nums">
                    {trialDaysLeft} Days Trial Left
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* STUDENT THINKING SUMMARY */}
        <section className="rounded-3xl border border-[#142033]/12 bg-white p-6 sm:p-7 shadow-[var(--shadow-artifact)] space-y-4">
          <div>
            <p className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
              Your Thinking Breakdown
            </p>
            <h2 className="mt-1 font-display text-lg font-extrabold text-[#142033]">
              How You’ve Been Investigating
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl border border-[#142033]/12 bg-[#F7F6F1] p-3.5">
              <p className="text-[10px] font-bold uppercase text-[#586579]">
                Clue Checks
              </p>
              <p className="mt-1 font-display text-xl font-extrabold tabular-nums text-[#142033]">
                {studentSummary.totalChecksTried}
              </p>
            </div>
            <div className="rounded-2xl border border-[#142033]/12 bg-[#F7F6F1] p-3.5">
              <p className="text-[10px] font-bold uppercase text-[#586579]">
                Re-Checks
              </p>
              <p className="mt-1 font-display text-xl font-extrabold tabular-nums text-[#087F80]">
                {studentSummary.recheckMoments}
              </p>
            </div>
            <div className="rounded-2xl border border-[#142033]/12 bg-[#F7F6F1] p-3.5">
              <p className="text-[10px] font-bold uppercase text-[#586579]">
                Written Notes
              </p>
              <p className="mt-1 font-display text-xl font-extrabold tabular-nums text-[#142033]">
                {studentSummary.writtenReflections}
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm leading-6 text-[#142033]">
            {studentSummary.highlights.map((line) => (
              <li
                key={line}
                className="rounded-xl border border-[#142033]/10 bg-[#F7F6F1]/70 px-3.5 py-2.5"
              >
                {line}
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-[#F5B942]/45 bg-[#FFFDF7] p-4">
            <p className="font-mono-tech text-[10px] font-bold uppercase tracking-wider text-[#8A5A00]">
              Next Step to Try
            </p>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-[#142033]">
              {studentSummary.nextStepTip}
            </p>
          </div>
        </section>

        {/* ACCOUNT & FAMILY HUB */}
        <section className="rounded-3xl border border-[#142033]/12 bg-white p-6 sm:p-7 shadow-[var(--shadow-artifact)] space-y-5">
          <div className="flex items-center justify-between cx-hairline-b pb-3">
            <h2 className="font-display text-base font-extrabold text-[#142033]">
              Family & Account
            </h2>
            <span className="font-mono-tech text-[10px] font-bold text-[#586579] uppercase tracking-wider">
              {kids.length} of 3 Profiles
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="font-semibold text-[#586579]">
                Registered Parent
              </span>
              <span className="font-extrabold text-[#142033]">
                {registeredParent}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 cx-hairline-t pt-3">
              <span className="font-semibold text-[#586579]">Account Email</span>
              <span className="font-extrabold text-[#142033]">
                {emailContact}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            {kids.length > 1 && (
              <button
                type="button"
                onClick={() => navigate('/switch')}
                className="w-full py-3 px-4 rounded-full border border-[#142033]/15 bg-white hover:bg-[#F7F6F1] text-[#142033] text-xs font-extrabold transition cursor-pointer text-center"
              >
                Switch Child
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenParentInsights}
              className="cx-action-pill w-full py-3 px-4 bg-[#142033] hover:bg-[#087F80] text-white text-xs cursor-pointer text-center"
            >
              Parent View →
            </button>

            <button
              type="button"
              onClick={() => void signOut()}
              className="w-full py-3 px-4 rounded-full border border-[#142033]/12 bg-[#F7F6F1] hover:bg-white text-[#586579] hover:text-[#142033] text-xs font-bold transition cursor-pointer text-center"
            >
              Sign Out
            </button>
          </div>
        </section>
      </div>

      {/* ADULT GATE MODAL */}
      {showGate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#142033]/65 backdrop-blur-md p-4"
          onClick={() => setShowGate(false)}
        >
          <div
            className="w-full max-w-sm rounded-[28px] border border-[#142033]/15 bg-[#F7F6F1] p-7 shadow-2xl space-y-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <span className="inline-block rounded-full bg-[#087F80]/10 px-3 py-1 font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#087F80]">
                GROWN-UPS ONLY
              </span>
              <h2 className="font-display text-2xl font-extrabold text-[#142033]">
                Parent Check
              </h2>
              <p className="text-xs text-[#586579] leading-relaxed">
                Solve this quick question to open Parent View:
              </p>
            </div>

            <form onSubmit={handleVerifyGate} className="space-y-3.5">
              <div className="rounded-2xl border border-[#142033]/12 bg-white p-4 font-mono-tech text-2xl font-bold tabular-nums text-[#142033]">
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
                className="w-full rounded-2xl border border-[#142033]/20 bg-white p-3 text-center font-mono-tech text-base font-bold text-[#142033] focus:border-[#087F80] focus:outline-none"
              />

              {gateError && (
                <p className="text-xs font-bold text-[#9E3324]">
                  That doesn’t match — try again.
                </p>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGate(false)}
                  className="flex-1 py-3 rounded-full border border-[#142033]/15 bg-white text-[#142033] text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-[#142033] hover:bg-[#087F80] text-white text-xs font-extrabold cursor-pointer"
                >
                  Unlock →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}