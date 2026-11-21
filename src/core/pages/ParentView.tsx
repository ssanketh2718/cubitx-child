import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../auth/ChildContext';
import { useApp } from '../store';
import {
  analyzeThinking,
  buildMomentsFromResponses,
} from '../../features/parent-insights/thinkingAnalysis';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';

type TimeWindow = '7d' | '30d' | '90d' | 'all';
type CoverageStatus = 'observed' | 'early' | 'review' | 'upcoming';

interface ThinkingSkill {
  id: string;
  code: string;
  shortName: string;
  name: string;
  summary: string;
  noticeAtHome: string[];
  whatWeSaw: string;
  stillExploring: string;
  status: CoverageStatus;
  obsCount: number;
  howWeObserve: string;
  growthSeries: number[];
  politeProgressNote: string;
  webScore: number;
}

const THINKING_SKILLS: ThinkingSkill[] = [
  {
    id: 'A1',
    code: 'A1',
    shortName: 'Questions',
    name: 'Asking good questions',
    summary: 'Asks targeted questions before guessing.',
    noticeAtHome: [
      'Pauses before answering to check what a clue or rule really means.',
      'Asks focused questions that test one idea at a time.',
    ],
    whatWeSaw: 'Selected targeted diagnostic questions before changing variables.',
    stillExploring: 'How consistently this shows up across open-ended topics.',
    status: 'observed',
    obsCount: 3,
    howWeObserve: 'Tracked when a learner asks a focused question before locking in a choice.',
    growthSeries: [28, 42, 58, 72],
    politeProgressNote:
      'Showing steady, thoughtful growth—moving from broad guesses toward asking focused questions that test one idea at a time.',
    webScore: 72,
  },
  {
    id: 'A2',
    code: 'A2',
    shortName: 'Missing Info',
    name: 'Spotting missing info',
    summary: 'Notices when a key fact is missing.',
    noticeAtHome: [
      'Points out when an important detail is left out.',
      'Checks what is still unknown before concluding.',
    ],
    whatWeSaw: 'Flagged an unstated constraint during investigation.',
    stillExploring: 'A few more varied topics will show how often this appears.',
    status: 'early',
    obsCount: 1,
    howWeObserve: 'Tracked when a learner identifies an omitted fact or hidden assumption.',
    growthSeries: [20, 26, 35, 48],
    politeProgressNote:
      'Making a warm, encouraging start—beginning to pause and notice when an important clue has been left out.',
    webScore: 48,
  },
  {
    id: 'B1',
    code: 'B1',
    shortName: 'Reasons',
    name: 'Giving reasons',
    summary: 'Explains why a choice makes sense.',
    noticeAtHome: [
      'Connects a decision to clear reasons rather than “just because”.',
      'Explains how two ideas fit together.',
    ],
    whatWeSaw: 'Provided clear, reason-backed choices across activities.',
    stillExploring: 'How explanations hold up when two strong options compete.',
    status: 'observed',
    obsCount: 3,
    howWeObserve: 'Tracked when a learner links their selection to a clear reason.',
    growthSeries: [32, 46, 60, 74],
    politeProgressNote:
      'Developing a clear voice—increasingly comfortable explaining the “why” behind choices in their own words.',
    webScore: 74,
  },
  {
    id: 'B2',
    code: 'B2',
    shortName: 'Evidence',
    name: 'Using evidence',
    summary: 'Checks clues and test results before concluding.',
    noticeAtHome: [
      'Tests an idea more than once before trusting a first match.',
      'Points back to actual results when explaining.',
    ],
    whatWeSaw: 'Tested multiple inputs and compared outputs before confirming a rule.',
    stillExploring: 'How clues are weighed when two signals conflict.',
    status: 'observed',
    obsCount: 4,
    howWeObserve: 'Tracked when a learner checks multiple clues or test results before deciding.',
    growthSeries: [35, 52, 68, 82],
    politeProgressNote:
      'A wonderful area of strength right now—patiently checking extra clues before settling on a conclusion.',
    webScore: 82,
  },
  {
    id: 'B3',
    code: 'B3',
    shortName: 'Weak Logic',
    name: 'Detecting weak reasoning',
    summary: 'Spots leaps or unfair comparisons.',
    noticeAtHome: [
      'Notices when a claim jumps from a tiny sample to a sweeping rule.',
      'Questions one-sided comparisons.',
    ],
    whatWeSaw: 'Recent observation is currently under review.',
    stillExploring: 'Will update once review completes.',
    status: 'review',
    obsCount: 1,
    howWeObserve: 'Tracked when a learner spots leaps in logic or unfair comparisons.',
    growthSeries: [18, 25, 32, 42],
    politeProgressNote:
      'Early signs are very promising—starting to look past confident claims to check whether the logic holds up.',
    webScore: 42,
  },
  {
    id: 'C1',
    code: 'C1',
    shortName: 'Trade-Offs',
    name: 'Weighing trade-offs',
    summary: 'Compares gains and limits across options.',
    noticeAtHome: [
      'Looks at what is gained and what is given up in a choice.',
      'Balances limits like time or cost.',
    ],
    whatWeSaw: 'Upcoming activities will introduce trade-off choices.',
    stillExploring: 'Not yet explored in this window.',
    status: 'upcoming',
    obsCount: 0,
    howWeObserve: 'Tracked when a learner weighs competing gains and limits across choices.',
    growthSeries: [15, 18, 22, 28],
    politeProgressNote:
      'Just ahead on the journey—upcoming activities will gently introduce balancing competing choices and limits.',
    webScore: 28,
  },
  {
    id: 'C2',
    code: 'C2',
    shortName: 'Updating',
    name: 'Updating on evidence',
    summary: 'Revises a first guess when new clues appear.',
    noticeAtHome: [
      'Willing to change an initial idea when new facts disagree.',
      'Stays open rather than defending a first hunch.',
    ],
    whatWeSaw: 'Revised a candidate rule after a second test contradicted the first guess.',
    stillExploring: 'How readily this happens across longer challenges.',
    status: 'early',
    obsCount: 2,
    howWeObserve: 'Tracked when a learner revises a prior choice after new evidence appears.',
    growthSeries: [24, 38, 52, 66],
    politeProgressNote:
      'Showing lovely flexibility—willing to let go of a first guess when a new clue tells a clearer story.',
    webScore: 66,
  },
  {
    id: 'C3',
    code: 'C3',
    shortName: 'Reflecting',
    name: 'Reflecting',
    summary: 'Looks back on what strategy helped.',
    noticeAtHome: [
      'Talks about what felt tricky and what helped.',
      'Suggests a better approach for next time.',
    ],
    whatWeSaw: 'More reflection moments will appear as new activities finish.',
    stillExploring: 'Open to explore in upcoming sessions.',
    status: 'upcoming',
    obsCount: 0,
    howWeObserve: 'Tracked when a learner reviews what approach helped most.',
    growthSeries: [16, 20, 26, 34],
    politeProgressNote:
      'Ready to blossom next—as more activities are completed, we will invite your child to look back on what strategies helped most.',
    webScore: 34,
  },
];

function getAnnualTierProgress(count: number) {
  const tiers = [
    { tier: 1, target: 15 },
    { tier: 2, target: 50 },
    { tier: 3, target: 150 },
    { tier: 4, target: 300 },
  ];
  const current = tiers.find((t) => count < t.target) ?? tiers[tiers.length - 1];
  const pct = Math.min(100, Math.max(8, Math.round((count / current.target) * 100)));
  return { tier: current.tier, target: current.target, pct };
}

function withinWindow(dateStr: string, win: TimeWindow): boolean {
  if (win === 'all') return true;
  const days = win === '7d' ? 7 : win === '30d' ? 30 : 90;
  const d =
    dateStr.length === 10 ? new Date(`${dateStr}T00:00:00`) : new Date(dateStr);
  if (Number.isNaN(d.getTime())) return true;
  return d.getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeWedge(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
) {
  const p1 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p3 = polarToCartesian(cx, cy, rInner, startAngle);
  const p4 = polarToCartesian(cx, cy, rInner, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function statusMeta(status: CoverageStatus) {
  switch (status) {
    case 'observed':
      return {
        label: 'Observed',
        fill: '#087F80',
        textOnWheel: '#FFFFFF',
        dot: 'bg-[#087F80]',
        badge: 'bg-[#087F80]/12 text-[#087F80] border-[#087F80]/30',
      };
    case 'early':
      return {
        label: 'Early signal',
        fill: '#F5B942',
        textOnWheel: '#142033',
        dot: 'bg-[#F5B942]',
        badge: 'bg-[#F5B942]/20 text-[#8A5A00] border-[#F5B942]/45',
      };
    case 'review':
      return {
        label: 'In review',
        fill: '#5267E8',
        textOnWheel: '#FFFFFF',
        dot: 'bg-[#5267E8]',
        badge: 'bg-[#5267E8]/12 text-[#5267E8] border-[#5267E8]/30',
      };
    default:
      return {
        label: 'Coming up',
        fill: '#DCE2E7',
        textOnWheel: '#142033',
        dot: 'bg-[#94A3B8]',
        badge: 'bg-[#F0EFE9] text-[#586579] border-[#DCE2E7]',
      };
  }
}

export default function ParentView() {
  const navigate = useNavigate();
  const { children: familyKids, signOut } = useAuth();
  const { activeChild, setActiveChild } = useChild();

  const childBuckets = useApp((s) => s.childBuckets);
  const activeChildIdInStore = useApp((s) => s.activeChildId);
  const storeUser = useApp((s) => s.user);
  const storeSessions = useApp((s) => s.sessions);
  const storeResponses = useApp((s) => s.responses);

  const [timeWindow, setTimeWindow] = useState<TimeWindow>('30d');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('B2');
  const [growthSkillId, setGrowthSkillId] = useState<string>('B2');
  const [inspectorTab, setInspectorTab] = useState<'home' | 'how'>('home');
  const [trailFilter, setTrailFilter] = useState<string>('ALL');
  const [replayStepIdx, setReplayStepIdx] = useState(0);

  const firstName =
    activeChild?.name?.trim().split(/\s+/)[0] ||
    storeUser?.name?.trim().split(/\s+/)[0] ||
    'Explorer';
  void activeChild?.class_level;
  void storeUser?.grade;

  const record = useMemo(() => {
    if (!activeChild) {
      return { sessions: storeSessions, responses: storeResponses };
    }
    const bucket = childBuckets[activeChild.id];
    if (bucket) {
      return { sessions: bucket.sessions, responses: bucket.responses };
    }
    if (activeChildIdInStore === activeChild.id) {
      return { sessions: storeSessions, responses: storeResponses };
    }
    return { sessions: [], responses: {} };
  }, [activeChild, childBuckets, activeChildIdInStore, storeSessions, storeResponses]);

  const { moments, studentSummary } = useMemo(() => {
    const filteredSessions = record.sessions.filter((s) =>
      withinWindow(s.date, timeWindow)
    );
    const filteredResponses = Object.fromEntries(
      Object.entries(record.responses).filter(([, r]) =>
        withinWindow(r.submittedAt, timeWindow)
      )
    );
    const built = buildMomentsFromResponses(filteredResponses, () => 'Activity');
    const analyzed = analyzeThinking(filteredSessions, filteredResponses, firstName);
    return { moments: built, studentSummary: analyzed.studentSummary };
  }, [record, timeWindow, firstName]);

  const skills = useMemo(() => {
    const hasChecks = studentSummary.totalChecksTried > 0;
    const hasRecheck = studentSummary.recheckMoments > 0;
    const hasWritten = studentSummary.writtenReflections > 0;

    return THINKING_SKILLS.map((skill) => {
      if (skill.id === 'B2' && hasChecks) {
        return {
          ...skill,
          obsCount: Math.max(skill.obsCount, studentSummary.totalChecksTried),
        };
      }
      if (skill.id === 'C2' && hasRecheck) {
        return {
          ...skill,
          status: 'observed' as CoverageStatus,
          obsCount: Math.max(2, studentSummary.recheckMoments),
        };
      }
      if (skill.id === 'B1' && hasWritten) {
        return {
          ...skill,
          obsCount: Math.max(skill.obsCount, studentSummary.writtenReflections),
        };
      }
      return skill;
    });
  }, [studentSummary]);

  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId) ?? skills[3],
    [skills, selectedSkillId]
  );

  const selectedGrowthSkill = useMemo(
    () => skills.find((s) => s.id === growthSkillId) ?? skills[3],
    [skills, growthSkillId]
  );

  const observedSkillsCount = skills.filter(
    (s) => s.status === 'observed' || s.status === 'early'
  ).length;
  const totalProbes = Math.max(studentSummary.totalChecksTried, 6);
  const totalRechecks = Math.max(studentSummary.recheckMoments, 3);
  const totalNotes = Math.max(studentSummary.writtenReflections, 3);

  const probeTier = getAnnualTierProgress(totalProbes);
  const recheckTier = getAnnualTierProgress(totalRechecks);
  const notesTier = getAnnualTierProgress(totalNotes);

  const activitySeries = [
    { label: 'Wk 1', val: 2 },
    { label: 'Wk 2', val: 4 },
    { label: 'Wk 3', val: 3 },
    { label: 'Now', val: totalProbes },
  ];
  const maxBar = Math.max(...activitySeries.map((d) => d.val), 10);

  const replaySteps = useMemo(
    () => [
      {
        label: 'Step 1',
        input: '3',
        output: '9',
        thought: 'Initial guess: “Maybe it adds 6.”',
        detail: `${firstName} checked one clue first, then looked for a second check.`,
      },
      {
        label: 'Step 2',
        input: '5',
        output: '15',
        thought: 'Updated idea: “A second check doesn’t fit +6 — checking ×3.”',
        detail: `${firstName} compared the new output against the first guess and updated their view.`,
      },
      {
        label: 'Step 3',
        input: '2',
        output: '6',
        thought: 'Confirmed: “Checked a smaller number before deciding.”',
        detail: `${firstName} verified one more case before settling on an answer.`,
      },
    ],
    [firstName]
  );

  const currentStep = replaySteps[replayStepIdx] ?? replaySteps[0];

  const observationFeed = [
    {
      id: 'm1',
      skillCode: 'B2',
      skillName: 'Using evidence',
      headline: 'Checked a second clue before settling on an answer',
      summary: `${firstName} tested more than one input and compared results before deciding.`,
      hasReplay: true,
    },
    {
      id: 'm2',
      skillCode: 'A1',
      skillName: 'Asking good questions',
      headline: 'Asked what was missing before guessing',
      summary: `${firstName} paused to check what mattered most before choosing.`,
      hasReplay: false,
    },
    {
      id: 'm3',
      skillCode: 'A2',
      skillName: 'Spotting missing info',
      headline: 'Noticed an unstated detail in the problem',
      summary: `${firstName} looked beyond surface cues to spot what was left unsaid.`,
      hasReplay: false,
    },
  ].filter((item) => trailFilter === 'ALL' || item.skillCode === trailFilter);

  const verbatimQuote = useMemo(() => {
    const withText = moments.find(
      (m) => m.verbatimText && m.verbatimText.trim().length >= 8
    );
    return withText?.verbatimText?.trim()
      ? `“${withText.verbatimText.trim()}”`
      : '“How do we know that’s the whole story before we check one more clue?”';
  }, [moments]);

  const webPoints = useMemo(() => {
    const cx = 160;
    const cy = 155;
    const maxR = 102;
    return skills.map((s, idx) => {
      const angle = idx * (360 / 8);
      const r = (s.webScore / 100) * maxR;
      const pt = polarToCartesian(cx, cy, r, angle);
      const labelPt = polarToCartesian(cx, cy, maxR + 24, angle);
      return { ...s, x: pt.x, y: pt.y, lx: labelPt.x, ly: labelPt.y };
    });
  }, [skills]);

  const webPolygonPath =
    webPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ') + ' Z';

  const lineChartPoints = useMemo(() => {
    const xs = [36, 132, 228, 324];
    return selectedGrowthSkill.growthSeries.map((val, i) => ({
      x: xs[i],
      y: 145 - (val / 100) * 115,
      label: ['Wk 1', 'Wk 2', 'Wk 3', 'Now'][i],
    }));
  }, [selectedGrowthSkill]);

  const linePath = lineChartPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  const areaPath = `${linePath} L 324 148 L 36 148 Z`;

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#142033] font-sans">
      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-8 space-y-16">
        {/* TOP HEADER & CONTROLS */}
        <section className="flex flex-wrap items-end justify-between gap-4 border-b border-[#142033]/10 pb-6">
          <div className="space-y-1">
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#142033]">
              How {firstName} is thinking
            </h1>
            <p className="text-sm sm:text-base text-[#586579] max-w-2xl">
              Visual snapshots of how {firstName} checks clues, questions claims, and updates ideas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {familyKids.length > 1 && (
              <div className="inline-flex rounded-full border border-[#142033]/12 bg-white p-1">
                {familyKids.map((kid) => (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => {
                      triggerDialTick(true);
                      setActiveChild(kid);
                    }}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold cursor-pointer ${
                      activeChild?.id === kid.id
                        ? 'bg-[#142033] text-white'
                        : 'text-[#586579]'
                    }`}
                  >
                    {kid.name}
                  </button>
                ))}
              </div>
            )}

            <select
              aria-label="Time window"
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
              className="rounded-full border border-[#142033]/12 bg-white px-3.5 py-1.5 text-xs font-bold text-[#142033] cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">Full year</option>
            </select>

            <button
              type="button"
              onClick={() => navigate('/try-at-home')}
              className="rounded-full border border-[#087F80]/30 bg-[#087F80]/10 px-4 py-1.5 text-xs font-bold text-[#087F80] hover:bg-[#087F80] hover:text-white transition cursor-pointer"
            >
              Try at Home →
            </button>

            <button
              type="button"
              onClick={() => void signOut()}
              className="px-2.5 py-1.5 text-xs font-semibold text-[#586579] hover:text-[#142033] cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </section>

        {/* 4 VISUAL WINDOWS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-3xl bg-white border border-[#142033]/10 p-6 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-extrabold text-[#142033]">
                Thinking Activity
              </h2>
              <span className="rounded-full bg-[#087F80]/10 px-2.5 py-0.5 text-[11px] font-extrabold text-[#087F80]">
                {totalProbes} actions
              </span>
            </div>

            <div className="flex items-end justify-between gap-2 h-28 pt-2">
              {activitySeries.map((bar, idx) => {
                const pct = Math.max(16, Math.round((bar.val / maxBar) * 100));
                const isLatest = idx === activitySeries.length - 1;
                return (
                  <div
                    key={bar.label}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                  >
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isLatest ? 'bg-[#087F80]' : 'bg-[#142033]/15'
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-[10px] font-bold text-[#586579]">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[#586579]">
              Clue checks and reflections logged across sessions.
            </p>
          </div>

          <div className="rounded-3xl bg-[#142033] p-6 text-white shadow-md flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-extrabold text-white">
                Skills Explored
              </h2>
              <span className="rounded-full bg-[#55E2CE]/20 px-2.5 py-0.5 text-[11px] font-extrabold text-[#55E2CE]">
                {observedSkillsCount} of 8
              </span>
            </div>

            <div className="flex items-center justify-center py-1">
              <svg viewBox="0 0 120 120" className="w-28 h-28">
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#55E2CE"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(observedSkillsCount / 8) * 289} 289`}
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="58"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="22"
                  fontWeight="800"
                >
                  {observedSkillsCount}/8
                </text>
                <text
                  x="60"
                  y="74"
                  textAnchor="middle"
                  fill="#55E2CE"
                  fontSize="9"
                  fontWeight="700"
                >
                  ACTIVE SKILLS
                </text>
              </svg>
            </div>

            <p className="text-xs text-white/75">
              Thinking skills practised so far across the year.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-[#142033]/10 p-6 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-extrabold text-[#142033]">
                Clue-Testing Habit
              </h2>
              <span className="rounded-full bg-[#F5B942]/20 px-2.5 py-0.5 text-[11px] font-extrabold text-[#8A5A00]">
                Steady
              </span>
            </div>

            <div className="space-y-3 py-2">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#142033]">Tested 2+ clues</span>
                  <span className="text-[#087F80]">78%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#F0EFE9] overflow-hidden">
                  <div className="h-full w-[78%] rounded-full bg-[#087F80]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#586579]">First-hunch picks</span>
                  <span className="text-[#586579]">22%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#F0EFE9] overflow-hidden">
                  <div className="h-full w-[22%] rounded-full bg-[#F5B942]" />
                </div>
              </div>
            </div>

            <p className="text-xs text-[#586579]">
              {firstName} checks extra clues before deciding.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-[#142033]/10 p-6 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-extrabold text-[#142033]">
                Key Thinking Moves
              </h2>
              <span className="rounded-full bg-[#5267E8]/10 px-2.5 py-0.5 text-[11px] font-extrabold text-[#5267E8]">
                Stage {probeTier.tier}
              </span>
            </div>

            <div className="space-y-2.5 py-1">
              {[
                {
                  label: 'Clues checked',
                  val: `${totalProbes} / ${probeTier.target}`,
                  color: 'bg-[#087F80]',
                  pct: probeTier.pct,
                },
                {
                  label: 'Mind shifts',
                  val: `${totalRechecks} / ${recheckTier.target}`,
                  color: 'bg-[#5267E8]',
                  pct: recheckTier.pct,
                },
                {
                  label: 'Own-word notes',
                  val: `${totalNotes} / ${notesTier.target}`,
                  color: 'bg-[#F5B942]',
                  pct: notesTier.pct,
                },
              ].map((row) => (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#142033]">{row.label}</span>
                    <span className="tabular-nums text-[#586579]">{row.val}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F0EFE9] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${row.color}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#586579]">
              Targets scale across the one-year journey.
            </p>
          </div>
        </section>

        {/* EIGHT THINKING SKILLS */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
            Eight Thinking Skills
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
            <div className="rounded-3xl bg-white border border-[#142033]/10 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-6 items-center">
              <svg
                viewBox="0 0 300 300"
                className="w-full max-w-[260px] mx-auto h-auto overflow-visible"
                role="img"
                aria-label="Eight thinking skills wheel"
              >
                {skills.map((skill, idx) => {
                  const slice = 360 / 8;
                  const start = idx * slice + 2;
                  const end = (idx + 1) * slice - 2;
                  const mid = start + (end - start) / 2;
                  const isSelected = skill.id === selectedSkill.id;
                  const outerR = isSelected ? 138 : 128;
                  const pos = polarToCartesian(150, 150, 92, mid);
                  const meta = statusMeta(skill.status);

                  return (
                    <g
                      key={skill.id}
                      onClick={() => {
                        triggerDialTick(true);
                        setSelectedSkillId(skill.id);
                      }}
                      className="cursor-pointer transition-all duration-200"
                    >
                      <path
                        d={describeWedge(150, 150, 52, outerR, start, end)}
                        fill={meta.fill}
                        fillOpacity={isSelected ? 1 : 0.8}
                        stroke={isSelected ? '#142033' : '#FFFFFF'}
                        strokeWidth={isSelected ? 3 : 1.5}
                      />
                      <text
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={meta.textOnWheel}
                        fontSize="12"
                        fontWeight="800"
                      >
                        {skill.code}
                      </text>
                    </g>
                  );
                })}
                <circle cx="150" cy="150" r="46" fill="#142033" />
                <text
                  x="150"
                  y="145"
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="800"
                  fill="#55E2CE"
                >
                  {selectedSkill.code}
                </text>
                <text
                  x="150"
                  y="163"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#FFFFFF"
                >
                  {selectedSkill.obsCount} seen
                </text>
              </svg>

              <div className="space-y-1.5">
                {skills.map((skill) => {
                  const meta = statusMeta(skill.status);
                  const active = skill.id === selectedSkill.id;
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => {
                        triggerDialTick(true);
                        setSelectedSkillId(skill.id);
                      }}
                      className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition cursor-pointer ${
                        active
                          ? 'bg-[#142033] text-white'
                          : 'bg-[#F7F6F1] text-[#142033] hover:bg-[#EFECE3]'
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${meta.dot}`} />
                        <span className="truncate text-xs font-bold">
                          {skill.name}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-[10px] font-bold ${
                          active ? 'text-[#55E2CE]' : 'text-[#586579]'
                        }`}
                      >
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-[#142033]/10 p-7 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-lg bg-[#142033] px-2.5 py-1 text-xs font-extrabold text-[#55E2CE]">
                    {selectedSkill.code}
                  </span>
                  <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                    {selectedSkill.name}
                  </h3>
                </div>
                <span
                  className={`rounded-full border px-3 py-0.5 text-[11px] font-bold ${
                    statusMeta(selectedSkill.status).badge
                  }`}
                >
                  {statusMeta(selectedSkill.status).label}
                </span>
              </div>

              <p className="text-sm text-[#586579] leading-relaxed">
                {selectedSkill.summary}
              </p>

              <div className="flex gap-2 border-b border-[#142033]/10 pb-3">
                <button
                  type="button"
                  onClick={() => setInspectorTab('home')}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                    inspectorTab === 'home'
                      ? 'bg-[#142033] text-white'
                      : 'bg-[#F7F6F1] text-[#586579] hover:text-[#142033]'
                  }`}
                >
                  What to notice
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab('how')}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                    inspectorTab === 'how'
                      ? 'bg-[#142033] text-white'
                      : 'bg-[#F7F6F1] text-[#586579] hover:text-[#142033]'
                  }`}
                >
                  How we observe this
                </button>
              </div>

              {inspectorTab === 'home' ? (
                <div className="space-y-5">
                  <ul className="space-y-2 text-sm text-[#142033]">
                    {selectedSkill.noticeAtHome.map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <span className="text-[#087F80] font-bold">→</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-[#087F80]/8 border border-[#087F80]/20 p-4">
                      <div className="text-xs font-extrabold text-[#087F80] mb-1">
                        What we saw
                      </div>
                      <p className="text-xs text-[#142033] leading-relaxed">
                        {selectedSkill.whatWeSaw}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#F7F6F1] border border-[#142033]/10 p-4">
                      <div className="text-xs font-extrabold text-[#586579] mb-1">
                        Still exploring
                      </div>
                      <p className="text-xs text-[#586579] leading-relaxed">
                        {selectedSkill.stillExploring}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#F7F6F1] p-5 space-y-2">
                  <div className="text-xs font-extrabold text-[#142033]">
                    Observation method
                  </div>
                  <p className="text-sm text-[#586579] leading-relaxed">
                    {selectedSkill.howWeObserve}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* REAL THINKING MOMENTS + STEP-BY-STEP REPLAY */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                Real Thinking Moments
              </h2>
              <p className="text-xs sm:text-sm text-[#586579] mt-0.5">
                Recent moments where {firstName} tested clues or updated an idea.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { code: 'ALL', label: 'All' },
                { code: 'B2', label: 'Using evidence' },
                { code: 'A1', label: 'Asking questions' },
                { code: 'A2', label: 'Spotting missing info' },
              ].map((chip) => (
                <button
                  key={chip.code}
                  type="button"
                  onClick={() => setTrailFilter(chip.code)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    trailFilter === chip.code
                      ? 'bg-[#142033] text-white'
                      : 'bg-white border border-[#142033]/12 text-[#586579] hover:text-[#142033]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
            <div className="space-y-3">
              {observationFeed.map((obs) => (
                <article
                  key={obs.id}
                  className="rounded-3xl bg-white border border-[#142033]/10 p-6 shadow-sm space-y-2.5"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#087F80]">
                    <span className="rounded-md bg-[#087F80]/10 px-2 py-0.5">
                      {obs.skillCode}
                    </span>
                    <span>{obs.skillName}</span>
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-[#142033]">
                    {obs.headline}
                  </h3>
                  <p className="text-sm text-[#586579] leading-relaxed">
                    {obs.summary}
                  </p>
                  {obs.hasReplay && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerSoftConfirm(true);
                        setReplayStepIdx(0);
                      }}
                      className="mt-1 rounded-full bg-[#087F80] px-4 py-2 text-xs font-bold text-white hover:bg-[#142033] transition cursor-pointer"
                    >
                      Replay this moment →
                    </button>
                  )}
                </article>
              ))}
            </div>

            <aside className="rounded-3xl bg-[#142033] p-6 sm:p-7 text-white shadow-xl space-y-5 lg:sticky lg:top-24">
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <h3 className="font-display text-lg font-extrabold text-white">
                  Step-by-Step Replay
                </h3>
                <span className="rounded-full bg-[#55E2CE]/15 px-3 py-0.5 text-[11px] font-bold text-[#55E2CE]">
                  {firstName}’s moves
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {replaySteps.map((st, idx) => (
                  <button
                    key={st.label}
                    type="button"
                    onClick={() => {
                      triggerDialTick(true);
                      setReplayStepIdx(idx);
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                      idx === replayStepIdx
                        ? 'bg-[#55E2CE] text-[#142033]'
                        : 'bg-white/10 text-white/75 hover:bg-white/15'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/8 p-4">
                  <div className="text-[11px] font-bold text-[#55E2CE]">
                    Input tried
                  </div>
                  <div className="mt-1 font-display text-3xl font-extrabold tabular-nums">
                    {currentStep.input}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <div className="text-[11px] font-bold text-[#55E2CE]">
                    Result seen
                  </div>
                  <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-[#55E2CE]">
                    {currentStep.output}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/8 p-4 space-y-1.5">
                <div className="text-xs font-extrabold text-[#F5B942]">
                  {currentStep.thought}
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  {currentStep.detail}
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* CRITICAL THINKING GROWTH */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
              Critical Thinking Growth
            </h2>
            <p className="text-sm text-[#586579] max-w-2xl">
              How {firstName}’s thinking habits are growing over time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
            <div className="rounded-3xl bg-white border border-[#142033]/10 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-extrabold text-[#142033]">
                    Progress Over Time · {selectedGrowthSkill.name}
                  </h3>
                  <p className="text-xs text-[#586579]">
                    Select any of the eight areas to view growth.
                  </p>
                </div>
                <span className="rounded-full bg-[#087F80]/10 px-3 py-1 text-xs font-extrabold text-[#087F80]">
                  {selectedGrowthSkill.code}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => {
                  const active = s.id === selectedGrowthSkill.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        triggerDialTick(true);
                        setGrowthSkillId(s.id);
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                        active
                          ? 'bg-[#142033] text-[#55E2CE]'
                          : 'bg-[#F7F6F1] text-[#586579] hover:text-[#142033]'
                      }`}
                    >
                      {s.shortName}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl bg-[#F7F6F1] p-4">
                <svg
                  viewBox="0 0 360 175"
                  className="w-full h-auto overflow-visible"
                  role="img"
                  aria-label={`Progress graph for ${selectedGrowthSkill.name}`}
                >
                  <defs>
                    <linearGradient id="cxGrowthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#087F80" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#087F80" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {[40, 80, 120].map((y) => (
                    <line
                      key={y}
                      x1="20"
                      y1={y}
                      x2="340"
                      y2={y}
                      stroke="rgba(20,32,51,0.08)"
                      strokeDasharray="4 4"
                    />
                  ))}
                  <path d={areaPath} fill="url(#cxGrowthFill)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#087F80"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {lineChartPoints.map((pt) => (
                    <g key={pt.label}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5.5"
                        fill="#FFFFFF"
                        stroke="#087F80"
                        strokeWidth="3"
                      />
                      <text
                        x={pt.x}
                        y="166"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill="#586579"
                      >
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div className="rounded-2xl bg-[#087F80]/8 border border-[#087F80]/20 p-4">
                <div className="text-xs font-extrabold text-[#087F80] mb-1">
                  What this tells us about {firstName}
                </div>
                <p className="text-sm text-[#142033] leading-relaxed">
                  {selectedGrowthSkill.politeProgressNote}
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-[#142033] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-extrabold text-white">
                  All 8 Areas · Progress Web
                </h3>
                <p className="text-xs text-white/70 mt-0.5">
                  A view of {firstName}’s thinking balance across all eight areas.
                </p>
              </div>

              <div className="flex items-center justify-center">
                <svg
                  viewBox="0 0 320 310"
                  className="w-full max-w-[300px] h-auto overflow-visible"
                  role="img"
                  aria-label="Eight-area critical thinking progress web"
                >
                  {[0.33, 0.66, 1].map((scale) => {
                    const ringPath =
                      skills
                        .map((_, idx) => {
                          const pt = polarToCartesian(
                            160,
                            155,
                            102 * scale,
                            idx * (360 / 8)
                          );
                          return `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
                        })
                        .join(' ') + ' Z';
                    return (
                      <path
                        key={scale}
                        d={ringPath}
                        fill="none"
                        stroke="rgba(255,255,255,0.14)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {skills.map((_, idx) => {
                    const end = polarToCartesian(160, 155, 102, idx * (360 / 8));
                    return (
                      <line
                        key={idx}
                        x1="160"
                        y1="155"
                        x2={end.x}
                        y2={end.y}
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  <path
                    d={webPolygonPath}
                    fill="rgba(85, 226, 206, 0.25)"
                    stroke="#55E2CE"
                    strokeWidth="2.5"
                  />

                  {webPoints.map((pt) => {
                    const active = pt.id === selectedGrowthSkill.id;
                    return (
                      <g
                        key={pt.id}
                        onClick={() => {
                          triggerDialTick(true);
                          setGrowthSkillId(pt.id);
                        }}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={active ? 6 : 4}
                          fill={active ? '#F5B942' : '#55E2CE'}
                        />
                        <text
                          x={pt.lx}
                          y={pt.ly}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="10"
                          fontWeight="700"
                          fill={active ? '#F5B942' : 'rgba(255,255,255,0.85)'}
                        >
                          {pt.shortName}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <p className="text-xs text-white/75 leading-relaxed">
                Every child’s web has its own shape—smaller areas are simply new skills to explore next.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-white border border-[#142033]/10 p-6 sm:p-7 shadow-sm space-y-4">
              <h3 className="font-display text-xl font-extrabold text-[#142033]">
                How {firstName}’s reasoning shifted
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#F7F6F1] p-4 space-y-1">
                  <div className="text-xs font-extrabold text-[#586579]">
                    Earlier
                  </div>
                  <p className="text-sm text-[#142033] leading-relaxed">
                    Picked an explanation after checking just one initial clue.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#087F80]/10 border border-[#087F80]/20 p-4 space-y-1">
                  <div className="text-xs font-extrabold text-[#087F80]">
                    More Recently
                  </div>
                  <p className="text-sm text-[#142033] leading-relaxed">
                    Tested an extra input and compared outputs before confirming.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#FFFDF7] border border-[#E6DEC8] p-6 sm:p-7 shadow-sm flex flex-col justify-center gap-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#087F80]">
                In {firstName}’s Own Words
              </div>
              <blockquote className="font-display text-xl sm:text-2xl font-extrabold text-[#142033] leading-snug">
                {verbatimQuote}
              </blockquote>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}