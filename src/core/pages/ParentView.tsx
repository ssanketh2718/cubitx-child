import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { computeProfile } from '../analytics/profile';
import { HABITS } from '../analytics/habits';
import { LEVEL_LABELS, LEVEL_ICONS, type Level } from '../analytics/signals';
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
  const streak = useApp((s) => s.getStreak());
  const isTrialActive = useApp((s) => s.isTrialActive);
  const getTrialDaysLeft = useApp((s) => s.getTrialDaysLeft);

  const profile = useMemo(() => computeProfile(responses), [responses]);
  const habit = HABITS[profile.weakest];

  if (!user) return null;

  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();

  const openPayment = () =>
    window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer');

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
          {user.name}'s thinking
        </h1>
        <div className="text-[13.5px] mt-1.5" style={{ color: BRAND.inkDim }}>
          Class {user.grade} · {streak}-day streak
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
            <div className="text-[11.5px] mt-0.5" style={{ color: BRAND.inkFaint }}>
              ₹999/year afterwards — cancel anytime
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
            {profile.writtenCount === 0
              ? `${user.name} hasn't answered any written questions yet. Once they do, we'll show what we're noticing.`
              : `${user.name} has answered ${profile.writtenCount} written ${
                  profile.writtenCount === 1 ? 'question' : 'questions'
                } this week. We need a few more to give you a clear picture — usually within 2–3 days.`}
          </div>
        </Block>
      ) : (
        <>
          <Block title="What we noticed this week">
            <Observation
              icon={LEVEL_ICONS[strongestDim.level]}
              sentence={strongSentence(strongestDim.key, user.name)}
              tone="positive"
            />
            <Observation
              icon={LEVEL_ICONS[weakestDim.level]}
              sentence={weakSentence(weakestDim.key, user.name)}
              tone="gentle"
            />
          </Block>

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

          <Block title="How they're growing">
            <div className="grid gap-3">
              {profile.dimensions.map((d) => (
                <GrowthRow
                  key={d.key}
                  label={d.plain}
                  current={d.level}
                  previous={d.previousLevel}
                />
              ))}
            </div>
            <div className="text-[12.5px] mt-5 leading-[1.65]" style={{ color: BRAND.inkFaint }}>
              Every week we look at how {user.name} thinks — not what they got right.
            </div>
          </Block>
        </>
      )}

      {!trialActive && (
        <div
          className="mt-8 rounded-2xl p-6 text-center"
          style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
        >
          <div className="text-[16px] font-bold mb-2">Unlock CubitX for ₹999/year</div>
          <div className="text-[13px] mb-4" style={{ color: BRAND.inkDim }}>
            Keep the thinking habit going.
          </div>
          <button
            onClick={openPayment}
            className="px-8 py-3.5 rounded-full font-bold text-[14px]"
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
      <span className="text-[22px] leading-none mt-[2px]">{icon}</span>
      <div
        className="text-[14px] leading-[1.7] flex-1"
        style={{ color: tone === 'positive' ? BRAND.ink : BRAND.inkDim }}
      >
        {sentence}
      </div>
    </div>
  );
}

function GrowthRow({
  label,
  current,
  previous,
}: {
  label: string;
  current: Level;
  previous: Level | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[18px] leading-none">{LEVEL_ICONS[current]}</span>
      <span className="text-[13.5px] flex-1" style={{ color: BRAND.ink }}>
        {label}
      </span>
      <span className="text-[12px] font-semibold" style={{ color: BRAND.inkFaint }}>
        {LEVEL_LABELS[current]}
      </span>
      {previous !== null && previous < current && (
        <span className="text-[11px] font-bold" style={{ color: BRAND.emerald }}>
          ↑
        </span>
      )}
    </div>
  );
}

function strongSentence(key: string, name: string): string {
  switch (key) {
    case 'noticing':
      return `${name} notices small things. When they answer, they often mention specific details — not just general ideas.`;
    case 'reasoning':
      return `${name} explains why they chose something. That habit of giving reasons is a real strength.`;
    case 'openMindedness':
      return `${name} considers more than one possibility. They don't just jump to the first idea.`;
    case 'revising':
      return `${name} is willing to change their mind when they see new information. That's a strong thinking habit — most adults struggle with it.`;
    case 'curiosity':
      return `${name} asks good questions. They push back on ideas and want to know more.`;
    default:
      return `${name} is showing strong thinking in one area this week.`;
  }
}

function weakSentence(key: string, name: string): string {
  switch (key) {
    case 'noticing':
      return `${name} tends to speak in general terms. We're working on noticing specific details.`;
    case 'reasoning':
      return `${name} often gives an answer without explaining why. This week we'll work on the habit of giving reasons.`;
    case 'openMindedness':
      return `${name} usually commits to the first idea that comes. We're working on considering other possibilities.`;
    case 'revising':
      return `${name} rarely changes their mind once they've decided. We're working on openness to revising.`;
    case 'curiosity':
      return `${name} answers what is asked, but rarely asks their own questions. We're working on the habit of questioning.`;
    default:
      return `${name} is still developing in one area this week.`;
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
      return `A real example of ${name}'s thinking this week.`;
  }
}

function trim(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max).trim() + '…';
}
