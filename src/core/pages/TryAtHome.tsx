import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../auth/ChildContext';
import { useApp } from '../store';
import { analyzeThinking } from '../../features/parent-insights/thinkingAnalysis';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';

interface HomeMoment {
  id: string;
  skill: string;
  title: string;
  prompt: string;
  nudge: string;
  reactions: string[];
}

const HOME_MOMENTS: HomeMoment[] = [
  {
    id: 'hm-1',
    skill: 'Spotting missing info',
    title: 'Everyday moment 01',
    prompt: '[Add natural everyday question or activity for your child here]',
    nudge: 'Pause for 10 seconds, then ask: “What else would you want to know?”',
    reactions: ['Asked a follow-up', 'Thought deeply', 'Sparked a debate'],
  },
  {
    id: 'hm-2',
    skill: 'Updating on evidence',
    title: 'Everyday moment 02',
    prompt: '[Add natural everyday question or activity for your child here]',
    nudge: 'Ask gently: “What new clue could change your first guess?”',
    reactions: ['Asked a follow-up', 'Thought deeply', 'Sparked a debate'],
  },
  {
    id: 'hm-3',
    skill: 'Giving reasons',
    title: 'Everyday moment 03',
    prompt: '[Add natural everyday question or activity for your child here]',
    nudge: 'Ask: “What makes that choice feel strongest to you?”',
    reactions: ['Asked a follow-up', 'Thought deeply', 'Sparked a debate'],
  },
];

export default function TryAtHome() {
  const { children: familyKids } = useAuth();
  const { activeChild, setActiveChild } = useChild();

  const childBuckets = useApp((s) => s.childBuckets);
  const activeChildIdInStore = useApp((s) => s.activeChildId);
  const storeUser = useApp((s) => s.user);
  const storeSessions = useApp((s) => s.sessions);
  const storeResponses = useApp((s) => s.responses);

  const [log, setLog] = useState<Record<string, { tried: boolean; tag?: string }>>({});

  const firstName =
    activeChild?.name?.trim().split(/\s+/)[0] ||
    storeUser?.name?.trim().split(/\s+/)[0] ||
    'Your Child';
  const grade = activeChild?.class_level ?? storeUser?.grade ?? 7;

  const record = useMemo(() => {
    if (!activeChild) {
      return { sessions: storeSessions, responses: storeResponses };
    }
    const bucket = childBuckets[activeChild.id];
    if (bucket) {
      return { sessions: bucket.sessions, responses: bucket.responses };
    }
    if (activeChildIdInStore === activeChild.id) {
      return { sessions: storeSessions, responses: storeResponses };
    }
    return { sessions: [], responses: {} };
  }, [activeChild, childBuckets, activeChildIdInStore, storeSessions, storeResponses]);

  const { studentSummary } = useMemo(
    () => analyzeThinking(record.sessions, record.responses, firstName),
    [record, firstName]
  );

  const tailoredNote = useMemo(() => {
    const band = grade <= 6 ? 'Classes 5–6' : grade <= 8 ? 'Classes 7–8' : 'Classes 9–10';
    if (studentSummary.recheckMoments >= 2) {
      return {
        headline: `Tailored for ${firstName} (${band}) — ready for deeper perspectives`,
        body: `${firstName} already pauses to re-check ideas. At home, invite ${firstName} to compare two sides of a real-life choice before settling.`,
      };
    }
    if (studentSummary.totalChecksTried >= 2) {
      return {
        headline: `Tailored for ${firstName} (${band}) — building steady curiosity`,
        body: `${firstName} is checking clues in activities. Keep home questions casual and give space to explain why without rushing to an answer.`,
      };
    }
    return {
      headline: `Tailored for ${firstName} (${band}) — starting out naturally`,
      body: `Keep everyday questions light and open. Let ${firstName} wonder out loud with zero pressure to get a "school" answer.`,
    };
  }, [firstName, grade, studentSummary]);

  const triedCount = Object.values(log).filter((x) => x.tried).length;

  return (
    <div className="min-h-screen cx-paper-canvas pb-28 pt-6 text-[#142033] font-sans">
      <main className="mx-auto max-w-6xl px-4 sm:px-8 space-y-12">
        {/* HEADER */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#142033]/10 pb-6">
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#142033]">
            Try at Home with {firstName}
          </h1>

          <div className="flex items-center gap-3">
            {familyKids.length > 1 && (
              <div className="inline-flex rounded-full border border-[#142033]/12 bg-white p-1">
                {familyKids.map((kid) => (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => {
                      triggerDialTick(true);
                      setActiveChild(kid);
                    }}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold cursor-pointer ${
                      activeChild?.id === kid.id
                        ? 'bg-[#142033] text-white'
                        : 'text-[#586579]'
                    }`}
                  >
                    {kid.name}
                  </button>
                ))}
              </div>
            )}

            <span className="rounded-full bg-[#142033] px-4 py-1.5 font-mono-tech text-xs font-bold text-[#55E2CE]">
              {triedCount} tried
            </span>
          </div>
        </div>

        {/* TAILORED FOR KID */}
        <section className="rounded-[28px] bg-[#142033] p-7 text-white shadow-lg space-y-2">
          <div className="font-mono-tech text-[11px] font-bold uppercase tracking-widest text-[#55E2CE]">
            TAILORED FOR {firstName.toUpperCase()}
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold">
            {tailoredNote.headline}
          </h2>
          <p className="text-sm text-white/80 leading-relaxed max-w-3xl">
            {tailoredNote.body}
          </p>
        </section>

        {/* 3 HOME MOMENTS */}
        <section className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {HOME_MOMENTS.map((item) => {
              const entry = log[item.id] ?? { tried: false };
              return (
                <div
                  key={item.id}
                  className={`rounded-3xl border p-6 shadow-sm flex flex-col justify-between gap-5 transition ${
                    entry.tried
                      ? 'border-[#087F80]/40 bg-[#087F80]/8'
                      : 'border-[#142033]/10 bg-white'
                  }`}
                >
                  <div className="space-y-3">
                    <span className="inline-block rounded-full bg-[#087F80]/10 px-3 py-1 text-[11px] font-extrabold text-[#087F80]">
                      {item.skill}
                    </span>
                    <h3 className="font-display text-xl font-extrabold text-[#142033]">
                      {item.title}
                    </h3>
                    <p className="text-sm font-semibold text-[#142033] leading-relaxed">
                      {item.prompt}
                    </p>
                    <p className="text-xs text-[#586579] leading-relaxed">
                      {item.nudge}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[#142033]/10">
                    <button
                      type="button"
                      onClick={() => {
                        triggerSoftConfirm(true);
                        setLog((prev) => ({
                          ...prev,
                          [item.id]: { ...entry, tried: !entry.tried },
                        }));
                      }}
                      className={`w-full rounded-full py-2.5 text-xs font-extrabold transition cursor-pointer ${
                        entry.tried
                          ? 'bg-[#087F80] text-white'
                          : 'bg-[#142033] text-white hover:bg-[#087F80]'
                      }`}
                    >
                      {entry.tried ? '✓ Marked tried' : 'Mark as tried'}
                    </button>

                    {entry.tried && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.reactions.map((tag) => {
                          const picked = entry.tag === tag;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                triggerDialTick(true);
                                setLog((prev) => ({
                                  ...prev,
                                  [item.id]: { tried: true, tag },
                                }));
                              }}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                                picked
                                  ? 'bg-[#142033] text-[#55E2CE]'
                                  : 'border border-[#142033]/15 bg-white text-[#142033]'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ONE GOLDEN RULE */}
        <section className="rounded-3xl border border-[#142033]/12 bg-white p-6 sm:p-7 shadow-sm space-y-1.5">
          <div className="font-mono-tech text-[11px] font-bold uppercase tracking-widest text-[#087F80]">
            The 10-Second Rule
          </div>
          <p className="font-display text-lg sm:text-xl font-extrabold text-[#142033]">
            After asking, stay quiet for 10 seconds. Let {firstName} think without hints or corrections.
          </p>
        </section>
      </main>
    </div>
  );
}