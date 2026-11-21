import { useMemo, useState } from 'react';
import { useChild } from '../auth/ChildContext';
import { useApp } from '../store';
import type { EducationBoard } from '../auth/AuthContext';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';

export type SheetSubject =
  | 'Science'
  | 'History'
  | 'Geography'
  | 'Extra Curricular';

export interface ThinkingSheetItem {
  id: string;
  board: EducationBoard | 'ALL';
  classLevel: number | 'ALL';
  subject: SheetSubject;
  topicName: string;
  hook: string;
  twistPrompt: string;
  catchPrompt: string;
  viewpoints: [string, string];
}

const SUBJECTS: SheetSubject[] = [
  'Science',
  'History',
  'Geography',
  'Extra Curricular',
];

/**
 * Drop your class-wise CBSE and Maharashtra State Board chapters here.
 * Any item with board: 'ALL' & classLevel: 'ALL' acts as a fallback template
 * until you fill in that specific class + board chapter.
 */
const THINKING_SHEET_BANK: ThinkingSheetItem[] = [
  {
    id: 'tpl-science',
    board: 'ALL',
    classLevel: 'ALL',
    subject: 'Science',
    topicName: '[Add Science chapter / topic name]',
    hook: '[Add one-line hook]',
    twistPrompt: '[Add chapter-based "What if?" or real-world situation here]',
    catchPrompt:
      '[Add two student viewpoints where one has a reasoning gap here — options shuffled per student, no A/B/C labels]',
    viewpoints: ['[Add viewpoint 1]', '[Add viewpoint 2]'],
  },
  {
    id: 'tpl-history',
    board: 'ALL',
    classLevel: 'ALL',
    subject: 'History',
    topicName: '[Add History chapter / topic name]',
    hook: '[Add one-line hook]',
    twistPrompt: '[Add chapter-based "What if?" or real-world situation here]',
    catchPrompt:
      '[Add two student viewpoints where one has a reasoning gap here — options shuffled per student, no A/B/C labels]',
    viewpoints: ['[Add viewpoint 1]', '[Add viewpoint 2]'],
  },
  {
    id: 'tpl-geography',
    board: 'ALL',
    classLevel: 'ALL',
    subject: 'Geography',
    topicName: '[Add Geography chapter / topic name]',
    hook: '[Add one-line hook]',
    twistPrompt: '[Add chapter-based "What if?" or real-world situation here]',
    catchPrompt:
      '[Add two student viewpoints where one has a reasoning gap here — options shuffled per student, no A/B/C labels]',
    viewpoints: ['[Add viewpoint 1]', '[Add viewpoint 2]'],
  },
  {
    id: 'tpl-extra',
    board: 'ALL',
    classLevel: 'ALL',
    subject: 'Extra Curricular',
    topicName: '[Add Extra Curricular topic name]',
    hook: '[Add one-line hook]',
    twistPrompt: '[Add everyday real-world situation or "What if?" here]',
    catchPrompt:
      '[Add two student viewpoints where one has a reasoning gap here — options shuffled per student, no A/B/C labels]',
    viewpoints: ['[Add viewpoint 1]', '[Add viewpoint 2]'],
  },
];

export default function ThinkingSheets() {
  const { activeChild } = useChild();
  const user = useApp((s) => s.user);
  const responses = useApp((s) => s.responses);
  const saveResponse = useApp((s) => s.saveResponse);

  const childId = activeChild?.id || user?.childId || 'student';
  const classLevel = activeChild?.class_level ?? user?.grade ?? 6;
  const board: EducationBoard =
    (activeChild as { board?: EducationBoard | null } | null)?.board || 'CBSE';

  const [subject, setSubject] = useState<SheetSubject>('Science');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [twistNote, setTwistNote] = useState('');
  const [pickedViewpoint, setPickedViewpoint] = useState<number | null>(null);
  const [reasonNote, setReasonNote] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const visibleTopics = useMemo(() => {
    const exact = THINKING_SHEET_BANK.filter(
      (item) =>
        item.subject === subject &&
        (item.board === board || item.board === 'ALL') &&
        (item.classLevel === classLevel || item.classLevel === 'ALL')
    );
    const specific = exact.filter(
      (item) => item.board !== 'ALL' && item.classLevel !== 'ALL'
    );
    return specific.length > 0 ? specific : exact;
  }, [subject, board, classLevel]);

  const activeTopic = useMemo(
    () =>
      visibleTopics.find((t) => t.id === selectedTopicId) ?? visibleTopics[0],
    [visibleTopics, selectedTopicId]
  );

  // Per-student deterministic shuffle, zero A/B/C labels
  const shuffledViewpoints = useMemo(() => {
    if (!activeTopic) return [];
    const list = activeTopic.viewpoints.map((text, origIdx) => ({
      text,
      origIdx,
    }));
    const hash = `${childId}:${activeTopic.id}`
      .split('')
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return hash % 2 === 1 ? [...list].reverse() : list;
  }, [childId, activeTopic]);

  const responseKey = activeTopic
    ? `sheet:${board}:c${classLevel}:${activeTopic.id}`
    : '';
  const isDone = Boolean(responseKey && responses[responseKey]);

  const handleSave = async () => {
    if (!activeTopic || !responseKey) return;
    triggerSoftConfirm(true);
    await saveResponse(responseKey, {
      engine: 'thinking-sheet',
      text: reasonNote.trim() || twistNote.trim(),
      picked: pickedViewpoint ?? undefined,
    });
    setSavedNotice(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] pb-32 pt-4 text-[#142033]">
      <div className="mx-auto max-w-5xl space-y-8 px-2 sm:px-4">
        {/* HEADER & SUBJECT TABS */}
        <header className="cx-hairline-b pb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#142033]">
                Thinking Sheets
              </h1>
              <p className="mt-1 text-sm sm:text-base text-[#586579]">
                Solve each topic on your own after class.
              </p>
            </div>

            <span className="rounded-full border border-[#142033]/15 bg-white px-3.5 py-1.5 font-mono-tech text-[11px] font-bold text-[#142033]">
              Class {classLevel} · {board}
            </span>
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Subjects"
          >
            {SUBJECTS.map((tab) => {
              const active = subject === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    triggerDialTick(false);
                    setSubject(tab);
                    setSelectedTopicId('');
                    setStep(1);
                    setPickedViewpoint(null);
                    setSavedNotice(false);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                    active
                      ? 'bg-[#142033] text-white'
                      : 'border border-[#142033]/12 bg-white text-[#586579] hover:text-[#142033]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </header>

        {/* TOPIC LIST + 3-STEP INTERACTIVE CONSOLE */}
        {activeTopic && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr] items-start">
            <div className="space-y-3">
              {visibleTopics.map((topic) => {
                const key = `sheet:${board}:c${classLevel}:${topic.id}`;
                const done = Boolean(responses[key]);
                const selected = topic.id === activeTopic.id;

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      triggerDialTick(true);
                      setSelectedTopicId(topic.id);
                      setStep(1);
                      setPickedViewpoint(null);
                      setSavedNotice(false);
                    }}
                    className={`w-full rounded-2xl border p-4 text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                      selected
                        ? 'border-[#087F80] bg-[#087F80]/8'
                        : 'border-[#142033]/12 bg-white hover:border-[#142033]'
                    }`}
                  >
                    <div>
                      <div className="font-display text-sm font-extrabold text-[#142033]">
                        {topic.topicName}
                      </div>
                      <p className="mt-0.5 text-xs text-[#586579]">
                        {topic.hook}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#142033]/12 bg-[#F7F6F1] px-3 py-1 font-mono-tech text-[10px] font-bold uppercase text-[#142033]">
                      {done ? 'Done' : 'Start'}
                    </span>
                  </button>
                );
              })}
            </div>

            <section className="rounded-[32px] bg-[#142033] cx-instrument-grid p-7 sm:p-8 text-white shadow-[var(--shadow-instrument)] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#55E2CE]">
                    {activeTopic.subject}
                  </span>
                  <h2 className="font-display text-xl font-extrabold text-white mt-0.5">
                    {activeTopic.topicName}
                  </h2>
                </div>

                <div className="flex gap-1.5">
                  {([1, 2, 3] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        triggerDialTick(false);
                        setStep(n);
                      }}
                      className={`rounded-full px-3.5 py-1 font-mono-tech text-xs font-bold transition cursor-pointer ${
                        step === n
                          ? 'bg-[#55E2CE] text-[#142033]'
                          : 'bg-white/10 text-white/75'
                      }`}
                    >
                      Step {n}
                    </button>
                  ))}
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-display text-2xl font-extrabold text-white">
                    The Twist
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {activeTopic.twistPrompt}
                  </p>
                  <textarea
                    rows={3}
                    value={twistNote}
                    onChange={(e) => setTwistNote(e.target.value)}
                    placeholder="Write what you notice..."
                    className="w-full rounded-2xl border border-white/15 bg-[#1B2A42] p-4 text-sm text-white outline-none focus:border-[#55E2CE]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      triggerDialTick(true);
                      setStep(2);
                    }}
                    className="cx-action-pill bg-[#55E2CE] px-6 py-3 text-xs text-[#142033] hover:bg-white cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-display text-2xl font-extrabold text-white">
                    Spot the Catch
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {activeTopic.catchPrompt}
                  </p>
                  <div className="space-y-2.5">
                    {shuffledViewpoints.map((vp) => (
                      <button
                        key={vp.origIdx}
                        type="button"
                        onClick={() => {
                          triggerDialTick(true);
                          setPickedViewpoint(vp.origIdx);
                        }}
                        className={`w-full rounded-2xl border p-4 text-left text-sm font-semibold transition cursor-pointer ${
                          pickedViewpoint === vp.origIdx
                            ? 'border-[#55E2CE] bg-[#55E2CE]/20 text-white'
                            : 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10'
                        }`}
                      >
                        {vp.text}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-bold text-white/80 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerDialTick(true);
                        setStep(3);
                      }}
                      className="cx-action-pill bg-[#55E2CE] px-6 py-2.5 text-xs text-[#142033] hover:bg-white cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-display text-2xl font-extrabold text-white">
                    Your Reason
                  </h3>
                  <p className="text-sm text-white/80">
                    Why do you think that? Write a short line in your own words.
                  </p>
                  <textarea
                    rows={3}
                    value={reasonNote}
                    onChange={(e) => {
                      setReasonNote(e.target.value);
                      setSavedNotice(false);
                    }}
                    placeholder="Write a short line in your own words..."
                    className="w-full rounded-2xl border border-white/15 bg-[#1B2A42] p-4 text-sm text-white outline-none focus:border-[#55E2CE]"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-bold text-white/80 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      className="cx-action-pill bg-[#55E2CE] px-7 py-2.5 text-xs text-[#142033] hover:bg-white cursor-pointer"
                    >
                      Save
                    </button>
                    {(savedNotice || isDone) && (
                      <span className="font-mono-tech text-xs font-bold text-[#55E2CE]">
                        Saved
                      </span>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}