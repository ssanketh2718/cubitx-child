import { useMemo, useState } from 'react';
import { useApp } from '../../../core/store';
import {
  triggerDialTick,
  triggerSoftConfirm,
} from '../../../core/lib/tactileFeedback';

interface ThinkingSheetProps {
  sheetId?: string;
  title?: string;
  twist?: string;
  catchPrompt?: string;
  options?: string[];
  onComplete?: (payload: { choice: string; reason: string }) => void;
}

export default function ThinkingSheet({
  sheetId = 'default-sheet',
  title = 'Thinking Sheet',
  twist = 'What if the conditions in a familiar situation shifted suddenly?',
  catchPrompt = 'Pick the statement that checks the strongest reason:',
  options = [
    'Test the claim against an extra example before deciding.',
    'Accept the first explanation without checking other facts.',
  ],
  onComplete,
}: ThinkingSheetProps) {
  const user = useApp((s: { user: { name?: string } | null }) => s.user);
  const saveResponse = useApp(
    (s: {
      saveResponse: (
        key: string,
        payload: {
          engine: string;
          text: string;
          behaviours: { testsBeforeGuess: number };
        }
      ) => Promise<void> | void;
    }) => s.saveResponse
  );

  const [picked, setPicked] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [saved, setSaved] = useState(false);

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Explorer';

  const shuffledOptions = useMemo(() => {
    const seed = (firstName.charCodeAt(0) + sheetId.length) % 2;
    return seed === 0 ? options : [...options].reverse();
  }, [firstName, sheetId, options]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!picked || !reason.trim()) return;
    triggerSoftConfirm(true);
    await saveResponse(`sheet:${sheetId}`, {
      engine: 'thinking-sheet-solo',
      text: reason.trim(),
      behaviours: { testsBeforeGuess: 1 },
    });
    setSaved(true);
    onComplete?.({ choice: picked, reason: reason.trim() });
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-3xl border border-[#142033]/12 bg-white p-6 shadow-sm space-y-5"
    >
      <div className="space-y-1">
        <div className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#087F80]">
          SOLO SHEET
        </div>
        <h3 className="font-display text-xl font-extrabold text-[#142033]">
          {title}
        </h3>
        <p className="text-sm text-[#586579] leading-relaxed">{twist}</p>
      </div>

      <div className="space-y-2.5">
        <div className="text-xs font-extrabold text-[#142033]">{catchPrompt}</div>
        {shuffledOptions.map((opt) => {
          const active = picked === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                triggerDialTick(true);
                setPicked(opt);
                setSaved(false);
              }}
              className={`w-full rounded-2xl border p-3.5 text-left text-xs font-bold transition cursor-pointer ${
                active
                  ? 'border-[#087F80] bg-[#087F80]/10 text-[#142033]'
                  : 'border-[#142033]/12 bg-[#F7F6F1] text-[#142033] hover:border-[#142033]'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-extrabold text-[#142033]">
          Your reason in your own words
        </label>
        <textarea
          rows={2}
          maxLength={240}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setSaved(false);
          }}
          placeholder="Write a short reason..."
          className="w-full rounded-2xl border border-[#142033]/15 bg-[#F7F6F1] p-3.5 text-xs text-[#142033] outline-none focus:border-[#087F80] focus:bg-white"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={!picked || !reason.trim()}
          className="rounded-full bg-[#142033] px-6 py-2.5 text-xs font-extrabold text-white hover:bg-[#087F80] disabled:opacity-40 transition cursor-pointer"
        >
          Save
        </button>
        {saved && (
          <span className="text-xs font-extrabold text-[#087F80]">
            Saved ✓
          </span>
        )}
      </div>
    </form>
  );
}