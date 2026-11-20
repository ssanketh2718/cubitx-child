import { useParams, useNavigate } from 'react-router-dom';

import CrackTheMachine from '../../features/missions/components/CrackTheMachine';
import DayOneMission from '../../features/missions/components/DayOneMission';

interface RouteParams {
  tier?: string;
  day?: string;
  idx?: string;
  [key: string]: string | undefined;
}

export default function Play() {
  const { tier = '1', day = '1', idx = '0' } =
    useParams<RouteParams>();

  const navigate = useNavigate();

  // DAY 1 — MISSION 1: CRACK THE MACHINE
  if (tier === '1' && day === '1' && idx === '0') {
    return <CrackTheMachine />;
  }

  // DAY 1 — MISSION 2: THE CASE OF THE MISSING SHADOW
  if (tier === '1' && day === '1' && idx === '1') {
    return <DayOneMission />;
  }

  // DAY 1 — MISSION 3: BUILD THE IMPOSSIBLE BRIDGE
  if (tier === '1' && day === '1' && idx === '2') {
    return <DayOneMission />;
  }

  // FALLBACK — OTHER DAYS AND MISSIONS
  return (
    <main className="min-h-screen bg-[#FAF9F5] px-4 pt-6 pb-24 text-[#111827] font-sans selection:bg-[#EDE9FE] selection:text-[#6D28D9]">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* NAVIGATION BAR */}
        <header className="flex items-center justify-between bg-white border border-[#E7E5E0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition cursor-pointer"
              title="Return to Home"
              aria-label="Return to Home"
            >
              ←
            </button>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6D28D9]">
                Tier {tier} · Day {day}
              </p>

              <h1 className="text-base font-extrabold text-[#111827]">
                Mission {Number(idx) + 1}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            Horizon Map
          </button>
        </header>

        {/* MISSION CONTAINER */}
        <section className="rounded-[32px] border border-[#E7E5E0] border-b-4 border-b-[#DDD9D2] bg-white p-8 text-center shadow-sm space-y-4">

          <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 text-[#6D28D9] flex items-center justify-center text-3xl mx-auto shadow-sm">
            ✦
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6D28D9]">
              Upcoming Sector
            </span>

            <h2 className="text-2xl font-extrabold text-[#111827]">
              Day {day} · Investigation {Number(idx) + 1}
            </h2>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
            This sector is currently being prepared for your expedition.
            You can explore the active reference missions on Day 1.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">

            <button
              type="button"
              onClick={() => navigate('/play/1/1/0')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#111827] hover:bg-[#6D28D9] text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-md"
            >
              Play Crack the Machine (Day 1) →
            </button>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
            >
              Back to Home Map
            </button>

          </div>
        </section>
      </div>
    </main>
  );
}