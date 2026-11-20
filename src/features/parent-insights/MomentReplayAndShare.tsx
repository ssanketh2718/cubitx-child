import { useState } from 'react';
import type { ObservedMoment } from './skillsCatalog';

interface MomentReplayAndShareProps {
  childFirstName: string;
  moments: ObservedMoment[];
}

function formatMomentDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function MomentReplayAndShare({
  childFirstName,
  moments,
}: MomentReplayAndShareProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [includeFirstName, setIncludeFirstName] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  if (moments.length === 0) {
    return (
      <div className="rounded-3xl border border-[#DCE2E7] bg-white p-6 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
          Show me the moment
        </p>
        <h3 className="mt-1 text-xl font-extrabold text-[#142033]">
          No recorded mission moments in this period yet
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#586579]">
          Once your child explores a mission on this device, their actual
          recorded steps and written ideas will appear here as a read-only
          replay—so you can see how they approached the problem instead of
          reading a generic grade.
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(selectedIndex, moments.length - 1);
  const active = moments[safeIndex];

  const hasVerbatimText = !!active.verbatimText?.trim();
  const displayName = includeFirstName ? childFirstName : 'My child';

  const shareText = hasVerbatimText
    ? `${displayName} explored "${active.title}" on CubitX and shared this idea:\n\n“${active.verbatimText?.trim()}”\n\nWhat would you have checked first?`
    : `${displayName} investigated "${active.title}" on CubitX.\n\nFamily challenge: When two explanations both fit the first clue, what test would you run to tell them apart?`;

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyStatus('Copied — ready to paste into WhatsApp.');
      window.setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus(
        'Could not copy automatically. Select and copy the preview text.'
      );
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
      {/* LEFT: SHOW ME THE MOMENT (Deterministic Read-Only Replay) */}
      <div className="rounded-3xl border border-[#DCE2E7] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
              Show me the moment · Read-only replay
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-[#142033]">
              {active.title}
            </h3>
            <p className="mt-0.5 text-xs text-[#586579]">
              Recorded {formatMomentDate(active.submittedAt)} · Engine:{' '}
              {active.engine}
            </p>
          </div>

          <span className="rounded-full bg-[#FEF6E4] px-3 py-1 text-[11px] font-bold text-[#946200]">
            Local record · Awaiting review
          </span>
        </div>

        {/* Recorded action trail */}
        <div className="mt-5 rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#586579]">
            What actually happened in this activity
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {typeof active.testsBeforeGuess === 'number' && (
              <div className="rounded-xl border border-[#DCE2E7] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-[#586579]">
                  Tests run first
                </p>
                <p className="mt-1 text-lg font-extrabold tabular-nums text-[#142033]">
                  {active.testsBeforeGuess}
                </p>
              </div>
            )}

            {typeof active.wentBackToTest === 'boolean' && (
              <div className="rounded-xl border border-[#DCE2E7] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-[#586579]">
                  Re-tested clues
                </p>
                <p className="mt-1 text-sm font-extrabold text-[#087F80]">
                  {active.wentBackToTest ? 'Yes, checked again' : 'Moved forward'}
                </p>
              </div>
            )}

            {typeof active.hintsUsed === 'number' && (
              <div className="rounded-xl border border-[#DCE2E7] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-[#586579]">
                  Clues requested
                </p>
                <p className="mt-1 text-lg font-extrabold tabular-nums text-[#142033]">
                  {active.hintsUsed}
                </p>
              </div>
            )}
          </div>

          {hasVerbatimText ? (
            <div className="mt-4 rounded-xl border border-[#DCE2E7] bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#087F80]">
                Child’s own words (verbatim)
              </p>
              <blockquote className="mt-2 text-sm font-medium leading-6 text-[#142033]">
                “{active.verbatimText?.trim()}”
              </blockquote>
            </div>
          ) : (
            <p className="mt-3 text-xs leading-5 text-[#586579]">
              This activity recorded structured choices rather than a typed
              response. No written text was invented or filled in.
            </p>
          )}
        </div>

        {/* Moment switcher if multiple recorded responses exist */}
        {moments.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#DCE2E7] pt-4">
            <p className="text-xs font-semibold text-[#586579]">
              Moment {safeIndex + 1} of {moments.length}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safeIndex === 0}
                onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
                className="rounded-xl border border-[#DCE2E7] bg-white px-3 py-1.5 text-xs font-bold text-[#142033] transition hover:border-[#087F80] disabled:opacity-40"
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={safeIndex >= moments.length - 1}
                onClick={() =>
                  setSelectedIndex((i) => Math.min(moments.length - 1, i + 1))
                }
                className="rounded-xl border border-[#DCE2E7] bg-white px-3 py-1.5 text-xs font-bold text-[#142033] transition hover:border-[#087F80] disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: THINKING MILESTONE / DISCOVERY SHARE CARD */}
      <div className="flex flex-col justify-between rounded-3xl border border-[#DCE2E7] bg-[#142033] p-5 text-white shadow-sm sm:p-6">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-[#F5B942]/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#F5B942]">
              {hasVerbatimText
                ? 'Moment of curiosity'
                : 'Family reverse challenge'}
            </span>
            <span className="text-[11px] font-semibold text-[#9FB0C3]">
              No scores · Privacy-safe
            </span>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="whitespace-pre-line text-sm leading-6 text-[#F7F6F1]">
              {shareText}
            </p>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-xs text-[#C7D2DE]">
            <input
              type="checkbox"
              checked={includeFirstName}
              onChange={(e) => setIncludeFirstName(e.target.checked)}
              className="h-4 w-4 rounded border-white/30 accent-[#087F80]"
            />
            Include child’s first name ({childFirstName}) — off by default for
            privacy
          </label>
        </div>

        <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => void handleCopyShare()}
            className="w-full rounded-xl bg-[#087F80] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-[#0A9697] focus:outline-none focus:ring-2 focus:ring-[#55E2CE]"
          >
            Copy card for family WhatsApp
          </button>

          {copyStatus && (
            <p
              role="status"
              className="text-center text-xs font-semibold text-[#55E2CE]"
            >
              {copyStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
