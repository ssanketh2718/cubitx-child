import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { computeProfile } from '../analytics/profile';
import { HABITS } from '../analytics/habits';
import { type Level } from '../analytics/signals';
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
  const openPayment = () => window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer');

  const strongestDim = profile.dimensions.find((d) => d.key === profile.strongest)!;
  const weakestDim = profile.dimensions.find((d) => d.key === profile.weakest)!;

  return (
    <div className="max-w-2xl mx-auto px-5 pb-10">
      <div className="mb-7">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 flex items-center gap-1.5 text-[12.5px] font-semibold transition hover:text-white"
          style={{ color: BRAND.inkFaint }}
        >
          ← Back to today
        </button>
        <h1 className="text-[28px] font-semibold tracking-tight">
          {user.name}'s habits
        </h1>
        <div className="text-[13.5px] mt-1.5" style={{ color: BRAND.inkDim }}>
          Class {user.grade} · {profile.activeDays} active days out of {profile.totalDays}
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

      <Block title="Consistency">
        <ConsistencyCalendar days={profile.consistency} />
        <div className="text-[13px] mt-4" style={{ color: BRAND.inkDim }}>
          {profile.activeDays === 0
            ? `No sessions yet. Once ${user.name} starts, their daily rhythm appears here.`
            : `${profile.activeDays} of the last ${profile.totalDays} days had a session. Small, steady habits matter more than perfect ones.`}
        </div>
      </Block>

      {profile.writtenCount > 0 && (
        <Block title="Habits this week">
          <div className="grid grid-cols-5 gap-3">
            {profile.dimensions.map((d) => (
              <Ring
                key={d.key}
                label={d.plain}
                level={d.level}
                previousLevel={d.previousLevel}
              />
            ))}
          </div>
          <div className="text-[12.5px] mt-5 leading-[1.65]" style={{ color: BRAND.inkFaint }}>
            Each ring fills as {user.name} shows that habit more. The goal is steady growth — not a perfect score.
          </div>
        </Block>
      )}

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

      {profile.exampleResponse && (
        <Block title="One of their answers">
          <div
            className="rounded-xl p-4 text-[14px] leading-[1.75] italic mb-3"
            style={{ background: 'rgba(0,0,0,0.2)', color: BRAND.inkDim }}
          >
            “{trim(profile.exampleResponse.text, 240)}”
          </div>
          <div className="text-[13px] leading-[1.7]" style={{ color: BRAND.inkDim }}>
            {praiseFor(strongestDim.key, user.name)}
          </div>
        </Block>
      )}

      <Block title="Try this week">
        <div className="text-[16px] font-semibold mb-2">{habit.title}</div>
        <div className="text-[13.5px] leading-[1.75] mb-4" style={{ color: BRAND.inkDim }}>
          {habit.why}
        </div>
        <div
          className="rounded-xl p-4 text-[13.5px] leading-[1.75]"
          style={{
            background: `${BRAND.blue}10`,
            border: `1px solid ${BRAND.blue}33`,
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

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 mb-5"
      style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
    >
      <div className="text-[16px] font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function ConsistencyCalendar({
  days,
}: {
  days: { date: string; count: number }[];
}) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="flex flex-wrap gap-1.5">
      {days.map((d) => {
        const intensity = d.count === 0 ? 0 : Math.min(1, d.count / max);
        const bg =
          d.count === 0
            ? 'rgba(255,255,255,0.04)'
            : `rgba(123,141,255,${0.25 + intensity * 0.65})`;
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.count} item${d.count === 1 ? '' : 's'}`}
            className="w-7 h-7 rounded-md transition-colors"
            style={{ background: bg, border: `1px solid ${BRAND.inkGhost}` }}
          />
        );
      })}
    </div>
  );
}

function Ring({
  label,
  level,
  previousLevel,
}: {
  label: string;
  level: Level;
  previousLevel: Level | null;
}) {
  const size = 52;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = level === 0 ? 0.15 : level === 1 ? 0.55 : 1;
  const dash = circumference * pct;

  const grew = previousLevel !== null && previousLevel < level;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={level >= 2 ? BRAND.emerald : BRAND.blue}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        {grew && (
          <span
            className="absolute -top-1 -right-1 text-[10px] font-bold"
            style={{ color: BRAND.emerald }}
          >
            ↑
          </span>
        )}
      </div>
      <div
        className="text-[9.5px] text-center font-semibold leading-tight"
        style={{ color: BRAND.inkDim }}
      >
        {label}
      </div>
    </div>
  );
}

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
    <div className="flex items-start gap-3 mb-3 last:mb-0">
      <span className="text-[20px] leading-none mt-[3px]">{icon}</span>
      <div
        className="text-[14px] leading-[1.7] flex-1"
        style={{ color: tone === 'positive' ? BRAND.ink : BRAND.inkDim }}
      >
        {sentence}
      </div>
    </div>
  );
}

function strongSentence(key: string, name: string): string {
  switch (key) {
    case 'noticing':
      return `${name} notices details. When they answer, they mention specific things — not just general ideas.`;
    case 'reasoning':
      return `${name} explains why they chose something. That habit of giving reasons is a real strength.`;
    case 'openMindedness':
      return `${name} considers more than one possibility. They don't just jump to the first idea.`;
    case 'revising':
      return `${name} changes their mind when new information appears. That's a strong habit.`;
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
      return `${name} grounded this answer in something specific.`;
    case 'reasoning':
      return `${name} connected their choice to a reason.`;
    case 'openMindedness':
      return `${name} held more than one idea in mind.`;
    case 'revising':
      return `${name} left room to change their mind.`;
    case 'curiosity':
      return `${name} asked a real question here.`;
    default:
      return `A real example of ${name}'s habit.`;
  }
}

function trim(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max).trim() + '…';
}