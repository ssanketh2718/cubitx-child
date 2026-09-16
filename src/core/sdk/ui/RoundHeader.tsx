interface Props {
  left: string;
  right?: string;
}

export default function RoundHeader({ left, right }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.06] text-white/70 text-[12px] font-semibold tracking-tight">
        {left}
      </div>
      {right && (
        <div className="px-3.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[12px] font-semibold tracking-tight tabular-nums">
          {right}
        </div>
      )}
    </div>
  );
}
