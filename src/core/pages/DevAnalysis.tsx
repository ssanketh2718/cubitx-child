import { useState } from 'react';
import { supabase } from '../lib/supabase'; 

export default function DevAnalysis() {
  const [question, setQuestion] = useState('What describes you as a person?');
  const [keywords, setKeywords] = useState('kind, helpful, beautiful');
  const [answer, setAnswer] = useState('I am kind hearted. Helps other people a lot.');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!keywords) return alert("Enter at least one scene keyword");
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('score-mission', {
        body: {
          attempt_id: 'test-attempt-uuid-1234',
          answers: { text: answer },
          mission_context: { question, keywords }
        }
      });

      if (error) throw error;
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setResult({ 
        status: 'pending_review', 
        message: 'Feedback coming soon. System encountered an error.',
        scores: [] 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05091a] text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-400">CubitX v8.0 Cognitive Engine</h1>
        
        <div className="bg-[#0a1228] p-6 rounded-lg border border-[#16244a] space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Question</label>
            <input value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-[#0f1a38] p-3 rounded border border-[#1e2e5c] outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Scene keywords</label>
            <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full bg-[#0f1a38] p-3 rounded border border-[#1e2e5c] outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Child's answer</label>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full bg-[#0f1a38] p-3 rounded border border-[#1e2e5c] outline-none focus:border-blue-500 h-32" />
          </div>
          <button onClick={handleAnalyze} disabled={loading} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
            {loading ? 'Analyzing with Gemini...' : 'Analyze →'}
          </button>
        </div>

        {result && (
          <div className="bg-[#0a1228] p-6 rounded-lg border border-[#16244a]">
            <h2 className="text-sm text-blue-300 font-bold tracking-wider mb-4">COMPOSITE SCORE</h2>
            {result.status === 'pending_review' ? (
               <p className="text-yellow-400">{result.message}</p>
            ) : (
              <div className="space-y-4">
                <div className="text-5xl font-bold text-white">
                  {/* Math: Assuming 1 skill is tested, score is 0-4. Max = 4. 4*25 = 100 */}
                  {result.scores?.[0]?.score !== undefined ? `${result.scores[0].score * 25} / 100` : 'Pending'}
                </div>
                {/* Show the AI's evidence quote */}
                <div className="bg-[#0f1a38] p-4 rounded border border-[#1e2e5c]">
                    <p className="text-sm text-gray-400">AI Evidence Quote:</p>
                    <p className="text-white italic">"{result.scores?.[0]?.evidence_quote}"</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
