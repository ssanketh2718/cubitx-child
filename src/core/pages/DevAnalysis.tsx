import { useState } from 'react';
import MissionRunner from '../../components/MissionRunner';
import { cryptoScamMission } from '../../data/missions';

export default function DevAnalysis() {
  const [gameState, setGameState] = useState<'lobby' | 'loading' | 'playing' | 'results'>('lobby');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const startMission = async () => {
    setGameState('loading');
    setErrorMsg('');

    // Development preview is local-only: never create a database attempt or
    // use a hard-coded user UUID from a browser session.
    try {
      const localAttemptId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `local-${Date.now()}`;
      setAttemptId(localAttemptId);
      setGameState('playing');
    } catch {
      setErrorMsg('Could not start the local preview. Please try again.');
      setGameState('lobby');
    }
  };

  const handleMissionComplete = (result: any) => {
    setResultData(result);
    setGameState('results');
  };

  return (
    <div className="min-h-screen bg-[#05091a] text-white flex flex-col items-center justify-center p-4 font-sans">

      {gameState === 'lobby' && (
        <div className="max-w-md w-full bg-[#0a1228] border border-[#16244a] p-8 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="text-6xl">💸</div>
          <h1 className="text-3xl font-bold">Dev Analysis Room</h1>
          <p className="text-gray-400 text-sm">Secure AI Mission Test</p>

          {errorMsg && <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{errorMsg}</p>}

          <button 
            onClick={startMission}
            className="w-full bg-[#5b7fff] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors"
          >
            Start Crypto Scam Mission →
          </button>
        </div>
      )}

      {gameState === 'loading' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#5b7fff] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm animate-pulse">Connecting securely...</p>
        </div>
      )}

      {gameState === 'playing' && attemptId && (
        <MissionRunner 
          mission={cryptoScamMission} 
          attemptId={attemptId} 
          onComplete={handleMissionComplete} 
          isDev={true}
        />
      )}

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
            Back to Dev Lobby
          </button>
        </div>
      )}

    </div>
  );
}