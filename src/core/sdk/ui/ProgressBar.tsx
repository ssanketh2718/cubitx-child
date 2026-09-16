export default function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden mb-6">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
