
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

const CONTEXTS = [
  'Questioning',
  'Investigating',
  'Explaining',
  'Reconsidering',
] as const;

const NOTE_PREFIX = 'cubitx-family-discovery:';

const COLORS = {
  blue: '#3978F6',
  violet: '#8455E8',
  green: '#0C9B78',
};

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

function SectionHeading({
  eyebrow,
  title,
  description,
  number,
}: {
  eyebrow: string;
  title: string;
  description: string;
  number: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-[#172554] px-2.5 py-1 text-[10px] font-black tracking-widest text-white">
          {number}
        </span>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5265B8]">
          {eyebrow}
        </p>
      </div>

      <h2 className="mt-2 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#718096]">
        {description}
      </p>
    </div>
  );
}

/* =======================================================
   VISUAL 1: THINKING PROFILE
   Eight-axis spider chart.
   No fabricated evidence polygon or ability scores.
======================================================= */

function ThinkingSpider() {
  const cx = 250;
  const cy = 218;
  const radius = 125;

  const point = (index: number, r: number) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 4;

    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  };

  return (
    <svg
      viewBox="0 0 500 440"
      role="img"
      aria-labelledby="spider-title spider-desc"
      className="block h-auto w-full"
    >
      <title id="spider-title">Eight-area thinking profile</title>

      <desc id="spider-desc">
        An eight-axis spider chart. No skill evidence is currently
        connected, so no ability polygon or scores are displayed.
      </desc>

      {[0.25, 0.5, 0.75, 1].map((scale, index) => (
        <polygon
          key={scale}
          points={Array.from({ length: 8 }, (_, i) => {
            const p = point(i, radius * scale);
            return `${p.x},${p.y}`;
          }).join(' ')}
          fill="none"
          stroke={index === 3 ? '#B8C8E7' : '#DCE5F2'}
          strokeWidth={index === 3 ? 1.8 : 1.3}
        />
      ))}

      {SKILLS.map((skill, index) => {
        const end = point(index, radius);
        const label = point(index, 177);

        const angle = -Math.PI / 2 + (index * Math.PI) / 4;
        const cos = Math.cos(angle);

        const anchor =
          cos > 0.35 ? 'start' : cos < -0.35 ? 'end' : 'middle';

        let labelY = label.y;
        if (index === 0) labelY += 3;
        if (index === 4) labelY -= 3;

        return (
          <g key={skill}>
            <line
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="#C6D4E9"
              strokeWidth="1.5"
            />

            <circle
              cx={end.x}
              cy={end.y}
              r="5.5"
              fill="white"
              stroke="#718DBA"
              strokeWidth="2.5"
            />

            <text
              x={label.x}
              y={labelY}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="700"
              fill="#425575"
            >
              {skill}
            </text>
          </g>
        );
      })}

      <circle
        cx={cx}
        cy={cy}
        r="47"
        fill="#EEF2FF"
        stroke="#C8D2F4"
        strokeWidth="1.5"
      />

      <circle
        cx={cx}
        cy={cy}
        r="37"
        fill="white"
      />

      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="900"
        fill="#4657B8"
      >
        THINKING
      </text>

      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fontSize="9"
        fill="#718096"
      >
        profile
      </text>
    </svg>
  );
}

/* =======================================================
   VISUAL 2: EVIDENCE LANDSCAPE
   Eight skills x four learning contexts.
   Interactive matrix with selected-cell information.
======================================================= */

function EvidenceMatrix() {
  const [selected, setSelected] = useState<{
    skill: number;
    context: number;
  } | null>(null);

  const selectedSkill =
    selected !== null ? SKILLS[selected.skill] : null;

  const selectedContext =
    selected !== null ? CONTEXTS[selected.context] : null;

  const contextColors = [
    '#3978F6',
    '#8455E8',
    '#F47762',
    '#0C9B78',
  ];

  return (
    <div className="rounded-3xl border border-[#E0E6F3] bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5265B8]">
            Evidence coverage
          </p>

          <h3 className="mt-1 text-lg font-black text-[#172554]">
            The evidence landscape
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#718096]">
            Explore where each thinking skill may be observed.
          </p>
        </div>

        <div className="rounded-xl bg-[#F0F2FF] px-3 py-2 text-[10px] font-bold text-[#5265B8]">
          8 skills · 4 contexts
        </div>
      </div>

      {/* Context legend */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CONTEXTS.map((context, index) => (
          <div
            key={context}
            className="flex items-center gap-2 rounded-xl bg-[#F8F9FC] px-2.5 py-2"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: contextColors[index] }}
            />

            <span className="text-[10px] font-bold text-[#526078]">
              {context}
            </span>
          </div>
        ))}
      </div>

      {/* Matrix */}
      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[570px]">
          <div className="grid grid-cols-[minmax(175px,1.6fr)_repeat(4,minmax(70px,1fr))] gap-2">
            <div className="flex items-end pb-2 text-[9px] font-black uppercase tracking-wider text-[#98A2B3]">
              Thinking skill
            </div>

            {CONTEXTS.map((context) => (
              <div
                key={context}
                className="flex min-h-[43px] items-end justify-center pb-2 text-center text-[9px] font-extrabold text-[#526078]"
              >
                {context}
              </div>
            ))}

            {/* IMPORTANT: iterate over SKILLS here, not CONTEXTS */}
            {SKILLS.map((skill, skillIndex) => (
              <div key={skill} className="contents">
                <div className="flex min-h-[43px] items-center rounded-xl bg-[#F7F8FC] px-3 text-[10px] font-bold text-[#43516B]">
                  <span className="mr-2 text-[9px] font-black text-[#A1AABD]">
                    {String(skillIndex + 1).padStart(2, '0')}
                  </span>

                  {skill}
                </div>

                {CONTEXTS.map((context, contextIndex) => {
                  const active =
                    selected?.skill === skillIndex &&
                    selected?.context === contextIndex;

                  return (
                    <button
                      key={`${skillIndex}-${contextIndex}`}
                      type="button"
                      aria-label={`${skill} in ${context}: evidence not connected`}
                      aria-pressed={active}
                      onClick={() =>
                        setSelected({
                          skill: skillIndex,
                          context: contextIndex,
                        })
                      }
                      className={`group flex min-h-[43px] items-center justify-center rounded-xl border transition-all duration-200 ${
                        active
                          ? 'border-[#5265B8] bg-[#EEF0FF] shadow-md ring-2 ring-[#5265B8]/15'
                          : 'border-[#E8ECF3] bg-white hover:border-[#AAB9E8] hover:bg-[#F5F6FF]'
                      }`}
                    >
                      <span
                        className={`h-4 w-4 rounded-md border-2 transition-all ${
                          active
                            ? 'border-[#5265B8] bg-[#5265B8]'
                            : 'border-[#CBD3E1] bg-[#F9FAFC] group-hover:border-[#899BCB]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected cell detail */}
      <div className="mt-4 rounded-2xl border border-[#E1E7F2] bg-gradient-to-r from-[#F4F6FF] to-[#F8F5FF] p-4">
        {selected ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black text-[#35477F]">
                {selectedSkill}
              </p>

              <span className="rounded-full bg-white px-3 py-1 text-[9px] font-bold text-[#8455E8]">
                {selectedContext}
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-[#718096]">
              No reviewed observation is connected to this skill and
              context yet. This does not mean the child cannot demonstrate it.
            </p>
          </>
        ) : (
          <p className="text-xs leading-5 text-[#718096]">
            <strong className="text-[#35477F]">
              Explore the matrix.
            </strong>{' '}
            Select any cell to see its evidence status. An empty cell means
            evidence has not been connected, not that the skill is absent.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] font-semibold text-[#8792A1]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#CBD3E1] bg-[#F9FAFC]" />
          Awaiting evidence
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#5265B8]" />
          Selected cell
        </span>
      </div>
    </div>
  );
}

/* =======================================================
   VISUAL 3: GROWTH TIMELINE
   Illustrative annual journey, not actual child milestones.
======================================================= */

function EvidenceTimeline() {
  const milestones = [
    {
      period: 'BEGIN',
      title: 'First observations',
      description: 'The first meaningful evidence is captured.',
      color: '#3978F6',
    },
    {
      period: 'REPEAT',
      title: 'Patterns reappear',
      description: 'A similar behaviour is observed again.',
      color: '#8455E8',
    },
    {
      period: 'EXPAND',
      title: 'Different contexts',
      description: 'Evidence appears in another situation.',
      color: '#F47762',
    },
    {
      period: 'REFLECT',
      title: 'Annual reflection',
      description: 'The accumulated evidence is reviewed.',
      color: '#0C9B78',
    },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-[#263A72] bg-[#111D45] p-5 text-white shadow-xl sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9EACFF]">
            Longitudinal view
          </p>

          <h3 className="mt-1 text-xl font-black">
            The journey of evidence
          </h3>

          <p className="mt-2 max-w-xl text-xs leading-5 text-[#B9C5E5]">
            Thinking is not understood through one moment. Meaningful
            observations become more useful when viewed over time.
          </p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#AAB7DD]">
            Annual view
          </p>

          <p className="mt-1 text-sm font-black">
            Evidence journey
          </p>
        </div>
      </div>

      {/* Visual timeline */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute left-[7%] right-[7%] top-5 h-[3px] rounded-full bg-white/15" />

          <div className="relative grid grid-cols-4 gap-1">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.period}
                className="flex min-w-0 flex-col items-center text-center"
              >
                <div
                  className="z-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#111D45] shadow-lg"
                  style={{
                    backgroundColor: milestone.color,
                    boxShadow: `0 0 22px ${milestone.color}55`,
                  }}
                >
                  <span className="text-sm font-black text-white">
                    {index + 1}
                  </span>
                </div>

                <p
                  className="mt-3 text-[8px] font-black tracking-wider sm:text-[9px]"
                  style={{ color: milestone.color }}
                >
                  {milestone.period}
                </p>

                <p className="mt-2 text-[10px] font-extrabold leading-4 text-white sm:text-xs">
                  {milestone.title}
                </p>

                <p className="mt-2 hidden max-w-[125px] text-[10px] leading-4 text-[#AAB7DD] sm:block">
                  {milestone.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#F5A43B]" />

          <p className="text-xs font-bold text-white">
            Evidence timeline is not connected yet
          </p>
        </div>

        <p className="mt-2 text-xs leading-5 text-[#B9C5E5]">
          These are the stages the annual experience is designed to support,
          not completed milestones for this child. Actual dates and examples
          will appear only when reviewed observations are available.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ['01', 'Original response'],
          ['02', 'Reviewed observation'],
          ['03', 'Context and date'],
        ].map(([number, label]) => (
          <div
            key={number}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2"
          >
            <span className="text-[9px] font-black text-[#9EACFF]">
              {number}
            </span>

            <span className="text-[9px] font-semibold text-[#D5DCF0]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =======================================================
   MAIN PARENT VIEW
======================================================= */

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

    const completedDays = Object.values(days).filter(
      (day) => !!day.completedAt,
    ).length;

    const activeDays = new Set(
      sessions.map((session) => session.date),
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
      setNoteMessage(
        'This browser could not save the note. Please try again.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FC] text-[#172554]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[#E1E6F0] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-base font-black tracking-tight text-[#172554]">
              CubitX
            </p>

            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5265B8]">
              Parent insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold">
                {activeChild?.name ?? 'Your child'}
              </p>

              <p className="text-xs text-[#718096]">
                {activeChild
                  ? `Class ${activeChild.class_level}`
                  : 'Child profile'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="rounded-full border border-[#DCE2EE] bg-white px-4 py-2 text-xs font-bold transition hover:bg-[#EEF1FA]"
            >
              Back to activities
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-9 px-4 py-7 sm:px-6 sm:py-10">
        {/* HERO */}
        <section className="relative isolate overflow-hidden rounded-[30px] bg-gradient-to-br from-[#172554] via-[#293C83] to-[#6347B9] p-6 text-white shadow-xl shadow-[#293C83]/15 sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#A78BFA]/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#31C7C0]/15 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#6EE7B7]" />

              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#DCE6FF]">
                A year of curiosity
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              {activeChild?.name
                ? `${activeChild.name}’s thinking journey`
                : 'Your child’s thinking journey'}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#D6DDF5]">
              More than completed activities. Discover the questions,
              reasoning and meaningful moments that make learning special.
            </p>

            <nav
              aria-label="Parent insights sections"
              className="mt-7 flex gap-2 overflow-x-auto pb-1"
            >
              {[
                ['activity', 'Activity'],
                ['profile', 'Thinking profile'],
                ['landscape', 'Evidence landscape'],
                ['timeline', 'Growth journey'],
                ['family', 'Family discoveries'],
              ].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold text-white transition hover:bg-white/20"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* 01: LEARNING ACTIVITY */}
        <section id="activity" className="scroll-mt-24">
          <SectionHeading
            number="01"
            eyebrow="Participation"
            title="Learning activity"
            description="A snapshot of the learning activity recorded on this device. These are participation measures, not cognitive scores."
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              {
                label: 'Missions completed',
                value: activity.completedMissionCount,
                description: 'Unique completed activities',
                color: '#3978F6',
                icon: '✦',
              },
              {
                label: 'Active days',
                value: activity.activeDays,
                description: 'Days with recorded activity',
                color: '#8455E8',
                icon: '◷',
              },
              {
                label: 'Days completed',
                value: activity.completedDays,
                description: 'Completed learning days',
                color: '#0C9B78',
                icon: '✓',
              },
              {
                label: 'Responses saved',
                value: activity.responseCount,
                description: 'Answers saved on this device',
                color: '#F47762',
                icon: '✎',
              },
            ].map((metric) => (
              <article
                key={metric.label}
                className="relative overflow-hidden rounded-2xl border border-[#E5E9F2] bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-5"
              >
                <div
                  className="absolute left-0 top-0 h-1 w-full"
                  style={{ backgroundColor: metric.color }}
                />

                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black"
                  style={{
                    color: metric.color,
                    backgroundColor: `${metric.color}15`,
                  }}
                >
                  {metric.icon}
                </div>

                <p className="mt-4 text-3xl font-black tabular-nums text-[#172554]">
                  {metric.value}
                </p>

                <h3 className="mt-1 text-xs font-extrabold text-[#34415D]">
                  {metric.label}
                </h3>

                <p className="mt-1 text-[10px] leading-4 text-[#8993A6]">
                  {metric.description}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-3 text-[10px] text-[#8792A1]">
            Activity data currently comes from this browser’s saved CubitX
            progress. It is not yet a cloud-synchronised annual record.
          </p>
        </section>

        {/* 02: THINKING PROFILE */}
        <section id="profile" className="scroll-mt-24">
          <SectionHeading
            number="02"
            eyebrow="The thinking profile"
            title="How does your child think?"
            description="Eight areas of thinking that may become visible through meaningful activity and reviewed observations."
          />

          <div className="overflow-hidden rounded-[28px] border border-[#DFE5F2] bg-gradient-to-br from-white via-[#F4F6FF] to-[#E9EEFF] p-4 shadow-sm sm:p-7">
            <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(220px,0.7fr)]">
              <div className="rounded-2xl border border-white bg-white/80 p-2 shadow-sm sm:p-4">
                <ThinkingSpider />
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-gradient-to-br from-[#283C83] to-[#6651BD] p-5 text-white shadow-lg">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#D5D9FF]">
                    Evidence status
                  </p>

                  <p className="mt-2 text-xl font-black">
                    Awaiting observations
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#E0E5FF]">
                    The thinking profile will develop as relevant
                    observations are captured and reviewed.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#DFE5F2] bg-white p-4">
                  <p className="text-xs font-extrabold text-[#34415D]">
                    What this map represents
                  </p>

                  <ul className="mt-3 space-y-2 text-[11px] leading-5 text-[#718096]">
                    <li>• Eight distinct areas of thinking.</li>
                    <li>• Evidence linked to actual learning activities.</li>
                    <li>• No arbitrary scores or ability rankings.</li>
                    <li>• Patterns interpreted only after review.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#D9E1FF] bg-[#EEF1FF] p-4">
                  <p className="text-xs font-bold text-[#5265B8]">
                    Remember
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[#66749B]">
                    An unobserved skill is not an absent skill. The map
                    reflects available evidence, not the limits of a child.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 03: EVIDENCE LANDSCAPE */}
        <section id="landscape" className="scroll-mt-24">
          <SectionHeading
            number="03"
            eyebrow="The evidence landscape"
            title="Where does thinking appear?"
            description="The same skill may appear in different situations. This matrix is designed to reveal the breadth of evidence rather than create another score."
          />

          <EvidenceMatrix />
        </section>

        {/* 04: GROWTH TIMELINE */}
        <section id="timeline" className="scroll-mt-24">
          <SectionHeading
            number="04"
            eyebrow="The annual journey"
            title="Growth through meaningful moments"
            description="A chronological view of how reviewed observations can accumulate across activities, situations and time."
          />

          <EvidenceTimeline />
        </section>

        {/* 05: FAMILY DISCOVERY */}
        <section id="family" className="scroll-mt-24">
          <SectionHeading
            number="05"
            eyebrow="Beyond the screen"
            title="Thinking continues at home"
            description="Simple conversations can encourage children to question, explain, explore and reconsider. There is no test and no right answer."
          />

          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                title: 'Ask before deciding',
                prompt: '“What else would we need to know before choosing?”',
                color: '#3978F6',
                background: '#EAF1FF',
                icon: '?',
              },
              {
                title: 'Look for the clue',
                prompt: '“Which detail helped you reach that idea?”',
                color: '#8455E8',
                background: '#F0EAFE',
                icon: '⌕',
              },
              {
                title: 'Consider another view',
                prompt: '“What new information might change your mind?”',
                color: '#0C9B78',
                background: '#E5F6F0',
                icon: '↻',
              },
            ].map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-[#E5E9F2] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black"
                  style={{
                    color: card.color,
                    backgroundColor: card.background,
                  }}
                >
                  {card.icon}
                </span>

                <h3 className="mt-4 text-sm font-extrabold text-[#172554]">
                  {card.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#65728A]">
                  {card.prompt}
                </p>
              </article>
            ))}
          </div>

          {/* FAMILY DISCOVERY LOG */}
          <div className="mt-4 rounded-3xl border border-[#E1E6F0] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0E9] text-xl text-[#F47762]">
                ✎
              </div>

              <div>
                <h3 className="text-base font-black text-[#172554]">
                  Family Discovery Log
                </h3>

                <p className="text-[10px] text-[#8993A6]">
                  Your observations, in your own words
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#718096]">
              Optional: record a moment you noticed. Family notes remain
              separate from platform-reviewed observations.
            </p>

            <form onSubmit={saveFamilyNote} className="mt-4 space-y-3">
              <label
                htmlFor="family-note"
                className="block text-xs font-bold text-[#526078]"
              >
                What happened?
              </label>

              <textarea
                id="family-note"
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                rows={3}
                maxLength={1200}
                placeholder="For example: During dinner, my child asked how we could check whether..."
                className="w-full resize-y rounded-2xl border border-[#DFE5EF] bg-[#FAFBFE] p-4 text-sm outline-none transition focus:border-[#5265B8] focus:ring-4 focus:ring-[#5265B8]/10"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-[10px] leading-4 text-[#8993A6]">
                  Notes are saved only in this browser on this device.
                  They are not uploaded, synced or analysed by AI.
                </p>

                <button
                  type="submit"
                  disabled={!noteText.trim() || !activeChild}
                  className="rounded-xl bg-gradient-to-r from-[#283C83] to-[#6651BD] px-5 py-3 text-xs font-bold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save family note
                </button>
              </div>

              {noteMessage && (
                <p
                  role="status"
                  className="text-xs font-semibold text-[#0C9B78]"
                >
                  {noteMessage}
                </p>
              )}
            </form>

            {familyNotes.length > 0 && (
              <div className="mt-5 space-y-3 border-t border-[#E9ECF3] pt-4">
                <h4 className="text-xs font-bold text-[#34415D]">
                  Your saved notes
                </h4>

                {familyNotes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-xl bg-[#F5F6FA] p-3"
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6 text-[#34415D]">
                      {note.text}
                    </p>

                    <p className="mt-2 text-[10px] text-[#8993A6]">
                      {new Date(note.createdAt).toLocaleString('en-IN')}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 06: RECENT ACTIVITY */}
        <section id="discoveries" className="scroll-mt-24">
          <SectionHeading
            number="06"
            eyebrow="Activity history"
            title="Recent discoveries"
            description="A record of completed CubitX activities saved in this browser. This is activity history, not a reviewed evidence timeline."
          />

          <div className="rounded-2xl border border-[#E2E7F0] bg-white p-5 shadow-sm">
            {activity.discoveries.length === 0 ? (
              <p className="text-sm text-[#718096]">
                No completed activities have been recorded on this device yet.
              </p>
            ) : (
              <ol className="space-y-4">
                {activity.discoveries.slice(0, 20).map((item, index) => (
                  <li key={item.id} className="flex gap-3">
                    <span
                      className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[10px] font-black text-white"
                      style={{
                        backgroundColor:
                          index % 3 === 0
                            ? COLORS.blue
                            : index % 3 === 1
                              ? COLORS.violet
                              : COLORS.green,
                      }}
                    >
                      {index + 1}
                    </span>

                    <div>
                      <p className="text-sm font-bold text-[#34415D]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-[10px] text-[#8993A6]">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {activity.discoveries.length > 20 && (
              <p className="mt-4 text-[10px] text-[#8993A6]">
                Showing the latest 20 of {activity.discoveries.length}
                {' '}completed activity records.
              </p>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="rounded-2xl bg-[#172554] px-5 py-5 text-[10px] leading-5 text-[#C4CEE7]">
          <p className="font-bold text-white">
            About this report
          </p>

          <p className="mt-1">
            Activity counts describe participation, not cognitive development.
            Thinking interpretations will appear only when reviewed
            observations are connected. Activity and family notes on this
            version are stored locally in this browser and are not a
            cloud-backed annual record.
          </p>
        </footer>
      </main>
    </div>
  );
}
