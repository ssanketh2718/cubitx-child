import { useParams, useNavigate } from 'react-router-dom';
import BaselineDiscoveryMission from '../../features/missions/components/BaselineDiscoveryMission';

interface RouteParams {
  tier?: string;
  day?: string;
  idx?: string;
  [key: string]: string | undefined;
}

export default function Play() {
  const { tier = '1', day = '1' } = useParams<RouteParams>();
  const navigate = useNavigate();

  // DAY 1 & BASELINE — Renders the 5-mission single-frame console
  if (tier === 'baseline' || day === 'baseline' || day === '1') {
    return <BaselineDiscoveryMission />;
  }

  // FUTURE DAYS (Day 2..365) — Falls back cleanly until authored
  return (
    <main className="min-h-screen bg-[#F7F6F1] px-4 pt-6 pb-24 text-[#142033] font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-white border border-[#DCE2E7] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="w-9 h-9 rounded-xl bg-[#F7F6F1] hover:bg-[#E6F4F4] flex items-center justify-center text-[#142033] font-bold transition cursor-pointer"
              title="Return to Missions"
              aria-label="Return to Missions"
            >
              ←
            </button>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#087F80]">
                Day {day}
              </p>

              <h1 className="text-base font-extrabold text-[#142033]">
                Thinking Missions
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="text-xs font-bold text-[#142033] bg-[#F7F6F1] hover:bg-[#E6F4F4] px-3.5 py-2 rounded-xl border border-[#DCE2E7] transition cursor-pointer"
          >
            Back to Home
          </button>
        </header>

        <section className="rounded-3xl border border-[#DCE2E7] bg-white p-8 text-center shadow-xs space-y-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#087F80]">
            Day 1 Ready
          </span>

          <h2 className="text-2xl font-extrabold text-[#142033]">
            Complete Day 1 Detective Lab First
          </h2>

          <p className="text-sm text-[#586579] max-w-md mx-auto leading-relaxed">
            Your Day 1 missions (The Missing Tiffin, The Wet Shoes, and more)
            are ready to play.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/baseline')}
              className="px-6 py-3.5 rounded-full bg-[#142033] hover:bg-[#087F80] text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
            >
              Start Day 1 Missions →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}