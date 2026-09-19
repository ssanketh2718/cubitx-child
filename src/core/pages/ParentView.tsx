import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { loadDayConfig } from '../../missions/curriculum';
import { curriculumTierFrom } from '../../missions/tiers';
import type { DayItem, CurriculumTier } from '../../missions/types';
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
};

export default function ParentView() {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const responses = useApp((s) => s.responses);
  const days = useApp((s) => s.days);
  const streak = useApp((s) => s.getStreak());
  const isTrialActive = useApp((s) => s.isTrialActive);
  const getTrialDaysLeft = useApp((s) => s.getTrialDaysLeft);

  const tier: CurriculumTier = user ? curriculumTierFrom(user.tier) : 1;

  // Build a per-day picture
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
        return {
          key,
          item,
          response: responses[key] ?? null,
        };
      });

      const doneCount = items.filter((i) => !!i.response).length;

      // Only include days where something was done OR the day is in progress
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
  const activeDay = useApp.getState().getActiveDay();

  // Aggregate stats
  const totalItemsDone = dayData.reduce((sum, d) => sum + d.doneCount, 0);
  const daysCompleted = dayData.filter((d) => d.completedAt).length;
  const totalWords = Object.values(responses).reduce(
    (sum, r) => sum + (r.text ? r.text.trim().split(/\s+/).filter(Boolean).length : 0),
    0
  );

  // Generate insights from the responses
  const insights = useMemo(() => {
    const allText = Object.values(responses)
      .map((r) => r.text ?? '')
      .join(' ')
      .toLowerCase();

    const out: string[] = [];

    const because = (allText.match(/\bbecause\b|\bsince\b/g) || []).length;
    const so = (allText.match(/\bso\b|\btherefore\b/g) || []).length;
    const but = (allText.match(/\bbut\b|\bhowever\b|\balthough\b/g) || []).length;
    const maybe = (allText.match(/\bmaybe\b|\bperhaps\b|\bi think\b/g) || []).length;
    const always = (allText.match(/\balways\b|\bnever\b/g) || []).length;

    if (because + so >= 2) out.push('Gives reasons for their answers');
    if (but >= 1) out.push('Considers more than one side');
    if (maybe >= 2) out.push('Weighs ideas carefully before deciding');
    if (always >= 2) out.push('Speaks with strong certainty');
    if (totalWords >= 80) out.push('Writes at length when thinking');
    if (totalItemsDone >= 8) out.push('Has built a steady daily habit');

    return out;
  }, [responses, totalItemsDone, totalWords]);

  const openPayment = () => {
    window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-3xl mx-auto px-5 pb-8">
      {/* Header */}
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
          Class {user.grade} · Day {activeDay} · {streak} day streak
        </div>
      </div>

      {/* Trial banner */}
      {trialActive && trialDaysLeft !== null && (
        <div
          className="rounded-2xl p-4 mb-5 flex items-center gap-3"
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard value={daysCompleted} label="Days finished" />
        <StatCard value={totalItemsDone} label="Items answered" />
        <StatCard value={totalWords} label="Words written" />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: `${BRAND.blue}0e`, border: `1px solid ${BRAND.blue}30` }}
        >
          <div
            className="text-[10px] font-bold uppercase mb-3"
            style={{ color: BRAND.blueSoft, letterSpacing: '0.16em' }}
          >
            What we noticed
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.map((i) => (
              <span
                key={i}
                className="rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold"
                style={{
                  background: `${BRAND.blue}1c`,
                  color: BRAND.blueBright,
                  border: `1px solid ${BRAND.blue}40`,
                }}
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Day-by-day */}
      {dayData.length === 0 ? (
        <EmptyState onStart={() => navigate('/home')} />
      ) : (
        <div className="grid gap-4">
          {dayData.map((d) => (
            <DayCard key={d.day} data={d} />
          ))}
        </div>
      )}

      {/* Bottom upgrade CTA if trial ended */}
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

/* ─── Components ─────────────────────────────────────── */

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
    >
      <div className="text-[28px] font-bold tabular-nums" style={{ color: BRAND.blueBright }}>
        {value}
      </div>
      <div className="text-[11px] mt-1" style={{ color: BRAND.inkFaint }}>
        {label}
      </div>
    </div>
  );
}

function DayCard({
  data,
}: {
  data: {
    day: number;
    label?: string;
    items: {
      key: string;
      item: DayItem;
      response: {
        itemKey: string;
        engine: string;
        text?: string;
        picked?: number;
        submittedAt: string;
      } | null;
    }[];
    doneCount: number;
    total: number;
    completedAt: string | null;
  };
}) {
  const isComplete = !!data.completedAt;
  return (
    <details
      className="rounded-2xl overflow-hidden"
      style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
      open={data.day === 1}
    >
      <summary className="cursor-pointer list-none p-4 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
          style={{
            background: isComplete ? 'rgba(52,211,153,0.15)' : `${BRAND.blue}1c`,
            color: isComplete ? BRAND.emerald : BRAND.blueBright,
          }}
        >
          {data.day}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-semibold">
            Day {data.day}
            {data.label && (
              <span className="ml-2 text-[12px] font-normal" style={{ color: BRAND.inkFaint }}>
                {data.label.replace(/^Day \d+ · /, '')}
              </span>
            )}
          </div>
          <div className="text-[12px] mt-0.5" style={{ color: BRAND.inkFaint }}>
            {data.doneCount} of {data.total} answered
            {isComplete && ' · completed'}
          </div>
        </div>
        <span className="text-[11px]" style={{ color: BRAND.inkFaint }}>
          view ▾
        </span>
      </summary>

      <div className="px-4 pb-4 grid gap-3" style={{ borderTop: `1px solid ${BRAND.inkGhost}` }}>
        {data.items.map((i) => (
          <ResponseCard key={i.key} item={i.item} response={i.response} />
        ))}
      </div>
    </details>
  );
}

function ResponseCard({
  item,
  response,
}: {
  item: DayItem;
  response: {
    itemKey: string;
    engine: string;
    text?: string;
    picked?: number;
    submittedAt: string;
  } | null;
}) {
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
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[18px] leading-none">{itemEmoji(item)}</span>
        <span className="text-[12.5px] font-bold">{itemTitle(item)}</span>
        {!answered && (
          <span className="ml-auto text-[10px]" style={{ color: BRAND.inkFaint }}>
            not answered
          </span>
        )}
      </div>

      {/* The prompt (short) */}
      <div className="text-[12px] mb-3" style={{ color: BRAND.inkFaint }}>
        {itemPrompt(item)}
      </div>

      {/* The response */}
      {answered && response && (
        <>
          {/* Opinion: show picked option + reason */}
          {item.engine === 'opinion' && (
            <div>
              <div
                className="rounded-lg px-3 py-2 mb-2 text-[13px] font-semibold inline-flex items-center gap-2"
                style={{ background: `${BRAND.blue}1c`, color: BRAND.blueBright }}
              >
                {typeof response.picked === 'number' && item.options[response.picked] && (
                  <>
                    <span>{item.options[response.picked].em}</span>
                    <span>{item.options[response.picked].label}</span>
                  </>
                )}
              </div>
              {response.text && (
                <div
                  className="rounded-lg px-3 py-2.5 text-[13.5px] leading-[1.6] italic"
                  style={{ background: 'rgba(0,0,0,0.2)', color: BRAND.ink }}
                >
                  “{response.text}”
                </div>
              )}
            </div>
          )}

          {/* Math: what they picked */}
          {item.engine === 'math' && (
            <div>
              <div
                className="rounded-lg px-3 py-2 text-[13px] font-semibold inline-flex items-center gap-2"
                style={{
                  background:
                    response.picked === item.answerIdx
                      ? 'rgba(52,211,153,0.12)'
                      : `${BRAND.blue}1c`,
                  color: response.picked === item.answerIdx ? BRAND.emerald : BRAND.blueBright,
                }}
              >
                <span>{response.picked === item.answerIdx ? '✓' : '✗'}</span>
                <span>
                  {typeof response.picked === 'number' && item.ruleOptions[response.picked]}
                </span>
              </div>
            </div>
          )}

          {/* Creative / watch: the text */}
          {(item.engine === 'creative' || item.engine === 'watch') && response.text && (
            <div
              className="rounded-lg px-3 py-2.5 text-[13.5px] leading-[1.6] italic"
              style={{ background: 'rgba(0,0,0,0.2)', color: BRAND.ink }}
            >
              “{response.text}”
            </div>
          )}

          {/* Signals */}
          {response.text && <TextSignals text={response.text} />}
        </>
      )}
    </div>
  );
}

function TextSignals({ text }: { text: string }) {
  const t = text.toLowerCase();
  const signals: string[] = [];
  if (/\bbecause\b|\bsince\b/.test(t)) signals.push('gives reasons');
  if (/\bbut\b|\bhowever\b/.test(t)) signals.push('considers other side');
  if (/\bmaybe\b|\bperhaps\b|\bi think\b/.test(t)) signals.push('weighs carefully');
  if (/\balways\b|\bnever\b/.test(t)) signals.push('strong certainty');

  if (signals.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {signals.map((s) => (
        <span
          key={s}
          className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
          style={{
            background: 'rgba(255,255,255,0.04)',
            color: BRAND.inkDim,
            border: `1px solid ${BRAND.inkGhost}`,
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
    >
      <div className="text-[40px] mb-3">📊</div>
      <div className="text-[15px] font-semibold mb-2">Nothing here yet</div>
      <div className="text-[13px] mb-5" style={{ color: BRAND.inkDim }}>
        Once your child answers today's items, their thinking appears here.
      </div>
      <button
        onClick={onStart}
        className="rounded-full px-6 py-3 text-[13px] font-bold"
        style={{ background: BRAND.ink, color: BRAND.surface }}
      >
        Start today →
      </button>
    </div>
  );
}

/* ─── helpers ─────────────────────────────────────────── */

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

function itemPrompt(item: DayItem): string {
  switch (item.engine) {
    case 'm1':
    case 'm2':
    case 'm3':
    case 'm4':
    case 'm5':
      return `Mission: ${item.puzzle}`;
    case 'math':
      return item.description;
    case 'opinion':
      return item.question.length > 120 ? item.question.slice(0, 117) + '…' : item.question;
    case 'creative':
      return item.prompt;
    case 'watch':
      return item.title;
  }
}