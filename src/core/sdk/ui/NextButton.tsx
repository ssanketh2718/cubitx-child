interface Props {
  show: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export default function NextButton({ show, onClick, children = 'Next' }: Props) {
  if (!show) return null;
  return (
    <div className="text-center mt-6">
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-[14px] bg-white text-navy-900 hover:bg-white/90 transition animate-pop"
      >
        <span>{children}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  );
}
