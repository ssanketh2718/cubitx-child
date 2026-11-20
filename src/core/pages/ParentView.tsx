import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../auth/ChildContext';
import { useApp } from '../store';
import { loadDayConfig } from '../../missions/curriculum';
import { curriculumTierFrom, sdkTierForClass } from '../../missions/tiers';
import type { DayItem } from '../../missions/types';
import { EvidenceWheel } from '../../features/parent-insights/EvidenceWheel';
import { MomentReplayAndShare } from '../../features/parent-insights/MomentReplayAndShare';
import type { ObservedMoment } from '../../features/parent-insights/skillsCatalog';

type ReportingPeriod = '7d' | '30d' | '90d' | 'all';

type FamilyNote = {
  id: string;
  text: string;
  createdAt: string;
};

const NOTE_PREFIX = 'cubitx-family-discovery:';

const PERIOD_OPTIONS: { id: ReportingPeriod; label: string }[] = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'All time' },
];

function isWithinPeriod(isoOrYmd: string, period: ReportingPeriod): boolean {
  if (period === 'all') return true;
  const daysLimit = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const parsed =
    isoOrYmd.length === 10
      ? new Date(`${isoOrYmd}T00:00:00`)
      : new Date(isoOrYmd);
  if (Number.isNaN(parsed.getTime())) return true;
  const cutoff = Date.now() - daysLimit * 24 * 60 * 60 * 1000;
  return parsed.getTime() >= cutoff;
}

function formatDate(value: string) {
  const date =
    value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function itemTitle(item: DayItem | undefined, index: number) {
  if (!item) return `Activity ${index + 1}`;
  if ('title' in item) return item.title;
  if ('puzzle' in item) return item.puzzle;
  if ('question' in item) return item.question;
  if ('prompt' in item) return item.prompt;
  return `Activity ${index + 1}`;
}

function resolveMissionTitle(missionId: string, fallbackTier: 1 | 2) {
  const match = /^t([12]):d(\d+):i(\d+)$/.exec(missionId);
  if (!match) return missionId;

  const tier = Number(match[1]) as 1 | 2;
  const day = Number(match[2]);
  const index = Number(match[3]);
  const config = loadDayConfig(tier || fallbackTier, day);

  return itemTitle(config?.items[index], index);
}

function loadFamilyNotes(childId: string): FamilyNote[] {
  try {
    const raw = window.localStorage.getItem(`${NOTE_PREFIX}${childId}`);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FamilyNote[]) : [];
  } catch {
    return [];
  }
}

export default function ParentView() {
  const navigate = useNavigate();
  const { children: familyChildren } = useAuth();
  const { activeChild, setActiveChild } = useChild();

  const childBuckets = useApp((state) => state.childBuckets);
  const activeChildIdInStore = useApp((state) => state.activeChildId);
  const storeUser = useApp((state) => state.user);
  const storeSessions = useApp((state) => state.sessions);
  const storeResponses = useApp((state) => state.responses);

  const childId = activeChild?.id ?? 'no-active-child';

  // Read strictly from this child's isolated bucket; never bleed sibling data.
  const childRecord = useMemo(() => {
    if (!activeChild) {
      return {
        tier: storeUser?.tier ?? 'foundation',
        sessions: storeSessions,
        responses: storeResponses,
      };
    }

    const bucket = childBuckets[activeChild.id];
    if (bucket) {
      return {
        tier: bucket.user.tier,
        sessions: bucket.sessions,
        responses: bucket.responses,
      };
    }

    if (activeChildIdInStore === activeChild.id) {
      return {
        tier: storeUser?.tier ?? 'foundation',
        sessions: storeSessions,
        responses: storeResponses,
      };
    }

    return {
      tier: sdkTierForClass(activeChild.class_level),
      sessions: [],
      responses: {},
    };
  }, [
    activeChild,
    childBuckets,
    activeChildIdInStore,
    storeUser,
    storeSessions,
    storeResponses,
  ]);

  const [period, setPeriod] = useState<ReportingPeriod>('30d');
  const [showAnalyticalDetail, setShowAnalyticalDetail] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [familyNotes, setFamilyNotes] = useState<FamilyNote[]>([]);
  const [noteMessage, setNoteMessage] = useState('');

  useEffect(() => {
    setFamilyNotes(loadFamilyNotes(childId));
    setNoteMessage('');
  }, [childId]);

  const curriculumTier = curriculumTierFrom(childRecord.tier);

  const filteredData = useMemo(() => {
    const filteredSessions = childRecord.sessions.filter((s) =>
      isWithinPeriod(s.date, period)
    );
    const completedMissionIds = Array.from(
      new Set(filteredSessions.flatMap((s) => s.missionsCompleted))
    );
    const activeDays = new Set(filteredSessions.map((s) => s.date)).size;

    const discoveries = filteredSessions
      .flatMap((s) =>
        s.missionsCompleted.map((missionId) => ({
          id: `${s.id}-${missionId}`,
          date: s.date,
          title: resolveMissionTitle(missionId, curriculumTier),
        }))
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    const moments: ObservedMoment[] = Object.values(childRecord.responses)
      .filter((r) => isWithinPeriod(r.submittedAt, period))
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      .map((r) => ({
        id: `${r.itemKey}-${r.submittedAt}`,
        itemKey: r.itemKey,
        title: resolveMissionTitle(r.itemKey, curriculumTier),
        engine: r.engine,
        submittedAt: r.submittedAt,
        verbatimText: r.text,
        pickedIndex: r.picked,
        testsBeforeGuess: r.behaviours?.testsBeforeGuess,
        wentBackToTest: r.behaviours?.wentBackToTest,
        hintsUsed: r.behaviours?.hintsUsed,
        changedAnswerCount: r.behaviours?.changedAnswerCount,
      }));

    return {
      completedMissionCount: completedMissionIds.length,
      activeDays,
      responseCount: moments.length,
      discoveries,
      moments,
    };
  }, [childRecord, period, curriculumTier]);

  const saveFamilyNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = noteText.trim();
    if (!text || !activeChild) return;

    const next: FamilyNote[] = [
      {
        id: `note-${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
      },
      ...familyNotes,
    ];

    try {
      window.localStorage.setItem(
        `${NOTE_PREFIX}${childId}`,
        JSON.stringify(next)
      );
      setFamilyNotes(next);
      setNoteText('');
      setNoteMessage('Saved privately in this browser for this child.');
    } catch {
      setNoteMessage(
        'Could not save the note in this browser. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#142033]">
      {/* TOP STICKY BAR */}
      <header className="sticky top-0 z-30 border-b border-[#DCE2E7] bg-[#F7F6F1]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-base font-extrabold tracking-tight text-[#142033]">
                CubitX
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#087F80]">
                Parent Insights
              </p>
            </div>

            {familyChildren.length > 1 && (
              <div className="ml-1 flex items-center gap-1.5 rounded-xl border border-[#DCE2E7] bg-white p-1">
                {familyChildren.map((kid) => {
                  const selected = activeChild?.id === kid.id;
                  return (
                    <button
                      key={kid.id}
                      type="button"
                      onClick={() => setActiveChild(kid)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        selected
                          ? 'bg-[#142033] text-white'
                          : 'text-[#586579] hover:text-[#142033]'
                      }`}
                    >
                      {kid.avatar} {kid.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAnalyticalDetail((v) => !v)}
              aria-pressed={showAnalyticalDetail}
              className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                showAnalyticalDetail
                  ? 'border-[#142033] bg-[#142033] text-white'
                  : 'border-[#DCE2E7] bg-white text-[#142033] hover:border-[#087F80]'
              }`}
            >
              {showAnalyticalDetail
                ? 'Analytical detail: ON'
                : 'Show analytical detail'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="rounded-xl border border-[#DCE2E7] bg-white px-4 py-2 text-xs font-bold text-[#142033] transition hover:border-[#087F80] hover:text-[#087F80]"
            >
              Back to missions
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-7 px-4 py-7 sm:px-6 sm:py-9">
        {/* HERO + PERIOD FILTER */}
        <section className="rounded-3xl border border-[#DCE2E7] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F4] px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-[#087F80]" />
                <span className="text-[11px] font-bold text-[#087F80]">
                  {activeChild
                    ? `${activeChild.avatar} ${activeChild.name} · Class ${activeChild.class_level}`
                    : 'Child profile'}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#142033] sm:text-4xl">
                {activeChild?.name
                  ? `${activeChild.name}’s thinking journey`
                  : 'Your child’s thinking journey'}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#586579]">
                See the actual clues, choices, and questions from your child’s
                missions—without invented IQ numbers or comparison against other
                children.
              </p>
            </div>

            <div
              role="group"
              aria-label="Reporting period"
              className="inline-flex rounded-xl border border-[#DCE2E7] bg-[#F7F6F1] p-1"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPeriod(opt.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    period === opt.id
                      ? 'bg-[#087F80] text-white shadow-sm'
                      : 'text-[#586579] hover:text-[#142033]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* THE NOT-BROKEN SIGNAL (Anti-Guilt Inactivity Reassurance) */}
          {filteredData.completedMissionCount === 0 && (
            <div className="mt-6 rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1] p-4 sm:p-5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#087F80]">
                Every learning journey has its own rhythm
              </p>
              <p className="mt-1 text-sm leading-6 text-[#142033]">
                There has been no recorded CubitX activity in this period. There
                is no streak loss, no missed-day penalty, and no falling
                behind—your child can pick up a new investigation whenever they
                feel curious.
              </p>
            </div>
          )}

          {/* 01: JOURNEY AT A GLANCE */}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: 'Missions explored',
                value: filteredData.completedMissionCount,
                helper: 'Participation count, not an ability score',
                accent: '#087F80',
              },
              {
                label: 'Recorded moments',
                value: filteredData.responseCount,
                helper: 'Saved on this device · Awaiting review',
                accent: '#F5B942',
              },
              {
                label: 'Verified skills',
                value: '0 / 8',
                helper: 'Requires teacher-calibrated review',
                accent: '#5267E8',
              },
              {
                label: 'Active days',
                value: filteredData.activeDays,
                helper: 'Self-paced · No daily streak pressure',
                accent: '#142033',
              },
            ].map((card) => (
              <article
                key={card.label}
                className="rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1]/60 p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: card.accent }}
                  />
                  <h2 className="text-xs font-bold text-[#586579]">
                    {card.label}
                  </h2>
                </div>
                <p className="mt-2.5 text-3xl font-extrabold tabular-nums text-[#142033]">
                  {card.value}
                </p>
                <p className="mt-1 text-[11px] leading-4 text-[#586579]">
                  {card.helper}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* 02: SHOW ME THE MOMENT + SHAREABLE DISCOVERY CARD */}
        <section aria-label="Recorded thinking moments">
          <MomentReplayAndShare
            key={childId}
            childFirstName={activeChild?.name ?? 'Your child'}
            moments={filteredData.moments}
          />
        </section>

        {/* 03: EIGHT-SKILL EVIDENCE WHEEL + INVISIBLE RIGOR */}
        <section aria-label="Eight thinking skills">
          <EvidenceWheel
            hasLocalActivity={filteredData.responseCount > 0}
            showAnalyticalDetail={showAnalyticalDetail}
          />
        </section>

        {/* 04: WHAT WE KNOW — AND WHAT WE DON'T */}
        <section className="rounded-3xl border border-[#DCE2E7] bg-white p-5 shadow-sm sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
            Pedagogical honesty
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-[#142033]">
            What we know — and what we don’t
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1] p-4">
              <span className="inline-block rounded-full bg-[#E6F4F4] px-2.5 py-0.5 text-[10px] font-bold text-[#087F80]">
                CubitX observed (local device)
              </span>
              <p className="mt-2 text-sm leading-6 text-[#142033]">
                {filteredData.completedMissionCount > 0
                  ? `Your child completed ${filteredData.completedMissionCount} mission(s) and recorded ${filteredData.responseCount} interaction moment(s) in this period.`
                  : 'No mission moments have been recorded in this period yet.'}
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1] p-4">
              <span className="inline-block rounded-full bg-[#F1F4F8] px-2.5 py-0.5 text-[10px] font-bold text-[#586579]">
                What we cannot yet conclude
              </span>
              <p className="mt-2 text-sm leading-6 text-[#586579]">
                One activity or a short period of play never establishes a
                permanent strength, weakness, or intelligence level. Skill-level
                summaries unlock only after varied, rubric-reviewed
                observations.
              </p>
            </div>
          </div>

          {showAnalyticalDetail && (
            <div className="mt-4 rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1] p-4 text-xs leading-6 text-[#586579]">
              <p className="font-bold text-[#142033]">
                Source transparency & current storage scope
              </p>
              <p className="mt-1">
                Mission history and family notes on this build are stored
                locally in this browser, scoped to immutable child ID{' '}
                <code className="rounded bg-white px-1.5 py-0.5 text-[#142033]">
                  {childId}
                </code>
                . Server-side scoring is intentionally paused (
                <code>pending_review</code>) until calibration and legal/consent
                gates are complete.
              </p>
            </div>
          )}
        </section>

        {/* 05: CONTINUE THINKING AT HOME + FAMILY DISCOVERY LOG */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="rounded-3xl border border-[#DCE2E7] bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
              Continue thinking at home
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#142033]">
              Dinner-table questions
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#586579]">
              One casual question is better than a quiz. There is no score and
              no right answer to grade.
            </p>

            <div className="mt-4 space-y-3">
              {[
                {
                  tag: 'A2 · Missing information',
                  q: '“Before we decide, what one detail are we still missing?”',
                },
                {
                  tag: 'B2 · Using evidence',
                  q: '“Which clue made you lean toward that answer?”',
                },
                {
                  tag: 'C2 · Updating on evidence',
                  q: '“What new fact would actually make you change your mind?”',
                },
              ].map((item) => (
                <div
                  key={item.tag}
                  className="rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1] p-3.5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#087F80]">
                    {item.tag}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#142033]">
                    {item.q}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#DCE2E7] bg-white p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#586579]">
                Parent shared · Separate from CubitX evidence
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-[#142033]">
                Family Discovery Log
              </h2>
            </div>

            <form onSubmit={saveFamilyNote} className="mt-4 space-y-3">
              <label
                htmlFor="family-note"
                className="block text-xs font-bold text-[#586579]"
              >
                Jot down a question or realisation you noticed at home
              </label>
              <textarea
                id="family-note"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                maxLength={1200}
                placeholder="Example: At dinner, they asked how we know whether a WhatsApp forward is actually true..."
                className="w-full resize-y rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1] p-3.5 text-sm text-[#142033] outline-none transition focus:border-[#087F80] focus:bg-white focus:ring-2 focus:ring-[#087F80]/20"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] text-[#586579]">
                  Stored locally for this child and cleared automatically on
                  sign-out.
                </p>
                <button
                  type="submit"
                  disabled={!noteText.trim() || !activeChild}
                  className="rounded-xl bg-[#087F80] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#0A9697] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save note
                </button>
              </div>

              {noteMessage && (
                <p
                  role="status"
                  className="text-xs font-semibold text-[#087F80]"
                >
                  {noteMessage}
                </p>
              )}
            </form>

            {familyNotes.length > 0 && (
              <div className="mt-5 space-y-2.5 border-t border-[#DCE2E7] pt-4">
                {familyNotes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-xl border border-[#DCE2E7] bg-[#F7F6F1] p-3.5"
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6 text-[#142033]">
                      {note.text}
                    </p>
                    <p className="mt-1.5 text-[10px] font-semibold text-[#586579]">
                      {new Date(note.createdAt).toLocaleString('en-IN')}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 06: CHRONOLOGICAL ACTIVITY TIMELINE */}
        {filteredData.discoveries.length > 0 && (
          <section className="rounded-3xl border border-[#DCE2E7] bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
              Activity timeline
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#142033]">
              Recent missions explored
            </h2>
            <ol className="mt-4 space-y-3">
              {filteredData.discoveries.slice(0, 15).map((item, idx) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#DCE2E7] bg-[#F7F6F1]/70 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#142033] text-[10px] font-extrabold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-[#142033]">
                      {item.title}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-[#586579]">
                    {formatDate(item.date)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}