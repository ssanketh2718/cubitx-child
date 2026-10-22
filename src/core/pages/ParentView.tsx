// src/core/pages/ParentView.tsx
import { useState } from 'react';
import CognitiveDashboard from '../../components/CognitiveDashboard';
import { supabase } from '../lib/supabase';

export default function ParentView() {
  const [isResetting, setIsResetting] = useState(false);

  const resetData = async () => {
    if (!window.confirm("DEV ONLY: Are you sure you want to delete all solved missions and scores?")) return;
    
    setIsResetting(true);
    const devUserId = '857393a7-66f1-4aa7-be30-5885f17cecd1';

    try {
      // 1. Delete from Supabase Database
      await supabase.from('scores').delete().eq('student_id', devUserId);
      await supabase.from('attempts').delete().eq('student_id', devUserId);
      
      // 2. Clear all local browser storage (This fixes the green checkmarks!)
      localStorage.clear();
      sessionStorage.clear();

      // 3. Force a hard refresh to the home page
      window.location.href = '/home';
      
    } catch (error) {
      console.error("Failed to reset:", error);
      alert("Failed to reset data. Check console.");
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

        {/* WEEKLY HABITS UI */}
        <div className="bg-[#0a1228] border border-[#16244a] rounded-3xl p-6 shadow-xl space-y-5">
          <h2 className="text-xl font-bold text-white">Weekly Habits</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0f1a38] p-4 rounded-2xl border border-[#1e2e5c] text-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Streak</p>
              <p className="text-2xl font-bold text-[#fbbf24]">🔥 0 Days</p>
            </div>
            <div className="bg-[#0f1a38] p-4 rounded-2xl border border-[#1e2e5c] text-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Missions</p>
              <p className="text-2xl font-bold text-[#5b7fff]">0 Done</p>
            </div>
          </div>
        </div>

        {/* THE NEW COGNITIVE DASHBOARD */}
        <CognitiveDashboard />

        {/* DEV RESET BUTTON */}
        <div className="pt-8 pb-4 text-center">
          <button 
            onClick={resetData}
            disabled={isResetting}
            className="bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30 px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#f87171]/20 transition-all disabled:opacity-50"
          >
            {isResetting ? "Deleting Data..." : "Dev Only: Reset All Data"}
          </button>
          <p className="text-xs text-gray-500 mt-2">Wipes database and local browser cache.</p>
        </div>

      </div>
    </div>
  );
}