import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type EducationBoard } from '../auth/AuthContext';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';

const AVATARS = ['🦊', '🐼', '🐯', '🦁', '🐙', '🦉'];
const BOARDS: { id: EducationBoard; label: string; sub: string }[] = [
  { id: 'CBSE', label: 'CBSE', sub: 'NCERT syllabus' },
  {
    id: 'Maharashtra State Board',
    label: 'Maharashtra State Board',
    sub: 'Balbharati syllabus',
  },
];

const MIN_CLASS = 5;
const MAX_CLASS = 10;

export default function AddChild() {
  const navigate = useNavigate();
  const { addChild, children, isDev } = useAuth();

  const [name, setName] = useState('');
  const [grade, setGrade] = useState(5);
  const [board, setBoard] = useState<EducationBoard>('CBSE');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedName = name.trim();

    if (!cleanedName) {
      setError("Please enter your child's first name.");
      return;
    }
    if (cleanedName.length > 30) {
      setError('Please use a name with 30 characters or fewer.');
      return;
    }
    if (!Number.isInteger(grade) || grade < MIN_CLASS || grade > MAX_CLASS) {
      setError('Please select a class from 5 to 10.');
      return;
    }
    if (children.length >= 3) {
      setError('You can create up to three child profiles per parent account.');
      return;
    }

    setSaving(true);
    setError('');
    triggerSoftConfirm(true);

    try {
      if (isDev) {
        setTimeout(() => navigate('/home', { replace: true }), 350);
        return;
      }

      const result = await addChild(cleanedName, grade, avatar, null, board);
      if (result.error) {
        setError(result.error);
        return;
      }

      navigate(children.length === 0 ? '/home' : '/play-who', {
        replace: true,
      });
    } catch {
      setError('We could not save this profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const atLimit = children.length >= 3;

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#142033] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-7">
        <header className="space-y-2">
          <span className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.18em] text-[#087F80]">
            Family Profile Setup
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#142033]">
            Add your child
          </h1>
          <p className="text-sm text-[#586579]">
            We use class and board to load the right Thinking Sheets automatically.
          </p>
        </header>

        {error && (
          <p
            role="alert"
            className="rounded-2xl border border-[#F07868]/40 bg-[#F07868]/10 px-4 py-3 text-xs font-bold text-[#9E3324]"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-6 cx-hairline-t pt-6">
          {/* FIRST NAME */}
          <div>
            <label
              htmlFor="child-name"
              className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-[#586579]"
            >
              First name
            </label>
            <input
              id="child-name"
              type="text"
              autoComplete="off"
              maxLength={30}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Neeta"
              className="w-full rounded-2xl border border-[#142033]/15 bg-white px-4 py-3.5 text-sm font-semibold text-[#142033] outline-none focus:border-[#087F80]"
            />
          </div>

          {/* CLASS (5-10) */}
          <div>
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-[#586579]">
              Class
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[5, 6, 7, 8, 9, 10].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    triggerDialTick(false);
                    setGrade(c);
                  }}
                  className={`rounded-2xl border py-3 text-xs font-extrabold tabular-nums transition cursor-pointer ${
                    grade === c
                      ? 'border-[#142033] bg-[#142033] text-[#55E2CE]'
                      : 'border-[#142033]/12 bg-white text-[#142033] hover:border-[#087F80]'
                  }`}
                >
                  Class {c}
                </button>
              ))}
            </div>
          </div>

          {/* EDUCATION BOARD */}
          <div>
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-[#586579]">
              School Board
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BOARDS.map((b) => {
                const active = board === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      triggerDialTick(true);
                      setBoard(b.id);
                    }}
                    className={`rounded-2xl border p-4 text-left transition cursor-pointer ${
                      active
                        ? 'border-[#087F80] bg-[#087F80]/8'
                        : 'border-[#142033]/12 bg-white hover:border-[#142033]/40'
                    }`}
                  >
                    <div className="font-display text-sm font-extrabold text-[#142033]">
                      {b.label}
                    </div>
                    <div className="mt-0.5 text-xs text-[#586579]">{b.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AVATAR */}
          <fieldset>
            <legend className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#586579]">
              Avatar
            </legend>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-label={`Choose avatar ${item}`}
                  aria-pressed={avatar === item}
                  onClick={() => {
                    triggerDialTick(false);
                    setAvatar(item);
                  }}
                  className={`flex min-h-12 items-center justify-center rounded-2xl border text-2xl transition cursor-pointer ${
                    avatar === item
                      ? 'border-[#142033] bg-[#142033] shadow-sm'
                      : 'border-[#142033]/12 bg-white hover:border-[#087F80]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          {atLimit && (
            <p className="text-xs font-bold text-[#8A5A00]">
              This account already has three child profiles.
            </p>
          )}

          <button
            type="submit"
            disabled={saving || atLimit}
            className="cx-action-pill w-full bg-[#142033] py-4 text-sm text-white hover:bg-[#087F80] cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving profile...' : 'Save and continue →'}
          </button>
        </form>
      </div>
    </div>
  );
}