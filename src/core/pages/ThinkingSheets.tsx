import { useMemo, useState } from 'react';
import { useChild } from '../auth/ChildContext';
import { useApp } from '../store';
import type { EducationBoard } from '../auth/AuthContext';
import {
  FREE_THINKING_SHEET_LIMIT,
  TRIAL_DAYS,
  TRIAL_PAYMENT_LINK,
  TRIAL_PRICE_INR,
} from '../config';
import { isDevMode } from '../auth/devMode';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';

export type SheetSubject =
  | 'Science'
  | 'History'
  | 'Geography'
  | 'Extra Curricular';

export interface SheetQuestion {
  id: string;
  twistPrompt: string;
  catchPrompt: string;
  viewpoints: [string, string];
}

export interface ThinkingSheetChapter {
  id: string;
  board: EducationBoard | 'ALL';
  classLevel: number | 'ALL';
  subject: SheetSubject;
  topicName: string;
  hook: string;
  /** Flexible bank: add 12, 15, or 20+ questions per chapter */
  questions: SheetQuestion[];
}

const SUBJECTS: SheetSubject[] = [
  'Science',
  'History',
  'Geography',
  'Extra Curricular',
];

const STUDENT_NAME_PAIRS: Array<[string, string]> = [
  ['Rohan', 'Ananya'],
  ['Kabir', 'Meera'],
  ['Aarav', 'Diya'],
  ['Vihaan', 'Saanvi'],
  ['Aditya', 'Kavya'],
];

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function deterministicShuffle<T>(items: T[], seedKey: string): T[] {
  const arr = [...items];
  let seed = hashString(seedKey);
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function applyStudentNames(text: string, seedKey: string): string {
  const pair = STUDENT_NAME_PAIRS[hashString(seedKey) % STUDENT_NAME_PAIRS.length];
  return text.replace(/\{S1\}/g, pair[0]).replace(/\{S2\}/g, pair[1]);
}

function buildFlexibleQuestions(prefix: string, count = 12): SheetQuestion[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `${prefix}-q${idx + 1}`,
    twistPrompt: `[Add chapter "What if?" situation #${idx + 1} here — use {S1} and {S2} for auto-swapped names]`,
    catchPrompt:
      'Compare {S1} and {S2}. Which viewpoint has a hidden gap in reasoning?',
    viewpoints: [
      `{S1}: [Add viewpoint 1 for question #${idx + 1}]`,
      `{S2}: [Add viewpoint 2 for question #${idx + 1}]`,
    ],
  }));
}

const CHAPTER_BANK: ThinkingSheetChapter[] = [
  {
    id: 'tpl-science',
    board: 'ALL',
    classLevel: 'ALL',
    subject: 'Science',
    topicName: '[Add Science chapter / syllabus topic name]',
    hook: '[Add one-line hook]',
    questions: buildFlexibleQuestions('sci', 12),
  },
  {
    id: 'tpl-history',
    board: 'ALL',
    classLevel: 'ALL',
    subject: 'History',
    topicName: '[Add History chapter / syllabus topic name]',
    hook: '[Add one-line hook]',
    questions: buildFlexibleQuestions('his', 12),
  },
  {
    id: 'tpl-geography',
    board: 'ALL',
    classLevel: 'ALL',
    subject: 'Geography',
    topicName: '[Add Geography chapter / syllabus topic name]',
    hook: '[Add one-line hook]',
    questions: buildFlexibleQuestions('geo', 12),
  },
  {
    id: 'tpl-extra',
    board: 'ALL',
    classLevel: 'ALL',
    subject: 'Extra Curricular',
    topicName: '[Add Extra Curricular topic name]',
    hook: '[Add one-line hook]',
    questions: buildFlexibleQuestions('ext', 12),
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

  const dev = isDevMode();
  const [devPaidPreview, setDevPaidPreview] = useState(false);
  const isPaid =
    devPaidPreview ||
    (typeof window !== 'undefined' &&
      localStorage.getItem('cubitx-plan') === 'paid');

  const [subject, setSubject] = useState<SheetSubject>('Science');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [questionIdx, setQuestionIdx] = useState<number>(0);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [twistNote, setTwistNote] = useState('');
  const [pickedViewpoint, setPickedViewpoint] = useState<number | null>(null);
  const [reasonNote, setReasonNote] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const visibleChapters = useMemo(() => {
    const exact = CHAPTER_BANK.filter(
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

  const activeChapter = useMemo(
    () =>
      visibleChapters.find((c) => c.id === selectedChapterId) ??
      visibleChapters[0],
    [visibleChapters, selectedChapterId]
  );

  // Per-student tailored order so classmates do not get identical question numbers
  const tailoredQuestions = useMemo(() => {
    if (!activeChapter) return [];
    return deterministicShuffle(
      activeChapter.questions,
      `${childId}:${activeChapter.id}`
    );
  }, [activeChapter, childId]);

  const unlockedCount = isPaid
    ? tailoredQuestions.length
    : Math.min(FREE_THINKING_SHEET_LIMIT, tailoredQuestions.length);

  const isQuestionLocked = !isPaid && questionIdx >= FREE_THINKING_SHEET_LIMIT;
  const activeQuestion = tailoredQuestions[questionIdx] ?? tailoredQuestions[0];

  const shuffledViewpoints = useMemo(() => {
    if (!activeQuestion) return [];
    const seed = `${childId}:${activeQuestion.id}`;
    const list = activeQuestion.viewpoints.map((raw, origIdx) => ({
      text: applyStudentNames(raw, seed),
      origIdx,
    }));
    return hashString(seed) % 2 === 1 ? [...list].reverse() : list;
  }, [childId, activeQuestion]);

  const responseKey =
    activeChapter && activeQuestion
      ? `sheet:${board}:c${classLevel}:${activeChapter.id}:${activeQuestion.id}`
      : '';
  const isDone = Boolean(responseKey && responses[responseKey]);

  const handleSave = async () => {
    if (!activeQuestion || !responseKey || isQuestionLocked) return;
    triggerSoftConfirm(true);
    await saveResponse(responseKey, {
      engine: 'thinking-sheet',
      text: reasonNote.trim() || twistNote.trim(),
      picked: pickedViewpoint ?? undefined,
    });
    setSavedNotice(true);
  };

  const resetInputsForQuestion = (nextIdx: number) => {
    setQuestionIdx(nextIdx);
    setStep(1);
    setTwistNote('');
    setPickedViewpoint(null);
    setReasonNote('');
    setSavedNotice(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] pb-20 pt-4 text-[#142033]">
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

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#142033]/15 bg-white px-3.5 py-1.5 font-mono-tech text-[11px] font-bold text-[#142033]">
                Class {classLevel} · {board}
              </span>
              {dev && (
                <button
                  type="button"
                  onClick={() => setDevPaidPreview((p) => !p)}
                  className="rounded-full border border-[#087F80]/30 bg-[#087F80]/10 px-3 py-1.5 font-mono-tech text-[10px] font-bold text-[#087F80] cursor-pointer"
                >
                  DEV: {isPaid ? 'Paid (12+)' : `Free (${FREE_THINKING_SHEET_LIMIT})`}
                </button>
              )}
            </div>
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
                    setSelectedChapterId('');
                    resetInputsForQuestion(0);
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

        {/* TOPIC LIST + 3-STEP CONSOLE */}
        {activeChapter && activeQuestion && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.82fr_1.18fr] items-start">
            <div className="space-y-3">
              {visibleChapters.map((chapter) => {
                const selected = chapter.id === activeChapter.id;
                const solvedInChapter = chapter.questions.filter((q) =>
                  Boolean(
                    responses[
                      `sheet:${board}:c${classLevel}:${chapter.id}:${q.id}`
                    ]
                  )
                ).length;

                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => {
                      triggerDialTick(true);
                      setSelectedChapterId(chapter.id);
                      resetInputsForQuestion(0);
                    }}
                    className={`w-full rounded-2xl border p-4 text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                      selected
                        ? 'border-[#087F80] bg-[#087F80]/8'
                        : 'border-[#142033]/12 bg-white hover:border-[#142033]'
                    }`}
                  >
                    <div>
                      <div className="font-display text-sm font-extrabold text-[#142033]">
                        {chapter.topicName}
                      </div>
                      <p className="mt-0.5 text-xs text-[#586579]">
                        {chapter.hook}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#142033]/12 bg-[#F7F6F1] px-3 py-1 font-mono-tech text-[10px] font-bold text-[#142033] tabular-nums">
                      {solvedInChapter}/{unlockedCount}
                    </span>
                  </button>
                );
              })}

              {!isPaid && (
                <div className="rounded-2xl border border-[#142033]/12 bg-white p-4 space-y-2">
                  <div className="font-mono-tech text-[10px] font-bold uppercase tracking-wider text-[#087F80]">
                    Free Plan · {FREE_THINKING_SHEET_LIMIT} of{' '}
                    {tailoredQuestions.length} Open
                  </div>
                  <p className="text-xs text-[#586579] leading-relaxed">
                    Unlock all {tailoredQuestions.length}+ tailored questions
                    per chapter for ₹{TRIAL_PRICE_INR} ({TRIAL_DAYS} days).
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        TRIAL_PAYMENT_LINK,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                    className="cx-action-pill bg-[#142033] px-4 py-2 text-[11px] text-white hover:bg-[#087F80] cursor-pointer"
                  >
                    Unlock All Questions →
                  </button>
                </div>
              )}
            </div>

            {/* 3-STEP THINKING SHEET CONSOLE */}
            <section className="rounded-[28px] bg-[#142033] p-6 sm:p-8 text-white shadow-[var(--shadow-device)] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#55E2CE]">
                    {activeChapter.subject} · Tailored Set
                  </span>
                  <h2 className="font-display text-xl font-extrabold text-white mt-0.5">
                    {activeChapter.topicName}
                  </h2>
                </div>

                {!isQuestionLocked && (
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
                )}
              </div>

              {/* QUESTION STRIP (4 OPEN ON FREE, 12+ ON PAID) */}
              <div className="flex flex-wrap gap-1.5">
                {tailoredQuestions.map((q, idx) => {
                  const locked = !isPaid && idx >= FREE_THINKING_SHEET_LIMIT;
                  const active = idx === questionIdx;
                  const done = Boolean(
                    responses[
                      `sheet:${board}:c${classLevel}:${activeChapter.id}:${q.id}`
                    ]
                  );

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        triggerDialTick(false);
                        resetInputsForQuestion(idx);
                      }}
                      className={`rounded-lg px-2.5 py-1 font-mono-tech text-[11px] font-bold transition cursor-pointer ${
                        active
                          ? 'bg-[#55E2CE] text-[#142033]'
                          : locked
                          ? 'bg-white/5 text-white/40 hover:bg-white/10'
                          : done
                          ? 'bg-[#087F80] text-white'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      Q{idx + 1}
                      {locked ? ' 🔒' : ''}
                    </button>
                  );
                })}
              </div>

              {isQuestionLocked ? (
                <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-center space-y-4">
                  <div className="font-mono-tech text-[11px] font-bold uppercase tracking-widest text-[#F5B942]">
                    Question {questionIdx + 1} of {tailoredQuestions.length}
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-white">
                    Unlock all {tailoredQuestions.length}+ questions in this chapter
                  </h3>
                  <p className="mx-auto max-w-md text-xs sm:text-sm text-white/75 leading-relaxed">
                    Free plan includes {FREE_THINKING_SHEET_LIMIT} thinking
                    questions per chapter. Unlock the complete board-aligned
                    bank for ₹{TRIAL_PRICE_INR} ({TRIAL_DAYS} days).
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        TRIAL_PAYMENT_LINK,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                    className="cx-action-pill bg-[#55E2CE] px-6 py-3 text-xs text-[#142033] hover:bg-white cursor-pointer"
                  >
                    Unlock for ₹{TRIAL_PRICE_INR} ({TRIAL_DAYS} Days) →
                  </button>
                </div>
              ) : (
                <>
                  {step === 1 && (
                    <div className="space-y-4">
                      <h3 className="font-display text-2xl font-extrabold text-white">
                        The Twist
                      </h3>
                      <p className="text-sm text-white/85 leading-relaxed">
                        {applyStudentNames(
                          activeQuestion.twistPrompt,
                          `${childId}:${activeQuestion.id}`
                        )}
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
                      <p className="text-sm text-white/85 leading-relaxed">
                        {applyStudentNames(
                          activeQuestion.catchPrompt,
                          `${childId}:${activeQuestion.id}`
                        )}
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
                      <p className="text-sm text-white/85">
                        Why do you think that? Write a short line in your own
                        words.
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
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}