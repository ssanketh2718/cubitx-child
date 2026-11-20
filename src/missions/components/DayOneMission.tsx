import { useParams } from 'react-router-dom';
import { useState } from 'react';

type MissionType = 'shadow' | 'bridge';

export default function DayOneMission() {
  const { idx = '1' } = useParams<{ idx: string }>();

  const mission: MissionType = idx === '1' ? 'shadow' : 'bridge';

  return mission === 'shadow' ? <ShadowMission /> : <BridgeMission />;
}

/* =========================================================
   MISSION 2 — THE CASE OF THE MISSING SHADOW
========================================================= */

function ShadowMission() {
  const [stage, setStage] = useState(0);
  const [selectedClues, setSelectedClues] = useState<string[]>([]);
  const [conclusion, setConclusion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const clues = [
    'Time of observation',
    'Weather conditions',
    'Position of the Sun',
    'Method used to measure the shadow',
  ];

  const toggleClue = (clue: string) => {
    setSelectedClues((previous) =>
      previous.includes(clue)
        ? previous.filter((item) => item !== clue)
        : [...previous, clue]
    );
  };

  const correctConclusion =
    'The Sun’s apparent position changed during the day.';

  return (
    <main className="min-h-screen bg-[#FAF9F5] px-4 py-6 pb-24 text-[#111827] font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        <header className="bg-white border border-[#E7E5E0] rounded-2xl p-5">
          <p className="text-xs font-black uppercase tracking-widest text-purple-700">
            CUBITX · DAY 1 · MISSION 2
          </p>

          <h1 className="text-2xl font-extrabold mt-2">
            The Case of the Missing Shadow
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Observe carefully. Separate what you know from what you assume.
          </p>
        </header>

        <section className="bg-white rounded-3xl border border-[#E7E5E0] p-6 space-y-4">
          <div className="text-4xl">☀️</div>

          <h2 className="text-xl font-extrabold">
            The Mystery
          </h2>

          <p className="text-sm leading-relaxed text-slate-600">
            Three students observed the shadow of the same vertical pole
            at different times. They recorded different shadow directions
            and lengths.
          </p>

          <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
            <div className="flex justify-between text-sm border-b border-slate-200 pb-2">
              <span className="font-bold">8:00 AM</span>
              <span>West · Long</span>
            </div>

            <div className="flex justify-between text-sm border-b border-slate-200 pb-2">
              <span className="font-bold">10:00 AM</span>
              <span>North-West · Medium</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-bold">12:00 PM</span>
              <span>North · Short</span>
            </div>
          </div>
        </section>

        {stage === 0 && (
          <section className="bg-white rounded-3xl border border-[#E7E5E0] p-6 space-y-4">
            <h2 className="font-extrabold text-lg">
              Your Investigation
            </h2>

            <p className="text-sm text-slate-600">
              Before explaining the difference, what information would
              you want to examine?
            </p>

            <div className="space-y-2">
              {clues.map((clue) => (
                <button
                  key={clue}
                  type="button"
                  onClick={() => toggleClue(clue)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition ${
                    selectedClues.includes(clue)
                      ? 'border-purple-500 bg-purple-50 text-purple-800'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="mr-2">
                    {selectedClues.includes(clue) ? '✓' : '○'}
                  </span>
                  {clue}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={selectedClues.length === 0}
              onClick={() => setStage(1)}
              className="w-full rounded-xl bg-[#111827] text-white p-4 text-sm font-extrabold disabled:opacity-40"
            >
              Examine the Evidence →
            </button>
          </section>
        )}

        {stage === 1 && (
          <section className="bg-white rounded-3xl border border-[#E7E5E0] p-6 space-y-4">
            <h2 className="text-lg font-extrabold">
              Evidence Review
            </h2>

            <p className="text-sm text-slate-600">
              The observations suggest that the shadow changes as the
              Sun appears to move across the sky.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-900">
                Think carefully
              </p>

              <p className="text-sm text-amber-800 mt-1">
                An observation is not automatically a complete explanation.
                We must distinguish evidence from interpretation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStage(2)}
              className="w-full rounded-xl bg-[#111827] text-white p-4 text-sm font-extrabold"
            >
              Form Your Conclusion →
            </button>
          </section>
        )}

        {stage === 2 && (
          <section className="bg-white rounded-3xl border border-[#E7E5E0] p-6 space-y-4">
            <h2 className="text-lg font-extrabold">
              What best explains the observations?
            </h2>

            {[
              'The pole changed its position.',
              'The Sun’s apparent position changed during the day.',
              'The shadow disappeared permanently.',
              'The pole became shorter.',
            ].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setConclusion(option);
                  setSubmitted(false);
                }}
                className={`w-full text-left p-4 rounded-xl border text-sm font-semibold ${
                  conclusion === option
                    ? 'border-purple-500 bg-purple-50 text-purple-800'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                {option}
              </button>
            ))}

            <button
              type="button"
              disabled={!conclusion}
              onClick={() => setSubmitted(true)}
              className="w-full rounded-xl bg-purple-700 text-white p-4 text-sm font-extrabold disabled:opacity-40"
            >
              Record My Conclusion
            </button>

            {submitted && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <h3 className="font-extrabold">
                  {conclusion === correctConclusion
                    ? 'Good investigation!'
                    : 'Look at the evidence again.'}
                </h3>

                <p className="text-sm text-slate-600 mt-2">
                  The observations are consistent with the Sun's apparent
                  movement across the sky. The direction and length of a
                  shadow depend on the position of the light source.
                </p>

                <p className="text-xs text-slate-500 mt-3">
                  Selected clues: {selectedClues.length} of {clues.length}
                </p>
              </div>
            )}
          </section>
        )}

      </div>
    </main>
  );
}

/* =========================================================
   MISSION 3 — BUILD THE IMPOSSIBLE BRIDGE
========================================================= */

function BridgeMission() {
  const materials = [
    { id: 'paper', name: 'Paper strips', strength: 1, cost: 1 },
    { id: 'folded', name: 'Folded paper strips', strength: 3, cost: 2 },
    { id: 'card', name: 'Card strips', strength: 2, cost: 2 },
    { id: 'wood', name: 'Wooden sticks', strength: 4, cost: 3 },
  ];

  const [selected, setSelected] = useState<string[]>([]);
  const [tested, setTested] = useState(false);

  const budget = 6;

  const chosenMaterials = materials.filter((material) =>
    selected.includes(material.id)
  );

  const totalCost = chosenMaterials.reduce(
    (total, material) => total + material.cost,
    0
  );

  const totalStrength = chosenMaterials.reduce(
    (total, material) => total + material.strength,
    0
  );

  const withinBudget = totalCost <= budget;
  const canTest = selected.length > 0 && withinBudget;

  const toggleMaterial = (id: string) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );

    setTested(false);
  };

  return (
    <main className="min-h-screen bg-[#FAF9F5] px-4 py-6 pb-24 text-[#111827] font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        <header className="bg-white border border-[#E7E5E0] rounded-2xl p-5">
          <p className="text-xs font-black uppercase tracking-widest text-purple-700">
            CUBITX · DAY 1 · MISSION 3
          </p>

          <h1 className="text-2xl font-extrabold mt-2">
            Build the Impossible Bridge
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Design, experiment and solve a resource constraint.
          </p>
        </header>

        <section className="bg-white rounded-3xl border border-[#E7E5E0] p-6 space-y-3">
          <div className="text-4xl">🌉</div>

          <h2 className="text-xl font-extrabold">
            Your Challenge
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            You must build a bridge that can support a load of at least
            6 strength points. You have a limited material budget.
            Choose wisely.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-700 font-bold">
                AVAILABLE BUDGET
              </p>
              <p className="text-2xl font-black">{budget}</p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs text-emerald-700 font-bold">
                REQUIRED STRENGTH
              </p>
              <p className="text-2xl font-black">6</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#E7E5E0] p-6 space-y-4">
          <h2 className="text-lg font-extrabold">
            Select Your Materials
          </h2>

          <p className="text-sm text-slate-500">
            You can combine materials. Each selection adds its cost
            and strength.
          </p>

          {materials.map((material) => {
            const active = selected.includes(material.id);

            return (
              <button
                key={material.id}
                type="button"
                onClick={() => toggleMaterial(material.id)}
                className={`w-full p-4 rounded-xl border flex items-center justify-between text-left ${
                  active
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-bold text-sm">
                    {material.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Strength: {material.strength} · Cost: {material.cost}
                  </p>
                </div>

                <span className="font-black text-purple-700">
                  {active ? '✓ Selected' : '+ Add'}
                </span>
              </button>
            );
          })}
        </section>

        <section className="bg-white rounded-3xl border border-[#E7E5E0] p-6 space-y-4">
          <h2 className="font-extrabold text-lg">
            Bridge Construction Report
          </h2>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total cost</span>
            <strong className={withinBudget ? 'text-emerald-700' : 'text-red-600'}>
              {totalCost} / {budget}
            </strong>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total strength</span>
            <strong>{totalStrength} / 6</strong>
          </div>

          {!withinBudget && (
            <p className="text-sm text-red-600 font-semibold">
              Your design exceeds the available budget. Remove a material.
            </p>
          )}

          <button
            type="button"
            disabled={!canTest}
            onClick={() => setTested(true)}
            className="w-full rounded-xl bg-[#111827] text-white p-4 text-sm font-extrabold disabled:opacity-40"
          >
            Test My Bridge →
          </button>

          {tested && (
            <div className={`rounded-2xl p-4 border ${
              totalStrength >= 6
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <h3 className="font-extrabold">
                {totalStrength >= 6
                  ? 'Bridge successfully constructed!'
                  : 'The bridge needs improvement.'}
              </h3>

              <p className="text-sm mt-2 text-slate-600">
                Your design has strength {totalStrength} and costs {totalCost}.
                {totalStrength >= 6
                  ? ' You achieved the required strength within the budget.'
                  : ' Experiment with a different combination of materials.'}
              </p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}