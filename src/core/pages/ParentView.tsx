import { useState } from 'react';
import CognitiveDashboard from '../../components/CognitiveDashboard';
import { useApp } from '../store';
import { supabase } from '../lib/supabase'; 

export default function ParentView() {
  const [isResetting, setIsResetting] = useState(false);
  
  const streak = useApp((s) => s.getStreak());
  const days = useApp((s) => s.days);
  const totalMissionsDone = Object.values(days).reduce(
    (acc, day) => acc + day.itemsCompleted.length, 
    0
  );

  const resetData = async () => {
    if (!window.confirm("Are you sure you want to delete all progress and scores for this account?")) return;
    
    setIsResetting(true);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("You must be logged in to delete data.");
      }

      await supabase.from('scores').delete().eq('student_id', user.id);
      await supabase.from('attempts').delete().eq('student_id', user.id);
      
      useApp.getState().reset();
      localStorage.clear();
      sessionStorage.clear();
      
      window.location.href = '/home';
      
    } catch (error: any) {
      console.error("Failed to reset:", error);
      alert(error.message || "Failed to delete data. Check console.");
      setIsResetting(false);
    }
  };

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
          <button 
            onClick={resetData}
            disabled={isResetting}
            className="bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30 px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#f87171]/20 transition-all disabled:opacity-50"
          >
            {isResetting ? "Deleting Data..." : "Delete My Data"}
          </button>
        </div>

      </div>
    </div>
  );
}
