import { useEffect, useState } from 'react';
import { supabase } from '../core/lib/supabase'; 

interface Score {
  id: string;
  skill: string;
  score: number;
  evidence_quote: string;
  created_at: string;
  model_version: string;
}

export default function CognitiveDashboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCognitiveScores = async () => {
      try {
        // 🔥 FETCH THE REAL LOGGED IN USER
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("Please log in to view cognitive data.");
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('scores')
          .select('*')
          .eq('student_id', user.id) // 🔥 Use real ID
          .order('created_at', { ascending: false })
          .limit(10); 

        if (error) throw error;
        setScores(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCognitiveScores();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-[#5b7fff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a1228] border border-[#16244a] rounded-3xl p-6 shadow-xl w-full space-y-6">
      
      <div className="flex justify-between items-end border-b border-[#1e2e5c] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🧠 Cognitive Profile
          </h2>
          <p className="text-gray-400 text-sm mt-1">Deep analysis of critical thinking skills</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#5b7fff] font-bold uppercase tracking-wider">Missions Analyzed</p>
          <p className="text-2xl font-bold text-white">{scores.length}</p>
        </div>
      </div>

      {error && <p className="text-[#f87171] bg-[#f87171]/10 p-3 rounded-lg text-sm">{error}</p>}

      {scores.length === 0 && !error && (
        <p className="text-gray-400 text-center py-6">No cognitive data yet. Complete a mission to see the analysis!</p>
      )}

      <div className="space-y-4">
        {scores.map((score) => (
          <div key={score.id} className="bg-[#0f1a38] border border-[#1e2e5c] p-4 rounded-2xl flex flex-col gap-3">
            
            <div className="flex justify-between items-center">
              <h3 className="text-[#5b7fff] font-bold text-sm uppercase tracking-wider">
                {score.skill.replace(/_/g, ' ')}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                score.score >= 3 ? 'bg-[#4ade80]/20 text-[#4ade80]' : 
                score.score >= 2 ? 'bg-[#fbbf24]/20 text-[#fbbf24]' : 
                'bg-[#f87171]/20 text-[#f87171]'
              }`}>
                {score.score} / 4
              </span>
            </div>

            <div className="bg-[#05091a] p-3 rounded-xl border-l-2 border-[#5b7fff]">
              <p className="text-xs text-gray-500 font-bold mb-1 uppercase">AI Evidence</p>
              <p className="text-gray-300 text-sm italic">"{score.evidence_quote}"</p>
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Engine: {score.model_version}</span>
              <span>{new Date(score.created_at).toLocaleDateString()}</span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}