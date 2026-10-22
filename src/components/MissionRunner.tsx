// src/components/MissionRunner.tsx
import { useState, useEffect, useRef } from 'react';
import type { Mission } from '../types/mission';
// ✅ FIXED PATH: Going up to components, then into core/lib
import { supabase } from '../core/lib/supabase'; 

interface MissionRunnerProps {
  mission: Mission;
  attemptId: string;
  onComplete: (result: any) => void;
}

export default function MissionRunner({ mission, attemptId, onComplete }: MissionRunnerProps) {
  const [phase, setPhase] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");

  const isSubmitting = useRef(false);

  useEffect(() => {
    let textToSpeak = "";
    if (phase === 1) textToSpeak = mission.audioContext;
    if (phase === 2) textToSpeak = mission.questionPhase.audio;
    if (phase === 3) textToSpeak = mission.twistPhase.audio;
    if (phase === 4) textToSpeak = mission.synthesisPhase.audio;

    if (textToSpeak) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN');
      if (indianVoice) utterance.voice = indianVoice;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [phase, mission]);

  const handleFinish = async (finalAnswer: string) => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('score-mission', {
        body: {
          attempt_id: attemptId,
          answers: {
            q1: answer1,
            q2: answer2,
            q3: finalAnswer
          }
        }
      });

      if (error) throw error;
      onComplete(data);
    } catch (err) {
      console.error("Scoring failed:", err);
      onComplete({ status: "pending_review", message: "Feedback coming soon." });
    } finally {
      setIsLoading(false);
      isSubmitting.current = false; 
    }
  };

  return (
    <div className="max-w-md w-full bg-[#0a1228] rounded-3xl border border-[#16244a] p-6 shadow-xl space-y-6 fade-in text-white font-sans">
      
      <div className="flex justify-center space-x-2 mb-4">
        {[1, 2, 3, 4].map((dot) => (
          <div key={dot} className={`w-3 h-3 rounded-full transition-colors ${phase >= dot ? 'bg-[#5b7fff]' : 'bg-[#1e2e5c]'}`} />
        ))}
      </div>

      {phase === 1 && (
        <div className="space-y-5 fade-in">
          <div className="flex justify-between items-start">
            <div className="text-5xl">{mission.icon}</div>
            <button onClick={() => {
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(new SpeechSynthesisUtterance(mission.audioContext));
            }} className="bg-[#5b7fff] p-2 rounded-full hover:bg-blue-600">🔊</button>
          </div>
          <div className="space-y-3 text-md text-gray-200 font-medium leading-relaxed">
            {mission.context.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
          </div>
          <button onClick={() => setPhase(2)} className="w-full bg-[#5b7fff] font-bold text-lg py-4 rounded-xl hover:bg-blue-600 mt-2">Next →</button>
        </div>
      )}

      {phase === 2 && (
        <div className="space-y-5 fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">{mission.questionPhase.title}</h2>
            <button onClick={() => {
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(new SpeechSynthesisUtterance(mission.questionPhase.audio));
            }} className="bg-[#5b7fff] p-2 rounded-full hover:bg-blue-600">🔊</button>
          </div>
          <div className="space-y-3">
            {mission.questionPhase.options.map((opt) => (
              <div 
                key={opt.id} 
                onClick={() => { setAnswer1(opt.id); setTimeout(() => setPhase(3), 300); }}
                className="bg-[#0a1228] border-2 border-[#1e2e5c] p-4 rounded-2xl cursor-pointer hover:border-[#5b7fff] transition-all"
              >
                <span className="font-bold text-[#5b7fff] mr-2">{opt.id}.</span> 
                <span className="font-bold text-gray-200 text-sm">{opt.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 3 && (
        <div className="space-y-5 fade-in">
          <div className="text-center">
            <div className="text-4xl mb-1">😲</div>
            <h2 className="text-lg font-bold text-[#fbbf24]">{mission.twistPhase.title}</h2>
            <p className="text-white mt-2 font-bold text-sm bg-[#0f1a38] p-4 rounded-lg border border-[#1e2e5c]">"{mission.twistPhase.prompt}"</p>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Do you agree?</p>
                <button onClick={() => {
                  window.speechSynthesis.cancel();
                  window.speechSynthesis.speak(new SpeechSynthesisUtterance(mission.twistPhase.audio));
                }} className="bg-[#5b7fff] p-1 rounded-full hover:bg-blue-600">🔊</button>
            </div>
            {mission.twistPhase.options.map((opt) => (
              <div 
                key={opt.id} 
                onClick={() => { setAnswer2(opt.id); setTimeout(() => setPhase(4), 300); }}
                className="bg-[#0a1228] border-2 border-[#1e2e5c] p-4 rounded-2xl cursor-pointer hover:border-[#5b7fff] transition-all"
              >
                <span className="font-bold text-gray-200 text-sm">{opt.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 4 && (
        <div className="space-y-5 fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">{mission.synthesisPhase.title}</h2>
            <button onClick={() => {
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(new SpeechSynthesisUtterance(mission.synthesisPhase.audio));
            }} className="bg-[#5b7fff] p-2 rounded-full hover:bg-blue-600">🔊</button>
          </div>
          <p className="text-gray-300 text-sm font-medium">{mission.synthesisPhase.prompt}</p>
          <div className="space-y-3 mt-4">
            {mission.synthesisPhase.options.map((opt) => (
              <div 
                key={opt.id} 
                onClick={() => { setTimeout(() => handleFinish(opt.id), 300); }}
                className="bg-[#0a1228] border-2 border-[#1e2e5c] p-4 rounded-2xl cursor-pointer hover:border-[#5b7fff] transition-all"
              >
                <span className="font-bold text-[#5b7fff] mr-2">{opt.id}.</span> 
                <span className="font-bold text-gray-200 text-sm">{opt.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center space-y-4 py-8">
          <div className="w-12 h-12 border-4 border-[#5b7fff] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm animate-pulse">Securing & Analyzing...</p>
        </div>
      )}

    </div>
  );
}