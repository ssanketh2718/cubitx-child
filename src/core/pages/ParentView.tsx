
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/*
 * CUBITX PARENT INSIGHTS
 * Demonstration frontend implementation.
 *
 * IMPORTANT:
 * 1. Demo records are illustrative, not real child evidence.
 * 2. Replace DEMO_DATA with verified backend data.
 * 3. Never calculate a skill score from evidence counts.
 * 4. Radar values are displayed only when approved comparable
 *    measures are supplied by the assessment service.
 * 5. All child ownership and access checks belong on the server.
 */

const CUBITX_LOGO_SRC =
  "data:image/png;base64,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";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type SkillId =
  | 'A1'
  | 'A2'
  | 'B1'
  | 'B2'
  | 'B3'
  | 'C1'
  | 'C2'
  | 'C3';

type EvidenceStatus =
  | 'SUPPORTED'
  | 'CONTRADICTED'
  | 'UNRESOLVED'
  | 'CONDITIONALLY_SUPPORTED'
  | 'INVALIDATED_OBSERVATION'
  | 'PENDING_REVIEW';

type ObservationSource =
  | 'PLATFORM_OBSERVED'
  | 'PARENT_SHARED'
  | 'SYSTEM_INTERPRETATION';

interface SkillDefinition {
  id: SkillId;
  name: string;
  shortName: string;
  description: string;
  homeMeaning: string;
  frameworkMeaning: string;
  parameterCode?: string;
  rubricConstraint: string;
}

interface ReplayEvent {
  id: string;
  label: string;
  detail: string;
  input?: string;
  output?: string;
  eventType: 'probe' | 'choice' | 'feedback' | 'revision';
}

interface Observation {
  id: string;
  skillId: SkillId;
  missionId: string;
  missionName: string;
  date: string;
  title: string;
  summary: string;
  evidenceText: string;
  source: ObservationSource;
  status: EvidenceStatus;
  events: ReplayEvent[];
  childVerbatim?: string;
  childVerbatimType?: 'typed' | 'selected';
  frameworkVersion: string;
  rubricVersion?: string;
  parameterCode?: string;
  interpretation: string;
  limitation: string;
}

interface Mission {
  id: string;
  name: string;
  description: string;
  date: string;
  completed: boolean;
  skillIds: SkillId[];
  observationIds: string[];
}

interface TrendPoint {
  period: string;
  count: number;
}

interface ChildProfile {
  id: string;
  displayName: string;
  classLabel: string;
}

interface ParentInsightsData {
  child: ChildProfile;
  isDemo: boolean;
  observations: Observation[];
  missions: Mission[];
  trends: TrendPoint[];
  comparableSkillMeasures?: Partial<Record<SkillId, number>>;
  measureLabel?: string;
  reportingPeriod: string;
  lastUpdated: string;
}

/* -------------------------------------------------------------------------- */
/* Approved V1.2 skill definitions                                            */
/* -------------------------------------------------------------------------- */

const SKILLS: SkillDefinition[] = [
  {
    id: 'A1',
    name: 'Asking good questions',
    shortName: 'Good questions',
    description:
      'Asks relevant, answerable questions that help distinguish between possibilities.',
    homeMeaning:
      'Your child asks questions that help investigate a problem rather than simply guessing.',
    frameworkMeaning:
      'A relevant and answerable question is used to distinguish between plausible possibilities.',
    rubricConstraint:
      'A question must be relevant to the task and capable of distinguishing possibilities. Question quantity alone is not evidence of quality.',
  },
  {
    id: 'A2',
    name: 'Spotting missing information',
    shortName: 'Missing information',
    description:
      'Recognises what is unknown or what information is needed before reaching a confident conclusion.',
    homeMeaning:
      'Your child notices when something important is not yet known.',
    frameworkMeaning:
      'The child identifies an unknown or information requirement relevant to the decision.',
    rubricConstraint:
      'The missing information must be relevant to the conclusion or decision being considered.',
  },
  {
    id: 'B1',
    name: 'Giving reasons',
    shortName: 'Giving reasons',
    description:
      'Provides a relevant and specific reason rather than merely restating an answer.',
    homeMeaning:
      'Your child explains why an answer or decision makes sense.',
    frameworkMeaning:
      'A relevant, specific reason is connected to the response or conclusion.',
    rubricConstraint:
      'A restatement of the answer without a relevant reason does not satisfy the reasoning requirement.',
  },
  {
    id: 'B2',
    name: 'Using evidence',
    shortName: 'Using evidence',
    description:
      'Uses a specific clue or information source to support or qualify a conclusion.',
    homeMeaning:
      'Your child uses clues or information to explain a decision.',
    frameworkMeaning:
      'The response connects identifiable evidence to a claim or conclusion.',
    rubricConstraint:
      'Evidence must be identifiable and relevant. A correct answer alone does not establish evidence use.',
  },
  {
    id: 'B3',
    name: 'Detecting weak reasoning',
    shortName: 'Weak reasoning',
    description:
      'Notices weaknesses in a claim, source or inference.',
    homeMeaning:
      'Your child notices when an explanation has a gap or does not fully make sense.',
    frameworkMeaning:
      'The child identifies a weakness in the reasoning connecting evidence and conclusion.',
    rubricConstraint:
      'The weakness must be identifiable; merely disagreeing with a conclusion is insufficient.',
  },
  {
    id: 'C1',
    name: 'Weighing trade-offs',
    shortName: 'Trade-offs',
    description:
      'Compares benefits, costs, risks or competing explanations.',
    homeMeaning:
      'Your child considers what may be gained and what may be lost when choosing.',
    frameworkMeaning:
      'The child considers competing benefits, costs, risks or explanations.',
    rubricConstraint:
      'Decision trade-offs and competing explanations require their respective approved rubric anchors.',
  },
  {
    id: 'C2',
    name: 'Updating on evidence',
    shortName: 'Updating views',
    description:
      'Changes or maintains a view proportionately in response to evidence, with a reason.',
    homeMeaning:
      'Your child considers new information and explains why an earlier view should change or remain.',
    frameworkMeaning:
      'The response demonstrates a reasoned relationship between relevant evidence and a revised or maintained view.',
    rubricConstraint:
      'Changing an answer is not automatically good updating. The relationship between the evidence and the decision matters.',
  },
  {
    id: 'C3',
    name: 'Reflecting',
    shortName: 'Reflection',
    description:
      'Identifies a clue or strategy that mattered and what could be tried next.',
    homeMeaning:
      'Your child thinks about what helped solve a problem and what they might try next time.',
    frameworkMeaning:
      'The child identifies a relevant strategy, clue or learning point and a possible next step.',
    rubricConstraint:
      'A generic statement without an identifiable strategy or learning point is insufficient.',
  },
];

/* -------------------------------------------------------------------------- */
/* Demonstration data                                                         */
/* Replace with backend data before production.                              */
/* -------------------------------------------------------------------------- */

const DEMO_OBSERVATIONS: Observation[] = [
  {
    id: 'demo-obs-001',
    skillId: 'B2',
    missionId: 'demo-mission-001',
    missionName: 'The Mystery Machine',
    date: '2026-11-02',
    title: 'Compared a clue before choosing a rule',
    summary:
      'The child examined a machine output and used the result to investigate a possible rule.',
    evidenceText:
      'Recorded probe: Input 3 → Output 9. A later probe was used to distinguish the candidate explanations.',
    source: 'PLATFORM_OBSERVED',
    status: 'SUPPORTED',
    frameworkVersion: 'V1.2',
    rubricVersion: 'Demo rubric',
    parameterCode: undefined,
    interpretation:
      'The available activity record contains an example of connecting an observed result to a possible explanation.',
    limitation:
      'One activity observation does not establish a stable behaviour across different contexts.',
    childVerbatim: 'How do we know that is the correct rule?',
    childVerbatimType: 'typed',
    events: [
      {
        id: 'demo-event-001',
        label: 'Initial probe',
        detail: 'The child entered an input into the machine.',
        input: '3',
        output: '9',
        eventType: 'probe',
      },
      {
        id: 'demo-event-002',
        label: 'Second probe',
        detail: 'The child tested another input to distinguish possible rules.',
        input: '4',
        output: '16',
        eventType: 'probe',
      },
      {
        id: 'demo-event-003',
        label: 'Decision',
        detail: 'The child selected a candidate explanation.',
        eventType: 'choice',
      },
    ],
  },
  {
    id: 'demo-obs-002',
    skillId: 'A2',
    missionId: 'demo-mission-002',
    missionName: 'The Missing Clue',
    date: '2026-11-03',
    title: 'Identified information that was still missing',
    summary:
      'The child identified an unknown detail before choosing an explanation.',
    evidenceText:
      'The activity record contains a response identifying information needed before deciding.',
    source: 'PLATFORM_OBSERVED',
    status: 'SUPPORTED',
    frameworkVersion: 'V1.2',
    interpretation:
      'This activity contains an example of identifying missing information.',
    limitation:
      'Further varied observations would be needed before describing a repeated pattern.',
    events: [
      {
        id: 'demo-event-004',
        label: 'Information check',
        detail: 'The child identified an unknown detail.',
        eventType: 'choice',
      },
    ],
  },
  {
    id: 'demo-obs-003',
    skillId: 'C2',
    missionId: 'demo-mission-003',
    missionName: 'The Changing Bridge',
    date: '2026-11-04',
    title: 'Reconsidered a decision after new information',
    summary:
      'The child reconsidered an earlier explanation after encountering new information.',
    evidenceText:
      'The activity record contains an initial decision and a later revision.',
    source: 'PLATFORM_OBSERVED',
    status: 'PENDING_REVIEW',
    frameworkVersion: 'V1.2',
    interpretation:
      'The record may provide an opportunity to examine how the child responds to new evidence.',
    limitation:
      'This observation is awaiting review and is not included in approved evidence summaries.',
    events: [
      {
        id: 'demo-event-005',
        label: 'Initial decision',
        detail: 'An initial response was recorded.',
        eventType: 'choice',
      },
      {
        id: 'demo-event-006',
        label: 'New information',
        detail: 'The activity presented additional information.',
        eventType: 'feedback',
      },
      {
        id: 'demo-event-007',
        label: 'Revision',
        detail: 'A revised response was recorded.',
        eventType: 'revision',
      },
    ],
  },
];

const DEMO_MISSIONS: Mission[] = [
  {
    id: 'demo-mission-001',
    name: 'The Mystery Machine',
    description: 'Investigate the hidden rule behind a machine.',
    date: '2026-11-02',
    completed: true,
    skillIds: ['A1', 'B2', 'C2'],
    observationIds: ['demo-obs-001'],
  },
  {
    id: 'demo-mission-002',
    name: 'The Missing Clue',
    description: 'Find out what information is needed before deciding.',
    date: '2026-11-03',
    completed: true,
    skillIds: ['A2', 'B1'],
    observationIds: ['demo-obs-002'],
  },
  {
    id: 'demo-mission-003',
    name: 'The Changing Bridge',
    description: 'Reconsider a plan when new information appears.',
    date: '2026-11-04',
    completed: true,
    skillIds: ['C1', 'C2', 'C3'],
    observationIds: ['demo-obs-003'],
  },
];

const DEMO_DATA: ParentInsightsData = {
  child: {
    id: 'demo-child',
    displayName: 'Demo child',
    classLabel: 'Demonstration profile',
  },
  isDemo: true,
  observations: DEMO_OBSERVATIONS,
  missions: DEMO_MISSIONS,
  trends: [
    { period: 'Week 1', count: 1 },
    { period: 'Week 2', count: 2 },
    { period: 'Week 3', count: 2 },
    { period: 'Week 4', count: 3 },
  ],
  // Intentionally absent. A radar chart must not be generated
  // from evidence counts or illustrative percentages.
  comparableSkillMeasures: undefined,
  reportingPeriod: 'All demonstration activity',
  lastUpdated: 'Demonstration timestamp',
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusLabel(status: EvidenceStatus) {
  const labels: Record<EvidenceStatus, string> = {
    SUPPORTED: 'Supported',
    CONTRADICTED: 'Contradicted',
    UNRESOLVED: 'Unresolved',
    CONDITIONALLY_SUPPORTED: 'Conditionally supported',
    INVALIDATED_OBSERVATION: 'Excluded observation',
    PENDING_REVIEW: 'Awaiting review',
  };

  return labels[status];
}

function statusClass(status: EvidenceStatus) {
  const classes: Record<EvidenceStatus, string> = {
    SUPPORTED: 'bg-[#DDF2ED] text-[#087F80]',
    CONTRADICTED: 'bg-[#FCE8E6] text-[#A33B32]',
    UNRESOLVED: 'bg-[#F0F1F3] text-[#586579]',
    CONDITIONALLY_SUPPORTED: 'bg-[#FDF1D8] text-[#8A641B]',
    INVALIDATED_OBSERVATION: 'bg-[#F0F1F3] text-[#586579]',
    PENDING_REVIEW: 'bg-[#FFF2D8] text-[#8A641B]',
  };

  return classes[status];
}

function getSkill(id: SkillId) {
  return SKILLS.find((skill) => skill.id === id)!;
}

function isEligibleObservation(observation: Observation) {
  return observation.status === 'SUPPORTED' ||
    observation.status === 'CONDITIONALLY_SUPPORTED' ||
    observation.status === 'CONTRADICTED' ||
    observation.status === 'UNRESOLVED';
}

function getEvidenceCount(
  observations: Observation[],
  skillId: SkillId,
) {
  return observations.filter(
    (observation) =>
      observation.skillId === skillId &&
      isEligibleObservation(observation),
  ).length;
}

function getCoverageStatus(
  observations: Observation[],
  skillId: SkillId,
) {
  const count = getEvidenceCount(observations, skillId);

  if (count === 0) return 'INSUFFICIENT';
  if (count === 1) return 'LIMITED';
  return 'AVAILABLE';
}

/* -------------------------------------------------------------------------- */
/* Small reusable UI components                                               */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#087F80] mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="text-xl sm:text-2xl font-extrabold text-[#142033]">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-[#687589] mt-1 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: EvidenceStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#CBD4DD] bg-[#FAFBFC] p-6 text-center">
      <div className="text-2xl mb-2">◌</div>
      <h3 className="text-sm font-bold text-[#142033]">{title}</h3>
      <p className="text-xs text-[#687589] mt-1 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Evidence coverage wheel                                                    */
/* -------------------------------------------------------------------------- */

function EvidenceWheel({
  observations,
  selectedSkill,
  onSelect,
}: {
  observations: Observation[];
  selectedSkill: SkillId;
  onSelect: (id: SkillId) => void;
}) {
  const size = 420;
  const center = size / 2;
  const radius = 125;
  const total = SKILLS.length;

  const polar = (index: number, r: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;

    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const segments = SKILLS.map((skill, index) => {
    const status = getCoverageStatus(observations, skill.id);
    const startAngle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 / total);

    const r1 = radius * 0.48;
    const r2 = radius;

    const p1 = {
      x: center + r1 * Math.cos(startAngle),
      y: center + r1 * Math.sin(startAngle),
    };
    const p2 = {
      x: center + r2 * Math.cos(startAngle),
      y: center + r2 * Math.sin(startAngle),
    };
    const p3 = {
      x: center + r2 * Math.cos(endAngle),
      y: center + r2 * Math.sin(endAngle),
    };
    const p4 = {
      x: center + r1 * Math.cos(endAngle),
      y: center + r1 * Math.sin(endAngle),
    };

    const fill =
      status === 'AVAILABLE'
        ? '#087F80'
        : status === 'LIMITED'
          ? '#A9D6CC'
          : '#E7EBEF';

    return {
      skill,
      status,
      path: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r2} ${r2} 0 0 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${r1} ${r1} 0 0 0 ${p1.x} ${p1.y} Z`,
      fill,
      selected: selectedSkill === skill.id,
    };
  });

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 420 420"
        role="img"
        aria-label="Eight-skill evidence coverage wheel"
        className="w-full max-w-[420px] mx-auto"
      >
        <circle cx={center} cy={center} r={radius * 0.46} fill="#F7F6F1" />

        {segments.map((segment) => (
          <g
            key={segment.skill.id}
            role="button"
            tabIndex={0}
            aria-label={`${segment.skill.id}: ${segment.skill.name}, ${segment.status}`}
            onClick={() => onSelect(segment.skill.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(segment.skill.id);
              }
            }}
            className="cursor-pointer"
          >
            <path
              d={segment.path}
              fill={segment.fill}
              stroke={segment.selected ? '#142033' : '#FFFFFF'}
              strokeWidth={segment.selected ? 4 : 2}
            />
          </g>
        ))}

        {SKILLS.map((skill, index) => {
          const point = polar(index, radius + 30);

          return (
            <g key={skill.id}>
              <text
                x={point.x}
                y={point.y - 7}
                textAnchor="middle"
                className="fill-[#142033] text-[13px] font-black"
              >
                {skill.id}
              </text>
              <text
                x={point.x}
                y={point.y + 8}
                textAnchor="middle"
                className="fill-[#586579] text-[9px] font-semibold"
              >
                {skill.shortName}
              </text>
            </g>
          );
        })}

        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          className="fill-[#142033] text-[15px] font-black"
        >
          8 SKILLS
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          className="fill-[#687589] text-[9px] font-medium"
        >
          EVIDENCE COVERAGE
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-4 text-[10px] font-semibold text-[#687589] mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#087F80]" />
          Evidence available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#A9D6CC]" />
          Limited evidence
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#E7EBEF]" />
          Insufficient evidence
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Conditional radar chart                                                    */
/* -------------------------------------------------------------------------- */

function SkillRadar({
  measures,
}: {
  measures?: Partial<Record<SkillId, number>>;
}) {
  const complete =
    !!measures &&
    SKILLS.every((skill) => {
      const value = measures[skill.id];
      return typeof value === 'number' && value >= 0 && value <= 100;
    });

  if (!complete) {
    return (
      <EmptyState
        title="A comparable skill profile is not available yet"
        description="The evidence coverage wheel shows where observations exist. A radar chart will appear only when all required skill measures are supplied using an approved, comparable assessment method."
      />
    );
  }

  const size = 340;
  const center = size / 2;
  const radius = 112;

  const points = SKILLS.map((skill, index) => {
    const angle = (Math.PI * 2 / SKILLS.length) * index - Math.PI / 2;
    const value = measures![skill.id]!;
    const r = (value / 100) * radius;

    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div>
      <svg
        viewBox="0 0 340 340"
        className="w-full max-w-[340px] mx-auto"
        role="img"
        aria-label="Comparable skill measures radar chart"
      >
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={SKILLS.map((_, index) => {
              const angle = (Math.PI * 2 / SKILLS.length) * index - Math.PI / 2;
              return `${center + radius * scale * Math.cos(angle)},${center + radius * scale * Math.sin(angle)}`;
            }).join(' ')}
            fill="none"
            stroke="#DCE2E7"
            strokeWidth="1"
          />
        ))}

        {SKILLS.map((_, index) => {
          const angle = (Math.PI * 2 / SKILLS.length) * index - Math.PI / 2;
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="#DCE2E7"
            />
          );
        })}

        <polygon
          points={points}
          fill="rgba(8,127,128,0.18)"
          stroke="#087F80"
          strokeWidth="2"
        />

        {SKILLS.map((skill, index) => {
          const angle = (Math.PI * 2 / SKILLS.length) * index - Math.PI / 2;
          const labelRadius = radius + 23;

          return (
            <text
              key={skill.id}
              x={center + labelRadius * Math.cos(angle)}
              y={center + labelRadius * Math.sin(angle)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[#586579] text-[10px] font-bold"
            >
              {skill.id}
            </text>
          );
        })}
      </svg>
      <p className="text-xs text-center text-[#687589]">
        Measure: { 'Approved comparable measure' }. Interpret alongside sample sizes and rubric documentation.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Show Me the Moment replay                                                  */
/* -------------------------------------------------------------------------- */

function ReplayModal({
  observation,
  onClose,
}: {
  observation: Observation;
  onClose: () => void;
}) {
  const skill = getSkill(observation.skillId);

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#142033]/55 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="replay-title"
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-[#E4E8EC] flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#087F80]">
              Read-only activity replay
            </p>
            <h2 id="replay-title" className="text-xl font-extrabold mt-1">
              {observation.missionName}
            </h2>
            <p className="text-xs text-[#687589] mt-1">
              {formatDate(observation.date)} · {skill.id} {skill.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F1F3F5] text-[#142033] font-bold"
            aria-label="Close replay"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-2xl bg-[#F7F6F1] p-4">
            <p className="text-xs font-bold text-[#586579] mb-2">
              Recorded observation
            </p>
            <p className="text-sm text-[#142033] leading-relaxed">
              {observation.evidenceText}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-3">Recorded interaction sequence</h3>

            {observation.events.length === 0 ? (
              <EmptyState
                title="Replay unavailable"
                description="The original event sequence is not available for this observation."
              />
            ) : (
              <div className="space-y-3">
                {observation.events.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-7 h-7 shrink-0 rounded-full bg-[#DDF2ED] text-[#087F80] flex items-center justify-center text-xs font-black">
                      {index + 1}
                    </div>
                    <div className="flex-1 rounded-xl border border-[#E4E8EC] p-3">
                      <p className="text-sm font-bold">{event.label}</p>
                      <p className="text-xs text-[#687589] mt-1">
                        {event.detail}
                      </p>

                      {event.input !== undefined && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="bg-[#F7F6F1] rounded-lg p-3">
                            <p className="text-[10px] text-[#687589]">Input</p>
                            <p className="font-extrabold text-lg">{event.input}</p>
                          </div>
                          <div className="bg-[#F7F6F1] rounded-lg p-3">
                            <p className="text-[10px] text-[#687589]">Output</p>
                            <p className="font-extrabold text-lg">
                              {event.output ?? 'Not recorded'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[#E4E8EC] pt-4">
            <p className="text-xs font-bold text-[#586579]">What this may show</p>
            <p className="text-sm text-[#142033] mt-1 leading-relaxed">
              {observation.interpretation}
            </p>
            <p className="text-xs text-[#687589] mt-3 leading-relaxed">
              Limitation: {observation.limitation}
            </p>
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#8792A1]">
            <span>Framework {observation.frameworkVersion}</span>
            <span>Original events · Read only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Framework detail panel                                                     */
/* -------------------------------------------------------------------------- */

function FrameworkPanel({
  skill,
  observation,
}: {
  skill: SkillDefinition;
  observation?: Observation;
}) {
  const [tab, setTab] = useState<'home' | 'framework'>('home');

  return (
    <div className="bg-white rounded-2xl border border-[#DCE2E7] p-5">
      <div className="flex flex-wrap justify-between gap-3 items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#087F80]">
            {skill.id} · Thinking skill
          </p>
          <h3 className="text-lg font-extrabold mt-1">{skill.name}</h3>
        </div>
        {observation && <StatusBadge status={observation.status} />}
      </div>

      <div className="flex gap-2 mt-5 p-1 rounded-xl bg-[#F1F3F5]">
        <button
          type="button"
          onClick={() => setTab('home')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${
            tab === 'home'
              ? 'bg-white text-[#087F80] shadow-sm'
              : 'text-[#687589]'
          }`}
        >
          What this means at home
        </button>
        <button
          type="button"
          onClick={() => setTab('framework')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${
            tab === 'framework'
              ? 'bg-white text-[#087F80] shadow-sm'
              : 'text-[#687589]'
          }`}
        >
          Framework science
        </button>
      </div>

      {tab === 'home' ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm leading-relaxed text-[#142033]">
            {skill.homeMeaning}
          </p>
          <div className="rounded-xl bg-[#F7F6F1] p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#087F80]">
              A question to ask
            </p>
            <p className="text-sm text-[#142033] mt-1">
              {skill.id === 'A1' && 'What else would you like to know before solving this?'}
              {skill.id === 'A2' && 'What information are we still missing?'}
              {skill.id === 'B1' && 'What made you choose that answer?'}
              {skill.id === 'B2' && 'Which clue helped you decide?'}
              {skill.id === 'B3' && 'Could there be another explanation?'}
              {skill.id === 'C1' && 'What do we gain, and what might we lose?'}
              {skill.id === 'C2' && 'Would you change your mind if we found something new?'}
              {skill.id === 'C3' && 'What helped you solve that problem?'}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[10px] font-black uppercase text-[#687589]">
              Master Framework V1.2
            </p>
            <p className="text-sm mt-1">{skill.frameworkMeaning}</p>
          </div>

          <div className="rounded-xl bg-[#F7F6F1] p-3 space-y-2">
            <div>
              <p className="text-[10px] font-bold text-[#687589]">Skill ID</p>
              <p className="text-sm font-bold">{skill.id}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#687589]">
                Parameter code
              </p>
              <p className="text-sm">
                {observation?.parameterCode ??
                  skill.parameterCode ??
                  'Not mapped in this demonstration'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#687589]">
                Rubric constraint
              </p>
              <p className="text-xs leading-relaxed">
                {skill.rubricConstraint}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#687589]">
                Framework version
              </p>
              <p className="text-sm">
                {observation?.frameworkVersion ?? 'V1.2'}
              </p>
            </div>
          </div>

          <p className="text-[10px] text-[#8792A1]">
            Exact parameter mappings and rubric anchors must be loaded from
            the approved, version-controlled framework source.
          </p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Trend chart                                                                 */
/* -------------------------------------------------------------------------- */

function ObservationTrend({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) {
    return (
      <EmptyState
        title="Not enough time-series data"
        description="The observation timeline remains available. A trend requires at least two valid reporting periods."
      />
    );
  }

  const width = 600;
  const height = 220;
  const padding = 35;
  const maxValue = Math.max(1, ...points.map((point) => point.count));
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const coordinates = points.map((point, index) => ({
    x: padding + (index / Math.max(1, points.length - 1)) * plotWidth,
    y: height - padding - (point.count / maxValue) * plotHeight,
    ...point,
  }));

  const line = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Valid observations recorded over time"
      >
        {[0, 1, 2, 3].map((lineIndex) => {
          const y = padding + (lineIndex / 3) * plotHeight;

          return (
            <line
              key={lineIndex}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#E5E9ED"
              strokeDasharray="4 4"
            />
          );
        })}

        <path
          d={line}
          fill="none"
          stroke="#087F80"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coordinates.map((point) => (
          <g key={point.period}>
            <circle cx={point.x} cy={point.y} r="5" fill="#087F80" />
            <text
              x={point.x}
              y={point.y - 12}
              textAnchor="middle"
              className="fill-[#142033] text-[11px] font-bold"
            >
              {point.count}
            </text>
            <text
              x={point.x}
              y={height - 10}
              textAnchor="middle"
              className="fill-[#687589] text-[10px]"
            >
              {point.period}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-xs text-[#687589] mt-2">
        This chart describes recorded valid observations, not improvement in
        thinking ability.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Thinking milestone card                                                    */
/* -------------------------------------------------------------------------- */

function MilestoneCard({
  observations,
}: {
  observations: Observation[];
}) {
  const [selectedId, setSelectedId] = useState('');

  const eligibleQuotes = observations.filter(
    (observation) =>
      observation.childVerbatim &&
      observation.childVerbatimType === 'typed' &&
      observation.status === 'SUPPORTED',
  );

  const selected =
    eligibleQuotes.find((observation) => observation.id === selectedId) ??
    eligibleQuotes[0];

  const [showPreview, setShowPreview] = useState(false);

  if (!selected) {
    return (
      <EmptyState
        title="No shareable child-authored question yet"
        description="A Thinking Milestone Card can be created when an eligible, verbatim child-authored question or realization is available."
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DCE2E7] p-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#087F80]">
        Family keepsake
      </p>
      <h3 className="text-lg font-extrabold mt-1">Thinking Milestone Card</h3>
      <p className="text-xs text-[#687589] mt-1">
        A genuine moment of curiosity, in the child's own words.
      </p>

      {eligibleQuotes.length > 1 && (
        <select
          value={selected.id}
          onChange={(event) => setSelectedId(event.target.value)}
          className="mt-4 w-full rounded-xl border border-[#DCE2E7] p-3 text-sm bg-white"
        >
          {eligibleQuotes.map((observation) => (
            <option key={observation.id} value={observation.id}>
              {observation.missionName} · {formatDate(observation.date)}
            </option>
          ))}
        </select>
      )}

      <div className="mt-4 rounded-2xl bg-[#F3EFE6] p-6 sm:p-8 text-[#27231F]">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#776B5D]">
          A moment of curiosity
        </p>
        <p className="font-serif italic text-2xl sm:text-3xl leading-snug mt-6">
          “{selected.childVerbatim}”
        </p>
        <div className="h-px bg-[#D4C9B8] my-6" />
        <p className="text-sm font-semibold">{selected.missionName}</p>
        <p className="text-xs text-[#776B5D] mt-1">
          {formatDate(selected.date)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowPreview(!showPreview)}
        className="mt-4 w-full rounded-xl border border-[#087F80] text-[#087F80] px-4 py-3 text-sm font-bold hover:bg-[#F0F8F6]"
      >
        {showPreview ? 'Close sharing information' : 'Review sharing information'}
      </button>

      {showPreview && (
        <div className="mt-3 rounded-xl bg-[#F7F6F1] p-4">
          <p className="text-xs font-bold">Before sharing</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-[#586579]">
            <li>Check that the quotation is appropriate to share.</li>
            <li>The child's full name is not included by default.</li>
            <li>No scores or assessment labels are displayed.</li>
            <li>Explicit parent confirmation and export permission are required.</li>
          </ul>
          <p className="text-[10px] text-[#8792A1] mt-3">
            Export/download functionality must be connected to an approved
            sharing service before production.
          </p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Parent View                                                            */
/* -------------------------------------------------------------------------- */

export default function ParentView({
  data = DEMO_DATA,
}: {
  data?: ParentInsightsData;
}) {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<
    'overview' | 'skills' | 'journey' | 'family'
  >('overview');

  const [selectedSkill, setSelectedSkill] = useState<SkillId>('B2');
  const [selectedObservation, setSelectedObservation] =
    useState<Observation | null>(null);

  const [showRadar, setShowRadar] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [period, setPeriod] = useState('all');

  const observations = data.observations;

  const validObservations = useMemo(
    () => observations.filter(isEligibleObservation),
    [observations],
  );

  const pendingCount = observations.filter(
    (observation) => observation.status === 'PENDING_REVIEW',
  ).length;

  const completedMissions = data.missions.filter(
    (mission) => mission.completed,
  );

  const skillsWithEvidence = SKILLS.filter(
    (skill) => getEvidenceCount(observations, skill.id) > 0,
  ).length;

  const selectedSkillDefinition = getSkill(selectedSkill);

  const selectedSkillObservations = observations.filter(
    (observation) => observation.skillId === selectedSkill,
  );

  const selectedSkillPrimaryObservation = selectedSkillObservations.find(
    isEligibleObservation,
  );

  const radarAvailable =
    !!data.comparableSkillMeasures &&
    SKILLS.every((skill) => {
      const value = data.comparableSkillMeasures?.[skill.id];
      return typeof value === 'number' && value >= 0 && value <= 100;
    });

  const displayedMissions =
    period === 'all'
      ? data.missions
      : data.missions.filter((mission) => {
          const missionDate = new Date(`${mission.date}T00:00:00`);
          const now = new Date();

          const days =
            period === '7d' ? 7 : period === '30d' ? 30 : 90;

          const cutoff = new Date(now);
          cutoff.setDate(now.getDate() - days);

          return missionDate >= cutoff;
        });

  const navigateSection = (
    section: 'overview' | 'skills' | 'journey' | 'family',
  ) => {
    setActiveSection(section);
    document.getElementById(`parent-section-${section}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#142033] font-['DM_Sans',sans-serif] antialiased">
      {/* Header */}
      <header className="h-16 sm:h-20 sticky top-0 z-40 bg-[#F7F6F1]/95 backdrop-blur-md border-b border-[#DCE2E7]">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-transparent border-0 p-0"
              aria-label="Go to CubitX home"
            >
              <img
                src={CUBITX_LOGO_SRC}
                alt="CubitX"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </button>

            <span className="hidden sm:block h-6 w-px bg-[#DCE2E7]" />

            <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-[#087F80]">
              Parent Insights
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{data.child.displayName}</p>
              <p className="text-[10px] text-[#687589]">
                {data.child.classLabel}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-full px-4 py-2 text-xs font-bold text-[#586579] hover:bg-white border border-transparent hover:border-[#DCE2E7]"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Demo warning */}
      {data.isDemo && (
        <div className="bg-[#FFF2D8] border-b border-[#F0D9A9]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 text-xs text-[#795B1E] font-semibold">
            Demonstration mode — all child profiles, events, dates and
            observations shown here are illustrative, not actual child records.
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="bg-white border-b border-[#DCE2E7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-9 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#087F80]">
                A window into curiosity
              </p>
              <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
                {data.child.displayName === 'Demo child'
                  ? 'Your child’s thinking journey'
                  : `${data.child.displayName}’s thinking journey`}
              </h1>
              <p className="text-sm sm:text-base text-[#687589] mt-3 leading-relaxed">
                Explore the questions, discoveries and decisions recorded
                during CubitX activities. This is a record of observable
                thinking behaviours — not an intelligence score or a ranking.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <label htmlFor="period" className="text-xs text-[#687589]">
                Reporting period
              </label>
              <select
                id="period"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="rounded-xl bg-[#F7F6F1] border border-[#DCE2E7] px-3 py-2 text-xs font-bold"
              >
                <option value="all">All available activity</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              ['overview', 'Overview'],
              ['skills', 'Thinking skills'],
              ['journey', 'Activity journey'],
              ['family', 'Family connection'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  navigateSection(
                    id as 'overview' | 'skills' | 'journey' | 'family',
                  )
                }
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeSection === id
                    ? 'bg-[#142033] text-white'
                    : 'bg-[#F1F3F5] text-[#586579] hover:bg-[#E7EBEF]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-9 space-y-12">
        {/* Overview */}
        <section id="parent-section-overview" className="scroll-mt-28">
          <SectionHeading
            eyebrow="01 · Journey at a glance"
            title="A snapshot of the journey"
            description="A simple overview of activities and eligible observations recorded by CubitX."
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                value: completedMissions.length,
                label: 'Missions explored',
                note: 'Completed activities',
              },
              {
                value: validObservations.length,
                label: 'Eligible observations',
                note: 'Not a skill score',
              },
              {
                value: skillsWithEvidence,
                label: 'Skills with evidence',
                note: 'Out of eight skills',
              },
              {
                value: pendingCount,
                label: 'Awaiting review',
                note: 'Not included in approved evidence',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl border border-[#DCE2E7] p-4 sm:p-5"
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-[#142033] tabular-nums">
                  {item.value}
                </p>
                <p className="text-xs font-bold mt-2">{item.label}</p>
                <p className="text-[10px] text-[#8792A1] mt-1">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-white border border-[#DCE2E7] p-5 flex flex-col sm:flex-row gap-3 items-start">
            <span className="text-xl">🌿</span>
            <div>
              <h3 className="text-sm font-bold">The Not-Broken Signal</h3>
              <p className="text-xs text-[#687589] mt-1 leading-relaxed">
                Every learning journey has its own rhythm. There is no need
                to maintain a daily schedule. Children can return to exploring
                whenever they are ready.
              </p>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="parent-section-skills" className="scroll-mt-28">
          <SectionHeading
            eyebrow="02 · Eight thinking skills"
            title="Where have we observed thinking?"
            description="The wheel shows evidence coverage, not ability or mastery. Select a segment to explore its observations."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DCE2E7] p-4 sm:p-6">
              <EvidenceWheel
                observations={observations}
                selectedSkill={selectedSkill}
                onSelect={setSelectedSkill}
              />
            </div>

            <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DCE2E7] p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#087F80]">
                Selected thinking skill
              </p>
              <h3 className="text-xl font-extrabold mt-2">
                {selectedSkillDefinition.id}. {selectedSkillDefinition.name}
              </h3>
              <p className="text-sm text-[#687589] mt-2 leading-relaxed">
                {selectedSkillDefinition.description}
              </p>

              <div className="mt-5 rounded-xl bg-[#F7F6F1] p-4">
                <p className="text-xs font-bold">Eligible observations</p>
                <p className="text-2xl font-extrabold mt-1">
                  {getEvidenceCount(observations, selectedSkill)}
                </p>
                <p className="text-[10px] text-[#687589] mt-1">
                  This count describes available evidence, not skill strength.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold">Evidence status</p>
                {getCoverageStatus(observations, selectedSkill) ===
                'AVAILABLE' ? (
                  <span className="inline-flex rounded-full bg-[#DDF2ED] text-[#087F80] px-3 py-1.5 text-xs font-bold">
                    Evidence available
                  </span>
                ) : getCoverageStatus(observations, selectedSkill) ===
                  'LIMITED' ? (
                  <span className="inline-flex rounded-full bg-[#EAF3F0] text-[#477E70] px-3 py-1.5 text-xs font-bold">
                    Limited evidence
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-[#F0F1F3] text-[#586579] px-3 py-1.5 text-xs font-bold">
                    Insufficient evidence
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="mt-5 w-full rounded-xl bg-[#142033] text-white px-4 py-3 text-xs font-bold"
              >
                {showDetails ? 'Hide skill details' : 'Explore skill details'}
              </button>
            </div>
          </div>

          <div className="mt-5 bg-white rounded-3xl border border-[#DCE2E7] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold">Analytical skill profile</h3>
                <p className="text-xs text-[#687589] mt-1">
                  An additional view, available only with comparable approved measures.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRadar(!showRadar)}
                className="rounded-full border border-[#DCE2E7] px-4 py-2 text-xs font-bold"
              >
                {showRadar ? 'Hide radar view' : 'View radar chart'}
              </button>
            </div>

            {showRadar && (
              <div className="mt-5">
                {radarAvailable ? (
                  <SkillRadar measures={data.comparableSkillMeasures} />
                ) : (
                  <EmptyState
                    title="Not enough comparable assessment data"
                    description="A radar chart cannot be calculated from observation counts. CubitX will show this view only after approved skill measures and comparable evidence are available."
                  />
                )}
              </div>
            )}
          </div>

          {showDetails && (
            <div className="mt-5 space-y-4">
              <FrameworkPanel
                skill={selectedSkillDefinition}
                observation={selectedSkillPrimaryObservation}
              />

              <div className="bg-white rounded-2xl border border-[#DCE2E7] p-5">
                <h3 className="font-bold text-sm mb-3">
                  Evidence for {selectedSkill}
                </h3>

                {selectedSkillObservations.length === 0 ? (
                  <EmptyState
                    title="No eligible observations yet"
                    description="There has not yet been enough eligible evidence to describe this skill."
                  />
                ) : (
                  <div className="space-y-3">
                    {selectedSkillObservations.map((observation) => (
                      <div
                        key={observation.id}
                        className="border border-[#E4E8EC] rounded-xl p-4"
                      >
                        <div className="flex flex-wrap justify-between gap-2">
                          <p className="text-sm font-bold">
                            {observation.title}
                          </p>
                          <StatusBadge status={observation.status} />
                        </div>
                        <p className="text-xs text-[#687589] mt-2">
                          {observation.summary}
                        </p>
                        <p className="text-[10px] text-[#8792A1] mt-2">
                          {observation.missionName} · {formatDate(observation.date)}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedObservation(observation)}
                          className="text-xs font-bold text-[#087F80] mt-3"
                        >
                          Show me the moment →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Observable Action Trail */}
        <section id="parent-section-journey" className="scroll-mt-28">
          <SectionHeading
            eyebrow="03 · Observable action trail"
            title="Thinking in action"
            description="Explore actual recorded moments from activities. Each replay uses the event sequence associated with that observation."
          />

          {observations.length === 0 ? (
            <EmptyState
              title="No recorded moments yet"
              description="When eligible mission events become available, they will appear here."
            />
          ) : (
            <div className="space-y-4">
              {observations.map((observation) => {
                const skill = getSkill(observation.skillId);

                return (
                  <div
                    key={observation.id}
                    className="bg-white rounded-2xl border border-[#DCE2E7] p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#087F80]">
                          {observation.missionName} · {skill.id}
                        </p>
                        <h3 className="text-base font-extrabold mt-1">
                          {observation.title}
                        </h3>
                        <p className="text-xs text-[#687589] mt-2 leading-relaxed">
                          {observation.summary}
                        </p>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <StatusBadge status={observation.status} />
                        <p className="text-[10px] text-[#8792A1] mt-2">
                          {formatDate(observation.date)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 bg-[#F7F6F1] rounded-xl p-3">
                      <p className="text-[10px] font-bold text-[#687589]">
                        Recorded evidence
                      </p>
                      <p className="text-xs text-[#142033] mt-1 leading-relaxed">
                        {observation.evidenceText}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-between gap-3 items-center">
                      <span className="text-[10px] text-[#8792A1]">
                        Source: {observation.source.replaceAll('_', ' ')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedObservation(observation)}
                        className="rounded-xl bg-[#142033] text-white px-4 py-2.5 text-xs font-bold"
                      >
                        Show me the moment
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Progress */}
        <section className="scroll-mt-28">
          <SectionHeading
            eyebrow="04 · Progress over time"
            title="The journey, across time"
            description="The timeline shows what happened. The trend describes the amount of eligible evidence recorded — not cognitive improvement."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-[#DCE2E7] p-5">
              <h3 className="font-extrabold text-sm">Observation trend</h3>
              <p className="text-xs text-[#687589] mt-1 mb-4">
                Valid observations by reporting period.
              </p>
              <ObservationTrend points={data.trends} />
            </div>

            <div className="bg-white rounded-2xl border border-[#DCE2E7] p-5">
              <h3 className="font-extrabold text-sm">Activity timeline</h3>
              <p className="text-xs text-[#687589] mt-1 mb-4">
                Recorded missions and observations.
              </p>

              {displayedMissions.length === 0 ? (
                <EmptyState
                  title="No activity in this period"
                  description="There is no recorded CubitX activity in the selected reporting period. This does not tell us what the child has been learning elsewhere."
                />
              ) : (
                <div className="space-y-4">
                  {displayedMissions.map((mission) => (
                    <div
                      key={mission.id}
                      className="flex gap-3 items-start"
                    >
                      <div className="w-3 h-3 rounded-full bg-[#087F80] mt-1 shrink-0" />
                      <div>
                        <p className="text-sm font-bold">{mission.name}</p>
                        <p className="text-xs text-[#687589] mt-1">
                          {mission.description}
                        </p>
                        <p className="text-[10px] text-[#8792A1] mt-1">
                          {formatDate(mission.date)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mission.skillIds.map((skillId) => (
                            <span
                              key={skillId}
                              className="rounded-full bg-[#EAF3F0] text-[#477E70] px-2 py-1 text-[9px] font-bold"
                            >
                              {skillId}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Evidence rigor */}
        <section className="scroll-mt-28">
          <SectionHeading
            eyebrow="05 · Invisible rigor"
            title="What the evidence tells us"
            description="Every interpretation should be traceable to an actual observation and an approved framework definition."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SKILLS.map((skill) => {
              const observation = observations.find(
                (item) => item.skillId === skill.id && isEligibleObservation(item),
              );

              return (
                <FrameworkPanel
                  key={skill.id}
                  skill={skill}
                  observation={observation}
                />
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl bg-white border border-[#DCE2E7] p-5">
            <h3 className="font-bold text-sm">What we know — and what we don't</h3>

            {validObservations.length > 0 ? (
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-bold text-[#087F80]">
                    What we observed
                  </p>
                  <p className="text-sm mt-1">
                    CubitX has recorded {validObservations.length} eligible
                    observation(s) across the available activities.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#687589]">
                    What we do not yet know
                  </p>
                  <p className="text-sm mt-1 text-[#687589]">
                    The available records do not automatically establish
                    whether these behaviours appear consistently across
                    different situations or outside CubitX activities.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#687589] mt-2">
                There is not yet enough eligible evidence to draw a conclusion.
              </p>
            )}
          </div>
        </section>

        {/* Mission map */}
        <section className="scroll-mt-28">
          <SectionHeading
            eyebrow="06 · Mission journey"
            title="Places explored along the way"
            description="Mission completion and evidence generation are shown separately."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.missions.map((mission, index) => (
              <div
                key={mission.id}
                className="bg-white rounded-2xl border border-[#DCE2E7] p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF3F0] flex items-center justify-center text-[#087F80] font-black">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="font-extrabold mt-4">{mission.name}</h3>
                <p className="text-xs text-[#687589] mt-2 leading-relaxed">
                  {mission.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  {mission.skillIds.map((skillId) => (
                    <span
                      key={skillId}
                      className="text-[9px] font-bold bg-[#F1F3F5] text-[#586579] rounded-full px-2 py-1"
                    >
                      {skillId}
                    </span>
                  ))}
                </div>
                <div className="border-t border-[#E4E8EC] mt-4 pt-3">
                  <p className="text-[10px] text-[#687589]">
                    {mission.completed ? 'Mission completed' : 'Not completed'}
                  </p>
                  <p className="text-[10px] text-[#687589] mt-1">
                    {mission.observationIds.length} linked observation record(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Before / after */}
        <section className="scroll-mt-28">
          <SectionHeading
            eyebrow="07 · Comparable moments"
            title="How approaches can differ"
            description="A comparison should only be shown when the tasks and evidence are genuinely comparable."
          />

          <EmptyState
            title="No approved comparison available"
            description="Cubix will display a before-and-after evidence comparison only when valid, comparable observations are available for the same skill. No improvement percentage will be invented."
          />
        </section>

        {/* Next opportunities */}
        <section className="scroll-mt-28">
          <SectionHeading
            eyebrow="08 · What to explore next"
            title="New opportunities for curiosity"
            description="Suggested activities create opportunities to explore thinking behaviours. They are not corrective exercises or diagnoses."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#DCE2E7] p-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#087F80]">
                Suggested opportunity
              </span>
              <h3 className="text-base font-extrabold mt-2">
                The Mystery of the Missing Clue
              </h3>
              <p className="text-xs text-[#687589] mt-2 leading-relaxed">
                Explore a challenge in which the child must decide what
                information is still needed before choosing an explanation.
              </p>
              <p className="text-[10px] text-[#687589] mt-3">
                Opportunity: A2 · Spotting missing information
              </p>
              <p className="text-[10px] text-[#8792A1] mt-2">
                Demonstration suggestion. Connect to an approved mission
                catalogue before production.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#DCE2E7] p-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#5267E8]">
                Suggested opportunity
              </span>
              <h3 className="text-base font-extrabold mt-2">
                Two Explanations, One Clue
              </h3>
              <p className="text-xs text-[#687589] mt-2 leading-relaxed">
                Explore how one additional observation can help distinguish
                between two possible explanations.
              </p>
              <p className="text-[10px] text-[#687589] mt-3">
                Opportunity: B2 · Using evidence
              </p>
              <p className="text-[10px] text-[#8792A1] mt-2">
                Demonstration suggestion. Connect to an approved mission
                catalogue before production.
              </p>
            </div>
          </div>
        </section>

        {/* Family connection */}
        <section id="parent-section-family" className="scroll-mt-28">
          <SectionHeading
            eyebrow="09 · Family connection"
            title="Keep curiosity alive at home"
            description="Conversation prompts, not another test. There is no need to score or submit the child's answers."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                skill: 'A1 · Asking good questions',
                question: 'What else would you like to know before solving this?',
                description: 'Encourages useful questions.',
              },
              {
                skill: 'A2 · Missing information',
                question: 'What information are we still missing?',
                description: 'Encourages attention to unknowns.',
              },
              {
                skill: 'B2 · Using evidence',
                question: 'Which clue helped you decide?',
                description: 'Connects conclusions to evidence.',
              },
              {
                skill: 'C2 · Updating on evidence',
                question: 'Would you change your mind if we found something new?',
                description: 'Encourages proportionate reconsideration.',
              },
            ].map((prompt) => (
              <div
                key={prompt.skill}
                className="bg-white rounded-2xl border border-[#DCE2E7] p-5"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-[#087F80]">
                  {prompt.skill}
                </p>
                <h3 className="text-base font-bold mt-3 leading-relaxed">
                  “{prompt.question}”
                </h3>
                <p className="text-xs text-[#687589] mt-2">
                  {prompt.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <MilestoneCard observations={observations} />
          </div>
        </section>

        {/* Methodology */}
        <section className="scroll-mt-28">
          <div className="bg-[#142033] text-white rounded-3xl p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8FD2C4]">
              10 · Understanding this report
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-2">
              Evidence before interpretation.
            </h2>
            <p className="text-sm text-[#D0D8E1] mt-3 leading-relaxed max-w-3xl">
              CubitX reports observable behaviours within its activities.
              These observations are not intelligence scores, diagnoses or
              permanent labels. A single activity cannot establish a stable
              pattern.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {[
                {
                  title: 'Missing evidence is not zero',
                  body: 'A skill without sufficient observations is shown as insufficient evidence, not poor performance.',
                },
                {
                  title: 'Participation is not improvement',
                  body: 'More completed activities or recorded events do not automatically establish cognitive development.',
                },
                {
                  title: 'Contradictory evidence matters',
                  body: 'Conflicting observations must remain visible rather than being silently discarded.',
                },
                {
                  title: 'Source transparency',
                  body: 'Platform observations, parent-shared information and system interpretations are kept distinct.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl bg-white/5 border border-white/10 p-4"
                >
                  <h3 className="text-sm font-bold">{item.title}</h3>
                  <p className="text-xs text-[#C4CED9] mt-2 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap justify-between gap-3 text-[10px] text-[#AAB7C5]">
              <span>Assessment authority: Master Framework V1.2</span>
              <span>Framework version: V1.2</span>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#DCE2E7] pt-5 pb-8 flex flex-col sm:flex-row justify-between gap-2 text-[10px] text-[#8792A1]">
          <span>CubitX · Parent Insights</span>
          <span>
            {data.isDemo
              ? 'Demonstration data — not a real child report'
              : `Last updated: ${data.lastUpdated}`}
          </span>
        </footer>
      </main>

      {selectedObservation && (
        <ReplayModal
          observation={selectedObservation}
          onClose={() => setSelectedObservation(null)}
        />
      )}
    </div>
  );
}
