import { useState } from 'react';
import {
  V12_SKILLS,
  type EvidenceCoverageState,
  type SkillDefinition,
} from './skillsCatalog';

interface EvidenceWheelProps {
  hasLocalActivity: boolean;
  showAnalyticalDetail: boolean;
}

const STATE_STYLES: Record<
  EvidenceCoverageState,
  {
    fill: string;
    stroke: string;
    badgeBg: string;
    badgeText: string;
    label: string;
  }
> = {
  evidence_available: {
    fill: '#087F80',
    stroke: '#FFFFFF',
    badgeBg: '#E6F4F4',
    badgeText: '#087F80',
    label: 'Reviewed evidence available',
  },
  limited_evidence: {
    fill: '#55E2CE',
    stroke: '#FFFFFF',
    badgeBg: '#E8FBF8',
    badgeText: '#0A6667',
    label: 'Limited evidence',
  },
  awaiting_review: {
    fill: '#F5B942',
    stroke: '#FFFFFF',
    badgeBg: '#FEF6E4',
    badgeText: '#946200',
    label: 'Local activity · Awaiting review',
  },
  not_observed: {
    fill: '#E8ECF0',
    stroke: '#FFFFFF',
    badgeBg: '#F1F4F8',
    badgeText: '#586579',
    label: 'Not yet observed (N/O)',
  },
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeDonutWedge(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(cx, cy, outerR, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    outerStart.x,
    outerStart.y,
    'A',
    outerR,
    outerR,
    0,
    largeArcFlag,
    0,
    outerEnd.x,
    outerEnd.y,
    'L',
    innerEnd.x,
    innerEnd.y,
    'A',
    innerR,
    innerR,
    0,
    largeArcFlag,
    1,
    innerStart.x,
    innerStart.y,
    'Z',
  ].join(' ');
}

export function EvidenceWheel({
  hasLocalActivity,
  showAnalyticalDetail,
}: EvidenceWheelProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition>(
    V12_SKILLS[3] // Default: B2 Using evidence
  );
  const [drawerTab, setDrawerTab] = useState<'home' | 'science'>('home');
  const [showRadarExplanation, setShowRadarExplanation] = useState(false);

  // Until server-side V1.2 scoring & human review are enabled, no skill is
  // presented as scored. Local browser activity is honestly marked pending/N/O.
  const currentCoverageState: EvidenceCoverageState = hasLocalActivity
    ? 'awaiting_review'
    : 'not_observed';

  const selectedMeta = STATE_STYLES[currentCoverageState];

  return (
    <div className="rounded-3xl border border-[#DCE2E7] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
            Eight thinking skills · Master Framework V1.2
          </p>
          <h3 className="mt-1 text-xl font-extrabold tracking-tight text-[#142033]">
            Evidence-coverage wheel
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#586579]">
            Shows where CubitX has gathered reviewed observations—and where more
            varied opportunities are still needed. Select any segment to inspect it.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRadarExplanation((v) => !v)}
          className="rounded-xl border border-[#DCE2E7] bg-[#F7F6F1] px-3.5 py-2 text-xs font-bold text-[#142033] transition hover:border-[#087F80] hover:text-[#087F80] focus:outline-none focus:ring-2 focus:ring-[#087F80]"
        >
          {showRadarExplanation
            ? 'Hide 8-skill radar info'
            : 'Why is the radar locked?'}
        </button>
      </div>

      {showRadarExplanation && (
        <div className="mt-4 rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1] p-4 text-xs leading-6 text-[#586579]">
          <p className="font-bold text-[#142033]">
            Conditional 8-Skill Radar (Locked until validated)
          </p>
          <p className="mt-1">
            Many apps plot an instant radar chart after a single 10-minute quiz.
            CubitX refuses to plot ability polygons until comparable,
            rubric-reviewed observations exist across multiple missions. Missing
            evidence is never plotted as zero.
          </p>
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* LEFT: Interactive SVG Wheel */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[340px]">
            <svg
              viewBox="0 0 360 360"
              role="img"
              aria-label="Eight-skill evidence coverage wheel"
              className="h-auto w-full"
            >
              {V12_SKILLS.map((skill, idx) => {
                const startAngle = idx * 45 + 1.5;
                const endAngle = (idx + 1) * 45 - 1.5;
                const midAngle = idx * 45 + 22.5;
                const isSelected = selectedSkill.code === skill.code;
                const style = STATE_STYLES[currentCoverageState];

                const outerR = isSelected ? 156 : 148;
                const innerR = 76;
                const path = describeDonutWedge(
                  180,
                  180,
                  innerR,
                  outerR,
                  startAngle,
                  endAngle
                );
                const labelPos = polarToCartesian(180, 180, 115, midAngle);

                return (
                  <g
                    key={skill.code}
                    role="button"
                    tabIndex={0}
                    aria-label={`${skill.code} ${skill.name}: ${style.label}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedSkill(skill)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedSkill(skill);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    <path
                      d={path}
                      fill={isSelected ? '#142033' : style.fill}
                      stroke={style.stroke}
                      strokeWidth="2.5"
                      className="transition-all duration-200 hover:opacity-90"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y - 4}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fontWeight="800"
                      fill={isSelected ? '#FFFFFF' : '#142033'}
                    >
                      {skill.code}
                    </text>
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 11}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8.5"
                      fontWeight="600"
                      fill={isSelected ? '#DCE2E7' : '#586579'}
                    >
                      {skill.shortLabel}
                    </text>
                  </g>
                );
              })}

              {/* Center Hub */}
              <circle
                cx="180"
                cy="180"
                r="64"
                fill="#FFFFFF"
                stroke="#DCE2E7"
                strokeWidth="1.5"
              />
              <text
                x="180"
                y="170"
                textAnchor="middle"
                fontSize="22"
                fontWeight="800"
                fill="#142033"
              >
                0 / 8
              </text>
              <text
                x="180"
                y="190"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#586579"
              >
                Verified skills
              </text>
              <text
                x="180"
                y="204"
                textAnchor="middle"
                fontSize="9"
                fill="#087F80"
              >
                Coverage ≠ Score
              </text>
            </svg>
          </div>

          {/* Non-colour + colour legend */}
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-[11px] font-medium text-[#586579]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#087F80]" />
              Reviewed evidence
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F5B942]" />
              Local · Awaiting review
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-[#B8C4CE] bg-[#E8ECF0]" />
              Not yet observed (N/O)
            </span>
          </div>
        </div>

        {/* RIGHT: Invisible Rigor Two-Layer Drawer */}
        <div className="rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2">
              <span className="rounded-lg bg-[#142033] px-2.5 py-1 text-xs font-extrabold text-white">
                {selectedSkill.code}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#586579]">
                {selectedSkill.pillar}
              </span>
            </span>

            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold"
              style={{
                backgroundColor: selectedMeta.badgeBg,
                color: selectedMeta.badgeText,
              }}
            >
              {selectedMeta.label}
            </span>
          </div>

          <h4 className="mt-3 text-lg font-extrabold text-[#142033]">
            {selectedSkill.name}
          </h4>

          {/* Invisible Rigor Tab Switcher */}
          <div
            role="tablist"
            aria-label="Skill detail view"
            className="mt-4 inline-flex rounded-xl border border-[#DCE2E7] bg-white p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={drawerTab === 'home'}
              onClick={() => setDrawerTab('home')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                drawerTab === 'home'
                  ? 'bg-[#087F80] text-white'
                  : 'text-[#586579] hover:text-[#142033]'
              }`}
            >
              What this means at home
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={drawerTab === 'science'}
              onClick={() => setDrawerTab('science')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                drawerTab === 'science'
                  ? 'bg-[#142033] text-white'
                  : 'text-[#586579] hover:text-[#142033]'
              }`}
            >
              Framework science
            </button>
          </div>

          {drawerTab === 'home' ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm leading-6 text-[#142033]">
                {selectedSkill.homeSummary}
              </p>

              <div className="rounded-xl border border-[#DCE2E7] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#586579]">
                  What you might recognise at home
                </p>
                <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#142033]">
                  {selectedSkill.whatYouMightNotice.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#F5B942]/40 bg-[#FFFDF7] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#946200]">
                  Dinner-table question
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#142033]">
                  “{selectedSkill.dinnerPrompt}”
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-xs leading-5 text-[#142033]">
              <div className="rounded-xl border border-[#DCE2E7] bg-white p-3.5">
                <p className="font-bold text-[#586579]">
                  V1.2 Behavioural Definition
                </p>
                <p className="mt-1">{selectedSkill.frameworkDefinition}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#DCE2E7] bg-white p-3.5">
                  <p className="font-bold text-[#586579]">Mapped Parameters</p>
                  <p className="mt-1 font-semibold">
                    {selectedSkill.primaryParameters.join(', ')}
                  </p>
                </div>
                <div className="rounded-xl border border-[#DCE2E7] bg-white p-3.5">
                  <p className="font-bold text-[#586579]">Scoring Method</p>
                  <p className="mt-1">{selectedSkill.scoringMode}</p>
                </div>
              </div>
              <div className="rounded-xl border border-[#DCE2E7] bg-white p-3.5">
                <p className="font-bold text-[#586579]">
                  Current Evidence Status
                </p>
                <p className="mt-1 text-[#586579]">
                  Status:{' '}
                  <strong className="text-[#142033]">
                    N/O (Not Observed)
                  </strong>{' '}
                  · Rubric version:{' '}
                  <strong className="text-[#142033]">V1.2</strong>. Reviewed
                  observations require server-side verification and teacher
                  calibration before a skill summary is shown.
                </p>
              </div>
            </div>
          )}

          {showAnalyticalDetail && (
            <div className="mt-4 border-t border-[#DCE2E7] pt-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#586579]">
                Jump to any skill
              </p>
              <div className="flex flex-wrap gap-1.5">
                {V12_SKILLS.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => setSelectedSkill(s)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                      selectedSkill.code === s.code
                        ? 'bg-[#142033] text-white'
                        : 'border border-[#DCE2E7] bg-white text-[#586579] hover:border-[#087F80]'
                    }`}
                  >
                    {s.code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}