import { NavLink } from 'react-router-dom';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: active ? '#7b9dff' : 'rgba(255,255,255,0.4)' }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BrainIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: active ? '#7b9dff' : 'rgba(255,255,255,0.4)' }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a4 4 0 0 0 0 8 4 4 0 0 1 0 8" />
    </svg>
  );
}

const items = [
  { to: '/home', icon: HomeIcon, label: 'Home' },
  { to: '/profile', icon: BrainIcon, label: 'Thinking' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-white/[0.06] bg-navy-900/90 backdrop-blur-xl py-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 font-semibold text-[11px] tracking-tight transition ${
                isActive ? 'text-blue-400' : 'text-white/40'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
