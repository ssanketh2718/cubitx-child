import CognitiveDashboard from '../../components/CognitiveDashboard';
import { useApp } from '../store';

export default function ParentView() {
  const streak = useApp((s) => s.getStreak());
  const days = useApp((s) => s.days);

  const totalMissionsDone = Object.values(days).reduce(
    (acc, day) => acc + day.itemsCompleted.length, 
    0
  );


  return (
    <div className="min-h-screen bg-[#05091a] text-white p-4 font-sans">
      <div className="max-w-md mx-auto space-y-6 pt-4 pb-24">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Parent Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Track habits and cognitive growth.</p>
        </div>

        <div className="bg-[#0a1228] border border-[#16244a] rounded-3xl p-6 shadow-xl space-y-5">
          <h2 className="text-xl font-bold text-white">Weekly Habits</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0f1a38] p-4 rounded-2xl border border-[#1e2e5c] text-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Streak</p>
              <p className="text-2xl font-bold text-[#fbbf24]">🔥 {streak} Days</p>
            </div>
            <div className="bg-[#0f1a38] p-4 rounded-2xl border border-[#1e2e5c] text-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Missions</p>
              <p className="text-2xl font-bold text-[#5b7fff]">{totalMissionsDone} Done</p>
            </div>
          </div>
        </div>

        <CognitiveDashboard />

        <div className="pt-8 pb-4 text-center">
          <p className="mb-3 text-xs leading-5 text-gray-500">
            Complete account and child-data deletion is not yet safely connected to the database.
          </p>
          <a
            href="mailto:hello@cubitx.in?subject=CubitX%20data%20deletion%20request"
            className="inline-flex rounded-xl border border-[#f87171]/30 bg-[#f87171]/10 px-6 py-3 text-sm font-bold text-[#f87171] transition-all hover:bg-[#f87171]/20"
          >
            Request data deletion
          </a>
        </div>

      </div>
    </div>
  );
}