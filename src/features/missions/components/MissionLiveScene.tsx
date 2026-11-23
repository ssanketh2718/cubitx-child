import { useState } from 'react';

interface MissionLiveSceneProps {
  missionId: string;
}

export default function MissionLiveScene({ missionId }: MissionLiveSceneProps) {
  const [step, setStep] = useState<0 | 1>(0);

  // DAY 1 · MISSION 1: The Missing Tiffin (10 AM vs 12:30 PM vs 1 PM)
  if (missionId === 'd1-m1') {
    return (
      <div className="rounded-2xl bg-[#142033] p-4 sm:p-5 text-white space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            Interactive Scene · Tap to compare time
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              10:00 AM
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              12:30 PM
            </button>
          </div>
        </div>

        <svg viewBox="0 0 420 110" className="w-full h-28 rounded-xl bg-white/[0.04]">
          {/* Classroom Bench */}
          <rect x="40" y="74" width="340" height="8" rx="4" fill="#94A3B8" />
          <rect x="65" y="82" width="10" height="20" rx="2" fill="#64748B" />
          <rect x="345" y="82" width="10" height="20" rx="2" fill="#64748B" />

          {/* Tiffin Box */}
          <rect x="180" y="46" width="60" height="28" rx="6" fill="#F5B942" />
          <rect x="176" y="42" width="68" height="8" rx="4" fill="#FDE68A" />

          {step === 0 ? (
            <g>
              {/* Lock Icon */}
              <rect x="75" y="34" width="24" height="20" rx="4" fill="#E2E8F0" />
              <path
                d="M81 34 V28 A6 6 0 0 1 93 28 V34"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="3"
              />
              <text x="112" y="48" fill="#F8FAFC" fontSize="13" fontWeight="700">
                Door Locked · Room Empty
              </text>
              <circle cx="210" cy="60" r="6" fill="#FB923C" />
              <text x="210" y="28" textAnchor="middle" fill="#FDE68A" fontSize="11" fontWeight="700">
                Mangoes Inside
              </text>
            </g>
          ) : (
            <g>
              {/* Open Door */}
              <rect x="75" y="24" width="22" height="34" rx="3" fill="none" stroke="#94A3B8" strokeWidth="2.5" />
              <text x="110" y="45" fill="#F8FAFC" fontSize="13" fontWeight="700">
                Door Open · Kabir at Bench
              </text>
              <text x="210" y="28" textAnchor="middle" fill="#CBD5E1" fontSize="11" fontWeight="700">
                Box Empty · No Smell on Hands
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  // DAY 1 · MISSION 2: The Wet Shoes
  if (missionId === 'd1-m2') {
    return (
      <div className="rounded-2xl bg-[#142033] p-4 sm:p-5 text-white space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            Interactive Scene · Tap to check outside vs verandah
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Outside Road
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              7:00 AM Verandah
            </button>
          </div>
        </div>

        <svg viewBox="0 0 420 110" className="w-full h-28 rounded-xl bg-white/[0.04]">
          {step === 0 ? (
            <g>
              <circle cx="340" cy="30" r="14" fill="#F5B942" />
              <rect x="40" y="76" width="340" height="14" rx="4" fill="#475569" />
              <line x1="70" y1="83" x2="110" y2="83" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6 6" />
              <line x1="170" y1="83" x2="210" y2="83" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6 6" />
              <line x1="270" y1="83" x2="310" y2="83" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6 6" />
              <text x="55" y="48" fill="#F8FAFC" fontSize="14" fontWeight="700">
                Road & Roofs: 100% Dry (Zero Rain)
              </text>
            </g>
          ) : (
            <g>
              {/* Bicycle wheels */}
              <circle cx="110" cy="68" r="18" fill="none" stroke="#CBD5E1" strokeWidth="3" />
              <circle cx="170" cy="68" r="18" fill="none" stroke="#CBD5E1" strokeWidth="3" />
              {/* Water splash drops */}
              <circle cx="235" cy="52" r="4" fill="#7DD3FC" className="animate-bounce" />
              <circle cx="255" cy="64" r="5" fill="#7DD3FC" className="animate-pulse" />
              <circle cx="275" cy="48" r="4" fill="#7DD3FC" className="animate-bounce" />
              {/* Shoe rack */}
              <rect x="230" y="74" width="90" height="10" rx="3" fill="#E2E8F0" />
              <text x="275" y="30" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="700">
                Brother Washed Cycle Near Shoe Rack
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  // DAY 1 · MISSION 3: Fastest Way to School
  if (missionId === 'd1-m3') {
    return (
      <div className="rounded-2xl bg-[#142033] p-4 sm:p-5 text-white space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            School starts in 15 mins · Pocket: ₹20
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              3 Routes
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Check Limits
            </button>
          </div>
        </div>

        <svg viewBox="0 0 420 110" className="w-full h-28 rounded-xl bg-white/[0.04]">
          {/* Park bar */}
          <text x="24" y="32" fill="#F8FAFC" fontSize="12" fontWeight="700">Park Walk</text>
          <rect x="120" y="20" width="180" height="14" rx="7" fill="#E2E8F0" />
          <text x="310" y="31" fill="#E2E8F0" fontSize="11" fontWeight="700">12 min · ₹0</text>

          {/* Auto bar */}
          <text x="24" y="62" fill="#F8FAFC" fontSize="12" fontWeight="700">Auto</text>
          <rect x="120" y="50" width="120" height="14" rx="7" fill="#94A3B8" />
          <text x="250" y="61" fill="#FDE68A" fontSize="11" fontWeight="700">
            {step === 0 ? '8 min · ₹30' : '8 min · Need ₹10 more!'}
          </text>

          {/* Cycle bar */}
          <text x="24" y="92" fill="#F8FAFC" fontSize="12" fontWeight="700">Cycle</text>
          <rect x="120" y="80" width="150" height="14" rx="7" fill="#64748B" />
          <text x="280" y="91" fill="#FDE68A" fontSize="11" fontWeight="700">
            {step === 0 ? '10 min · ₹0' : 'Front tyre flat!'}
          </text>
        </svg>
      </div>
    );
  }

  // DAY 1 · MISSION 4: The Drooping Plant
  if (missionId === 'd1-m4') {
    return (
      <div className="rounded-2xl bg-[#142033] p-4 sm:p-5 text-white space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            Tap to compare Window vs Desk
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Window Plant
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Desk Plant
            </button>
          </div>
        </div>

        <svg viewBox="0 0 420 110" className="w-full h-28 rounded-xl bg-white/[0.04]">
          <polygon points="185,84 235,84 227,104 193,104" fill="#D97706" />
          {step === 0 ? (
            <g>
              <circle cx="340" cy="30" r="15" fill="#F5B942" />
              <line x1="210" y1="84" x2="210" y2="38" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="194" cy="48" rx="14" ry="7" fill="#E2E8F0" />
              <ellipse cx="226" cy="44" rx="14" ry="7" fill="#E2E8F0" />
              <text x="40" y="54" fill="#F8FAFC" fontSize="13" fontWeight="700">
                Sunny Window · 1 Cup Water
              </text>
            </g>
          ) : (
            <g>
              <path d="M210 84 Q210 56 236 66" fill="none" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="240" cy="70" rx="12" ry="6" fill="#94A3B8" />
              <text x="40" y="54" fill="#F8FAFC" fontSize="13" fontWeight="700">
                Dark Corner · 1 Cup Water
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  // DAY 1 · MISSION 5: The Best Juice Shop
  if (missionId === 'd1-m5') {
    return (
      <div className="rounded-2xl bg-[#142033] p-4 sm:p-5 text-white space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            Pocket: ₹20 · Tap to inspect inside glass
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Outside Look
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Inside Glass
            </button>
          </div>
        </div>

        <svg viewBox="0 0 420 110" className="w-full h-28 rounded-xl bg-white/[0.04]">
          {/* Shop A Glass */}
          <rect x="85" y="24" width="44" height="62" rx="6" fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
          <rect x="88" y="32" width="38" height="51" rx="4" fill="#F59E0B" />
          {step === 1 && (
            <g>
              <rect x="92" y="34" width="13" height="13" rx="2" fill="#E0F2FE" />
              <rect x="109" y="36" width="13" height="13" rx="2" fill="#E0F2FE" />
              <rect x="95" y="50" width="13" height="13" rx="2" fill="#E0F2FE" />
              <rect x="110" y="52" width="13" height="13" rx="2" fill="#E0F2FE" />
            </g>
          )}
          <text x="107" y="102" textAnchor="middle" fill="#F8FAFC" fontSize="11" fontWeight="700">
            {step === 0 ? 'Shop A · Big Cup ₹20' : 'Shop A · Half Ice'}
          </text>

          {/* Shop B Glass */}
          <rect x="275" y="36" width="40" height="50" rx="6" fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
          <rect x="278" y="40" width="34" height="43" rx="4" fill="#F59E0B" />
          <text x="295" y="102" textAnchor="middle" fill="#F8FAFC" fontSize="11" fontWeight="700">
            {step === 0 ? 'Shop B · Medium ₹20' : 'Shop B · Pure Juice'}
          </text>
        </svg>
      </div>
    );
  }

  // DAY 2 · MISSION 1: The Two Plant Pots
  if (missionId === 'd2-m1') {
    return (
      <div className="rounded-2xl bg-[#142033] p-4 sm:p-5 text-white space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            Tap to compare Pot A vs Pot B
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Pot A (Verandah)
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Pot B (Room)
            </button>
          </div>
        </div>

        <svg viewBox="0 0 420 110" className="w-full h-28 rounded-xl bg-white/[0.04]">
          <polygon points="185,84 235,84 227,104 193,104" fill="#D97706" />
          {step === 0 ? (
            <g>
              <circle cx="345" cy="28" r="14" fill="#F5B942" />
              <circle cx="248" cy="44" r="4" fill="#7DD3FC" className="animate-bounce" />
              <circle cx="258" cy="58" r="4" fill="#7DD3FC" className="animate-pulse" />
              <line x1="210" y1="84" x2="210" y2="30" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="192" cy="46" rx="14" ry="7" fill="#E2E8F0" />
              <ellipse cx="228" cy="40" rx="14" ry="7" fill="#E2E8F0" />
              <text x="32" y="52" fill="#F8FAFC" fontSize="13" fontWeight="700">
                6 Hrs Sun + 1 Mug Water Daily
              </text>
            </g>
          ) : (
            <g>
              <line x1="210" y1="84" x2="210" y2="68" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="202" cy="70" rx="8" ry="4" fill="#94A3B8" />
              <text x="32" y="52" fill="#F8FAFC" fontSize="13" fontWeight="700">
                0 Hrs Sun + 0 Drops Water
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  // DAY 2 · MISSION 2: The Lucky Blue Bat
  if (missionId === 'd2-m2') {
    return (
      <div className="rounded-2xl bg-[#142033] p-4 sm:p-5 text-white space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            Both Bats: 900g Willow · Tap match
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Saturday (45 Runs)
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Last Week (12 Runs)
            </button>
          </div>
        </div>

        <svg viewBox="0 0 420 110" className="w-full h-28 rounded-xl bg-white/[0.04]">
          <rect x="40" y="84" width="340" height="8" rx="4" fill="#64748B" />
          {step === 0 ? (
            <g>
              <path d="M85 72 Q210 20 330 70" fill="none" stroke="#FDE68A" strokeWidth="2.5" strokeDasharray="5 5" />
              <circle cx="210" cy="46" r="7" fill="#F5B942" className="animate-bounce" />
              <text x="210" y="24" textAnchor="middle" fill="#F8FAFC" fontSize="13" fontWeight="700">
                Class 3 Bowlers · Slow Underarm Balls
              </text>
            </g>
          ) : (
            <g>
              <line x1="85" y1="62" x2="330" y2="62" stroke="#E2E8F0" strokeWidth="3" />
              <circle cx="290" cy="62" r="7" fill="#F8FAFC" className="animate-ping" />
              <text x="210" y="28" textAnchor="middle" fill="#F8FAFC" fontSize="13" fontWeight="700">
                Class 8 Bowlers · Fast Overarm Balls
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  // DAY 2 · MISSION 3: The Cold Steel Spoon
  if (missionId === 'd2-m3') {
    return (
      <div className="rounded-2xl bg-[#142033] p-4 sm:p-5 text-white space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            Kitchen Shelf All Night · Tap to touch spoon
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Touch Steel
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Touch Wood
            </button>
          </div>
        </div>

        <svg viewBox="0 0 420 110" className="w-full h-28 rounded-xl bg-white/[0.04]">
          {/* Spoon */}
          <ellipse cx="280" cy="56" rx="34" ry="16" fill={step === 0 ? '#CBD5E1' : '#D97706'} />
          <rect x="165" y="51" width="90" height="10" rx="5" fill={step === 0 ? '#CBD5E1' : '#D97706'} />

          {/* Heat Flow Arrows from Warm Hand */}
          <text x="42" y="52" fill="#F8FAFC" fontSize="12" fontWeight="700">Warm Hand</text>
          <text x="42" y="68" fill="#FDE68A" fontSize="11" fontWeight="700">
            {step === 0 ? 'Heat leaves FAST →→→' : 'Heat leaves slowly →'}
          </text>
          <text x="210" y="96" textAnchor="middle" fill="#CBD5E1" fontSize="11" fontWeight="700">
            Neither spoon was in the fridge
          </text>
        </svg>
      </div>
    );
  }

  // DAY 2 · MISSION 4: The Carrom Club Notice (100 Kids vs 10 Sent)
  if (missionId === 'd2-m4') {
    return (
      <div className="rounded-2xl bg-[#142033] p-4 sm:p-5 text-white space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            Poster: “9 out of 10 won!” · Tap to zoom out
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Match Team (10)
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Full Club (100)
            </button>
          </div>
        </div>

        <svg viewBox="0 0 420 110" className="w-full h-28 rounded-xl bg-white/[0.04]">
          {step === 0 ? (
            <g>
              {Array.from({ length: 10 }, (_, i) => (
                <circle
                  key={i}
                  cx={65 + i * 32}
                  cy="54"
                  r="10"
                  fill={i < 9 ? '#F5B942' : '#475569'}
                />
              ))}
              <text x="210" y="92" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="700">
                9 Medal Winners out of 10 Sent to Play
              </text>
            </g>
          ) : (
            <g>
              {Array.from({ length: 100 }, (_, i) => {
                const col = i % 20;
                const row = Math.floor(i / 20);
                return (
                  <circle
                    key={i}
                    cx={68 + col * 15}
                    cy={22 + row * 14}
                    r="4.2"
                    fill={i < 9 ? '#F5B942' : i === 9 ? '#94A3B8' : '#334155'}
                  />
                );
              })}
              <text x="210" y="102" textAnchor="middle" fill="#F8FAFC" fontSize="11" fontWeight="700">
                9 Winners out of 100 Club Students (90 Stayed Home)
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  // DAY 2 · MISSION 5: The Cancelled Picnic
  return (
    <div className="rounded-2xl bg-[#142033] p-4 sm:p-5 text-white space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
          Rule: “If it rains → Picnic cancelled”
        </span>
        <div className="inline-flex rounded-full bg-white/10 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setStep(0)}
            className={`rounded-full px-3 py-1 transition cursor-pointer ${
              step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
            }`}
          >
            6:30 AM Road
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`rounded-full px-3 py-1 transition cursor-pointer ${
              step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
            }`}
          >
            7:00 AM Sky
          </button>
        </div>
      </div>

      <svg viewBox="0 0 420 110" className="w-full h-28 rounded-xl bg-white/[0.04]">
        {step === 0 ? (
          <g>
            <rect x="65" y="34" width="110" height="38" rx="6" fill="#F5B942" />
            <circle cx="90" cy="76" r="10" fill="#E2E8F0" />
            <ellipse cx="152" cy="80" rx="12" ry="5" fill="#94A3B8" />
            <text x="200" y="52" fill="#F8FAFC" fontSize="13" fontWeight="700">
              School Bus Tyre Burst!
            </text>
            <text x="200" y="70" fill="#CBD5E1" fontSize="11" fontWeight="600">
              No spare bus available
            </text>
          </g>
        ) : (
          <g>
            <circle cx="95" cy="48" r="18" fill="#F5B942" />
            <text x="140" y="48" fill="#F8FAFC" fontSize="14" fontWeight="700">
              Bright Sun · Zero Rain
            </text>
            <text x="140" y="68" fill="#CBD5E1" fontSize="11" fontWeight="600">
              Picnic still cancelled because of bus
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}