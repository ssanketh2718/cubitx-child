import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { computeProfile, LEVEL_LABELS } from '../analytics/profile';
import { HABITS, DIMENSION_LABELS, DIMENSION_ICONS, type DimensionKey } from '../analytics/habits';
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

  if (!user) return null;

  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();
  const openPayment = () =>
    window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer');

  const strongest = profile.strongest;
  const weakest = profile.weakest;

  const strongestHabit = strongest ? HABITS[strongest.dimension as DimensionKey] : null;
  const weakestHabit = weakest ? HABITS[weakest.dimension as DimensionKey] : null;

  const warmth = warmOpening(profile.answersThisWeek, profile.totalAnswers, user.name);

  return (
    <div className="max-w-2xl mx-auto px-5 pb-12">
      {/* Header */}
      <button
        onClick={() => navigate('/home')}
        className="mb-5 flex items-center gap-1.5 text-[12.5px] font-semibold transition hover:text-white"
        style={{ color: BRAND.inkFaint }}
      >
        ← Back to today
      </button>

      <div className="mb-7">
        <div
          className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
          style={{ color: BRAND.blueBright }}
        >
          {user.name}'s thinking
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

      {!profile.hasEnoughData ? (
        <Block title="We need a few more answers">
          <div className="text-[14px] leading-[1.75]" style={{ color: BRAND.inkDim }}>
            {profile.totalAnswers === 0
              ? `${user.name} hasn't answered any written questions yet. Once they do, we'll show what we're noticing.`
              : `${user.name} has answered ${profile.totalAnswers} question${profile.totalAnswers === 1 ? '' : 's'} so far. We need a few more this week to give you a clear picture.`}
          </div>
        </Block>
      ) : (
        <>
          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard value={profile.totalAnswers} label="Answers so far" icon="📝" />
            <StatCard value={profile.answersThisWeek} label="This week" icon="📅" />
            <StatCard
              value={profile.composite}
              label="Thinking score"
              icon="🧠"
              color={BRAND.blueBright}
            />
          </div>

          {/* Dimensions */}
          <Block
            title="Thinking habits"
            subtitle={`${profile.answersThisWeek} written answer${profile.answersThisWeek === 1 ? '' : 's'} this week`}
          >
            <div className="grid gap-5">
              {profile.dimensions.map((d) => (
                <HabitBar
                  key={d.dimension}
                  label={DIMENSION_LABELS[d.dimension as DimensionKey]}
                  icon={DIMENSION_ICONS[d.dimension as DimensionKey]}
                  score={d.score}
                  level={d.level}
                />
              ))}
            </div>
            <div className="text-[12px] mt-6 leading-[1.65]" style={{ color: BRAND.inkFaint }}>
              Each bar fills as {user.name} shows each thinking habit more. The goal is steady growth — not a perfect score.
            </div>
          </Block>

          {/* What we noticed */}
          {strongest && weakest && (
            <Block title="What we noticed this week">
              <Observation
                icon="💪"
                sentence={strongSentence(strongest.dimension as DimensionKey, user.name)}
                tone="positive"
              />
              <Observation
                icon="🌱"
                sentence={weakSentence(weakest.dimension as DimensionKey, user.name)}
                tone="gentle"
              />
            </Block>
          )}

          {/* Evidence */}
          {profile.evidence.length > 0 && (
            <Block title="In their own words">
              {profile.evidence.map((e, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 text-[14px] leading-[1.75] italic mb-3 last:mb-0"
                  style={{ background: 'rgba(0,0,0,0.2)', color: BRAND.inkDim }}
                >
                  “{trim(e, 240)}”
                </div>
              ))}
            </Block>
          )}

          {/* Try this week */}
          {weakestHabit && weakest && (
            <Block title="Try this week">
              <div className="text-[16px] font-semibold mb-2">{weakestHabit.title}</div>
              <div className="text-[13.5px] leading-[1.75] mb-4" style={{ color: BRAND.inkDim }}>
                {weakestHabit.why}
              </div>
              <div
                className="rounded-xl p-4 text-[13.5px] leading-[1.75]"
                style={{
                  background: `${BRAND.blue}10`,
                  border: `1px solid ${BRAND.blue}33`,
                }}
              >
                {weakestHabit.script}
              </div>
            </Block>
          )}

          {/* Strongest habit reminder */}
          {strongestHabit && strongest && (
            <Block title="Where they shine">
              <div className="text-[15px] font-semibold mb-2">{strongestHabit.title}</div>
              <div className="text-[13px] leading-[1.7]" style={{ color: BRAND.inkDim }}>
                {strongSentence(strongest.dimension as DimensionKey, user.name)}
              </div>
            </Block>
          )}
        </>
      )}

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

/* ─── Components ─────────────────────────────── */

function Block({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 mb-5"
      style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
    >
      <div className="text-[16px] font-semibold mb-1">{title}</div>
      {subtitle && (
        <div className="text-[12.5px] mb-4 leading-[1.55]" style={{ color: BRAND.inkDim }}>
          {subtitle}
        </div>
      )}
      <div className={subtitle ? '' : 'mt-3'}>{children}</div>
    </div>
  );
}

function StatCard({
  value, label, icon, color,
}: {
  value: number;
  label: string;
  icon: string;
  color?: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
    >
      <div className="text-[20px] leading-none mb-2">{icon}</div>
      <div
        className="text-[26px] font-bold tabular-nums leading-none"
        style={{ color: color ?? BRAND.blueBright }}
      >
        {value}
      </div>
      <div className="text-[10.5px] mt-1.5 leading-tight" style={{ color: BRAND.inkDim }}>
        {label}
      </div>
    </div>
  );
}

function HabitBar({
  label, icon, score, level,
}: {
  label: string;
  icon: string;
  score: number;
  level: number;
}) {
  const barColor =
    level >= 4 ? BRAND.emerald : level >= 2 ? BRAND.blue : 'rgba(255,255,255,0.15)';

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[18px] leading-none">{icon}</span>
        <div className="text-[14px] font-semibold flex-1" style={{ color: BRAND.ink }}>
          {label}
        </div>
        <div className="text-[12px] font-medium" style={{ color: BRAND.inkDim }}>
          {LEVEL_LABELS[level as 0 | 1 | 2 | 3 | 4]}
        </div>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(score, 2)}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

function Observation({
  icon, sentence, tone,
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

/* ─── Sentence generators ────────────────────── */

function warmOpening(
  thisWeek: number,
  total: number,
  name: string
): { headline: string; subline: string } {
  if (total === 0) {
    return {
      headline: `Let's get ${name} started.`,
      subline: `Once ${name} answers a few questions, this page will show what they're building.`,
    };
  }
  if (thisWeek < 3) {
    return {
      headline: `We're getting to know ${name}'s thinking.`,
      subline: `A few more answers this week and the picture becomes clearer.`,
    };
  }
  return {
    headline: `Here's what ${name} has been thinking.`,
    subline: `Every answer reveals a habit. Below is what we're seeing — and one way to build on it at home.`,
  };
}

function strongSentence(key: DimensionKey, name: string): string {
  switch (key) {
    case 'interpretation':
      return `${name} notices specific details. When they answer, they mention concrete things — not just general ideas.`;
    case 'reasoning':
      return `${name} explains why they chose something. The habit of giving reasons is a real strength.`;
    case 'openMindedness':
      return `${name} considers more than one possibility. They don't just jump to the first idea.`;
    case 'evaluation':
      return `${name} questions where information comes from. That's the essential skill of the AI era.`;
    case 'revision':
      return `${name} is willing to change their mind when new information appears. That's a strong habit — most adults struggle with it.`;
    default:
      return `${name} is showing a strong habit this week.`;
  }
}

function weakSentence(key: DimensionKey, name: string): string {
  switch (key) {
    case 'interpretation':
      return `${name} tends to speak in general terms. We're working on noticing specifics.`;
    case 'reasoning':
      return `${name} often answers without explaining why. This week we'll work on reasons.`;
    case 'openMindedness':
      return `${name} commits to the first idea quickly. We're working on considering other options.`;
    case 'evaluation':
      return `${name} accepts information without checking where it comes from. We're working on source evaluation.`;
    case 'revision':
      return `${name} rarely changes their mind once decided. We're working on being open.`;
    default:
      return `${name} is still building one habit this week.`;
  }
}

function trim(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max).trim() + '…';
}