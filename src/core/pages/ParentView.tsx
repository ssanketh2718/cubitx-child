import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import {
  computeProfile,
  SIGNAL_LABELS,
  SIGNAL_DESCRIPTIONS,
  THINKER_INFO,
  type SignalKey,
} from '../analytics/profile';
import { HABITS } from '../analytics/habits';
import { buildStarters } from '../analytics/conversations';
import { loadDayConfig } from '../../missions/curriculum';
import { curriculumTierFrom } from '../../missions/tiers';
import type { DayItem } from '../../missions/types';
import { PAYMENT_LINK } from '../config';

const BRAND = {
  surface: '#05091a',
  surface2: '#0a1228',
  blue: '#7b8dff',
  blueBright: '#9aaaff',
  blueSoft: '#a8b6ff',
  ink: '#ffffff',
  inkDim: 'rgba(255,255,255,0.62)',
  inkFaint: 'rgba(255,255,255,0.38)',
  inkGhost: 'rgba(255,255,255,0.14)',
  emerald: '#34d399',
  red: '#f87171',
};

export default function ParentView() {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const responses = useApp((s) => s.responses);
  const days = useApp((s) => s.days);
  const streak = useApp((s) => s.getStreak());
  const isTrialActive = useApp((s) => s.isTrialActive);
  const getTrialDaysLeft = useApp((s) => s.getTrialDaysLeft);

  const profile = useMemo(() => computeProfile(responses), [responses]);
  const starters = useMemo(() => buildStarters(responses, 3), [responses]);
  const habit = HABITS[profile.weakness];

  const tier = user ? curriculumTierFrom(user.tier) : 1;

  const dayData = useMemo(() => {
    const out: {
      day: number;
      label?: string;
      items: {
        key: string;
        item: DayItem;
        response: ReturnType<typeof useApp.getState>['responses'][string] | null;
      }[];
      doneCount: number;
      total: number;
      completedAt: string | null;
    }[] = [];

    for (let d = 1; d <= 30; d++) {
      const cfg = loadDayConfig(tier, d);
      if (!cfg || cfg.items.length === 0) continue;

      const dayProgress = days[d];
      const items = cfg.items.map((item, idx) => {
        const key = itemKey(item, idx);
        return { key, item, response: responses[key] ?? null };
      });

      const doneCount = items.filter((i) => !!i.response).length;
      if (doneCount === 0 && !dayProgress) continue;

      out.push({
        day: d,
        label: cfg.label,
        items,
        doneCount,
        total: cfg.items.length,
        completedAt: dayProgress?.completedAt ?? null,
      });
    }
    return out;
  }, [tier, responses, days]);

  if (!user) return null;

  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();
  const totalItemsDone = dayData.reduce((s, d) => s + d.doneCount, 0);
  const totalWords = Object.values(responses).reduce(
    (s, r) => s + (r.text ? r.text.trim().split(/\s+/).filter(Boolean).length : 0),
    0
  );

  const openPayment = () =>
    window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer');

  const isEarlyStage = profile.weekCount < 3;

  return (
    <div className="max-w-3xl mx-auto px-5 pb-10">
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
          Class {user.grade} · {streak}-day streak · {totalItemsDone} answers so far
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

      {isEarlyStage && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: `${BRAND.blue}0e`, border: `1px solid ${BRAND.blue}30` }}
        >
          <div className="text-[14px] font-semibold mb-1.5">
            The picture sharpens as more answers come in
          </div>
          <div className="text-[13px] leading-[1.65]" style={{ color: BRAND.inkDim }}>
            {profile.weekCount} answer{profile.weekCount === 1 ? '' : 's'} this week.
            Analytical insights appear once your child has answered a few more —
            usually within 2–3 days.
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard value={profile.weekCount} label="Answers this week" />
        <StatCard value={profile.lastWeekCount} label="Answers last week" />
        <StatCard value={totalWords} label="Words written total" />
      </div>

      <Section
        eyebrow="This week's profile"
        title={THINKER_INFO[profile.type].label}
        subtitle={THINKER_INFO[profile.type].blurb}
      >
        <div className="mt-5 grid gap-3">
          {(Object.keys(SIGNAL_LABELS) as SignalKey[]).map((k) => (
            <SignalBar
              key={k}
              label={SIGNAL_LABELS[k]}
              value={profile.signals[k]}
              previous={profile.lastWeekSignals[k]}
              hasPrev={profile.lastWeekCount > 0}
            />
          ))}
        </div>
      </Section>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <Eyebrow color={BRAND.emerald}>Where they shine</Eyebrow>
          <div className="text-[15px] font-semibold mt-2 mb-1">
            {SIGNAL_LABELS[profile.strength]}
          </div>
          <div className="text-[12.5px] leading-[1.65]" style={{ color: BRAND.inkDim }}>
            {SIGNAL_DESCRIPTIONS[profile.strength]}
          </div>
        </Card>

        <Card>
          <Eyebrow color={BRAND.blueBright}>Where they're working</Eyebrow>
          <div className="text-[15px] font-semibold mt-2 mb-1">
            {SIGNAL_LABELS[profile.weakness]}
          </div>
          <div className="text-[12.5px] leading-[1.65]" style={{ color: BRAND.inkDim }}>
            {SIGNAL_DESCRIPTIONS[profile.weakness]}
          </div>
        </Card>
      </div>

      <Section eyebrow="This week's habit" title={habit.title}>
        <div className="text-[13.5px] leading-[1.75] mt-3 mb-4" style={{ color: BRAND.inkDim }}>
          {habit.why}
        </div>
        <div
          className="rounded-xl p-4 text-[13.5px] leading-[1.7]"
          style={{
            background: 'rgba(0,0,0,0.25)',
            border: `1px solid ${BRAND.inkGhost}`,
          }}
        >
          <div
            className="text-[10px] font-bold uppercase mb-2"
            style={{ color: BRAND.blueSoft, letterSpacing: '0.16em' }}
          >
            Try this
          </div>
          {habit.script}
        </div>
      </Section>

      {starters.length > 0 && (
        <Section
          eyebrow="What to ask at dinner"
          title="Three openings, based on what they wrote"
        >
          <div className="mt-4 grid gap-3">
            {starters.map((s) => (
              <div
                key={s.itemKey}
                className="rounded-xl p-4"
                style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
              >
                <div
                  className="text-[11px] font-bold uppercase mb-2"
                  style={{ color: BRAND.inkFaint, letterSpacing: '0.14em' }}
                >
                  They wrote
                </div>
                <div
                  className="text-[13.5px] leading-[1.65] italic mb-3"
                  style={{ color: BRAND.inkDim }}
                >
                  “{s.childWrote}
                  {s.childWrote.length >= 140 ? '…' : ''}”
                </div>
                <div className="text-[13.5px] font-semibold" style={{ color: BRAND.blueBright }}>
                  → {s.tryThis}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section eyebrow="Day by day" title="Everything they answered">
        {dayData.length === 0 ? (
          <div className="text-[13.5px] mt-3" style={{ color: BRAND.inkFaint }}>
            Nothing here yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {dayData.map((d) => (
              <DayCard key={d.day} data={d} />
            ))}
          </div>
        )}
      </Section>

      {!trialActive && (
        <div
          className="mt-8 rounded-2xl p-6 text-center"
          style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
        >
          <div className="text-[16px] font-bold mb-2">Unlock CubitX for ₹999/year</div>
          <div className="text-[13px] mb-4" style={{ color: BRAND.inkDim }}>
            Keep your child's thinking habit going.
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

function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
    >
      <div
        className="text-[10px] font-bold uppercase mb-2"
        style={{ color: BRAND.blueSoft, letterSpacing: '0.18em' }}
      >
        {eyebrow}
      </div>
      <div className="text-[19px] font-semibold leading-[1.25]">{title}</div>
      {subtitle && (
        <div className="text-[13px] mt-2 leading-[1.65]" style={{ color: BRAND.inkDim }}>
          {subtitle}
        </div>
      )}
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="text-[10px] font-bold uppercase" style={{ color, letterSpacing: '0.16em' }}>
      {children}
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
    >
      <div className="text-[26px] font-bold tabular-nums" style={{ color: BRAND.blueBright }}>
        {value}
      </div>
      <div className="text-[11px] mt-1 leading-tight" style={{ color: BRAND.inkFaint }}>
        {label}
      </div>
    </div>
  );
}

function SignalBar({
  label,
  value,
  previous,
  hasPrev,
}: {
  label: string;
  value: number;
  previous: number;
  hasPrev: boolean;
}) {
  const delta = hasPrev ? value - previous : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[12.5px] font-medium" style={{ color: BRAND.inkDim }}>
          {label}
        </div>
        {hasPrev && delta !== 0 && (
          <div
            className="text-[11px] font-bold tabular-nums"
            style={{ color: delta > 0 ? BRAND.emerald : BRAND.red }}
          >
            {delta > 0 ? '+' : ''}
            {delta}
          </div>
        )}
      </div>
      <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            background:
              value >= 60 ? BRAND.emerald : value >= 35 ? BRAND.blue : 'rgba(255,255,255,0.25)',
          }}
        />
      </div>
    </div>
  );
}

function DayCard({ data }: { data: any }) {
  const isComplete = !!data.completedAt;
  return (
    <details
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BRAND.inkGhost}` }}
    >
      <summary className="cursor-pointer list-none p-4 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
          style={{
            background: isComplete ? 'rgba(52,211,153,0.15)' : `${BRAND.blue}1c`,
            color: isComplete ? BRAND.emerald : BRAND.blueBright,
          }}
        >
          {data.day}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold">
            Day {data.day}
            {data.label && (
              <span className="ml-2 text-[11.5px] font-normal" style={{ color: BRAND.inkFaint }}>
                {data.label.replace(/^Day \d+ · /, '')}
              </span>
            )}
          </div>
          <div className="text-[11.5px] mt-0.5" style={{ color: BRAND.inkFaint }}>
            {data.doneCount} of {data.total} answered
            {isComplete && ' · completed'}
          </div>
        </div>
        <span className="text-[11px]" style={{ color: BRAND.inkFaint }}>
          view ▾
        </span>
      </summary>
      <div className="px-4 pb-4 grid gap-3" style={{ borderTop: `1px solid ${BRAND.inkGhost}` }}>
        {data.items.map((i: any) => (
          <ResponseCard key={i.key} item={i.item} response={i.response} />
        ))}
      </div>
    </details>
  );
}

function ResponseCard({ item, response }: { item: DayItem; response: any }) {
  const answered = !!response;
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: answered ? 'rgba(255,255,255,0.02)' : 'transparent',
        border: `1px solid ${answered ? BRAND.inkGhost : 'rgba(255,255,255,0.06)'}`,
        opacity: answered ? 1 : 0.55,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[16px] leading-none">{itemEmoji(item)}</span>
        <span className="text-[12.5px] font-bold">{itemTitle(item)}</span>
        {!answered && (
          <span className="ml-auto text-[10px]" style={{ color: BRAND.inkFaint }}>
            not answered
          </span>
        )}
      </div>
      {answered && response && (
        <>
          {item.engine === 'opinion' &&
            typeof response.picked === 'number' &&
            item.options[response.picked] && (
              <div
                className="rounded-lg px-3 py-2 mb-2 text-[12.5px] font-semibold inline-flex items-center gap-2"
                style={{ background: `${BRAND.blue}1c`, color: BRAND.blueBright }}
              >
                <span>{item.options[response.picked].em}</span>
                <span>{item.options[response.picked].label}</span>
              </div>
            )}
          {response.text && (
            <div
              className="rounded-lg px-3 py-2.5 text-[13px] leading-[1.6] italic"
              style={{ background: 'rgba(0,0,0,0.2)', color: BRAND.ink }}
            >
              “{response.text}”
            </div>
          )}
        </>
      )}
    </div>
  );
}

function itemKey(item: DayItem, idx: number): string {
  switch (item.engine) {
    case 'm1':
    case 'm2':
    case 'm3':
    case 'm4':
    case 'm5':
      return `${item.engine}:${item.puzzle}`;
    case 'math':
      return `math:${item.title.slice(0, 40)}`;
    case 'opinion':
      return `opinion:${item.question.slice(0, 40)}`;
    case 'creative':
      return `creative:${item.prompt.slice(0, 40)}`;
    case 'watch':
      return `watch:${item.video}`;
  }
  return `item:${idx}`;
}

function itemEmoji(item: DayItem): string {
  switch (item.engine) {
    case 'm1': return '🔢';
    case 'm2': return '⚖️';
    case 'm3': return '🔮';
    case 'm4': return '🎯';
    case 'm5': return '💭';
    case 'math': return '🔢';
    case 'opinion': return '🗣️';
    case 'creative': return '✨';
    case 'watch': return '🎬';
  }
}

function itemTitle(item: DayItem): string {
  switch (item.engine) {
    case 'm1': return 'Secret Machine';
    case 'm2': return 'Balance Detective';
    case 'm3': return 'Pattern Detective';
    case 'm4': return 'Cause Detective';
    case 'm5': return 'Big Question';
    case 'math': return item.title;
    case 'opinion': return 'Your Opinion';
    case 'creative': return 'Create';
    case 'watch': return 'Watch & Think';
  }
}
