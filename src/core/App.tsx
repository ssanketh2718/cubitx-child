// src/core/App.tsx
import { useState } from 'react';
// ✅ FIXED PATHS: Going up one folder to get out of 'core'
import MissionRunner from '../components/MissionRunner';
import { cryptoScamMission } from '../data/missions';
import { supabase } from './lib/supabase'; // Staying inside core to find lib

export default function App() {
  const [gameState, setGameState] = useState<'lobby' | 'loading' | 'playing' | 'results'>('lobby');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const startMission = async () => {
    setGameState('loading');
    setErrorMsg('');
    
    try {
      // 1. Get the currently logged-in user (SECURITY)
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fallback for your local test if no user is logged in
      const studentId = user?.id || '857393a7-66f1-4aa7-be30-5885f17cecd1'; 

      // 2. Create a real attempt in the database.
      const { data: attemptData, error: attemptError } = await supabase
        .from('attempts')
        .insert({ student_id: studentId })
        .select('id')
        .single();

      if (attemptError) throw attemptError;

      setAttemptId(attemptData.id);
      setGameState('playing');

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to start mission.");
      setGameState('lobby');
    }
  };

  const handleMissionComplete = (result: any) => {
    setResultData(result);
    setGameState('results');
  };

  return (
    <div className="min-h-screen bg-[#05091a] text-white flex flex-col items-center justify-center p-4 font-sans">
      
      {/* LOBBY */}
      {gameState === 'lobby' && (
        <div className="max-w-md w-full bg-[#0a1228] border border-[#16244a] p-8 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="text-6xl">💸</div>
          <h1 className="text-3xl font-bold">CubitX Missions</h1>
          <p className="text-gray-400 text-sm">Tier 2: Analyst Track</p>
          
          {errorMsg && <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{errorMsg}</p>}
          
          <button 
            onClick={startMission}
            className="w-full bg-[#5b7fff] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors"
          >
            Start Crypto Scam Mission →
          </button>
        </div>
      )}

      {/* LOADING */}
      {gameState === 'loading' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#5b7fff] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm animate-pulse">Connecting securely to database...</p>
        </div>
      )}

      {/* PLAYING */}
      {gameState === 'playing' && attemptId && (
        <MissionRunner 
          mission={cryptoScamMission} 
          attemptId={attemptId} 
          onComplete={handleMissionComplete} 
        />
      )}

      {/* RESULTS */}
      {gameState === 'results' && resultData && (
        <div className="max-w-md w-full bg-[#0a1228] border border-[#16244a] p-8 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="text-6xl">🧠</div>
          <h1 className="text-2xl font-bold text-[#4ade80]">Mission Complete!</h1>
          
          {resultData.status === 'pending_review' ? (
            <p className="text-yellow-400 bg-yellow-900/20 p-4 rounded-xl">{resultData.message}</p>
          ) : (
            <div className="space-y-4 text-left">
              <p className="text-sm text-gray-400 text-center">The AI analyzed your choices:</p>
              {resultData.scores?.map((score: any, index: number) => (
                <div key={index} className="bg-[#0f1a38] p-4 rounded-xl border border-[#1e2e5c]">
                  <p className="text-[#5b7fff] font-bold text-sm uppercase">{score.skill.replace('_', ' ')}</p>
                  <p className="text-xl font-bold text-white mb-2">Score: {score.score} / 4</p>
                  <p className="text-gray-400 text-xs italic">"{score.reason}"</p>
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={() => { setGameState('lobby'); setAttemptId(null); setResultData(null); }}
            className="w-full bg-transparent border-2 border-[#5b7fff] text-[#5b7fff] font-bold py-3 rounded-xl hover:bg-[#1e2e5c] transition-colors mt-4"
          >
            Back to Lobby
          </button>
        </div>
      )}

    </div>
  );
}