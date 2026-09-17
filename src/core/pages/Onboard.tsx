import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, deriveTier } from '../store';
import Logo from '../components/Logo';

export default function Onboard() {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(5);
  const setUser = useApp((s) => s.setUser);
  const navigate = useNavigate();

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) return alert('Enter a name first');
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 5);

    const tier = deriveTier(grade);

    setUser(
      { name: trimmed, grade, tier, createdAt: new Date().toISOString() },
      trialEnds.toISOString()
    );
    navigate('/home');
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-16 text-center relative">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60 hover:bg-white/[0.08] transition"
        aria-label="Back"
      >
        ←
      </button>

      <div className="flex justify-center mb-8">
        <Logo size={56} />
      </div>

      <h1 className="text-3xl font-bold mb-3 tracking-tight text-white">
        Think better, every day.
      </h1>
      <p className="text-white/50 text-[15px] leading-relaxed mb-10 font-medium">
        Daily missions that build how your child reasons — not what they memorize.
      </p>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-left mb-6">
        <label className="block text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase mb-2">
          Child's first name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ravi"
          maxLength={20}
          className="w-full bg-navy-950/60 border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-[15px] font-medium outline-none focus:border-blue-400 transition mb-5 placeholder:text-white/25"
        />
        <label className="block text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase mb-2">
          Class
        </label>
        <select
          value={grade}
          onChange={(e) => setGrade(parseInt(e.target.value, 10))}
          className="w-full bg-navy-950/60 border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-[15px] font-medium outline-none focus:border-blue-400 transition"
        >
          <option value={5}>Class 5</option>
          <option value={6}>Class 6</option>
          <option value={7}>Class 7</option>
          <option value={8}>Class 8</option>
          <option value={9}>Class 9</option>
          <option value={10}>Class 10</option>
        </select>
      </div>

      <button
        onClick={handleStart}
        className="w-full py-4 rounded-full font-bold text-[15px] bg-white text-navy-900 hover:bg-white/90 transition"
      >
        Start 5-day free trial
      </button>
      <p className="text-[12px] text-white/35 font-medium mt-5 leading-relaxed">
        No card needed. Your child's data stays private.
      </p>
    </div>
  );
}
