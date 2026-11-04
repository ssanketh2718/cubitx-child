import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🐬', '🦉'];

const MIN_CLASS = 5;
const MAX_CLASS = 10; // Updated to match platform specification (Classes 5-10)

export default function AddChild() {
  const navigate = useNavigate();
  const { addChild, children, isDev } = useAuth();

  const [name, setName] = useState('');
  const [grade, setGrade] = useState(5);
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanedName = name.trim();

    if (!cleanedName) {
      setError('Please enter your child’s first name.');
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

    try {
      // If running in local dev mode without live Supabase insert bindings, mock a smooth redirect
      if (isDev) {
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 500);
        return;
      }

      const result = await addChild(cleanedName, grade, avatar, null);

      if (result.error) {
        setError(result.error);
        return;
      }

      // The first child is selected automatically by ChildContext.
      // With multiple children, let the parent choose who will play.
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
    <div className="min-h-screen bg-[#05091a] text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-[#16244a] bg-[#0a1228] p-6 shadow-2xl sm:p-8">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold">Add your child</h1>
          <p className="mt-2 text-sm text-gray-400">
            Create a separate learning profile for each child (Classes 5–10).
          </p>
        </header>

        <div className="rounded-xl border border-[#1e2e5c] bg-[#0f1a38] p-3 text-sm text-gray-300">
          <strong className="text-white">School connection is optional.</strong>
          <p className="mt-1">
            Your child can start learning without joining a school.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label
              htmlFor="child-name"
              className="mb-2 block text-sm font-semibold text-gray-300"
            >
              Child’s first name
            </label>
            <input
              id="child-name"
              type="text"
              autoComplete="off"
              maxLength={30}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter first name"
              className="w-full rounded-xl border border-[#1e2e5c] bg-[#0f1a38] px-4 py-3 text-white outline-none focus:border-[#7b8dff]"
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-300">
              Choose an avatar
            </legend>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-label={`Choose avatar ${item}`}
                  aria-pressed={avatar === item}
                  onClick={() => setAvatar(item)}
                  className={`flex min-h-12 items-center justify-center rounded-xl border text-2xl transition ${
                    avatar === item
                      ? 'border-[#9aaaff] bg-[#25335f]'
                      : 'border-[#1e2e5c] bg-[#0f1a38] hover:bg-[#17254a]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="child-grade"
              className="mb-2 block text-sm font-semibold text-gray-300"
            >
              Class
            </label>
            <select
              id="child-grade"
              value={grade}
              onChange={(event) => setGrade(Number(event.target.value))}
              className="w-full rounded-xl border border-[#1e2e5c] bg-[#0f1a38] px-4 py-3 text-white outline-none focus:border-[#7b8dff]"
            >
              <option value={5}>Class 5</option>
              <option value={6}>Class 6</option>
              <option value={7}>Class 7</option>
              <option value={8}>Class 8</option>
              <option value={9}>Class 9</option>
              <option value={10}>Class 10</option>
            </select>
          </div>

          {atLimit && (
            <p className="text-sm text-amber-300">
              This account already has three child profiles.
            </p>
          )}

          <button
            type="submit"
            disabled={saving || atLimit}
            className="w-full rounded-xl bg-[#7b8dff] px-4 py-4 font-bold text-[#05091a] transition hover:bg-[#9aaaff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving profile…' : 'Create child profile'}
          </button>

          <p className="text-center text-xs leading-5 text-gray-500">
            Each child has a separate profile. You can connect a school later.
          </p>
        </form>
      </div>
    </div>
  );
}