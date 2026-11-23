import { useEffect, useRef, useState } from 'react';

interface MissionLiveSceneProps {
  missionId: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

export default function MissionLiveScene({ missionId }: MissionLiveSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interactive controls shared across scenarios
  const [sliderVal, setSliderVal] = useState<number>(100); // 0 to 100
  const [mode, setMode] = useState<0 | 1>(0);
  const [actionPulse, setActionPulse] = useState<number>(0);

  // Reset controls cleanly whenever mission changes
  useEffect(() => {
    setMode(0);
    setActionPulse(0);
    if (missionId === 'd2-m1' || missionId === 'd1-m4') {
      setSliderVal(100); // Day 10
    } else if (missionId === 'd2-m4') {
      setSliderVal(0); // Start zoomed on Top 10, scrub to 100
    } else if (missionId === 'd1-m5') {
      setSliderVal(0); // 0 = ice solid, 100 = ice melted
    } else {
      setSliderVal(50);
    }
  }, [missionId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;
    const particles: Particle[] = [];

    const spawnSplash = (cx: number, cy: number, color: string, count = 18) => {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI * Math.random();
        const speed = 1.2 + Math.random() * 3.2;
        particles.push({
          x: cx + (Math.random() - 0.5) * 18,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 1,
          size: 2 + Math.random() * 2.5,
          color,
        });
      }
    };

    if (actionPulse > 0) {
      if (missionId === 'd2-m1' || missionId === 'd1-m4') {
        spawnSplash(145, 132, '#7DD3FC', 26);
      } else if (missionId === 'd1-m2') {
        spawnSplash(220, 130, '#7DD3FC', 28);
      } else if (missionId === 'd2-m3') {
        spawnSplash(160, 105, '#FDBA74', 24);
      } else if (missionId === 'd2-m5') {
        spawnSplash(225, 150, '#CBD5E1', 22);
      }
    }

    const drawPot = (
      x: number,
      y: number,
      growth: number,
      wetSoil: boolean,
      healthy: boolean
    ) => {
      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(x, y + 48, 38, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soil mound
      ctx.fillStyle = wetSoil ? '#2B180A' : '#78553A';
      ctx.beginPath();
      ctx.ellipse(x, y, 31, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dry cracks if dry
      if (!wetSoil) {
        ctx.strokeStyle = '#3E2715';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - 14, y);
        ctx.lineTo(x - 4, y + 2);
        ctx.lineTo(x + 8, y - 1);
        ctx.stroke();
      }

      // Stem
      const stemH = 10 + growth * 58;
      const droop = healthy ? 0 : 18 * growth;
      ctx.strokeStyle = healthy ? '#4ADE80' : '#A3A380';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + droop * 0.4, y - stemH * 0.55, x + droop, y - stemH);
      ctx.stroke();

      // Leaves
      const leafCount = healthy ? Math.max(2, Math.floor(2 + growth * 4)) : 2;
      for (let i = 0; i < leafCount; i++) {
        const frac = (i + 1) / (leafCount + 0.5);
        const lx = x + droop * frac;
        const ly = y - stemH * frac;
        const dir = i % 2 === 0 ? 1 : -1;
        const leafLen = (8 + growth * 14) * (healthy ? 1 : 0.65);

        ctx.fillStyle = healthy ? '#22C55E' : '#9CA37B';
        ctx.beginPath();
        ctx.ellipse(
          lx + dir * leafLen * 0.55,
          ly + (healthy ? -2 : 4),
          leafLen * 0.6,
          leafLen * 0.28,
          dir * (healthy ? -0.35 : 0.45),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Terracotta pot body with 3D cylindrical gradient
      const potGrad = ctx.createLinearGradient(x - 34, y, x + 34, y);
      potGrad.addColorStop(0, '#7C2D12');
      potGrad.addColorStop(0.35, '#EA580C');
      potGrad.addColorStop(0.75, '#C2410C');
      potGrad.addColorStop(1, '#5A1E0B');

      ctx.fillStyle = potGrad;
      ctx.beginPath();
      ctx.moveTo(x - 32, y + 6);
      ctx.lineTo(x + 32, y + 6);
      ctx.lineTo(x + 24, y + 48);
      ctx.lineTo(x - 24, y + 48);
      ctx.closePath();
      ctx.fill();

      // Pot rim
      ctx.fillStyle = potGrad;
      ctx.beginPath();
      ctx.roundRect(x - 35, y, 70, 9, 4);
      ctx.fill();
    };

    const render = () => {
      t += 0.03;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Update & draw shared particles
      const updateParticles = () => {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.14;
          p.life -= 0.025;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      };

      // =========================================================
      // DAY 2 · MISSION 1: THE TWO PLANT POTS (10-Day Time-Lapse + Watering)
      // =========================================================
      if (missionId === 'd2-m1') {
        const growth = sliderVal / 100;

        // Left half: Sunny Verandah
        const sunBg = ctx.createLinearGradient(0, 0, 0, H);
        sunBg.addColorStop(0, '#38BDF8');
        sunBg.addColorStop(0.68, '#FEF3C7');
        sunBg.addColorStop(0.68, '#92400E');
        sunBg.addColorStop(1, '#451A03');
        ctx.fillStyle = sunBg;
        ctx.fillRect(0, 0, W / 2, H);

        // Glowing sun & rays
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(54, 34, 18 + Math.sin(t * 2) * 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(253, 224, 71, 0.25)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(64, 44);
        ctx.lineTo(145, 130);
        ctx.stroke();

        // Right half: Dark Room
        const darkBg = ctx.createLinearGradient(0, 0, 0, H);
        darkBg.addColorStop(0, '#0F172A');
        darkBg.addColorStop(0.68, '#1E293B');
        darkBg.addColorStop(0.68, '#334155');
        darkBg.addColorStop(1, '#0F172A');
        ctx.fillStyle = darkBg;
        ctx.fillRect(W / 2, 0, W / 2, H);

        // Center wall divider
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(W / 2 - 2, 0, 4, H);

        drawPot(145, 136, growth, true, true);
        drawPot(415, 136, Math.min(0.22, growth * 0.22), false, false);

        // Labels
        ctx.fillStyle = '#142033';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Pot A · Sun + 1 Mug Water', 72, 22);
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText('Pot B · Dark Room + 0 Water', 330, 22);

        updateParticles();
      }

      // =========================================================
      // DAY 2 · MISSION 2: THE LUCKY BLUE BAT (Turf Pitch Delivery Physics)
      // =========================================================
      else if (missionId === 'd2-m2') {
        // Sky & Stadium backdrop
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#1E3A8A');
        sky.addColorStop(0.55, '#60A5FA');
        sky.addColorStop(0.55, '#15803D');
        sky.addColorStop(1, '#14532D');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // Clay cricket pitch strip
        ctx.fillStyle = '#D6B88D';
        ctx.beginPath();
        ctx.moveTo(95, 122);
        ctx.lineTo(465, 122);
        ctx.lineTo(510, 178);
        ctx.lineTo(50, 178);
        ctx.closePath();
        ctx.fill();

        // Stumps at both ends
        ctx.fillStyle = '#FEF3C7';
        ctx.fillRect(102, 108, 3, 28);
        ctx.fillRect(108, 108, 3, 28);
        ctx.fillRect(452, 108, 3, 28);
        ctx.fillRect(458, 108, 3, 28);

        // Ball trajectory: mode 0 = Saturday slow loop, mode 1 = Last week fast bullet
        const speed = mode === 0 ? 0.55 : 1.45;
        const prog = (t * speed) % 1;
        const bx = 115 + prog * 330;
        const arcH = mode === 0 ? Math.sin(prog * Math.PI) * 68 : Math.abs(Math.sin(prog * Math.PI * 1.4)) * 18;
        const by = 142 - arcH;

        // Ball shadow on pitch
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(bx, 148, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Red leather cricket ball with white seam
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(bx, by, 5, -0.5, 1.2);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(
          mode === 0
            ? 'Saturday: Class 3 Kids · Slow Underarm Loop (45 Runs)'
            : 'Last Week: Class 8 Boys · Fast Overarm Pace (12 Runs)',
          24,
          26
        );
      }

      // =========================================================
      // DAY 2 · MISSION 3: THE COLD STEEL SPOON (Thermal Heat Transfer)
      // =========================================================
      else if (missionId === 'd2-m3') {
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#1E293B');
        bg.addColorStop(1, '#0F172A');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Kitchen Wooden Countertop
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(0, 142, W, 58);

        // Draw Steel Spoon (Left)
        const steelGrad = ctx.createLinearGradient(90, 90, 210, 135);
        steelGrad.addColorStop(0, '#F8FAFC');
        steelGrad.addColorStop(0.5, '#94A3B8');
        steelGrad.addColorStop(1, '#475569');
        ctx.fillStyle = steelGrad;
        ctx.beginPath();
        ctx.roundRect(75, 114, 95, 9, 4);
        ctx.ellipse(190, 118, 30, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw Wooden Spoon (Right)
        const woodGrad = ctx.createLinearGradient(320, 90, 460, 135);
        woodGrad.addColorStop(0, '#D97706');
        woodGrad.addColorStop(0.6, '#92400E');
        woodGrad.addColorStop(1, '#451A03');
        ctx.fillStyle = woodGrad;
        ctx.beginPath();
        ctx.roundRect(320, 114, 95, 9, 4);
        ctx.ellipse(435, 118, 30, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Warm Finger Probe hovering over selected spoon
        const fingerX = mode === 0 ? 190 : 435;
        ctx.fillStyle = '#FDBA74';
        ctx.beginPath();
        ctx.roundRect(fingerX - 11, 34, 22, 62, 11);
        ctx.fill();

        // Animated heat dots rushing from finger into spoon
        const flowCount = mode === 0 ? 6 : 1;
        for (let i = 0; i < flowCount; i++) {
          const p = (t * (mode === 0 ? 1.6 : 0.4) + i / flowCount) % 1;
          const hy = 92 + p * 24;
          const hx = fingerX + Math.sin(p * 8 + i) * 10;
          ctx.fillStyle = '#FB923C';
          ctx.beginPath();
          ctx.arc(hx, hy, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Steel Spoon (Room Temp)', 115, 165);
        ctx.fillText('Wooden Spoon (Room Temp)', 355, 165);
        ctx.fillStyle = '#FDE68A';
        ctx.fillText(
          mode === 0
            ? 'Heat rushes OUT of your warm finger FAST → Feels icy!'
            : 'Heat leaves your warm finger VERY SLOWLY → Feels normal',
          24,
          24
        );
      }

      // =========================================================
      // DAY 2 · MISSION 4: THE CARROM CLUB POSTER (100 Students vs 10 Sent)
      // =========================================================
      else if (missionId === 'd2-m4') {
        ctx.fillStyle = '#142033';
        ctx.fillRect(0, 0, W, H);

        const zoomOut = sliderVal / 100; // 0 = 10 players big, 1 = 100 players grid
        const cols = zoomOut < 0.35 ? 5 : 20;
        const count = zoomOut < 0.35 ? 10 : 100;
        const radius = zoomOut < 0.35 ? 15 : 5.2;
        const gapX = zoomOut < 0.35 ? 74 : 24;
        const gapY = zoomOut < 0.35 ? 54 : 22;
        const startX = zoomOut < 0.35 ? 130 : 52;
        const startY = zoomOut < 0.35 ? 64 : 46;

        for (let i = 0; i < count; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const cx = startX + c * gapX;
          const cy = startY + r * gapY;

          if (i < 9) {
            ctx.fillStyle = '#F5B942'; // 9 medal winners
          } else if (i === 9) {
            ctx.fillStyle = '#94A3B8'; // 10th player who went to match
          } else {
            ctx.fillStyle = 'rgba(255,255,255,0.16)'; // 90 club students left at school
          }

          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(
          zoomOut < 0.35
            ? 'Poster View: 9 Medal Winners out of 10 Sent to Match'
            : 'Full Club View: Only 9 Winners out of 100 Club Students (90 Stayed Back)',
          24,
          24
        );
      }

      // =========================================================
      // DAY 2 · MISSION 5: THE CANCELLED PICNIC (6:30 AM Bus Tyre vs 7:00 AM Sun)
      // =========================================================
      else if (missionId === 'd2-m5') {
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#38BDF8');
        sky.addColorStop(0.64, '#BAE6FD');
        sky.addColorStop(0.64, '#334155');
        sky.addColorStop(1, '#1E293B');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // Bright Morning Sun
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(485, 38, 20, 0, Math.PI * 2);
        ctx.fill();

        // Yellow Indian School Bus
        const busX = mode === 0 ? 110 : 125;
        const tilt = mode === 0 ? 0.05 : 0.06;
        ctx.save();
        ctx.translate(busX, 118);
        ctx.rotate(tilt);

        // Bus Body
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.roundRect(-75, -42, 165, 52, 8);
        ctx.fill();

        // Windows
        ctx.fillStyle = '#1E293B';
        for (let w = 0; w < 4; w++) {
          ctx.fillRect(-62 + w * 36, -32, 26, 18);
        }

        // Front Good Wheel
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(-45, 12, 13, 0, Math.PI * 2);
        ctx.fill();

        // Rear Flat Burst Wheel
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.ellipse(58, 16, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(
          mode === 0
            ? '6:30 AM Highway: School Bus Rear Tyre Burst!'
            : '7:00 AM Sky: Clear Blue Sky & Zero Rain — Bus Still Stuck',
          24,
          26
        );

        updateParticles();
      }

      // =========================================================
      // DAY 1 · MISSIONS 1–5 INTERACTIVE SCENES
      // =========================================================
      else if (missionId === 'd1-m1') {
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#334155');
        bg.addColorStop(0.65, '#475569');
        bg.addColorStop(0.65, '#78350F');
        bg.addColorStop(1, '#451A03');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Steel Tiffin Box
        const tiffinGrad = ctx.createLinearGradient(230, 80, 330, 140);
        tiffinGrad.addColorStop(0, '#94A3B8');
        tiffinGrad.addColorStop(0.4, '#F8FAFC');
        tiffinGrad.addColorStop(1, '#475569');
        ctx.fillStyle = tiffinGrad;
        ctx.beginPath();
        ctx.roundRect(235, 96, 90, 42, 8);
        ctx.fill();

        // Lid lifts when mode === 1
        const lidLift = mode === 1 ? -22 : 0;
        ctx.fillStyle = tiffinGrad;
        ctx.beginPath();
        ctx.roundRect(230, 86 + lidLift, 100, 12, 5);
        ctx.fill();

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(
          mode === 0
            ? '10:00 AM: Classroom Locked · Mangoes Inside Box'
            : '12:30 PM: Box Empty · Kabir Near Bench (No Mango Smell)',
          24,
          26
        );
      } else if (missionId === 'd1-m2') {
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, mode === 0 ? '#60A5FA' : '#94A3B8');
        bg.addColorStop(0.62, mode === 0 ? '#BAE6FD' : '#CBD5E1');
        bg.addColorStop(0.62, '#475569');
        bg.addColorStop(1, '#1E293B');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        if (mode === 0) {
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(470, 38, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText('Outside Road: 100% Dry & Dusty (Zero Rain Overnight)', 24, 28);
        } else {
          // Bicycle Wheel
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(140, 116, 28, 0, Math.PI * 2);
          ctx.stroke();

          // White shoes near shoe rack
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(330, 124, 34, 15, 6);
          ctx.roundRect(372, 124, 34, 15, 6);
          ctx.fill();

          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText('7:00 AM Verandah: Brother Washed Cycle Beside Shoe Rack', 24, 28);
        }
        updateParticles();
      } else if (missionId === 'd1-m3') {
        ctx.fillStyle = '#142033';
        ctx.fillRect(0, 0, W, H);

        const routes = [
          { name: 'Park Walk', time: '12 min · ₹0', w: 240, y: 42 },
          { name: 'Auto', time: mode === 0 ? '8 min · ₹30' : 'Need ₹30 (Has ₹20)', w: 160, y: 92 },
          { name: 'Cycle', time: mode === 0 ? '10 min · ₹0' : 'Front Tyre Flat!', w: 200, y: 142 },
        ];

        for (const r of routes) {
          ctx.fillStyle = '#F8FAFC';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(r.name, 26, r.y + 14);

          ctx.fillStyle = 'rgba(255,255,255,0.14)';
          ctx.beginPath();
          ctx.roundRect(115, r.y, 260, 20, 10);
          ctx.fill();

          ctx.fillStyle = '#F5B942';
          ctx.beginPath();
          ctx.roundRect(115, r.y, r.w, 20, 10);
          ctx.fill();

          ctx.fillStyle = '#E2E8F0';
          ctx.fillText(r.time, 388, r.y + 14);
        }
      } else if (missionId === 'd1-m4') {
        const growth = sliderVal / 100;
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(0, 0, W, H);

        drawPot(150, 136, growth, true, true);
        drawPot(410, 136, growth * 0.65, true, false);

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Sunny Window · 1 Cup Water', 75, 24);
        ctx.fillText('Dark Corner Desk · 1 Cup Water', 325, 24);
        updateParticles();
      } else {
        // d1-m5 Juice Shop
        ctx.fillStyle = '#142033';
        ctx.fillRect(0, 0, W, H);

        const melt = sliderVal / 100;
        // Shop A Glass
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(130, 44, 64, 110);
        const juiceA = 96 - melt * 44;
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(132, 152 - juiceA, 60, juiceA);

        // Ice cubes melting
        if (melt < 0.85) {
          ctx.fillStyle = `rgba(224, 242, 254, ${1 - melt})`;
          ctx.fillRect(140, 62, 18, 18);
          ctx.fillRect(164, 66, 18, 18);
          ctx.fillRect(142, 86, 18, 18);
        }

        // Shop B Glass
        ctx.strokeRect(360, 68, 64, 86);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(362, 74, 60, 78);

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Shop A · Big Cup ₹20', 105, 176);
        ctx.fillText('Shop B · Medium Cup ₹20 (No Ice)', 305, 176);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [missionId, sliderVal, mode, actionPulse]);

  return (
    <div className="rounded-2xl overflow-hidden border border-[#142033]/15 bg-[#142033] shadow-sm">
      <canvas
        ref={canvasRef}
        width={560}
        height={196}
        className="w-full h-44 sm:h-52 block"
      />

      {/* INTERACTIVE LAB CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0F172A] border-t border-white/10 text-xs text-white">
        {(missionId === 'd2-m1' || missionId === 'd1-m4') && (
          <>
            <div className="flex items-center gap-2.5 flex-1 min-w-[180px]">
              <span className="font-bold text-white/80 shrink-0">
                Day {Math.max(1, Math.round((sliderVal / 100) * 10))}
              </span>
              <input
                type="range"
                min={10}
                max={100}
                value={sliderVal}
                onChange={(e) => setSliderVal(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={() => setActionPulse((p) => p + 1)}
              className="rounded-full bg-white px-3.5 py-1.5 font-extrabold text-[#142033] hover:bg-amber-200 transition cursor-pointer"
            >
              Pour 1 Mug Water
            </button>
          </>
        )}

        {missionId === 'd2-m4' && (
          <div className="flex items-center gap-3 w-full">
            <span className="font-bold text-white/85 shrink-0">
              {sliderVal < 35 ? 'Top 10 Players' : 'All 100 Club Kids'}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        )}

        {missionId === 'd1-m5' && (
          <div className="flex items-center gap-3 w-full">
            <span className="font-bold text-white/85 shrink-0">
              {sliderVal < 50 ? 'With Ice' : 'Ice Melted'}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        )}

        {missionId === 'd2-m2' && (
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-white/75 font-semibold">Compare bowlers:</span>
            <div className="inline-flex rounded-full bg-white/10 p-0.5 font-bold">
              <button
                type="button"
                onClick={() => setMode(0)}
                className={`rounded-full px-3 py-1 cursor-pointer ${
                  mode === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
                }`}
              >
                Saturday (Slow)
              </button>
              <button
                type="button"
                onClick={() => setMode(1)}
                className={`rounded-full px-3 py-1 cursor-pointer ${
                  mode === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
                }`}
              >
                Last Week (Fast)
              </button>
            </div>
          </div>
        )}

        {missionId === 'd2-m3' && (
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-white/75 font-semibold">Touch spoon:</span>
            <div className="inline-flex rounded-full bg-white/10 p-0.5 font-bold">
              <button
                type="button"
                onClick={() => setMode(0)}
                className={`rounded-full px-3 py-1 cursor-pointer ${
                  mode === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
                }`}
              >
                Touch Steel
              </button>
              <button
                type="button"
                onClick={() => setMode(1)}
                className={`rounded-full px-3 py-1 cursor-pointer ${
                  mode === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
                }`}
              >
                Touch Wood
              </button>
            </div>
          </div>
        )}

        {missionId === 'd2-m5' && (
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-white/75 font-semibold">Morning timeline:</span>
            <div className="inline-flex rounded-full bg-white/10 p-0.5 font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode(0);
                  setActionPulse((p) => p + 1);
                }}
                className={`rounded-full px-3 py-1 cursor-pointer ${
                  mode === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
                }`}
              >
                6:30 AM Bus
              </button>
              <button
                type="button"
                onClick={() => setMode(1)}
                className={`rounded-full px-3 py-1 cursor-pointer ${
                  mode === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
                }`}
              >
                7:00 AM Sky
              </button>
            </div>
          </div>
        )}

        {(missionId === 'd1-m1' || missionId === 'd1-m2' || missionId === 'd1-m3') && (
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-white/75 font-semibold">Inspect scene:</span>
            <div className="inline-flex rounded-full bg-white/10 p-0.5 font-bold">
              <button
                type="button"
                onClick={() => setMode(0)}
                className={`rounded-full px-3 py-1 cursor-pointer ${
                  mode === 0 ? 'bg-white text-[#142033]' : 'text-white/75'
                }`}
              >
                {missionId === 'd1-m1'
                  ? '10:00 AM'
                  : missionId === 'd1-m2'
                  ? 'Outside Road'
                  : 'Travel Times'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(1);
                  setActionPulse((p) => p + 1);
                }}
                className={`rounded-full px-3 py-1 cursor-pointer ${
                  mode === 1 ? 'bg-white text-[#142033]' : 'text-white/75'
                }`}
              >
                {missionId === 'd1-m1'
                  ? '12:30 PM Open Lid'
                  : missionId === 'd1-m2'
                  ? '7:00 AM Verandah'
                  : 'Check Limits'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}