import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { computeProfile } from '../analytics/profile';
import { HABITS } from '../analytics/habits';
import { LEVEL_LABELS, type Level } from '../analytics/signals';
import { PAYMENT_LINK } from '../config';

const BRAND = {
  surface: '#05091a',
  surface2: '#0a1228',
  blue: '#7b8dff',
  blueBright: '#9aaaff',
  ink: '#ffffff',
  inkDim: 'rgba(255,255,255,0.62)',
  inkFaint: 'rgba(255,255,255,0.38)',
  inkGhost: 'rgba(255,255,255,0.14)',
  emerald: '#34d399',
  amber: '#fbbf24',
};

export default function ParentView() {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const responses = useApp((s) => s.responses);
  const isTrialActive = useApp((s) => s.isTrialActive);
  const getTrialDaysLeft = useApp((s) => s.getTrialDaysLeft);

  const profile = computeProfile(responses);
  const habit = HABITS[profile.weakest];

  if (!user) return null;

  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();
  const openPayment = () =>
    window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer');

  const strongestDim = profile.dimensions.find((d) => d.key === profile.strongest)!;
  const weakestDim = profile.dimensions.find((d) => d.key === profile.weakest)!;

  const warmth = warmOpening(profile.writtenCount, profile.activeDays, user.name);

  return (
    <div className="max-w-2xl mx-auto px-5 pb-12">
      {/* ─── HERO ─────────────────────────────────────── */}
      <button
        onClick={() => navigate('/home')}
        className="mb-5 flex items-center gap-1.5 text-[12.5px] font-semibold transition hover:text-white"
        style={{ color: BRAND.inkFaint }}
      >
        ← Back to today
      </button>

      <div className="mb-8">
        <div
          className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
          style={{ color: BRAND.blueBright }}
        >
          {user.name}'s habits
        </div>
        <h1 className="text-[28px] md:text-[32px] font-semibold leading-[1.15] tracking-tight">
          {warmth.headline}
        </h1>
        <div className="text-[14.5px] mt-3 leading-[1.65]" style={{ color: BRAND.inkDim }}>
          {warmth.subline}
        </div>
      </div>

      {trialActive && trialDaysLeft !== null && (
        <div
          className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
        >
          <span className="text-2xl">⏳</span>
          <div className="flex-1">
            <div className="text-[13.5px] font-bold">
              {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} left in trial
            </div>
          </div>
          <button
            onClick={openPayment}
            className="text-[12px] font-black px-3.5 py-2 rounded-full"
            style={{ background: BRAND.ink, color: BRAND.surface }}
          >
            Upgrade
          </button>
        </div>
      )}

      {/* ─── CONSISTENCY ──────────────────────────────── */}
      <Block
        title="Their rhythm"
        subtitle={
          profile.activeDays === 0
            ? `No sessions yet — this fills in as ${user.name} plays.`
            : `${profile.activeDays} active ${profile.activeDays === 1 ? 'day' : 'days'} out of the last ${profile.totalDays}`
        }
        accent={profile.activeDays > 0 ? BRAND.emerald : undefined}
      >
        <CalendarGrid days={profile.consistency} />
        <div className="flex items-center gap-4 mt-4 text-[11px]" style={{ color: BRAND.inkFaint }}>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-[3px]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${BRAND.inkGhost}`,
              }}
            />
            no session
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px]" style={{ background: 'rgba(123,141,255,0.4)' }} />
            some
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px]" style={{ background: 'rgba(123,141,255,0.95)' }} />
            full day
          </span>
        </div>
      </Block>

      {/* ─── FIVE HABITS ──────────────────────────────── */}
      <Block
        title="Habits they're building"
        subtitle={
          profile.writtenCount === 0
            ? 'Habits appear once they answer their first written question.'
            : `${profile.writtenCount} written ${profile.writtenCount === 1 ? 'answer' : 'answers'} this week`
        }
      >
        <div className="grid gap-5">
          {profile.dimensions.map((d) => (
            <HabitBar
              key={d.key}
              label={d.plain}
              level={d.level}
              previousLevel={d.previousLevel}
            />
          ))}
        </div>
        <div
          className="text-[12px] mt-6 leading-[1.65]"
          style={{ color: BRAND.inkFaint }}
        >
          Bars fill as {user.name} shows each habit more. The goal is steady growth — not perfection.
        </div>
      </Block>

      {/* ─── OBSERVATIONS ─────────────────────────────── */}
      {profile.writtenCount > 0 && (
        <Block title="What we noticed this week">
          <Observation
            icon="💪"
            sentence={strongSentence(strongestDim.key, user.name)}
            tone="positive"
          />
          <Observation
            icon="🌱"
            sentence={weakSentence(weakestDim.key, user.name)}
            tone="gentle"
          />
        </Block>
      )}

      {/* ─── EXAMPLE ──────────────────────────────────── */}
      {profile.exampleResponse && (
        <Block title="In their own words">
          <div
            className="rounded-xl p-4 text-[14.5px] leading-[1.75] italic mb-3"
            style={{ background: 'rgba(0,0,0,0.25)', color: BRAND.ink }}
          >
            “{trim(profile.exampleResponse.text, 240)}”
          </div>
          <div className="text-[13px] leading-[1.7]" style={{ color: BRAND.inkDim }}>
            {praiseFor(strongestDim.key, user.name)}
          </div>
        </Block>
      )}

      {/* ─── ACTION ───────────────────────────────────── */}
      <Block title="One thing to try this week" accent={BRAND.amber}>
        <div className="text-[17px] font-semibold mb-2 leading-[1.3]">{habit.title}</div>
        <div className="text-[13.5px] leading-[1.75] mb-4" style={{ color: BRAND.inkDim }}>
          {habit.why}
        </div>
        <div
          className="rounded-xl p-4 text-[14px] leading-[1.75]"
          style={{
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.28)',
            color: BRAND.ink,
          }}
        >
          {habit.script}
        </div>
      </Block>

      {!trialActive && (
        <div
          className="mt-8 rounded-2xl p-6 text-center"
          style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
        >
          <div className="text-[16px] font-bold mb-2">Unlock CubitX for ₹999/year</div>
          <button
            onClick={openPayment}
            className="mt-4 px-8 py-3.5 rounded-full font-bold text-[14px]"
            style={{ background: BRAND.ink, color: BRAND.surface }}
          >
            Continue Learning →
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Blocks
   ═══════════════════════════════════════════════════════ */

function Block({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 mb-5"
      style={{
        background: BRAND.surface2,
        border: `1px solid ${accent ? accent + '33' : BRAND.inkGhost}`,
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        {accent && (
          <span
            className="w-1 h-8 rounded-full flex-shrink-0 mt-1"
            style={{ background: accent }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-semibold leading-tight">{title}</div>
          {subtitle && (
            <div
              className="text-[12.5px] mt-1 leading-[1.55]"
              style={{ color: BRAND.inkDim }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── Calendar ────────────────────────────────────── */

function CalendarGrid({
  days,
}: {
  days: { date: string; count: number }[];
}) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => {
        const intensity = d.count === 0 ? 0 : Math.min(1, d.count / max);
        const bg =
          d.count === 0
            ? 'rgba(255,255,255,0.04)'
            : `rgba(123,141,255,${0.35 + intensity * 0.6})`;
        const today = new Date().toISOString().slice(0, 10);
        const isToday = d.date === today;
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.count} item${d.count === 1 ? '' : 's'}`}
            className="aspect-square rounded-md transition-all"
            style={{
              background: bg,
              border: `1px solid ${isToday ? BRAND.blueBright : BRAND.inkGhost}`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Habit bar ───────────────────────────────────── */

function HabitBar({
  label,
  level,
  previousLevel,
}: {
  label: string;
  level: Level;
  previousLevel: Level | null;
}) {
  const pct = level === 0 ? 8 : level === 1 ? 55 : 100;
  const barColor =
    level === 0 ? 'rgba(255,255,255,0.15)' : level === 1 ? BRAND.blue : BRAND.emerald;
  const grew = previousLevel !== null && previousLevel < level;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[14px] font-semibold" style={{ color: BRAND.ink }}>
          {label}
        </div>
        <div className="flex items-center gap-2">
          {grew && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: `${BRAND.emerald}20`, color: BRAND.emerald }}
            >
              ↑ growing
            </span>
          )}
          <span className="text-[12px] font-medium" style={{ color: BRAND.inkDim }}>
            {LEVEL_LABELS[level]}
          </span>
        </div>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

/* ─── Observation ─────────────────────────────────── */

function Observation({
  icon,
  sentence,
  tone,
}: {
  icon: string;
  sentence: string;
  tone: 'positive' | 'gentle';
}) {
  return (
    <div className="flex items-start gap-3 mb-4 last:mb-0">
      <span className="text-[22px] leading-none mt-[2px]">{icon}</span>
      <div
        className="text-[14.5px] leading-[1.7] flex-1"
        style={{ color: tone === 'positive' ? BRAND.ink : BRAND.inkDim }}
      >
        {sentence}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Warm opening — reassure, then guide
   ═══════════════════════════════════════════════════════ */

function warmOpening(
  written: number,
  activeDays: number,
  name: string
): { headline: string; subline: string } {
  if (written === 0 && activeDays === 0) {
    return {
      headline: `Let's get ${name} started.`,
      subline: `Once ${name} answers a few questions, this page will show what they're building — and how you can help at home.`,
    };
  }
  if (written < 3) {
    return {
      headline: `${name} is getting started.`,
      subline: `We can see early habits forming. A few more answers this week and the picture becomes clearer.`,
    };
  }
  if (activeDays >= 5) {
    return {
      headline: `${name} is building a real rhythm.`,
      subline: `Consistency is the hardest part, and ${name} is showing up. Here's what we're noticing — and one small thing you can do this week.`,
    };
  }
  return {
    headline: `Here's how ${name} has been thinking.`,
    subline: `Every answer reveals a habit. Below is what we're seeing — and one way to build on it at home.`,
  };
}

/* ═══════════════════════════════════════════════════════
   Sentences — plain, warm, non-judgmental
   ═══════════════════════════════════════════════════════ */

function strongSentence(key: string, name: string): string {
  switch (key) {
    case 'noticing':
      return `${name} notices details. When they answer, they mention specific things — not just general ideas.`;
    case 'reasoning':
      return `${name} explains why they chose something. That habit of giving reasons is a real strength.`;
    case 'openMindedness':
      return `${name} considers more than one possibility. They don't just jump to the first idea.`;
    case 'revising':
      return `${name} changes their mind when new information appears. That's a strong habit — many adults struggle with it.`;
    case 'curiosity':
      return `${name} asks good questions. They push back and want to know more.`;
    default:
      return `${name} is showing a strong habit this week.`;
  }
}

function weakSentence(key: string, name: string): string {
  switch (key) {
    case 'noticing':
      return `${name} tends to speak in general terms. We're working on noticing specifics.`;
    case 'reasoning':
      return `${name} often answers without explaining why. This week we'll work on reasons.`;
    case 'openMindedness':
      return `${name} commits to the first idea quickly. We're working on considering other options.`;
    case 'revising':
      return `${name} rarely changes their mind once decided. We're working on being open.`;
    case 'curiosity':
      return `${name} answers what's asked but rarely asks their own questions.`;
    default:
      return `${name} is still building one habit this week.`;
  }
}

function praiseFor(key: string, name: string): string {
  switch (key) {
    case 'noticing':
      return `${name} grounded this answer in something specific — that's a habit worth keeping.`;
    case 'reasoning':
      return `${name} connected their choice to a reason. That's the core of clear thinking.`;
    case 'openMindedness':
      return `${name} held more than one idea in mind before deciding. That's mature thinking.`;
    case 'revising':
      return `${name} left room to change their mind. That's a strength, not a weakness.`;
    case 'curiosity':
      return `${name} asked a real question here. That's what good thinkers do.`;
    default:
      return `A real example of ${name}'s habit this week.`;
  }
}

function trim(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max).trim() + '…';
}