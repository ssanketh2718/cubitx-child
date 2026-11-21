import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../../core/store';
import { curriculumTierFrom } from '../tiers';

export default function DayOneMission() {
  const { tier, idx = '1' } = useParams<{ tier?: string; idx?: string }>();
  return idx === '1' ? (
    <ShadowMission routeTier={tier} />
  ) : (
    <BridgeMission routeTier={tier} />
  );
}

function TopNav({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#DCE2E7] bg-white px-4 py-3 shadow-2xs">
      <button
        type="button"
        onClick={onBack}
        className="rounded-xl border border-[#DCE2E7] bg-[#F7F6F1] px-3 py-1.5 text-xs font-extrabold text-[#142033] hover:border-[#087F80] cursor-pointer"
      >
        ← Missions
      </button>
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#087F80]">
        {title}
      </span>
    </div>
  );
}

function ShadowMission({ routeTier }: { routeTier?: string }) {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const saveResponse = useApp((s) => s.saveResponse);
  const completeItem = useApp((s) => s.completeItem);

  const tierNum =
    routeTier === '2' ? 2 : curriculumTierFrom(user?.tier ?? 'foundation');

  const [hour, setHour] = useState(8);
  const [clues, setClues] = useState<string[]>([]);
  const [pick, setPick] = useState('');
  const [done, setDone] = useState(false);

  const clueList = ['Time of day', 'Sun angle', 'Pole fixed', 'Shadow tool'];
  const norm = (hour - 8) / 8;
  const sunX = 60 + norm * 280;
  const sunY = 120 - Math.sin(norm * Math.PI) * 80;
  const shadowLen = Math.max(24, (1.6 - Math.sin(norm * Math.PI)) * 70) * (norm < 0.5 ? -1 : 1);

  const handleSave = async () => {
    setDone(true);
    await saveResponse(`t${tierNum}:d1:i1`, {
      engine: 'm3-shadow-investigation',
      text: pick,
      picked: clues.length,
      behaviours: {
        testsBeforeGuess: clues.length,
        wentBackToTest: clues.length >= 2,
      },
    });
    await completeItem(`t${tierNum}:d1:i1`, 3);
  };

  return (
    <main className="min-h-screen bg-[#F7F6F1] px-4 py-5 pb-24 text-[#142033]">
      <div className="mx-auto max-w-2xl space-y-4">
        <TopNav title="Missing Shadow" onBack={() => navigate('/home')} />

        <section className="rounded-3xl border border-[#DCE2E7] bg-white p-6 shadow-2xs space-y-5">
          <h1 className="text-xl sm:text-2xl font-extrabold">
            Move the sun and see what shifts the shadow.
          </h1>

          <div className="rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1] p-3">
            <svg viewBox="0 0 400 175" className="w-full h-auto">
              <path
                d="M 60 120 Q 200 20 340 120"
                fill="none"
                stroke="#DCE2E7"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <line x1="20" y1="140" x2="380" y2="140" stroke="#142033" strokeWidth="2.5" />
              <line
                x1="200"
                y1="140"
                x2={200 + shadowLen}
                y2="140"
                stroke="#087F80"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <line x1="200" y1="140" x2="200" y2="90" stroke="#142033" strokeWidth="5" />
              <circle cx={sunX} cy={sunY} r="13" fill="#F5B942" />
            </svg>
            <div className="mt-2 flex items-center gap-3 px-2">
              <span className="text-xs font-extrabold w-16">
                {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
              </span>
              <input
                type="range"
                min={8}
                max={16}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="flex-1 accent-[#087F80] cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {clueList.map((c) => {
              const active = clues.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setClues((prev) =>
                      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                    )
                  }
                  className={`rounded-xl border p-3 text-left text-xs font-extrabold cursor-pointer ${
                    active
                      ? 'border-[#087F80] bg-[#E6F4F4]'
                      : 'border-[#DCE2E7] bg-white hover:bg-[#F7F6F1]'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {c}
                </button>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            {['Sun angle changed', 'Pole got shorter'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setPick(opt);
                  setDone(false);
                }}
                className={`rounded-xl border p-3 text-left text-xs font-bold cursor-pointer ${
                  pick === opt
                    ? 'border-[#087F80] bg-[#E6F4F4]'
                    : 'border-[#DCE2E7] bg-white hover:bg-[#F7F6F1]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!pick}
            onClick={() => void handleSave()}
            className="w-full rounded-2xl bg-[#087F80] hover:bg-[#0A9697] py-3.5 text-sm font-extrabold text-white disabled:opacity-40 cursor-pointer"
          >
            Save & Mark Complete
          </button>

          {done && (
            <div className="rounded-2xl bg-[#E6F4F4] p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-extrabold text-[#087F80]">
                ✓ Saved to your journey
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/play/${tierNum}/1/2`)}
                  className="rounded-xl bg-[#087F80] px-3.5 py-2 text-xs font-extrabold text-white cursor-pointer"
                >
                  Next →
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-[#142033] border border-[#DCE2E7] cursor-pointer"
                >
                  Home
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function BridgeMission({ routeTier }: { routeTier?: string }) {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const saveResponse = useApp((s) => s.saveResponse);
  const completeItem = useApp((s) => s.completeItem);

  const tierNum =
    routeTier === '2' ? 2 : curriculumTierFrom(user?.tier ?? 'foundation');

  const items = [
    { id: 'paper', name: 'Paper strip', str: 1, cost: 1 },
    { id: 'folded', name: 'Folded beam', str: 3, cost: 2 },
    { id: 'card', name: 'Card strip', str: 2, cost: 2 },
    { id: 'wood', name: 'Wood rod', str: 4, cost: 3 },
  ];

  const [selected, setSelected] = useState<string[]>([]);
  const [tested, setTested] = useState(false);

  const budget = 6;
  const chosen = items.filter((i) => selected.includes(i.id));
  const cost = chosen.reduce((s, i) => s + i.cost, 0);
  const str = chosen.reduce((s, i) => s + i.str, 0);

  const handleTest = async () => {
    setTested(true);
    await saveResponse(`t${tierNum}:d1:i2`, {
      engine: 'm5-bridge-tradeoff',
      text: `${chosen.map((c) => c.name).join(' + ')} (Str ${str}, Cost ${cost}/${budget})`,
      picked: str,
      behaviours: { testsBeforeGuess: chosen.length },
    });
    if (str >= 6) {
      await completeItem(`t${tierNum}:d1:i2`, 3);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F6F1] px-4 py-5 pb-24 text-[#142033]">
      <div className="mx-auto max-w-2xl space-y-4">
        <TopNav title="Bridge Lab" onBack={() => navigate('/home')} />

        <section className="rounded-3xl border border-[#DCE2E7] bg-white p-6 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold">
              Reach 6 strength inside a 6 budget.
            </h1>
            <span className="rounded-full bg-[#E6F4F4] px-3 py-1 text-xs font-extrabold text-[#087F80]">
              Str {str}/6 · Cost {cost}/{budget}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {items.map((m) => {
              const active = selected.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setTested(false);
                    setSelected((prev) =>
                      prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id]
                    );
                  }}
                  className={`rounded-2xl border p-3.5 text-left cursor-pointer ${
                    active
                      ? 'border-[#087F80] bg-[#E6F4F4]'
                      : 'border-[#DCE2E7] bg-white hover:bg-[#F7F6F1]'
                  }`}
                >
                  <p className="text-xs font-extrabold">
                    {active ? '✓ ' : ''}
                    {m.name}
                  </p>
                  <p className="mt-1 text-[11px] text-[#586579]">
                    +{m.str} str · {m.cost} cost
                  </p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={chosen.length === 0 || cost > budget}
            onClick={() => void handleTest()}
            className="w-full rounded-2xl bg-[#087F80] hover:bg-[#0A9697] py-3.5 text-sm font-extrabold text-white disabled:opacity-40 cursor-pointer"
          >
            Test Bridge
          </button>

          {tested && (
            <div className="rounded-2xl bg-[#F7F6F1] border border-[#DCE2E7] p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-extrabold text-[#142033]">
                {str >= 6
                  ? `✓ Holds ${str} strength! Saved.`
                  : `Got ${str}/6 strength—adjust parts and test again.`}
              </span>
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="rounded-xl bg-[#087F80] px-4 py-2 text-xs font-extrabold text-white cursor-pointer"
              >
                Back to Missions →
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}