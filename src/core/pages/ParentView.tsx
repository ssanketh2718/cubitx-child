import { useState } from 'react';
import { useApp } from '../store';
import { analyzeEvents, type SessionSummary } from '../analytics/reasoning';
import { generateInsights, generateConversationStarters, formatDuration } from '../analytics/insights';
import { analyzeText, SIGNAL_IS_POSITIVE, type TextAnalysis } from '../analytics/textAnalysis';

export default function ParentView() {
  const user = useApp((s) => s.user);
  const events = useApp((s) => s.events);
  const streak = useApp((s) => s.getStreak());

  if (!user) return null;

  const sessions = analyzeEvents(events);
  const insights = generateInsights(sessions);
  const starters = generateConversationStarters(sessions);
  const openResponses = events.filter(e => e.type === 'text_submitted').slice(-3).reverse();

  const totalRounds = sessions.reduce((a, s) => a + s.roundsAttempted, 0);
  const totalCorrect = sessions.reduce((a, s) => a + s.roundsCorrect, 0);
  const overallAccuracy = totalRounds ? Math.round((totalCorrect / totalRounds) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-5 pb-10">
      <div className="text-center py-6">
        <div className="text-[56px] leading-none mb-3">📊</div>
        <h1 className="text-[24px] font-black tracking-tight bg-gradient-to-r from-white to-gold bg-clip-text text-transparent mb-1">
          {user.name}'s Thinking
        </h1>
        <p className="text-[13px] text-white/50 font-bold">
          Class {user.grade} · {streak}-day streak
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <div className="text-[26px] font-black text-gold leading-none">{sessions.length}</div>
          <div className="text-[10px] tracking-wider uppercase text-white/50 font-black mt-1.5">Sessions</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <div className="text-[26px] font-black text-mint leading-none">{totalRounds}</div>
          <div className="text-[10px] tracking-wider uppercase text-white/50 font-black mt-1.5">Rounds</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <div className="text-[26px] font-black text-white leading-none">{overallAccuracy}%</div>
          <div className="text-[10px] tracking-wider uppercase text-white/50 font-black mt-1.5">Accuracy</div>
        </div>
      </div>

      {openResponses.length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] tracking-[2px] uppercase text-white/40 font-black mb-3">
            ✍️ Open responses
          </div>
          <div className="flex flex-col gap-3">
            {openResponses.map((e, i) => (
              <OpenResponseCard key={i} event={e} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="text-[11px] tracking-[2px] uppercase text-white/40 font-black mb-3">
          🧠 What we noticed
        </div>
        <div className="flex flex-col gap-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 ${
                insight.kind === 'strength' ? 'border-green-400/30 bg-green-400/[0.06]'
                : insight.kind === 'growth' ? 'border-gold/30 bg-gold/[0.06]'
                : insight.kind === 'pattern' ? 'border-sky/30 bg-sky/[0.06]'
                : 'border-white/15 bg-white/[0.04]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl leading-none flex-shrink-0">{insight.emoji}</div>
                <div className="flex-1">
                  <div className="text-[15px] font-black mb-1.5">{insight.title}</div>
                  <div className="text-[13.5px] leading-relaxed text-white/75 font-semibold">{insight.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {starters.length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] tracking-[2px] uppercase text-white/40 font-black mb-3">
            💬 What to ask at home
          </div>
          <div className="rounded-2xl border border-sky/25 bg-sky/[0.06] p-5">
            {starters.map((s, i) => (
              <div key={i} className="text-[14px] leading-relaxed text-sky-100 font-bold mb-2.5 last:mb-0 flex items-start gap-2">
                <span className="text-sky flex-shrink-0">→</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="text-[11px] tracking-[2px] uppercase text-white/40 font-black mb-3">
          📈 Recent sessions
        </div>
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/40 font-bold text-[13.5px]">
            No sessions yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.slice(0, 5).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: SessionSummary }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.03] transition"
      >
        <div className="text-[28px] leading-none flex-shrink-0">{session.missionEmoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-black mb-0.5">{session.missionName}</div>
          <div className="text-[12px] text-white/50 font-bold">
            {new Date(session.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {formatDuration(session.durationSeconds)}
          </div>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <div className={`text-[17px] font-black leading-none ${
            session.accuracy >= 70 ? 'text-green-400' : session.accuracy >= 40 ? 'text-gold' : 'text-red-400'
          }`}>{session.accuracy}%</div>
          <div className="text-[10px] tracking-wider uppercase text-white/40 font-black mt-0.5">
            {session.roundsCorrect}/{session.roundsAttempted}
          </div>
        </div>
        <div className="text-white/40 text-[12px] flex-shrink-0">{expanded ? '▲' : '▼'}</div>
      </button>

      {expanded && (
        <div className="border-t border-white/10 p-4 bg-black/20">
          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
            {session.trace.map((step, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[12.5px] leading-snug py-1.5">
                <div className="text-[10px] font-black text-white/30 w-10 text-right tabular-nums flex-shrink-0">
                  {step.relativeSeconds}s
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  step.type === 'complete' ? 'bg-green-400'
                  : step.type === 'give_up' ? 'bg-red-400'
                  : step.type === 'hint' ? 'bg-gold'
                  : step.type === 'analysis' && step.detail?.includes('✓') ? 'bg-green-400'
                  : step.type === 'analysis' && step.detail?.includes('✗') ? 'bg-red-400'
                  : 'bg-white/30'
                }`} />
                <div className="flex-1 min-w-0">
                  <span className="font-black text-white/85">{step.label}</span>
                  {step.detail && <span className="text-white/40 font-bold"> · {step.detail}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OpenResponseCard({ event }: { event: any }) {
  const [analysis] = useState<TextAnalysis>(() => analyzeText(event.payload?.text || ''));
  const text = event.payload?.text || '';
  const prompt = event.payload?.prompt || 'Open question';

  return (
    <div className="rounded-2xl border border-pink-400/25 bg-pink-400/[0.05] overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="text-[10.5px] tracking-[2px] uppercase text-pink-300 font-black mb-1">
          ✍️ Open response
        </div>
        <div className="text-[13px] text-white/60 font-bold italic">{prompt}</div>
      </div>

      <div className="p-4 bg-black/20">
        <div className="text-[10.5px] tracking-[2px] uppercase text-white/40 font-black mb-2">
          What your child wrote
        </div>
        <div className="text-[14px] leading-relaxed text-white/85 font-semibold bg-white/[0.03] rounded-xl p-3.5 border border-white/10 mb-4 whitespace-pre-wrap">
          {text}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
            <div className="text-[18px] font-black text-gold leading-none">{analysis.wordCount}</div>
            <div className="text-[9.5px] tracking-wider uppercase text-white/40 font-black mt-1">Words</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
            <div className="text-[18px] font-black text-gold leading-none">{analysis.sentenceCount}</div>
            <div className="text-[9.5px] tracking-wider uppercase text-white/40 font-black mt-1">Sentences</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
            <div className="text-[18px] font-black text-gold leading-none">{analysis.overallScore}</div>
            <div className="text-[9.5px] tracking-wider uppercase text-white/40 font-black mt-1">Depth</div>
          </div>
        </div>

        {analysis.signals.length > 0 && (
          <>
            <div className="text-[10.5px] tracking-[2px] uppercase text-white/40 font-black mb-2">
              Thinking signals detected
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {analysis.signals.map(s => (
                <div key={s.key} className={`rounded-full px-3 py-1.5 text-[11.5px] font-black border ${
                  SIGNAL_IS_POSITIVE[s.key]
                    ? 'border-green-400/40 bg-green-400/[0.08] text-green-200'
                    : 'border-gold/40 bg-gold/[0.08] text-gold'
                }`}>
                  {s.label} · {s.count}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="text-[10.5px] tracking-[2px] uppercase text-white/40 font-black mb-2">
          What this reveals
        </div>
        <div className="flex flex-col gap-2.5 mb-4">
          {analysis.nuances.map((n, i) => (
            <div key={i} className={`rounded-xl border p-3 ${
              n.kind === 'strength' ? 'border-green-400/30 bg-green-400/[0.06]'
              : n.kind === 'growth' ? 'border-gold/30 bg-gold/[0.06]'
              : 'border-sky/30 bg-sky/[0.06]'
            }`}>
              <div className="flex items-start gap-2.5">
                <div className="text-[20px] leading-none flex-shrink-0">{n.emoji}</div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-black mb-1">{n.title}</div>
                  <div className="text-[12.5px] text-white/75 font-semibold leading-relaxed">{n.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {analysis.conversationStarters.length > 0 && (
          <>
            <div className="text-[10.5px] tracking-[2px] uppercase text-white/40 font-black mb-2">
              What to ask at home
            </div>
            <div className="rounded-xl border border-sky/25 bg-sky/[0.06] p-3.5">
              {analysis.conversationStarters.map((s, i) => (
                <div key={i} className="text-[13px] leading-relaxed text-sky-100 font-bold mb-2 last:mb-0 flex items-start gap-2">
                  <span className="text-sky flex-shrink-0">→</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
