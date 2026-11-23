import { useState } from 'react';

interface MissionLiveSceneProps {
  missionId: string;
}

export default function MissionLiveScene({ missionId }: MissionLiveSceneProps) {
  const [step, setStep] = useState<0 | 1>(0);
  const [inspected, setInspected] = useState(false);

  // DAY 1 · MISSION 1: The Missing Tiffin (Realistic Classroom Desk & Steel Tiffin Dabba)
  if (missionId === 'd1-m1') {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-[#1B2432] shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111824] border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-sans text-xs font-bold text-white/85">
              Classroom Bench · Tap time to inspect
            </span>
          </div>
          <div className="inline-flex rounded-full bg-white/10 p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setStep(0);
                setInspected(false);
              }}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              10:00 AM
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setInspected(false);
              }}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              12:30 PM
            </button>
          </div>
        </div>

        <div
          onClick={() => setInspected((v) => !v)}
          className="relative h-48 sm:h-56 w-full cursor-pointer select-none overflow-hidden"
          style={{
            background:
              step === 0
                ? 'linear-gradient(180deg, #2D3A4B 0%, #3E4C5E 58%, #6B4423 58%, #4A2E16 100%)'
                : 'linear-gradient(180deg, #3B495C 0%, #52637A 58%, #6B4423 58%, #4A2E16 100%)',
          }}
        >
          {/* Sunlight window beam */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background:
                'radial-gradient(circle at 82% 18%, rgba(255,244,214,0.28) 0%, transparent 60%)',
            }}
          />

          {/* Classroom Door on Left */}
          <div className="absolute left-5 top-4 h-28 w-16 rounded-t-md border-2 border-[#26170B] bg-[#5C3A21] shadow-lg">
            <div className="mt-12 ml-2 h-2.5 w-2.5 rounded-full bg-amber-300 shadow" />
            {step === 0 ? (
              <div className="mx-auto mt-3 w-11 rounded bg-[#142033]/90 py-1 text-center text-[10px] font-extrabold text-amber-200 shadow">
                LOCKED
              </div>
            ) : (
              <div className="mx-auto mt-3 w-11 rounded bg-white/90 py-1 text-center text-[10px] font-extrabold text-[#142033] shadow">
                OPEN
              </div>
            )}
          </div>

          {/* Realistic Brushed Steel Indian Tiffin Box on Wooden Desk */}
          <div className="absolute left-1/2 top-[34%] -translate-x-1/2 flex flex-col items-center">
            {/* Lid (lifts when clicked!) */}
            <div
              className={`w-28 h-5 rounded-t-xl border border-white/40 shadow-md transition-transform duration-500 ${
                inspected ? '-translate-y-6 -rotate-6' : 'translate-y-0'
              }`}
              style={{
                background:
                  'linear-gradient(90deg, #94A3B8 0%, #F8FAFC 35%, #CBD5E1 65%, #64748B 100%)',
              }}
            >
              <div className="mx-auto -mt-1.5 h-2 w-8 rounded-full bg-slate-300 border border-slate-500" />
            </div>

            {/* Inside Tiffin Contents */}
            <div className="w-26 h-12 rounded-b-xl border-x border-b border-white/30 shadow-2xl relative overflow-hidden flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(90deg, #7C8B9E 0%, #E2E8F0 35%, #94A3B8 70%, #475569 100%)',
              }}
            >
              {inspected && (
                <div className="inset-1 absolute rounded-b-lg bg-[#1E293B] flex items-center justify-center px-2 text-center">
                  {step === 0 ? (
                    <span className="text-[11px] font-bold text-amber-300">
                      4 Sweet Mango Slices
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-200">
                      Empty · Clean Box
                    </span>
                  )}
                </div>
              )}
            </div>
            {/* Desk Shadow */}
            <div className="mt-1 h-2.5 w-32 rounded-full bg-black/45 blur-[2px]" />
          </div>

          {/* Bottom Interactive Caption */}
          <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between rounded-xl bg-black/55 backdrop-blur-md px-3.5 py-2 text-xs text-white">
            <span className="font-semibold">
              {step === 0
                ? '10:00 AM: Room locked for assembly'
                : '12:30 PM: Kabir sitting near bench · Hands have no mango smell'}
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
              {inspected ? 'Tap to close lid' : 'Tap tiffin to open'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // DAY 1 · MISSION 2: The Wet Shoes (Dry Asphalt Road vs Verandah Bicycle Wash)
  if (missionId === 'd1-m2') {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-[#1B2432] shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111824] border-b border-white/10">
          <span className="font-sans text-xs font-bold text-white/85">
            Morning Check · Tap location
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-0.5 text-xs font-bold">
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

        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          {step === 0 ? (
            <div
              className="h-full w-full relative"
              style={{
                background:
                  'linear-gradient(180deg, #60A5FA 0%, #BAE6FD 55%, #D6C7B2 55%, #475569 72%, #334155 100%)',
              }}
            >
              {/* Warm Morning Sun */}
              <div className="absolute right-8 top-5 h-12 w-12 rounded-full bg-amber-300 shadow-[0_0_35px_rgba(253,224,71,0.9)]" />
              {/* Dry dusty road texture */}
              <div className="absolute bottom-11 inset-x-0 flex justify-around opacity-60">
                <div className="h-1.5 w-14 rounded bg-amber-100" />
                <div className="h-1.5 w-14 rounded bg-amber-100" />
                <div className="h-1.5 w-14 rounded bg-amber-100" />
              </div>
              <div className="absolute bottom-2.5 inset-x-3 rounded-xl bg-black/60 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white">
                Outside Road & Neighbour Roofs: Completely dry, dusty, zero puddles
              </div>
            </div>
          ) : (
            <div
              className="h-full w-full relative"
              style={{
                background:
                  'linear-gradient(180deg, #CBD5E1 0%, #94A3B8 62%, #475569 62%, #1E293B 100%)',
              }}
            >
              {/* Bicycle Wheel & Water Spray */}
              <div className="absolute left-8 top-8 h-24 w-24 rounded-full border-4 border-slate-900 shadow-lg flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border border-dashed border-slate-300 animate-spin" />
              </div>
              {/* Animated Water Droplets splashing toward shoe rack */}
              <div className="absolute left-32 top-12 flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-300 shadow animate-bounce" />
                <span className="h-3 w-3 rounded-full bg-sky-200 shadow animate-ping" />
                <span className="h-2 w-2 rounded-full bg-sky-300 shadow animate-bounce" />
              </div>
              {/* Wet Puddle & White School Shoes */}
              <div className="absolute right-8 bottom-12 flex flex-col items-center">
                <div className="flex gap-2">
                  <div className="h-6 w-12 rounded-t-xl rounded-b-md bg-white border border-slate-300 shadow-md" />
                  <div className="h-6 w-12 rounded-t-xl rounded-b-md bg-white border border-slate-300 shadow-md" />
                </div>
                <div className="mt-1 h-3 w-32 rounded-full bg-sky-400/50 blur-[1px]" />
              </div>
              <div className="absolute bottom-2.5 inset-x-3 rounded-xl bg-black/65 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white">
                7:00 AM Verandah: Brother washed bicycle right beside the shoe rack
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // DAY 1 · MISSION 3: Fastest Way to School
  if (missionId === 'd1-m3') {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-[#1B2432] shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111824] border-b border-white/10">
          <span className="font-sans text-xs font-bold text-white/85">
            School Bell in 15 Mins · Aarav’s Pocket: ₹20
          </span>
          <button
            type="button"
            onClick={() => setStep((s) => (s === 0 ? 1 : 0))}
            className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#142033] cursor-pointer"
          >
            {step === 0 ? 'Inspect Vehicles' : 'Show Travel Time'}
          </button>
        </div>

        <div className="p-4 grid grid-cols-3 gap-2.5 bg-gradient-to-b from-[#233044] to-[#17202E]">
          {/* Park Walk */}
          <div className="rounded-xl bg-white/8 border border-white/12 p-3 flex flex-col justify-between space-y-2">
            <div className="text-xs font-extrabold text-amber-200">Park Shortcut</div>
            <div className="h-14 rounded-lg bg-gradient-to-b from-amber-200/20 to-stone-700/40 flex items-center justify-center text-xs font-bold text-white">
              {step === 0 ? '12 mins' : '₹0 · Open Gate'}
            </div>
          </div>

          {/* Auto Rickshaw */}
          <div className="rounded-xl bg-white/8 border border-white/12 p-3 flex flex-col justify-between space-y-2">
            <div className="text-xs font-extrabold text-amber-300">Auto Rickshaw</div>
            <div className="h-14 rounded-lg bg-gradient-to-b from-amber-400/25 to-stone-900/50 flex items-center justify-center text-xs font-bold text-white text-center px-1">
              {step === 0 ? '8 mins' : 'Fare ₹30 (Has ₹20)'}
            </div>
          </div>

          {/* Bicycle */}
          <div className="rounded-xl bg-white/8 border border-white/12 p-3 flex flex-col justify-between space-y-2">
            <div className="text-xs font-extrabold text-slate-200">Bicycle</div>
            <div className="h-14 rounded-lg bg-gradient-to-b from-slate-400/20 to-stone-900/50 flex items-center justify-center text-xs font-bold text-white text-center px-1">
              {step === 0 ? '10 mins' : 'Front Tyre Flat'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DAY 1 · MISSION 4: The Drooping Plant
  if (missionId === 'd1-m4') {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-[#1B2432] shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111824] border-b border-white/10">
          <span className="font-sans text-xs font-bold text-white/85">
            Tap to compare Window vs Dark Desk
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Sunny Window
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`rounded-full px-3 py-1 transition cursor-pointer ${
                step === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
              }`}
            >
              Dark Desk
            </button>
          </div>
        </div>

        <div
          className="relative h-48 sm:h-52 w-full flex items-end justify-center pb-11 transition-all duration-500"
          style={{
            background:
              step === 0
                ? 'radial-gradient(circle at 80% 20%, #FDE68A 0%, #3B4D63 55%, #1E293B 100%)'
                : 'linear-gradient(180deg, #161E2B 0%, #243042 75%, #111824 100%)',
          }}
        >
          {/* Terracotta Clay Pot */}
          <div className="relative flex flex-col items-center">
            <div
              className={`w-1.5 bg-amber-200 rounded-full transition-all duration-500 origin-bottom ${
                step === 0 ? 'h-20 rotate-0' : 'h-14 rotate-[38deg]'
              }`}
            />
            <div className="h-3 w-20 rounded-t bg-[#B45309] border-b border-black/30" />
            <div className="h-12 w-16 rounded-b-lg bg-gradient-to-r from-[#92400E] via-[#D97706] to-[#78350F] shadow-xl" />
          </div>
          <div className="absolute bottom-2.5 inset-x-3 rounded-xl bg-black/60 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white">
            {step === 0
              ? 'Sunny Window: 1 cup water daily · Upright firm stem'
              : 'Dark Corner Desk: 1 cup water daily · Drooping pale stem'}
          </div>
        </div>
      </div>
    );
  }

  // DAY 1 · MISSION 5: The Best Juice Shop
  if (missionId === 'd1-m5') {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-[#1B2432] shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111824] border-b border-white/10">
          <span className="font-sans text-xs font-bold text-white/85">
            Both Cost ₹20 · Tap to melt the ice
          </span>
          <button
            type="button"
            onClick={() => setStep((s) => (s === 0 ? 1 : 0))}
            className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#142033] cursor-pointer"
          >
            {step === 0 ? 'Look Inside Glasses' : 'Show Full Glasses'}
          </button>
        </div>

        <div className="h-48 sm:h-52 w-full bg-gradient-to-b from-[#253246] to-[#161E2B] flex items-end justify-around pb-12 px-6 relative">
          {/* Shop A Tall Glass */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-16 h-28 rounded-b-xl border-2 border-white/50 bg-white/10 p-1 flex flex-col justify-end overflow-hidden shadow-xl">
              {step === 0 ? (
                <div className="h-24 w-full rounded-b-lg bg-gradient-to-t from-amber-500 to-amber-300 relative">
                  <div className="grid grid-cols-2 gap-1 p-1">
                    <span className="h-4 rounded bg-white/75" />
                    <span className="h-4 rounded bg-white/75" />
                    <span className="h-4 rounded bg-white/75" />
                    <span className="h-4 rounded bg-white/75" />
                  </div>
                </div>
              ) : (
                <div className="h-12 w-full rounded-b-lg bg-amber-400 transition-all duration-500" />
              )}
            </div>
            <span className="text-xs font-bold text-white">
              Shop A · {step === 0 ? 'Big Cup (₹20)' : 'Only Half Juice'}
            </span>
          </div>

          {/* Shop B Medium Glass */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-16 h-22 rounded-b-xl border-2 border-white/50 bg-white/10 p-1 flex flex-col justify-end overflow-hidden shadow-xl">
              <div className="h-19 w-full rounded-b-lg bg-gradient-to-t from-amber-500 to-amber-300" />
            </div>
            <span className="text-xs font-bold text-white">
              Shop B · {step === 0 ? 'Medium Cup (₹20)' : '100% Pure Juice'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // DAY 2 · MISSION 1: The Two Plant Pots (Interactive Verandah vs Dark Room)
  if (missionId === 'd2-m1') {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-[#1B2432] shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111824] border-b border-white/10">
          <span className="font-sans text-xs font-bold text-white/85">
            10-Day Setup · Tap pot to inspect
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-0.5 text-xs font-bold">
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
              Pot B (Dark Room)
            </button>
          </div>
        </div>

        <div
          className="relative h-48 sm:h-54 w-full flex items-end justify-center pb-12 transition-all duration-500"
          style={{
            background:
              step === 0
                ? 'radial-gradient(circle at 82% 18%, rgba(253,224,71,0.45) 0%, #334155 58%, #1E293B 100%)'
                : 'linear-gradient(180deg, #111824 0%, #1F2937 75%, #0F172A 100%)',
          }}
        >
          {step === 0 && (
            <div className="absolute top-6 right-16 flex flex-col gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-300 animate-bounce" />
              <span className="h-2.5 w-2.5 rounded-full bg-sky-200 animate-pulse" />
            </div>
          )}
          <div className="flex flex-col items-center">
            <div
              className={`w-1.5 rounded-full bg-amber-200 transition-all duration-500 ${
                step === 0 ? 'h-24' : 'h-7'
              }`}
            />
            <div className="h-3 w-22 rounded-t bg-[#B45309]" />
            <div className="h-12 w-18 rounded-b-lg bg-gradient-to-r from-[#92400E] via-[#D97706] to-[#78350F] shadow-2xl" />
          </div>
          <div className="absolute bottom-2.5 inset-x-3 rounded-xl bg-black/60 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white">
            {step === 0
              ? 'Pot A: 6 hrs bright sunlight + 1 full mug water daily'
              : 'Pot B: 0 hrs sunlight + 0 drops water for 10 days'}
          </div>
        </div>
      </div>
    );
  }

  // DAY 2 · MISSION 2: The Lucky Blue Bat (Turf Pitch Delivery Comparison)
  if (missionId === 'd2-m2') {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-[#1B2432] shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111824] border-b border-white/10">
          <span className="font-sans text-xs font-bold text-white/85">
            Both Bats: 900g Willow · Tap match
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-0.5 text-xs font-bold">
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

        <div
          className="relative h-48 sm:h-52 w-full overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, #334155 0%, #475569 58%, #C2A878 58%, #9A7B4F 100%)',
          }}
        >
          {/* Pitch Crease Lines */}
          <div className="absolute bottom-14 left-12 h-8 w-1.5 bg-white/80" />
          <div className="absolute bottom-14 right-12 h-8 w-1.5 bg-white/80" />

          {/* Leather Cricket Ball */}
          <div
            className={`absolute h-5 w-5 rounded-full bg-gradient-to-br from-rose-500 to-red-900 border border-white/40 shadow-lg transition-all duration-700 ${
              step === 0
                ? 'left-1/2 top-14 -translate-x-1/2 animate-bounce'
                : 'right-20 top-24 animate-ping'
            }`}
          />

          <div className="absolute bottom-2.5 inset-x-3 rounded-xl bg-black/60 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white">
            {step === 0
              ? 'Saturday: Class 3 kids bowling slow underarm balls on small ground'
              : 'Last Week: Class 8 boys bowling fast overarm balls on big ground'}
          </div>
        </div>
      </div>
    );
  }

  // DAY 2 · MISSION 3: The Cold Steel Spoon (Interactive Heat-Flow Inspection)
  if (missionId === 'd2-m3') {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-[#1B2432] shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111824] border-b border-white/10">
          <span className="font-sans text-xs font-bold text-white/85">
            Kitchen Shelf All Night · Tap spoon to touch
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-0.5 text-xs font-bold">
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

        <div className="relative h-48 sm:h-52 w-full bg-gradient-to-b from-[#2A3648] to-[#17202D] flex flex-col items-center justify-center pb-8 px-6">
          {/* Realistic Spoon Silhouette with Metallic or Wood Grain Gradient */}
          <div className="flex items-center">
            <div
              className="h-4 w-32 rounded-l-full shadow-lg transition-all duration-300"
              style={{
                background:
                  step === 0
                    ? 'linear-gradient(180deg, #F8FAFC 0%, #94A3B8 55%, #475569 100%)'
                    : 'linear-gradient(180deg, #D97706 0%, #92400E 60%, #451A03 100%)',
              }}
            />
            <div
              className="h-12 w-20 -ml-2 rounded-full shadow-xl transition-all duration-300"
              style={{
                background:
                  step === 0
                    ? 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #94A3B8 60%, #334155 100%)'
                    : 'radial-gradient(circle at 35% 35%, #F59E0B 0%, #92400E 65%, #451A03 100%)',
              }}
            />
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-200">
            <span>Warm Finger (37°C)</span>
            <span className="tracking-widest">
              {step === 0 ? '→ → → Heat rushes out FAST' : '→ Heat leaves very slowly'}
            </span>
          </div>

          <div className="absolute bottom-2.5 inset-x-3 rounded-xl bg-black/60 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white">
            Both spoons sat on the exact same open shelf all night (no fridge)
          </div>
        </div>
      </div>
    );
  }

  // DAY 2 · MISSION 4: The Carrom Club Poster (100 Club Members vs 10 Sent)
  if (missionId === 'd2-m4') {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-[#1B2432] shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111824] border-b border-white/10">
          <span className="font-sans text-xs font-bold text-white/85">
            Poster: “9 out of 10 won!” · Tap view
          </span>
          <div className="inline-flex rounded-full bg-white/10 p-0.5 text-xs font-bold">
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
              All Club Members (100)
            </button>
          </div>
        </div>

        <div className="relative h-48 sm:h-52 w-full bg-gradient-to-b from-[#233044] to-[#151D29] flex flex-col items-center justify-center pb-9 px-4">
          {step === 0 ? (
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow ${
                    i < 9
                      ? 'bg-amber-300 text-[#142033]'
                      : 'bg-slate-600 text-white/70'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-20 gap-1 max-w-md">
              {Array.from({ length: 100 }, (_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full ${
                    i < 9
                      ? 'bg-amber-300'
                      : i === 9
                      ? 'bg-slate-300'
                      : 'bg-white/15'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="absolute bottom-2.5 inset-x-3 rounded-xl bg-black/60 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white">
            {step === 0
              ? 'Only the top 10 players went to play · 9 won medals'
              : '90 club students stayed back at school · Only 9 out of 100 won'}
          </div>
        </div>
      </div>
    );
  }

  // DAY 2 · MISSION 5: The Cancelled Picnic (6:30 AM Bus Tyre Burst vs 7:00 AM Bright Sun)
  return (
    <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-[#1B2432] shadow-inner">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#111824] border-b border-white/10">
        <span className="font-sans text-xs font-bold text-white/85">
          Rule: “If it rains → Picnic cancelled”
        </span>
        <div className="inline-flex rounded-full bg-white/10 p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setStep(0)}
            className={`rounded-full px-3 py-1 transition cursor-pointer ${
              step === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
            }`}
          >
            6:30 AM Highway
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

      <div
        className="relative h-48 sm:h-52 w-full overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #60A5FA 0%, #BAE6FD 56%, #475569 56%, #1E293B 100%)',
        }}
      >
        <div className="absolute right-8 top-4 h-11 w-11 rounded-full bg-amber-300 shadow-[0_0_30px_rgba(253,224,71,0.85)]" />

        {step === 0 ? (
          <div className="absolute left-8 bottom-12 flex items-end">
            {/* School Bus Body */}
            <div className="h-16 w-40 rounded-t-xl rounded-bl-md bg-gradient-to-b from-amber-300 to-amber-500 border border-amber-700 shadow-xl px-2.5 pt-2 flex gap-1.5">
              <div className="h-5 w-7 rounded bg-slate-800/80" />
              <div className="h-5 w-7 rounded bg-slate-800/80" />
              <div className="h-5 w-7 rounded bg-slate-800/80" />
              <div className="h-5 w-7 rounded bg-slate-800/80" />
            </div>
            {/* Front Good Tyre & Rear Flat Burst Tyre */}
            <div className=" -ml-36 -mb-2 h-7 w-7 rounded-full bg-slate-900 border-2 border-slate-400" />
            <div className="ml-20 -mb-2 h-3.5 w-9 rounded-full bg-slate-900 border border-slate-400" />
          </div>
        ) : (
          <div className="absolute left-8 top-10 rounded-xl bg-white/90 px-4 py-2.5 text-xs font-extrabold text-[#142033] shadow-lg">
            Clear Blue Sky · 0% Rain · Dry Roads
          </div>
        )}

        <div className="absolute bottom-2.5 inset-x-3 rounded-xl bg-black/65 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white">
          {step === 0
            ? '6:30 AM: Hired school bus tyre burst on highway — no spare bus'
            : '7:00 AM: Bright sun outside, yet picnic cancelled due to bus breakdown'}
        </div>
      </div>
    </div>
  );
}