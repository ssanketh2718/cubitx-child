import { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registry, emitEvent, type MissionContext } from '../sdk';
import { useApp } from '../store';

export default function Mission() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const completeMission = useApp((s) => s.completeMission);
  const user = useApp((s) => s.user);

  const mission = id ? registry.get(id) : undefined;
  const sessionId = useMemo(() => crypto.randomUUID(), [id]);

  /* Block Foundation users from Advanced missions */
  if (mission && user && !mission.tiers.includes(user.tier)) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-5">
        <div className="text-[64px] mb-4">🔒</div>
        <div className="text-[20px] font-black mb-2">Not available</div>
        <div className="text-[14px] text-white/50 font-semibold mb-6">
          This mission is for another class.
        </div>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-3 rounded-full bg-white text-navy-900 font-bold"
        >
          Back home
        </button>
      </div>
    );
  }

  const emit = useCallback(
    (type: string, payload: Record<string, unknown> = {}, round = 0) => {
      if (!mission) return;
      emitEvent(type, mission.id, sessionId, round, payload);
    },
    [mission, sessionId]
  );

  const handleComplete = useCallback(() => {
    if (!mission) return;
    completeMission(mission.id);
    setTimeout(() => navigate('/home'), 400);
  }, [mission, completeMission, navigate]);

  if (!mission) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-5">
        <div className="text-[20px] font-black mb-4">Mission not found</div>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-3 rounded-full bg-white text-navy-900 font-bold"
        >
          Back home
        </button>
      </div>
    );
  }

  const ctx: MissionContext = {
    missionId: mission.id,
    sessionId,
    tier: user?.tier ?? 'foundation',
    emit,
    onComplete: handleComplete,
  };

  const MissionComponent = mission.Component;

  return (
    <div className="max-w-2xl mx-auto px-5 pb-24">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-lg text-white/70 hover:bg-white/[0.08] transition"
        >
          ←
        </button>
        <div className="flex-1">
          <div className="text-white font-bold tracking-tight">
            {mission.emoji} {mission.name}
          </div>
          <div className="text-[11px] text-white/40 font-semibold tracking-wide uppercase mt-0.5">
            {mission.domainName}
          </div>
        </div>
      </div>

      <MissionComponent ctx={ctx} />
    </div>
  );
}
