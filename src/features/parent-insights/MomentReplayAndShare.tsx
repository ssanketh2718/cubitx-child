import { useState } from 'react';
import type { ObservedMoment } from './skillsCatalog';

interface MomentReplayAndShareProps {
  childFirstName: string;
  moments: ObservedMoment[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function cleanActivityName(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('bridge') || lower.includes('robot')) {
    return 'building a bridge on a budget';
  }
  if (lower.includes('shadow') || lower.includes('sun')) {
    return 'checking how shadows change';
  }
  if (lower.includes('ai') || lower.includes('claim')) {
    return 'checking a bold claim';
  }
  if (lower.includes('machine')) {
    return 'testing number rules';
  }
  return 'a thinking activity';
}

function cleanThoughtLine(text: string): string {
  const trimmed = text.trim();
  const parenIndex = trimmed.indexOf('(');
  const withoutStats =
    parenIndex > 6 ? trimmed.slice(0, parenIndex).trim() : trimmed;
  return withoutStats.length > 140
    ? `${withoutStats.slice(0, 137).trim()}...`
    : withoutStats;
}

export function MomentReplayAndShare({
  childFirstName,
  moments,
}: MomentReplayAndShareProps) {
  const [idx, setIdx] = useState(0);
  const [includeName, setIncludeName] = useState(false);
  const [copied, setCopied] = useState(false);

  if (moments.length === 0) {
    return (
      <div className="rounded-3xl border border-[#DCE2E7] bg-white p-6 shadow-2xs">
        <h2 className="text-lg font-extrabold text-[#142033]">
          Recent moments
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-[#586579]">
          Once {childFirstName} finishes an activity, you will see what they
          tried and thought right here.
        </p>
      </div>
    );
  }

  const safeIdx = Math.min(idx, moments.length - 1);
  const current = moments[safeIdx];
  const activityPhrase = cleanActivityName(current.title);
  const hasNote = Boolean(current.verbatimText?.trim());
  const cleanedNote = hasNote ? cleanThoughtLine(current.verbatimText!) : '';

  const who = includeName ? childFirstName : 'Your child';
  const shareText = cleanedNote
    ? `${who} spent time ${activityPhrase} and shared: "${cleanedNote}"`
    : `${who} spent time ${activityPhrase} and checked their ideas step by step.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const checks = current.testsBeforeGuess ?? 1;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
      {/* WHAT HAPPENED */}
      <div className="rounded-3xl border border-[#DCE2E7] bg-white p-6 shadow-2xs flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#087F80]">
              Moment {safeIdx + 1} of {moments.length}
              {formatDate(current.submittedAt)
                ? ` · ${formatDate(current.submittedAt)}`
                : ''}
            </span>

            {moments.length > 1 && (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={safeIdx === 0}
                  onClick={() => setIdx((i) => Math.max(0, i - 1))}
                  className="rounded-lg border border-[#DCE2E7] px-2.5 py-1 text-xs font-bold text-[#142033] disabled:opacity-35 cursor-pointer"
                  aria-label="Previous moment"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={safeIdx >= moments.length - 1}
                  onClick={() =>
                    setIdx((i) => Math.min(moments.length - 1, i + 1))
                  }
                  className="rounded-lg border border-[#DCE2E7] px-2.5 py-1 text-xs font-bold text-[#142033] disabled:opacity-35 cursor-pointer"
                  aria-label="Next moment"
                >
                  →
                </button>
              </div>
            )}
          </div>

          <h3 className="text-lg font-extrabold text-[#142033]">
            {childFirstName} tried {activityPhrase}
          </h3>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="rounded-full bg-[#F7F6F1] border border-[#DCE2E7] px-3 py-1 text-xs font-semibold text-[#142033]">
              {checks} {checks === 1 ? 'check' : 'checks'} made
            </span>
            {current.wentBackToTest && (
              <span className="rounded-full bg-[#FEF6E4] border border-[#F5B942]/50 px-3 py-1 text-xs font-semibold text-[#946200]">
                Went back to double-check
              </span>
            )}
          </div>

          {cleanedNote && (
            <p className="rounded-2xl bg-[#F7F6F1] border border-[#DCE2E7] p-3.5 text-sm leading-6 text-[#142033]">
              “{cleanedNote}”
            </p>
          )}
        </div>
      </div>

      {/* SOOTHING SHARE CARD */}
      <div className="rounded-3xl bg-[#142033] p-6 text-white shadow-2xs flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#F5B942]">
              Share with family
            </span>
            <label className="flex items-center gap-1.5 text-xs text-[#C7D2DE] cursor-pointer">
              <input
                type="checkbox"
                checked={includeName}
                onChange={(e) => setIncludeName(e.target.checked)}
                className="rounded accent-[#087F80]"
              />
              Use {childFirstName}’s name
            </label>
          </div>

          <p className="rounded-2xl bg-white/10 p-4 text-sm leading-6 text-[#F7F6F1]">
            {shareText}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleCopy()}
          className="w-full rounded-xl bg-[#087F80] hover:bg-[#0A9697] py-2.5 text-xs font-extrabold text-white transition cursor-pointer"
        >
          {copied ? 'Copied to clipboard' : 'Copy message'}
        </button>
      </div>
    </div>
  );
}