interface Props {
  kind: 'good' | 'bad';
  headline: string;
  detail?: string;
  show: boolean;
}

export default function FeedbackBanner({ kind, headline, detail, show }: Props) {
  if (!show) return null;
  const styles =
    kind === 'good'
      ? 'bg-success/[0.08] border-success/20 text-success'
      : 'bg-error/[0.08] border-error/20 text-error';
  return (
    <div className={`mt-4 p-4 rounded-xl border text-center animate-pop ${styles}`}>
      <div className="text-[14px] font-bold tracking-tight">{headline}</div>
      {detail && (
        <span className="block text-[12px] font-medium opacity-80 mt-1.5 leading-relaxed">
          {detail}
        </span>
      )}
    </div>
  );
}
