import { useParams, useNavigate } from 'react-router-dom';

import CrackTheMachine from '../../features/missions/components/CrackTheMachine';
import DayOneMission from '../../missions/components/DayOneMission';
import BaselineDiscoveryMission from '../../features/missions/components/BaselineDiscoveryMission';

interface RouteParams {
  tier?: string;
  day?: string;
  idx?: string;
  [key: string]: string | undefined;
}

export default function Play() {
  const { tier = '1', day = '1', idx = '0' } = useParams<RouteParams>();
  const navigate = useNavigate();

  // 15-MINUTE BASELINE DISCOVERY MISSION
  if (tier === 'baseline' || day === 'baseline') {
    return <BaselineDiscoveryMission />;
  }

  // DAY 1 — ACTIVE FOR BOTH TIER 1 (CLASSES 5–7) AND TIER 2 (CLASSES 8–10)
  if ((tier === '1' || tier === '2') && day === '1') {
    if (idx === '0') {
      return <CrackTheMachine />;
    }
    if (idx === '1' || idx === '2') {
      return <DayOneMission />;
    }
  }

  // FALLBACK — OTHER DAYS
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
                Tier {tier} · Day {day}
              </p>

              <h1 className="text-base font-extrabold text-[#142033]">
                Investigation {Number(idx) + 1}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="text-xs font-bold text-[#142033] bg-[#F7F6F1] hover:bg-[#E6F4F4] px-3.5 py-2 rounded-xl border border-[#DCE2E7] transition cursor-pointer"
          >
            Back to Missions
          </button>
        </header>

        <section className="rounded-3xl border border-[#DCE2E7] bg-white p-8 text-center shadow-xs space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#087F80]">
              Active Missions Ready
            </span>

            <h2 className="text-2xl font-extrabold text-[#142033]">
              Start with the 15-Minute Baseline Discovery
            </h2>
          </div>

          <p className="text-sm text-[#586579] max-w-md mx-auto leading-relaxed">
            Explore our flagship three-act discovery mission or jump straight
            into Crack the Machine.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/baseline')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#087F80] hover:bg-[#0A9697] text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
            >
              Start 15-Min Baseline Mission →
            </button>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#DCE2E7] bg-white text-[#142033] text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
            >
              Back to Missions
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}