import { useEffect, useState } from 'react';

interface MissionLiveSceneProps {
  missionId: string;
}

export default function MissionLiveScene({ missionId }: MissionLiveSceneProps) {
  const [currentDay, setCurrentDay] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [waterPotB, setWaterPotB] = useState<boolean>(false);
  const [inspectedPot, setInspectedPot] = useState<'A' | 'B' | null>(null);
  const [step, setStep] = useState<0 | 1>(0);

  // Reset state cleanly on mission change
  useEffect(() => {
    setIsPlaying(false);
    setWaterPotB(false);
    setInspectedPot(null);
    setStep(0);
    setCurrentDay(missionId === 'd2-m4' ? 1 : 10);
  }, [missionId]);

  // Auto-play 10-day time-lapse
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setCurrentDay((d) => {
        if (d < 10) return d + 1;
        setIsPlaying(false);
        return 10;
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentDay >= 10) setCurrentDay(1);
      setIsPlaying(true);
    }
  };

  // ============================================================================
  // DAY 2 · MISSION 1: ANANYA'S 10-DAY SUNLIGHT EXPERIMENT (HYPER-REAL SVG STAGE)
  // ============================================================================
  if (missionId === 'd2-m1') {
    const scaleA = 0.22 + ((currentDay - 1) / 9) * 0.78;
    const heightA = Math.round(2 + ((currentDay - 1) / 9) * 22);

    const scaleB = !waterPotB
      ? 0.25 + ((currentDay - 1) / 9) * 0.75
      : 0.35 + ((currentDay - 1) / 9) * 1.65;
    const heightB = !waterPotB
      ? currentDay <= 2
        ? 1
        : currentDay <= 6
        ? 2
        : 3
      : Math.round(2 + ((currentDay - 1) / 9) * 9);

    return (
      <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-stone-950 select-none shadow-sm">
        {/* Top Interactive Control Strip */}
        <div className="bg-stone-900 border-b border-stone-800 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInspectedPot('A')}
              className="px-3 py-1 rounded-xl text-xs font-extrabold bg-amber-500 text-white shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <span>☀️</span>
              <span>Pot A (Verandah)</span>
            </button>
            <button
              type="button"
              onClick={() => setInspectedPot('B')}
              className="px-3 py-1 rounded-xl text-xs font-extrabold bg-stone-800 text-stone-100 border border-stone-700 flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <span>🌑</span>
              <span>Pot B (Dark Room)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setWaterPotB((w) => !w);
              setCurrentDay(1);
              setIsPlaying(true);
            }}
            className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-500/20 border border-sky-400/50 text-sky-200 hover:bg-sky-500/30 transition cursor-pointer"
          >
            💧 {waterPotB ? 'Stop Watering Pot B' : 'Test: Pour 1 Mug Water in Pot B'}
          </button>
        </div>

        {/* Side-by-Side Hyper-Realistic SVG Stage */}
        <div className="grid grid-cols-1 md:grid-cols-2 relative">
          {/* LEFT: POT A (SUNNY VERANDAH) */}
          <div
            onClick={() => setInspectedPot('A')}
            className="group relative overflow-hidden cursor-pointer min-h-[290px] sm:min-h-[325px] border-b md:border-b-0 md:border-r border-amber-900/40"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200 via-orange-100 to-amber-300" />
            <div className="absolute -top-14 -left-14 w-64 h-64 rounded-full bg-yellow-100/90 blur-2xl" />
            <div className="absolute top-6 right-6 w-44 h-44 rounded-full bg-emerald-300/30 blur-2xl" />

            {/* Sunlit Tiled Verandah Floor */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-amber-800/90 via-orange-900/95 to-stone-950">
              <div
                className="w-full h-full opacity-35"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
                  backgroundSize: '64px 28px',
                }}
              />
            </div>

            {/* Volumetric Sunbeams & Dust Motes */}
            <div className="cx-sunbeam-ray pointer-events-none absolute -top-10 left-4 w-32 h-[360px] bg-gradient-to-b from-yellow-100/80 via-amber-200/30 to-transparent blur-md" />
            <span className="cx-dust-mote pointer-events-none absolute top-20 left-16 w-1.5 h-1.5 rounded-full bg-yellow-100 shadow-[0_0_8px_#fef08a]" />
            <span
              className="cx-dust-mote pointer-events-none absolute top-32 left-36 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#fff]"
              style={{ animationDelay: '2.2s' }}
            />

            {/* Floating Top Badge */}
            <div className="relative z-10 p-3 flex items-start justify-between gap-2">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-amber-200/90">
                <div className="text-xs font-black text-stone-800">Pot A (Verandah)</div>
                <div className="text-[11px] font-bold text-amber-800">
                  6 hrs sun · 1 mug water daily
                </div>
              </div>
              <span className="bg-stone-900/85 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                Tap to Inspect
              </span>
            </div>

            {/* Layered Terracotta Pot A + Lush Botanical Plant + Steel Mug */}
            <div className="relative z-10 flex flex-col items-center justify-end h-[225px] sm:h-[255px] pb-3">
              <svg
                viewBox="0 0 320 315"
                className="w-56 sm:w-64 h-auto drop-shadow-[0_18px_20px_rgba(45,22,8,0.55)] overflow-visible"
              >
                <defs>
                  <linearGradient id="clayPotA" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9a3412" />
                    <stop offset="28%" stopColor="#ea580c" />
                    <stop offset="55%" stopColor="#c2410c" />
                    <stop offset="85%" stopColor="#7c2d12" />
                    <stop offset="100%" stopColor="#431407" />
                  </linearGradient>
                  <linearGradient id="clayRimA" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c2d12" />
                    <stop offset="30%" stopColor="#fb923c" />
                    <stop offset="70%" stopColor="#c2410c" />
                    <stop offset="100%" stopColor="#431407" />
                  </linearGradient>
                  <radialGradient id="moistSoil" cx="50%" cy="40%" r="55%">
                    <stop offset="0%" stopColor="#451a03" />
                    <stop offset="70%" stopColor="#290f02" />
                    <stop offset="100%" stopColor="#170701" />
                  </radialGradient>
                  <linearGradient id="leafLush" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#84cc16" />
                    <stop offset="50%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#14532d" />
                  </linearGradient>
                  <linearGradient id="steelMug" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="35%" stopColor="#f8fafc" />
                    <stop offset="70%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>
                </defs>

                <ellipse cx="155" cy="296" rx="74" ry="12" fill="rgba(20, 8, 2, 0.55)" />

                <g transform={`translate(155, 204) scale(${scaleA.toFixed(2)})`}>
                  <g className="cx-plant-sway">
                    <path
                      d="M0,0 C-3,-36 4,-80 -2,-132"
                      stroke="#15803d"
                      strokeWidth="6.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M-1,0 C-4,-36 3,-80 -3,-132"
                      stroke="#86efac"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.7"
                    />
                    <g transform="translate(-1, -34) rotate(-32)">
                      <path
                        d="M0,0 C-22,-18 -54,-14 -66,4 C-46,16 -18,14 0,0 Z"
                        fill="url(#leafLush)"
                      />
                    </g>
                    <g transform="translate(1, -46) rotate(28)">
                      <path
                        d="M0,0 C22,-18 56,-14 68,5 C46,17 18,14 0,0 Z"
                        fill="url(#leafLush)"
                      />
                    </g>
                    <g transform="translate(-1, -78) rotate(-24)">
                      <path
                        d="M0,0 C-24,-20 -58,-15 -72,4 C-50,18 -20,15 0,0 Z"
                        fill="url(#leafLush)"
                      />
                    </g>
                    <g transform="translate(0, -92) rotate(22)">
                      <path
                        d="M0,0 C24,-22 60,-15 72,5 C48,18 18,14 0,0 Z"
                        fill="url(#leafLush)"
                      />
                    </g>
                    <g transform="translate(-2, -124) rotate(-14)">
                      <path
                        d="M0,0 C-16,-24 -42,-26 -52,-8 C-34,4 -14,4 0,0 Z"
                        fill="#22c55e"
                      />
                    </g>
                    <g transform="translate(-2, -127) rotate(16)">
                      <path
                        d="M0,0 C16,-26 42,-26 52,-8 C34,5 14,4 0,0 Z"
                        fill="#4ade80"
                      />
                    </g>
                    <path
                      d="M-2,-128 C-6,-146 2,-156 4,-142 C6,-134 1,-130 -2,-128 Z"
                      fill="#bef264"
                    />
                  </g>
                </g>

                <ellipse cx="155" cy="204" rx="58" ry="13" fill="url(#moistSoil)" />
                <path
                  d="M96,210 L214,210 L199,291 C198,296 192,299 185,299 L125,299 C118,299 112,296 111,291 Z"
                  fill="url(#clayPotA)"
                />
                <rect x="89" y="197" width="132" height="16" rx="6" fill="url(#clayRimA)" />

                {/* Steel Water Mug */}
                <g transform="translate(232, 241)">
                  <ellipse cx="22" cy="54" rx="20" ry="5" fill="rgba(0,0,0,0.4)" />
                  <path
                    d="M6,10 L38,10 L35,50 C35,53 31,55 22,55 C13,55 9,53 9,50 Z"
                    fill="url(#steelMug)"
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                  <ellipse cx="22" cy="11" rx="15" ry="4" fill="#38bdf8" />
                  <path
                    d="M37,16 C48,16 48,40 36,40"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </g>
              </svg>

              <div className="mt-1 bg-stone-950/85 text-amber-100 border border-amber-400/35 px-3.5 py-1 rounded-full text-xs font-extrabold">
                Height: {heightA} cm · {currentDay < 4 ? 'Sprouting' : 'Tall & Strong'}
              </div>
            </div>
          </div>

          {/* RIGHT: POT B (DARK ROOM) */}
          <div
            onClick={() => setInspectedPot('B')}
            className="group relative overflow-hidden cursor-pointer min-h-[290px] sm:min-h-[325px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-950" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-zinc-800/90 via-neutral-900 to-black border-t border-zinc-700/30" />

            <div className="relative z-10 p-3 flex items-start justify-between gap-2">
              <div className="bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-zinc-700/80">
                <div className="text-xs font-black text-zinc-100">Pot B (Dark Room)</div>
                <div className="text-[11px] font-bold text-amber-300">
                  {waterPotB
                    ? '0 hrs sun · 1 mug water daily'
                    : '0 hrs sun · 0 water (forgotten)'}
                </div>
              </div>
              <span className="bg-zinc-800 text-zinc-100 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-zinc-600">
                Tap to Inspect
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-end h-[225px] sm:h-[255px] pb-3">
              <svg
                viewBox="0 0 320 315"
                className="w-56 sm:w-64 h-auto drop-shadow-[0_18px_22px_rgba(0,0,0,0.85)] overflow-visible"
              >
                <defs>
                  <linearGradient id="clayPotB" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#451a03" />
                    <stop offset="30%" stopColor="#9a3412" />
                    <stop offset="65%" stopColor="#6c2309" />
                    <stop offset="100%" stopColor="#270c02" />
                  </linearGradient>
                  <linearGradient id="clayRimB" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b1304" />
                    <stop offset="35%" stopColor="#b45309" />
                    <stop offset="75%" stopColor="#7c2d12" />
                    <stop offset="100%" stopColor="#270c02" />
                  </linearGradient>
                  <radialGradient id="drySoil" cx="50%" cy="40%" r="55%">
                    <stop offset="0%" stopColor="#a18063" />
                    <stop offset="70%" stopColor="#785c43" />
                    <stop offset="100%" stopColor="#4a3726" />
                  </radialGradient>
                </defs>

                <ellipse cx="160" cy="296" rx="74" ry="12" fill="rgba(0, 0, 0, 0.78)" />

                <g transform={`translate(160, 204) scale(${scaleB.toFixed(2)})`}>
                  <g className="cx-plant-sway">
                    <path
                      d="M0,0 C2,-12 6,-22 11,-28"
                      stroke={waterPotB ? '#d9f99d' : '#a3a352'}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M11,-28 C4,-33 -4,-29 -6,-23 C1,-22 7,-24 11,-28 Z"
                      fill={waterPotB ? '#ecfccb' : '#bebd66'}
                    />
                    <path
                      d="M11,-28 C18,-32 25,-27 26,-21 C19,-21 14,-24 11,-28 Z"
                      fill={waterPotB ? '#d9f99d' : '#a3a352'}
                    />
                  </g>
                </g>

                <ellipse
                  cx="160"
                  cy="204"
                  rx="58"
                  ry="13"
                  fill={waterPotB ? 'url(#moistSoil)' : 'url(#drySoil)'}
                />
                {!waterPotB && (
                  <g stroke="#3e2716" strokeWidth="1.4" fill="none" opacity="0.85">
                    <path d="M122,203 L136,206 L144,200" />
                    <path d="M174,201 L184,207 L198,203" />
                    <path d="M148,209 L162,211 L172,207" />
                  </g>
                )}

                <path
                  d="M101,210 L219,210 L204,291 C203,296 197,299 190,299 L130,299 C123,299 117,296 116,291 Z"
                  fill="url(#clayPotB)"
                />
                <rect x="94" y="197" width="132" height="16" rx="6" fill="url(#clayRimB)" />

                {waterPotB && (
                  <g>
                    <g transform="translate(198, 128) rotate(-32)">
                      <path
                        d="M6,10 L36,10 L33,46 C33,49 29,51 21,51 C13,51 9,49 9,46 Z"
                        fill="url(#steelMug)"
                        stroke="#64748b"
                        strokeWidth="1"
                      />
                      <ellipse cx="21" cy="11" rx="14" ry="3.5" fill="#38bdf8" />
                    </g>
                    <circle className="cx-water-drop" cx="168" cy="166" r="3.2" fill="#38bdf8" />
                    <circle
                      className="cx-water-drop"
                      cx="155"
                      cy="174"
                      r="3.6"
                      fill="#7dd3fc"
                      style={{ animationDelay: '0.35s' }}
                    />
                  </g>
                )}
              </svg>

              <div className="mt-1 bg-zinc-900/90 text-zinc-200 border border-zinc-600 px-3.5 py-1 rounded-full text-xs font-extrabold">
                Height: {heightB} cm · {waterPotB ? 'Pale & Weak (No Sun)' : 'Tiny & Dry'}
              </div>
            </div>
          </div>
        </div>

        {/* Time-Lapse Scrubber + Clickable D1..D10 Pills */}
        <div className="bg-stone-900 border-t border-stone-800 px-3 sm:px-5 py-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 border border-amber-400/50 px-3 py-1 rounded-xl text-xs font-black text-amber-200">
                ⏱ Time-Lapse: Day {currentDay}
              </span>
              <button
                type="button"
                onClick={togglePlay}
                className="px-3 py-1 rounded-xl bg-white text-[#142033] text-xs font-extrabold hover:bg-amber-200 transition cursor-pointer"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>

            <div className="flex-1 min-w-[180px] sm:max-w-md flex items-center">
              <input
                type="range"
                min={1}
                max={10}
                value={currentDay}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentDay(Number(e.target.value));
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, idx) => {
              const d = idx + 1;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentDay(d);
                  }}
                  className={`py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                    d === currentDay
                      ? 'bg-white text-[#142033] shadow-xs'
                      : d < currentDay
                      ? 'bg-amber-500/25 text-amber-200'
                      : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  D{d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Close-Up Inspection Modal */}
        {inspectedPot && (
          <div
            onClick={() => setInspectedPot(null)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-stone-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-stone-900">
                  {inspectedPot === 'A'
                    ? `☀️ Pot A Inspection (Day ${currentDay})`
                    : `🌑 Pot B Inspection (Day ${currentDay})`}
                </h3>
                <button
                  type="button"
                  onClick={() => setInspectedPot(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 font-black text-stone-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {inspectedPot === 'A' ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs sm:text-sm font-semibold text-stone-800">
                  <div>🌞 <strong>Sunlight:</strong> 6 hours bright verandah sun daily</div>
                  <div>💧 <strong>Water:</strong> 1 full mug every morning</div>
                  <div>🪴 <strong>Soil &amp; Seeds:</strong> Garden mud + same seed packet</div>
                  <div>📏 <strong>Height on Day {currentDay}:</strong> {heightA} cm</div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-300 space-y-1.5 text-xs sm:text-sm font-semibold text-stone-800">
                  <div>🌑 <strong>Sunlight:</strong> 0 hours (dark room)</div>
                  <div>
                    💧 <strong>Water:</strong>{' '}
                    {waterPotB ? '1 full mug daily' : '0 mugs (forgotten all 10 days)'}
                  </div>
                  <div>🪴 <strong>Soil &amp; Seeds:</strong> Garden mud + same seed packet</div>
                  <div>📏 <strong>Height on Day {currentDay}:</strong> {heightB} cm</div>
                </div>
              )}
              <button
                type="button"
                onClick={() => setInspectedPot(null)}
                className="w-full py-2.5 rounded-2xl bg-[#142033] text-white font-extrabold text-sm cursor-pointer"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // REMAINING MISSIONS (DAY 1 & DAY 2) — RICH MULTI-LAYERED INTERACTIVE STAGES
  // ============================================================================
  return (
    <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-stone-950 select-none shadow-sm">
      <div className="bg-stone-900 border-b border-stone-800 px-4 py-2.5 flex items-center justify-between gap-2">
        <span className="font-sans text-xs font-extrabold text-stone-200">
          {missionId === 'd2-m2'
            ? 'Both Bats: 900g Willow · Tap match'
            : missionId === 'd2-m3'
            ? 'Kitchen Shelf All Night · Tap spoon'
            : missionId === 'd2-m4'
            ? 'Poster: “9 out of 10 won!” · Tap view'
            : missionId === 'd2-m5'
            ? 'Rule: “If it rains → Picnic cancelled”'
            : 'Tap to inspect scene'}
        </span>

        <div className="inline-flex rounded-full bg-stone-800 p-0.5 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => setStep(0)}
            className={`rounded-full px-3 py-1 transition cursor-pointer ${
              step === 0 ? 'bg-white text-[#142033]' : 'text-stone-300'
            }`}
          >
            {missionId === 'd2-m2'
              ? 'Saturday (45 Runs)'
              : missionId === 'd2-m3'
              ? 'Touch Steel'
              : missionId === 'd2-m4'
              ? 'Match Team (10)'
              : missionId === 'd2-m5'
              ? '6:30 AM Highway'
              : missionId === 'd1-m1'
              ? '10:00 AM'
              : missionId === 'd1-m2'
              ? 'Outside Road'
              : missionId === 'd1-m3'
              ? 'Travel Time'
              : missionId === 'd1-m4'
              ? 'Sunny Window'
              : 'With Ice'}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`rounded-full px-3 py-1 transition cursor-pointer ${
              step === 1 ? 'bg-white text-[#142033]' : 'text-stone-300'
            }`}
          >
            {missionId === 'd2-m2'
              ? 'Last Week (12 Runs)'
              : missionId === 'd2-m3'
              ? 'Touch Wood'
              : missionId === 'd2-m4'
              ? 'All Club Kids (100)'
              : missionId === 'd2-m5'
              ? '7:00 AM Sky'
              : missionId === 'd1-m1'
              ? '12:30 PM Open Lid'
              : missionId === 'd1-m2'
              ? '7:00 AM Verandah'
              : missionId === 'd1-m3'
              ? 'Check Limits'
              : missionId === 'd1-m4'
              ? 'Dark Desk'
              : 'Ice Melted'}
          </button>
        </div>
      </div>

      {/* Rich Textured Stage */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden flex items-center justify-center p-4 bg-gradient-to-b from-stone-800 via-stone-900 to-stone-950">
        {missionId === 'd2-m2' && (
          <div className="w-full h-full relative rounded-xl overflow-hidden bg-gradient-to-b from-sky-800 via-sky-600 to-amber-800 flex flex-col justify-between p-4">
            <div className="bg-black/45 backdrop-blur-xs rounded-xl px-3.5 py-2 text-xs sm:text-sm font-extrabold text-white">
              {step === 0
                ? 'Saturday: Class 3 kids bowling slow underarm balls on a small ground'
                : 'Last Week: Class 8 boys bowling fast overarm balls on a big ground'}
            </div>
            <div className="relative h-24 w-full flex items-center justify-between px-6">
              <div className="w-2 h-14 bg-amber-100 rounded" />
              <div
                className={`h-7 w-7 rounded-full bg-gradient-to-br from-rose-500 to-red-900 border border-white/50 shadow-xl ${
                  step === 0 ? 'animate-bounce' : 'animate-ping'
                }`}
              />
              <div className="w-2 h-14 bg-amber-100 rounded" />
            </div>
          </div>
        )}

        {missionId === 'd2-m3' && (
          <div className="w-full h-full relative rounded-xl overflow-hidden bg-gradient-to-b from-slate-800 to-stone-900 flex flex-col items-center justify-center p-4 gap-4">
            <div className="flex items-center">
              <div
                className="h-5 w-36 rounded-l-full shadow-lg"
                style={{
                  background:
                    step === 0
                      ? 'linear-gradient(180deg, #F8FAFC 0%, #94A3B8 55%, #475569 100%)'
                      : 'linear-gradient(180deg, #D97706 0%, #92400E 60%, #451A03 100%)',
                }}
              />
              <div
                className="h-14 w-24 -ml-2 rounded-full shadow-2xl"
                style={{
                  background:
                    step === 0
                      ? 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #94A3B8 60%, #334155 100%)'
                      : 'radial-gradient(circle at 35% 35%, #F59E0B 0%, #92400E 65%, #451A03 100%)',
                }}
              />
            </div>
            <div className="bg-black/50 rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold text-amber-200 text-center">
              {step === 0
                ? 'Warm Finger → Steel pulls warmth out VERY FAST → Feels icy cold!'
                : 'Warm Finger → Wood pulls warmth out VERY SLOWLY → Feels normal'}
            </div>
          </div>
        )}

        {missionId === 'd2-m4' && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            {step === 0 ? (
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black shadow-md ${
                      i < 9 ? 'bg-amber-400 text-stone-950' : 'bg-stone-700 text-stone-300'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-20 gap-1.5 max-w-lg">
                {Array.from({ length: 100 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-3 w-3 rounded-full ${
                      i < 9
                        ? 'bg-amber-400'
                        : i === 9
                        ? 'bg-stone-300'
                        : 'bg-stone-700/70'
                    }`}
                  />
                ))}
              </div>
            )}
            <div className="text-xs sm:text-sm font-extrabold text-stone-200 text-center">
              {step === 0
                ? 'Poster View: 9 medal winners out of 10 sent to tournament'
                : 'Full Club View: 90 club students never even went to play · Only 9 out of 100 won'}
            </div>
          </div>
        )}

        {missionId === 'd2-m5' && (
          <div className="w-full h-full relative rounded-xl overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-stone-700 p-4 flex flex-col justify-between">
            <div className="self-end h-12 w-12 rounded-full bg-amber-300 shadow-[0_0_30px_#fde047]" />
            <div className="bg-stone-900/85 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white">
              {step === 0
                ? '6:30 AM Highway: Hired school bus tyre burst — no spare bus available'
                : '7:00 AM Sky: Bright sun & zero rain — picnic still cancelled because of bus'}
            </div>
          </div>
        )}

        {(missionId.startsWith('d1-')) && (
          <div className="w-full h-full flex items-center justify-center text-center px-4">
            <div className="bg-white/10 border border-white/15 rounded-2xl px-5 py-4 text-sm sm:text-base font-extrabold text-white">
              {missionId === 'd1-m1' &&
                (step === 0
                  ? '10:00 AM: Classroom door locked · 4 mango slices inside Rohan’s steel tiffin'
                  : '12:30 PM: Tiffin empty · Kabir sitting near bench · Hands have zero mango smell')}
              {missionId === 'd1-m2' &&
                (step === 0
                  ? 'Outside Road & Neighbour Roofs: 100% dry & dusty (Zero rain at night)'
                  : '7:00 AM Verandah: Brother washed bicycle right next to the shoe rack')}
              {missionId === 'd1-m3' &&
                (step === 0
                  ? 'Park Walk: 12 mins · Auto: 8 mins · Bicycle: 10 mins (Bell in 15 mins)'
                  : 'Park Walk: ₹0 (Open) · Auto: ₹30 (Aarav has ₹20) · Bicycle: Front tyre flat')}
              {missionId === 'd1-m4' &&
                (step === 0
                  ? 'Sunny Window Plant: Gets 1 cup water daily · Upright firm stem'
                  : 'Dark Corner Desk Plant: Gets 1 cup water daily · Pale drooping stem')}
              {missionId === 'd1-m5' &&
                (step === 0
                  ? 'Shop A Big Cup (₹20) is packed full of ice cubes · Shop B Medium Cup (₹20) has zero ice'
                  : 'Once ice melts: Shop A has only half a glass of juice · Shop B is 100% pure juice')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}