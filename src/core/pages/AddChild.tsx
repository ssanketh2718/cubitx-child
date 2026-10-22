import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';

export default function AddChild() {
  const navigate = useNavigate();
  const setUser = useApp((s) => s.setUser);
  
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter a name");
    
    setSaving(true);
    setError('');

    try {
      // Save the child profile into Zustand (which attaches the Supabase ID)
      setUser({ name: name.trim(), grade }, 30);
      
      // ONLY navigate AFTER the user is saved
      navigate('/home', { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05091a] text-white flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-[#0a1228] border border-[#16244a] p-8 rounded-3xl shadow-2xl space-y-6">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white mb-2">Add Your Child</h1>
          <p className="text-gray-400 text-sm">Create a profile to start the missions.</p>
        </div>

        {error && <p className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm border border-red-500/20 text-center">{error}</p>}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1">Child's Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f1a38] border border-[#1e2e5c] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#5b7fff]"
              placeholder="e.g. Aarav"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1">Grade / Class</label>
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full bg-[#0f1a38] border border-[#1e2e5c] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#5b7fff] appearance-none"
            >
              <option value={5}>Class 5</option>
              <option value={6}>Class 6</option>
              <option value={7}>Class 7</option>
              <option value={8}>Class 8</option>
              <option value={9}>Class 9</option>
              <option value={10}>Class 10</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#5b7fff] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 mt-4"
          >
            {saving ? 'Saving...' : 'Start Learning'}
          </button>
        </form>

      </div>
    </div>
  );
}