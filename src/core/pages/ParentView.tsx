import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChild } from '../auth/ChildContext';
import { useApp } from '../store';
import { loadDayConfig } from '../../missions/curriculum';
import { curriculumTierFrom } from '../../missions/tiers';
import type { DayItem } from '../../missions/types';

type FamilyNote = {
  id: string;
  text: string;
  createdAt: string;
};

const SKILLS = [
  'Asking good questions',
  'Spotting missing information',
  'Giving reasons',
  'Using evidence',
  'Detecting weak reasoning',
  'Weighing trade-offs',
  'Updating on evidence',
  'Reflecting',
] as const;

const NOTE_PREFIX = 'cubitx-family-discovery:';

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
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
  const { activeChild } = useChild();
  const user = useApp((state) => state.user);
  const days = useApp((state) => state.days);
  const sessions = useApp((state) => state.sessions);
  const responses = useApp((state) => state.responses);

  const childId = activeChild?.id ?? 'no-active-child';
  const [noteText, setNoteText] = useState('');
  const [familyNotes, setFamilyNotes] = useState<FamilyNote[]>([]);
  const [noteMessage, setNoteMessage] = useState('');

  useEffect(() => {
    setFamilyNotes(loadFamilyNotes(childId));
  }, [childId]);

  const curriculumTier = curriculumTierFrom(user?.tier ?? 'foundation');

  const activity = useMemo(() => {
    const completedMissionIds = Array.from(
      new Set(sessions.flatMap((session) => session.missionsCompleted)),
    );
    const completedDays = Object.values(days).filter((day) => !!day.completedAt).length;
    const activeDays = new Set(sessions.map((session) => session.date)).size;
    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 29);
    recentCutoff.setHours(0, 0, 0, 0);
    const recentActiveDays = new Set(
      sessions
        .filter((session) => {
          const date = new Date(`${session.date}T00:00:00`);
          return !Number.isNaN(date.getTime()) && date >= recentCutoff;
        })
        .map((session) => session.date),
    ).size;

    const discoveries = sessions
      .flatMap((session) =>
        session.missionsCompleted.map((missionId) => ({
          id: `${session.id}-${missionId}`,
          date: session.date,
          title: resolveMissionTitle(missionId, curriculumTier),
        })),
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    return {
      completedMissionCount: completedMissionIds.length,
      completedDays,
      activeDays,
      recentActiveDays,
      responseCount: Object.keys(responses).length,
      discoveries,
    };
  }, [days, sessions, responses, curriculumTier]);

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
        JSON.stringify(next),
      );
      setFamilyNotes(next);
      setNoteText('');
      setNoteMessage('Your note is saved in this browser.');
    } catch {
      setNoteMessage('This browser could not save the note. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#142033]">
      <header className="sticky top-0 z-30 border-b border-[#DCE2E7] bg-[#F7F6F1]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-black tracking-tight text-[#142033]">CubitX</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#087F80]">Parent insights</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold">{activeChild?.name ?? 'Your child'}</p>
              <p className="text-xs text-[#687589]">
                {activeChild ? `Class ${activeChild.class_level}` : 'Child profile'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="rounded-full border border-[#DCE2E7] bg-white px-4 py-2 text-xs font-bold hover:bg-[#F1F3F5]"
            >
              Back to activities
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-7 sm:px-6 sm:py-10">
        <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#087F80]">A year of curiosity</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            {activeChild?.name ? `${activeChild.name}’s thinking journey` : 'Your child’s thinking journey'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#687589]">
            A growing record of activities, questions and discoveries. Activity counts show participation;
            they are not scores of intelligence, ability or thinking quality.
          </p>
          <nav aria-label="Parent insights sections" className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {[
              ['activity', 'Learning activity'],
              ['patterns', 'Thinking patterns'],
              ['noticing', 'What we’re noticing'],
              ['family', 'Try at home'],
              ['discoveries', 'Recent discoveries'],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="shrink-0 rounded-full bg-[#F1F3F5] px-4 py-2 text-xs font-bold text-[#586579] hover:bg-[#E5EFEC] hover:text-[#087F80]"
              >
                {label}
              </a>
            ))}
          </nav>
        </section>

        <section id="activity" className="scroll-mt-24">
          <div className="mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#087F80]">01 · Participation</p>
            <h2 className="mt-1 text-xl font-extrabold">Learning activity</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['Missions completed', activity.completedMissionCount, 'Unique completed activities'],
              ['Active days', activity.activeDays, 'Days with recorded activity'],
              ['Days completed', activity.completedDays, 'Completed learning days'],
              ['Responses saved', activity.responseCount, 'Answers saved on this device'],
            ].map(([label, value, description]) => (
              <article key={String(label)} className="rounded-2xl border border-[#DCE2E7] bg-white p-4 sm:p-5">
                <p className="text-3xl font-extrabold tabular-nums text-[#142033]">{value}</p>
                <h3 className="mt-2 text-xs font-bold">{label}</h3>
                <p className="mt-1 text-[10px] leading-4 text-[#8792A1]">{description}</p>
              </article>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[#8792A1]">
            Activity data currently comes from this browser’s saved CubitX progress. It is not yet a cloud-synchronised annual record.
          </p>
        </section>

        <section id="patterns" className="scroll-mt-24 rounded-3xl border border-[#DCE2E7] bg-white p-5 sm:p-7">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#087F80]">02 · Eight areas of thinking</p>
            <h2 className="mt-1 text-xl font-extrabold">Thinking patterns</h2>
            <p className="mt-2 text-sm leading-6 text-[#687589]">
              This map is designed to build gradually across the annual journey. It is not a monthly target
              and it will not be filled using activity counts. An area with no evidence is simply not yet observed.
            </p>
          </div>
          <div className="mt-5 grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_minmax(250px,0.9fr)]">
            <div className="mx-auto w-full max-w-[390px]">
              <svg viewBox="0 0 360 320" role="img" aria-labelledby="thinking-map-title thinking-map-desc" className="h-auto w-full">
                <title id="thinking-map-title">Eight-area thinking evidence map</title>
                <desc id="thinking-map-desc">An unfilled eight-axis map. No validated skill evidence is currently connected to this dashboard.</desc>
                {[30, 50, 70, 90].map((radius) => (
                  <polygon
                    key={radius}
                    points={Array.from({ length: 8 }, (_, index) => {
                      const angle = -Math.PI / 2 + (index * Math.PI) / 4;
                      return `${180 + Math.cos(angle) * radius},${145 + Math.sin(angle) * radius}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#DCE5E3"
                    strokeWidth="1"
                  />
                ))}
                {SKILLS.map((skill, index) => {
                  const angle = -Math.PI / 2 + (index * Math.PI) / 4;
                  const x = 180 + Math.cos(angle) * 90;
                  const y = 145 + Math.sin(angle) * 90;
                  const labelX = 180 + Math.cos(angle) * 132;
                  const labelY = 145 + Math.sin(angle) * 132;
                  const anchor = Math.cos(angle) > 0.35 ? 'start' : Math.cos(angle) < -0.35 ? 'end' : 'middle';
                  return (
                    <g key={skill}>
                      <line x1="180" y1="145" x2={x} y2={y} stroke="#DCE5E3" strokeWidth="1" />
                      <circle cx={x} cy={y} r="3" fill="#FFFFFF" stroke="#9CB8B0" strokeWidth="1.5" />
                      <text x={labelX} y={labelY} textAnchor={anchor} dominantBaseline="middle" fontSize="8.5" fill="#586579">
                        {skill}
                      </text>
                    </g>
                  );
                })}
                <text x="180" y="139" textAnchor="middle" fontSize="10" fontWeight="700" fill="#087F80">Evidence</text>
                <text x="180" y="153" textAnchor="middle" fontSize="9" fill="#687589">builds over time</text>
              </svg>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-[#F5F8F7] p-4">
                <p className="text-sm font-bold">Evidence collection is not yet connected</p>
                <p className="mt-1 text-xs leading-5 text-[#687589]">
                  CubitX has not connected validated, skill-linked observations to this parent view.
                  Therefore, this map deliberately shows no filled areas or numerical ratings.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-[#586579]">
                <li>• No evidence does not mean low ability.</li>
                <li>• One activity cannot establish a lasting pattern.</li>
                <li>• Evidence should accumulate across different missions and situations.</li>
                <li>• The annual view preserves history; the last 30 days are only a recent-activity window.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="noticing" className="scroll-mt-24">
          <div className="rounded-3xl border border-[#B8D8D0] bg-[#EAF4F0] p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#087F80]">03 · The important part</p>
            <h2 className="mt-2 text-2xl font-extrabold">What we’re noticing</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#405A57]">
              We want this section to explain meaningful moments in your child’s own words and actions —
              what happened, what evidence supports the observation, and what we still cannot conclude.
            </p>
            <div className="mt-5 rounded-2xl border border-[#CFE2DC] bg-white/80 p-5">
              <p className="text-sm font-bold text-[#142033]">No validated observations are connected yet.</p>
              <p className="mt-2 text-sm leading-6 text-[#687589]">
                Rather than generate a generic AI description from completed activities or saved answers,
                CubitX will wait until a reviewed observation can be linked to the actual activity record.
                This protects your child from unsupported labels.
              </p>
            </div>
          </div>
        </section>

        <section id="family" className="scroll-mt-24">
          <div className="mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#087F80]">04 · Family discovery</p>
            <h2 className="mt-1 text-xl font-extrabold">Try at home today</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#687589]">
              A small conversation can create a useful moment of discovery. There is no test, score or right answer.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ['Ask before deciding', '“What else would we need to know before choosing?”'],
              ['Look for the clue', '“Which detail helped you reach that idea?”'],
              ['Consider another view', '“What new information might change your mind?”'],
            ].map(([title, prompt]) => (
              <article key={title} className="rounded-2xl border border-[#DCE2E7] bg-white p-5">
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#586579]">{prompt}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#DCE2E7] bg-white p-5 sm:p-6">
            <h3 className="text-base font-extrabold">Family Discovery Log</h3>
            <p className="mt-1 text-xs leading-5 text-[#687589]">
              Optional: note a moment you noticed. Keep it in your own words; it will not be treated as a platform observation or used to rate a skill.
            </p>
            <form onSubmit={saveFamilyNote} className="mt-4 space-y-3">
              <label htmlFor="family-note" className="block text-xs font-bold text-[#586579]">What happened?</label>
              <textarea
                id="family-note"
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                rows={3}
                maxLength={1200}
                placeholder="For example: During dinner, my child asked how we could check whether..."
                className="w-full resize-y rounded-xl border border-[#DCE2E7] bg-[#FCFCFA] p-3 text-sm outline-none focus:border-[#087F80]"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-[10px] leading-4 text-[#8792A1]">
                  Notes are saved only in this browser on this device. They are not uploaded, synced or analysed by AI.
                </p>
                <button
                  type="submit"
                  disabled={!noteText.trim() || !activeChild}
                  className="rounded-xl bg-[#142033] px-5 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save family note
                </button>
              </div>
              {noteMessage && <p role="status" className="text-xs font-semibold text-[#087F80]">{noteMessage}</p>}
            </form>

            {familyNotes.length > 0 && (
              <div className="mt-5 space-y-3 border-t border-[#E4E8EC] pt-4">
                <h4 className="text-xs font-bold">Your saved notes</h4>
                {familyNotes.map((note) => (
                  <article key={note.id} className="rounded-xl bg-[#F7F6F1] p-3">
                    <p className="whitespace-pre-wrap text-sm leading-6">{note.text}</p>
                    <p className="mt-2 text-[10px] text-[#8792A1]">
                      {new Date(note.createdAt).toLocaleString('en-IN')}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="discoveries" className="scroll-mt-24">
          <div className="mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#087F80]">05 · Activity history</p>
            <h2 className="mt-1 text-xl font-extrabold">Recent discoveries</h2>
            <p className="mt-2 text-sm leading-6 text-[#687589]">
              Completed CubitX activities, listed from the progress saved in this browser.
            </p>
          </div>
          <div className="rounded-2xl border border-[#DCE2E7] bg-white p-5">
            {activity.discoveries.length === 0 ? (
              <p className="text-sm text-[#687589]">No completed activities have been recorded on this device yet.</p>
            ) : (
              <ol className="space-y-4">
                {activity.discoveries.slice(0, 20).map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#087F80]" />
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="mt-1 text-[11px] text-[#8792A1]">{formatDate(item.date)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {activity.discoveries.length > 20 && (
              <p className="mt-4 text-[11px] text-[#8792A1]">
                Showing the latest 20 of {activity.discoveries.length} completed activity records.
              </p>
            )}
          </div>
        </section>

        <footer className="border-t border-[#DCE2E7] py-5 text-[10px] leading-5 text-[#8792A1]">
          <p className="font-bold text-[#586579]">About this report</p>
          <p>
            Activity counts describe participation, not cognitive development. Thinking-pattern interpretations
            will appear only when validated observations are connected. Activity and family notes on this version
            are stored locally in this browser and are not a cloud-backed annual record.
          </p>
        </footer>
      </main>
    </div>
  );
}
