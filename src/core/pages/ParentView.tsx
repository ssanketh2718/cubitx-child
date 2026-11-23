import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../auth/ChildContext';
import { useApp } from '../store';
import {
  analyzeThinking,
  buildMomentsFromResponses,
} from '../../features/parent-insights/thinkingAnalysis';
import {
  triggerDialTick,
  triggerSoftConfirm,
} from '../lib/tactileFeedback';
import {
  PAYMENT_LINK,
  PRICE_INR,
} from '../config';
import { isDevMode } from '../auth/devMode';
import {
  summarizeThinkingSheets,
  type SkillCode,
} from '../analytics/thinkingSheetBridge';

type TimeWindow = '7d' | '30d' | '90d' | 'all';
type CoverageStatus = 'observed' | 'early' | 'review' | 'upcoming';

interface SkillMetadata {
  id: SkillCode;
  code: SkillCode;
  shortName: string;
  name: string;
  summary: string;
  noticeAtHome: string[];
  howWeObserve: string;
  emptyWhatWeSaw: string;
  emptyStillExploring: string;
}

interface ComputedSkill extends SkillMetadata {
  status: CoverageStatus;
  obsCount: number;
  whatWeSaw: string;
  stillExploring: string;
  growthSeries: number[];
  politeProgressNote: string;
  webScore: number;
}

const SKILL_DEFINITIONS: SkillMetadata[] = [
  {
    id: 'A1',
    code: 'A1',
    shortName: 'Questions',
    name: 'Asking good questions',
    summary: 'Asks targeted questions that narrow down a mystery before guessing.',
    noticeAtHome: [
      'Pauses before answering to ask what a rule or clue actually means.',
      'Asks specific “what if” questions instead of broad guesses.',
    ],
    howWeObserve: 'Tracked when your child isolates an unknown variable before making a choice.',
    emptyWhatWeSaw: 'No diagnostic question missions completed yet in this window.',
    emptyStillExploring: 'Will populate automatically as your child explores clue-gathering missions.',
  },
  {
    id: 'A2',
    code: 'A2',
    shortName: 'Missing Info',
    name: 'Spotting missing info',
    summary: 'Notices when a story, claim, or puzzle is leaving out a crucial fact.',
    noticeAtHome: [
      'Points out when a claim sounds confident but lacks proof.',
      'Asks “how do we know that?” before accepting an assumption.',
    ],
    howWeObserve: 'Tracked when your child identifies an omitted fact or hidden assumption.',
    emptyWhatWeSaw: 'No missing-information challenges completed yet in this window.',
    emptyStillExploring: 'Will populate as your child completes variable-check challenges.',
  },
  {
    id: 'B1',
    code: 'B1',
    shortName: 'Reasons',
    name: 'Giving reasons',
    summary: 'Connects a decision to clear logic rather than “just because”.',
    noticeAtHome: [
      'Explains why one option works better than another.',
      'Links two separate clues together to back up a point.',
    ],
    howWeObserve: 'Tracked when your child writes or selects a cause-and-effect reason.',
    emptyWhatWeSaw: 'No written explanations recorded yet in this window.',
    emptyStillExploring: 'Appears as soon as your child writes a short reason in their own words.',
  },
  {
    id: 'B2',
    code: 'B2',
    shortName: 'Evidence',
    name: 'Using evidence',
    summary: 'Checks clues and test results before locking in a conclusion.',
    noticeAtHome: [
      'Tests an idea a second time instead of trusting the first coincidence.',
      'Refers back to actual facts or observations when explaining.',
    ],
    howWeObserve: 'Tracked when your child runs multiple verification tests before deciding.',
    emptyWhatWeSaw: 'No multi-clue verification runs recorded yet in this window.',
    emptyStillExploring: 'Tracks how many test probes your child runs before choosing.',
  },
  {
    id: 'B3',
    code: 'B3',
    shortName: 'Weak Logic',
    name: 'Detecting weak reasoning',
    summary: 'Spots leaps in logic, small sample sizes, or unfair comparisons.',
    noticeAtHome: [
      'Notices when someone generalizes from just one or two examples.',
      'Questions bold claims that do not have a fair comparison.',
    ],
    howWeObserve: 'Tracked when your child flags unsupported generalizations or weak claims.',
    emptyWhatWeSaw: 'No weak-reasoning challenges completed yet in this window.',
    emptyStillExploring: 'Will update as your child tackles claim-checking challenges.',
  },
  {
    id: 'C1',
    code: 'C1',
    shortName: 'Trade-Offs',
    name: 'Weighing trade-offs',
    summary: 'Compares what is gained and what is given up across workable options.',
    noticeAtHome: [
      'Weighs pros and cons instead of grabbing the first option.',
      'Balances limits like time, cost, or effort when planning.',
    ],
    howWeObserve: 'Tracked when your child balances competing constraints across viable choices.',
    emptyWhatWeSaw: 'No multi-constraint trade-off items completed yet in this window.',
    emptyStillExploring: 'Appears in upcoming multi-option decision challenges.',
  },
  {
    id: 'C2',
    code: 'C2',
    shortName: 'Updating',
    name: 'Updating on evidence (Sisu)',
    summary: 'Willing to revise a first hunch calmly when new information disagrees.',
    noticeAtHome: [
      'Changes their mind calmly when shown a new fact.',
      'Does not stay stuck on a first guess just to be right.',
    ],
    howWeObserve: 'Tracked when your child re-tests or updates a prior choice after new evidence.',
    emptyWhatWeSaw: 'No answer-revision or re-check moments recorded yet in this window.',
    emptyStillExploring: 'Highlights moments where your child tests again and updates a hunch.',
  },
  {
    id: 'C3',
    code: 'C3',
    shortName: 'Reflecting',
    name: 'Reflecting',
    summary: 'Looks back on what strategy worked and what to try differently next time.',
    noticeAtHome: [
      'Talks about which step felt tricky and why.',
      'Suggests a smarter approach for a similar problem next time.',
    ],
    howWeObserve: 'Tracked when your child evaluates their own problem-solving strategy.',
    emptyWhatWeSaw: 'No strategy-reflection prompts completed yet in this window.',
    emptyStillExploring: 'Appears as reflection challenges are completed.',
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
  const pct =
    count === 0
      ? 0
      : Math.min(100, Math.max(8, Math.round((count / current.target) * 100)));
  return { tier: current.tier, target: current.target, pct };
}

function withinWindow(dateStr: string | undefined, win: TimeWindow): boolean {
  if (win === 'all' || !dateStr) return true;
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
        label: 'Not yet seen',
        fill: '#DCE2E7',
        textOnWheel: '#142033',
        dot: 'bg-[#94A3B8]',
        badge: 'bg-[#F0EFE9] text-[#586579] border-[#DCE2E7]',
      };
  }
}

function LockedOverlay({
  headline,
  sub,
  dark = false,
  childTitle,
  onUnlock,
}: {
  headline: string;
  sub: string;
  dark?: boolean;
  childTitle: string;
  onUnlock: () => void;
}) {
  return (
    <div
      className={`absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl p-5 text-center backdrop-blur-[5px] ${
        dark ? 'bg-[#142033]/75 text-white' : 'bg-[#F7F6F1]/78 text-[#142033]'
      }`}
    >
      <span
        className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono-tech text-[10px] font-bold uppercase tracking-wider ${
          dark
            ? 'bg-[#55E2CE]/20 text-[#55E2CE]'
            : 'bg-[#142033] text-[#55E2CE]'
        }`}
      >
        Full {childTitle}
      </span>
      <p className="max-w-xs font-display text-sm sm:text-base font-extrabold leading-snug">
        {headline}
      </p>
      <p
        className={`mt-1 max-w-xs text-xs ${
          dark ? 'text-white/75' : 'text-[#586579]'
        }`}
      >
        {sub}
      </p>
      <button
        type="button"
        onClick={onUnlock}
        className={`mt-3.5 cx-action-pill px-4 py-2 text-xs cursor-pointer ${
          dark
            ? 'bg-[#55E2CE] text-[#142033] hover:bg-white'
            : 'bg-[#142033] text-white hover:bg-[#087F80]'
        }`}
      >
        Unlock Full Brain Map · From ₹{PRICE_INR}/yr →
      </button>
    </div>
  );
}

export default function ParentView() {
  const navigate = useNavigate();
  const { children: familyKids } = useAuth();
  const { activeChild, setActiveChild } = useChild();

  const childBuckets = useApp((s) => s.childBuckets);
  const activeChildIdInStore = useApp((s) => s.activeChildId);
  const storeUser = useApp((s) => s.user);
  const storeSessions = useApp((s) => s.sessions);
  const storeResponses = useApp((s) => s.responses);

  const dev = isDevMode();
  const [devPaidPreview, setDevPaidPreview] = useState(false);
  const isPaid =
    devPaidPreview ||
    (typeof window !== 'undefined' &&
      localStorage.getItem('cubitx-plan') === 'paid');

  const [timeWindow, setTimeWindow] = useState<TimeWindow>('30d');
  const [selectedSkillId, setSelectedSkillId] = useState<SkillCode>('B2');
  const [growthSkillId, setGrowthSkillId] = useState<SkillCode>('B2');
  const [inspectorTab, setInspectorTab] = useState<'home' | 'how'>('home');
  const [trailFilter, setTrailFilter] = useState<string>('ALL');
  const [selectedMomentIdx, setSelectedMomentIdx] = useState(0);

  const firstName =
    activeChild?.name?.trim().split(/\s+/)[0] ||
    storeUser?.name?.trim().split(/\s+/)[0] ||
    'Explorer';
  const classLevel = activeChild?.class_level ?? storeUser?.grade ?? 7;
  const brainMappingTitle = `${firstName}'s Brain Mapping`;

  const openUnlockCheckout = () => {
    triggerSoftConfirm(true);
    window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer');
  };

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

  const {
    filteredResponses,
    moments,
    studentSummary,
    sheetSummary,
    missionsSolvedCount,
    activeDaysCount,
    multiCluePct,
    firstHunchPct,
    hasClueHabitData,
    weeklyActivityBars,
  } = useMemo(() => {
    const filteredSessions = record.sessions.filter((s) =>
      withinWindow(s.date, timeWindow)
    );
    const respMap = Object.fromEntries(
      Object.entries(record.responses).filter(([, r]) =>
        withinWindow(r.submittedAt, timeWindow)
      )
    );
    const built = buildMomentsFromResponses(respMap, (key) =>
      key.startsWith('sheet:') ? 'Chapter Challenge' : `Mission · ${key}`
    );
    const analyzed = analyzeThinking(filteredSessions, respMap, firstName);
    const sheets = summarizeThinkingSheets(respMap);

    const uniqueDates = new Set<string>();
    for (const s of filteredSessions) {
      if (s.date) uniqueDates.add(s.date.slice(0, 10));
    }
    for (const entry of sheets.entries) {
      if (entry.completedAt) uniqueDates.add(entry.completedAt.slice(0, 10));
    }
    for (const r of Object.values(respMap)) {
      if (r.submittedAt) uniqueDates.add(r.submittedAt.slice(0, 10));
    }

    const respList = Object.values(respMap);
    const responsesWithChecks = respList.filter(
      (r) => typeof r.behaviours?.testsBeforeGuess === 'number'
    );
    const multiClueCount = responsesWithChecks.filter(
      (r) => (r.behaviours?.testsBeforeGuess ?? 0) >= 2
    ).length;

    const hasHabit = responsesWithChecks.length > 0;
    const multiPct = hasHabit
      ? Math.round((multiClueCount / responsesWithChecks.length) * 100)
      : 0;
    const singlePct = hasHabit ? 100 - multiPct : 0;

    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const buckets = [0, 0, 0, 0];
    const allTimestamps: string[] = [
      ...respList.map((r) => r.submittedAt).filter(Boolean),
      ...filteredSessions.map((s) => s.date).filter(Boolean),
    ];

    for (const ts of allTimestamps) {
      const t = ts.length === 10 ? new Date(`${ts}T00:00:00`).getTime() : new Date(ts).getTime();
      if (Number.isNaN(t)) continue;
      const ageWeeks = Math.floor((now - t) / weekMs);
      if (ageWeeks <= 0) buckets[3] += 1;
      else if (ageWeeks === 1) buckets[2] += 1;
      else if (ageWeeks === 2) buckets[1] += 1;
      else if (ageWeeks === 3) buckets[0] += 1;
    }

    const bars = [
      { label: 'Wk 1', val: buckets[0] },
      { label: 'Wk 2', val: buckets[1] },
      { label: 'Wk 3', val: buckets[2] },
      { label: 'Now', val: buckets[3] },
    ];

    return {
      filteredResponses: respMap,
      moments: built,
      studentSummary: analyzed.studentSummary,
      sheetSummary: sheets,
      missionsSolvedCount: filteredSessions.length,
      activeDaysCount: uniqueDates.size,
      multiCluePct: multiPct,
      firstHunchPct: singlePct,
      hasClueHabitData: hasHabit,
      weeklyActivityBars: bars,
    };
  }, [record, timeWindow, firstName]);

  const skills: ComputedSkill[] = useMemo(() => {
    return SKILL_DEFINITIONS.map((def) => {
      const sheetEntries = sheetSummary.bySkill[def.id] ?? [];
      let obsCount = sheetEntries.length;

      if (def.id === 'B2') {
        obsCount += studentSummary.totalChecksTried;
      } else if (def.id === 'C2') {
        obsCount += studentSummary.recheckMoments;
      } else if (def.id === 'B1') {
        obsCount += studentSummary.writtenReflections;
      }

      const status: CoverageStatus =
        obsCount >= 3 ? 'observed' : obsCount >= 1 ? 'early' : 'upcoming';

      let whatWeSaw = def.emptyWhatWeSaw;
      let stillExploring = def.emptyStillExploring;

      if (sheetEntries.length > 0) {
        const latest = sheetEntries[0];
        whatWeSaw = latest.text
          ? `In ${latest.topicName} (${latest.questionTitle}): “${latest.text}”`
          : `Completed ${latest.topicName} · ${latest.questionTitle} (${latest.subject}).`;
        stillExploring =
          obsCount >= 3
            ? `Observed across ${obsCount} real activities.`
            : `${3 - obsCount} more observation${3 - obsCount === 1 ? '' : 's'} will confirm this habit.`;
      } else if (def.id === 'B2' && studentSummary.totalChecksTried > 0) {
        whatWeSaw = `${firstName} ran ${studentSummary.totalChecksTried} clue check${
          studentSummary.totalChecksTried === 1 ? '' : 's'
        } across ${studentSummary.recordedMoments} recorded mission step${
          studentSummary.recordedMoments === 1 ? '' : 's'
        }.`;
        stillExploring = 'Continues updating with every mission clue tested.';
      } else if (def.id === 'C2' && studentSummary.recheckMoments > 0) {
        whatWeSaw = `${firstName} re-tested or updated an initial guess in ${studentSummary.recheckMoments} moment${
          studentSummary.recheckMoments === 1 ? '' : 's'
        }.`;
        stillExploring = 'Tracks flexible thinking when new clues appear.';
      } else if (def.id === 'B1' && studentSummary.writtenReflections > 0) {
        whatWeSaw = `${firstName} wrote ${studentSummary.writtenReflections} explanation${
          studentSummary.writtenReflections === 1 ? '' : 's'
        } in their own words.`;
        stillExploring = 'Every written note adds clarity here.';
      }

      const webScore = obsCount === 0 ? 0 : Math.min(100, obsCount * 25);

      const growthSeries =
        obsCount === 0
          ? [0, 0, 0, 0]
          : [
              Math.round(webScore * 0.25),
              Math.round(webScore * 0.5),
              Math.round(webScore * 0.75),
              webScore,
            ];

      const politeProgressNote =
        obsCount === 0
          ? `${firstName} hasn't explored ${def.name.toLowerCase()} activities yet. Once completed, real progress will appear here.`
          : obsCount >= 3
          ? `${firstName} has demonstrated ${def.name.toLowerCase()} across ${obsCount} recorded activities.`
          : `Early signal recorded (${obsCount} observation${
              obsCount === 1 ? '' : 's'
            }). More activities will build a fuller picture.`;

      return {
        ...def,
        status,
        obsCount,
        whatWeSaw,
        stillExploring,
        growthSeries,
        politeProgressNote,
        webScore,
      };
    });
  }, [sheetSummary.bySkill, studentSummary, firstName]);

  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId) ?? skills[3],
    [skills, selectedSkillId]
  );

  const selectedGrowthSkill = useMemo(
    () => skills.find((s) => s.id === growthSkillId) ?? skills[3],
    [skills, growthSkillId]
  );

  const observedSkillsCount = skills.filter((s) => s.obsCount > 0).length;

  const sheetWrittenCount = sheetSummary.entries.filter(
    (e) => e.text.trim().length > 0
  ).length;
  const ownWordNotesCount =
    studentSummary.writtenReflections + sheetWrittenCount;

  const totalProbes =
    studentSummary.totalChecksTried + sheetSummary.totalCompleted;
  const totalRechecks = studentSummary.recheckMoments;
  const totalNotes = ownWordNotesCount;

  const probeTier = getAnnualTierProgress(totalProbes);
  const recheckTier = getAnnualTierProgress(totalRechecks);
  const notesTier = getAnnualTierProgress(totalNotes);

  const maxBar = Math.max(...weeklyActivityBars.map((d) => d.val), 1);

  const skillNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of SKILL_DEFINITIONS) {
      map[s.code] = s.name;
    }
    return map;
  }, []);

  const observationFeed = useMemo(() => {
    const sheetObservations = sheetSummary.entries.map((entry) => ({
      id: entry.key,
      skillCode: entry.skillCode,
      skillName: skillNameMap[entry.skillCode] || 'Chapter Challenge',
      headline: `${entry.topicName} · ${entry.questionTitle}`,
      summary: entry.text
        ? `${firstName} wrote: “${entry.text}”`
        : `${firstName} completed this ${entry.subject} Chapter Challenge.`,
      testsCount: 1,
      rechecked: false,
      writtenText: entry.text || '',
    }));

    const missionObservations = moments
      .filter((m) => !m.itemKey.startsWith('sheet:'))
      .map((m) => ({
        id: m.id,
        skillCode: m.wentBackToTest ? 'C2' : 'B2',
        skillName: m.wentBackToTest ? 'Updating on evidence' : 'Using evidence',
        headline: m.title,
        summary: m.verbatimText?.trim()
          ? `${firstName} wrote: “${m.verbatimText.trim()}”`
          : `${firstName} ran ${m.testsBeforeGuess ?? 1} check${
              (m.testsBeforeGuess ?? 1) === 1 ? '' : 's'
            } before choosing.`,
        testsCount: m.testsBeforeGuess ?? 1,
        rechecked: Boolean(m.wentBackToTest),
        writtenText: m.verbatimText?.trim() || '',
      }));

    return [...sheetObservations, ...missionObservations].filter(
      (item) => trailFilter === 'ALL' || item.skillCode === trailFilter
    );
  }, [sheetSummary.entries, moments, skillNameMap, firstName, trailFilter]);

  const activeMoment =
    observationFeed[selectedMomentIdx] ?? observationFeed[0] ?? null;

  const reasoningShift = useMemo(() => {
    const chronological = Object.values(filteredResponses)
      .filter((r) => typeof r.behaviours?.testsBeforeGuess === 'number')
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

    if (chronological.length < 2) return null;
    const earliest = chronological[0];
    const latest = chronological[chronological.length - 1];
    return {
      earliestChecks: earliest.behaviours?.testsBeforeGuess ?? 1,
      latestChecks: latest.behaviours?.testsBeforeGuess ?? 1,
      latestRechecked: Boolean(latest.behaviours?.wentBackToTest),
    };
  }, [filteredResponses]);

  const verbatimQuote = useMemo(() => {
    const sheetWithText = sheetSummary.entries.find(
      (e) => e.text && e.text.trim().length > 0
    );
    if (sheetWithText) {
      return `“${sheetWithText.text.trim()}”`;
    }
    const withText = moments.find(
      (m) => m.verbatimText && m.verbatimText.trim().length > 0
    );
    return withText?.verbatimText?.trim()
      ? `“${withText.verbatimText.trim()}”`
      : null;
  }, [sheetSummary.entries, moments]);

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
      val,
      label: ['Step 1', 'Step 2', 'Step 3', 'Current'][i],
    }));
  }, [selectedGrowthSkill]);

  const linePath = lineChartPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  const areaPath = `${linePath} L 324 148 L 36 148 Z`;

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#142033] font-sans">
      <main className="mx-auto max-w-6xl px-2 py-4 pb-20 sm:px-4 space-y-14">
        {/* HEADER + CONTROLS */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 cx-hairline-b pb-6">
            <div className="space-y-1.5">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                Class {classLevel} · {isPaid ? 'Full Brain Mapping' : 'Free Brain Map Summary'}
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#142033]">
                {brainMappingTitle}
              </h1>
              <p className="text-sm sm:text-base text-[#586579] max-w-2xl">
                Live record of how {firstName} checks clues, solves Chapter
                Challenges, and explains ideas in their own words.
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
                      className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                        activeChild?.id === kid.id
                          ? 'bg-[#142033] text-white'
                          : 'text-[#586579] hover:text-[#142033]'
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
                For Parents Guide →
              </button>

              {dev && (
                <button
                  type="button"
                  onClick={() => setDevPaidPreview((p) => !p)}
                  className="rounded-full border border-[#142033]/20 bg-white px-3 py-1.5 font-mono-tech text-[10px] font-bold text-[#142033] cursor-pointer"
                >
                  DEV: {isPaid ? 'Paid View' : 'Free View'}
                </button>
              )}
            </div>
          </div>

          {/* CLEAR ACTIVITY NUMBERS (100% REAL COUNTS) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#142033]/10 bg-white p-5 shadow-[var(--shadow-artifact)]">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-wider text-[#586579]">
                Thinking Missions
              </div>
              <div className="mt-1.5 font-display text-3xl sm:text-4xl font-extrabold tabular-nums text-[#142033]">
                {missionsSolvedCount}
              </div>
              <p className="mt-1 text-xs text-[#586579]">
                Puzzles explored
              </p>
            </div>

            <div className="rounded-2xl border border-[#087F80]/25 bg-white p-5 shadow-[var(--shadow-artifact)]">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-wider text-[#087F80]">
                Chapter Challenges
              </div>
              <div className="mt-1.5 font-display text-3xl sm:text-4xl font-extrabold tabular-nums text-[#087F80]">
                {sheetSummary.totalCompleted}
              </div>
              <p className="mt-1 text-xs text-[#586579]">
                Board-linked challenges done
              </p>
            </div>

            <div className="rounded-2xl border border-[#142033]/10 bg-white p-5 shadow-[var(--shadow-artifact)]">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-wider text-[#586579]">
                Own-Word Notes
              </div>
              <div className="mt-1.5 font-display text-3xl sm:text-4xl font-extrabold tabular-nums text-[#142033]">
                {ownWordNotesCount}
              </div>
              <p className="mt-1 text-xs text-[#586579]">
                Written in {firstName}’s words
              </p>
            </div>

            <div className="rounded-2xl border border-[#142033]/10 bg-white p-5 shadow-[var(--shadow-artifact)]">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-wider text-[#586579]">
                Active Days
              </div>
              <div className="mt-1.5 font-display text-3xl sm:text-4xl font-extrabold tabular-nums text-[#142033]">
                {activeDaysCount}
              </div>
              <p className="mt-1 text-xs text-[#586579]">
                Days practised in this period
              </p>
            </div>
          </div>

          {!isPaid && (
            <div className="rounded-3xl border border-[#087F80]/25 bg-white p-5 sm:p-6 shadow-[var(--shadow-artifact)] flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <span className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                  {brainMappingTitle}
                </span>
                <p className="font-display text-base sm:text-lg font-extrabold text-[#142033]">
                  {missionsSolvedCount + sheetSummary.totalCompleted > 0
                    ? `${firstName} has completed ${missionsSolvedCount} Thinking Mission${
                        missionsSolvedCount === 1 ? '' : 's'
                      } and ${sheetSummary.totalCompleted} Chapter Challenge${
                        sheetSummary.totalCompleted === 1 ? '' : 's'
                      }.`
                    : `${firstName} hasn't completed a mission or challenge yet—insights will populate live as soon as they play.`}
                </p>
                <p className="text-xs text-[#586579]">
                  Unlock full step-by-step replays, verbatim quotes, and the
                  8-area Brain Map (Explorer ₹{PRICE_INR}/yr · Thinker Pro ₹1,499/yr · Scholar Elite ₹2,499/yr — one-time payment, zero auto-debit).
                </p>
              </div>
              <button
                type="button"
                onClick={openUnlockCheckout}
                className="cx-action-pill bg-[#142033] px-5 py-3 text-xs text-white hover:bg-[#087F80] cursor-pointer"
              >
                Unlock Full Brain Mapping →
              </button>
            </div>
          )}

          {/* 4 VISUAL WINDOWS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-3xl bg-white border border-[#142033]/10 p-6 shadow-[var(--shadow-artifact)] flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-extrabold text-[#142033]">
                  Thinking Activity
                </h2>
                <span className="rounded-full bg-[#087F80]/10 px-2.5 py-0.5 text-[11px] font-extrabold text-[#087F80]">
                  {totalProbes} actions
                </span>
              </div>

              <div className="flex items-end justify-between gap-2 h-28 pt-2">
                {weeklyActivityBars.map((bar, idx) => {
                  const pct =
                    bar.val === 0
                      ? 8
                      : Math.max(16, Math.round((bar.val / maxBar) * 100));
                  const isLatest = idx === weeklyActivityBars.length - 1;
                  return (
                    <div
                      key={bar.label}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                    >
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          bar.val === 0
                            ? 'bg-[#142033]/8'
                            : isLatest
                            ? 'bg-[#087F80]'
                            : 'bg-[#142033]/25'
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
                Missions, Chapter Challenges ({sheetSummary.totalCompleted}), and
                clue checks logged.
              </p>
            </div>

            <div className="rounded-3xl bg-[#142033] p-6 text-white shadow-[var(--shadow-device)] flex flex-col justify-between gap-4">
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
                Thinking skills observed across completed Missions and Chapter Challenges.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-white border border-[#142033]/10 p-6 shadow-[var(--shadow-artifact)] flex flex-col justify-between gap-4">
              <div className={!isPaid ? 'blur-[4px] select-none pointer-events-none space-y-4' : 'space-y-4'}>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-sm font-extrabold text-[#142033]">
                    Clue-Testing Habit
                  </h2>
                  <span className="rounded-full bg-[#F5B942]/20 px-2.5 py-0.5 text-[11px] font-extrabold text-[#8A5A00]">
                    {hasClueHabitData
                      ? multiCluePct >= 60
                        ? 'Strong'
                        : 'Building'
                      : 'Awaiting data'}
                  </span>
                </div>
                <div className="space-y-3 py-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-[#142033]">Tested 2+ clues</span>
                      <span className="text-[#087F80]">
                        {hasClueHabitData ? `${multiCluePct}%` : '—'}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[#F0EFE9] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#087F80]"
                        style={{ width: `${multiCluePct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-[#586579]">First-hunch picks</span>
                      <span className="text-[#586579]">
                        {hasClueHabitData ? `${firstHunchPct}%` : '—'}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[#F0EFE9] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#F5B942]"
                        style={{ width: `${firstHunchPct}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#586579]">
                  {hasClueHabitData
                    ? `${firstName} checked 2+ clues in ${multiCluePct}% of recorded mission steps.`
                    : `Complete a Thinking Mission to measure how many clues ${firstName} checks.`}
                </p>
              </div>

              {!isPaid && (
                <LockedOverlay
                  childTitle={brainMappingTitle}
                  headline="Guessing vs. Thinking Habit"
                  sub={`See how often ${firstName} verifies vs. guesses.`}
                  onUnlock={openUnlockCheckout}
                />
              )}
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-white border border-[#142033]/10 p-6 shadow-[var(--shadow-artifact)] flex flex-col justify-between gap-4">
              <div className={!isPaid ? 'blur-[4px] select-none pointer-events-none space-y-4' : 'space-y-4'}>
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
                      label: 'Mind shifts (Sisu)',
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
                        <span className="tabular-nums text-[#586579]">
                          {row.val}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#F0EFE9] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.color}`}
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

              {!isPaid && (
                <LockedOverlay
                  childTitle={brainMappingTitle}
                  headline="Key Thinking Moves"
                  sub="Track mind shifts and own-word notes over time."
                  onUnlock={openUnlockCheckout}
                />
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: EIGHT THINKING SKILLS */}
        <section className="cx-hairline-t pt-10 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
            Eight Thinking Skills (A1–C3)
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
            <div className="rounded-3xl bg-white border border-[#142033]/10 p-6 shadow-[var(--shadow-artifact)] grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-6 items-center">
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

            <div className="relative overflow-hidden rounded-3xl bg-white border border-[#142033]/10 p-7 shadow-[var(--shadow-artifact)] space-y-5">
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

              <div className="relative">
                <div className={!isPaid ? 'blur-[4px] select-none pointer-events-none space-y-5' : 'space-y-5'}>
                  <div className="flex gap-2 border-b border-[#142033]/10 pb-3">
                    <button
                      type="button"
                      onClick={() => setInspectorTab('home')}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                        inspectorTab === 'home'
                          ? 'bg-[#142033] text-white'
                          : 'bg-[#F7F6F1] text-[#586579]'
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
                          : 'bg-[#F7F6F1] text-[#586579]'
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

                {!isPaid && (
                  <LockedOverlay
                    childTitle={brainMappingTitle}
                    headline={`See what we observed for ${selectedSkill.name}`}
                    sub="Unlock specific observations and what to notice at home."
                    onUnlock={openUnlockCheckout}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: REAL THINKING MOMENTS + STEP-BY-STEP REPLAY */}
        <section className="cx-hairline-t pt-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                Real Thinking Moments
              </h2>
              <p className="text-xs sm:text-sm text-[#586579] mt-0.5">
                Live recorded steps from Thinking Missions and Chapter Challenges completed by {firstName}.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { code: 'ALL', label: 'All' },
                { code: 'B1', label: 'Giving reasons' },
                { code: 'B2', label: 'Using evidence' },
                { code: 'A1', label: 'Asking questions' },
                { code: 'A2', label: 'Spotting missing info' },
              ].map((chip) => (
                <button
                  key={chip.code}
                  type="button"
                  onClick={() => {
                    setTrailFilter(chip.code);
                    setSelectedMomentIdx(0);
                  }}
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
              {observationFeed.length === 0 ? (
                <div className="rounded-3xl bg-white border border-[#142033]/10 p-7 text-center space-y-2">
                  <p className="font-display text-base font-extrabold text-[#142033]">
                    No recorded moments yet
                  </p>
                  <p className="text-xs sm:text-sm text-[#586579]">
                    Once {firstName} completes a Thinking Mission or Chapter
                    Challenge, each real step and written answer will appear here.
                  </p>
                </div>
              ) : (
                observationFeed.map((obs, idx) => (
                  <article
                    key={obs.id}
                    className={`rounded-3xl bg-white border p-6 shadow-[var(--shadow-artifact)] space-y-2.5 transition ${
                      idx === selectedMomentIdx
                        ? 'border-[#087F80]'
                        : 'border-[#142033]/10'
                    }`}
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
                    <p
                      className={`text-sm text-[#586579] leading-relaxed ${
                        !isPaid && idx > 0 ? 'blur-[4px] select-none' : ''
                      }`}
                    >
                      {obs.summary}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isPaid) {
                          openUnlockCheckout();
                          return;
                        }
                        triggerSoftConfirm(true);
                        setSelectedMomentIdx(idx);
                      }}
                      className="mt-1 rounded-full bg-[#087F80] px-4 py-2 text-xs font-bold text-white hover:bg-[#142033] transition cursor-pointer"
                    >
                      {isPaid ? 'Inspect this step →' : 'Unlock Step-by-Step Replay →'}
                    </button>
                  </article>
                ))
              )}
            </div>

            <aside className="relative overflow-hidden rounded-3xl bg-[#142033] p-6 sm:p-7 text-white shadow-[var(--shadow-device)] space-y-5 lg:sticky lg:top-24">
              <div className={!isPaid ? 'blur-[4px] select-none pointer-events-none space-y-5' : 'space-y-5'}>
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                  <h3 className="font-display text-lg font-extrabold text-white">
                    Step-by-Step Inspector
                  </h3>
                  <span className="rounded-full bg-[#55E2CE]/15 px-3 py-0.5 text-[11px] font-bold text-[#55E2CE]">
                    {firstName}’s log
                  </span>
                </div>

                {activeMoment ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/8 p-4">
                        <div className="text-[11px] font-bold text-[#55E2CE]">
                          Clues / Checks Tried
                        </div>
                        <div className="mt-1 font-display text-3xl font-extrabold tabular-nums">
                          {activeMoment.testsCount}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/8 p-4">
                        <div className="text-[11px] font-bold text-[#55E2CE]">
                          Re-checked Idea
                        </div>
                        <div className="mt-1 font-display text-2xl font-extrabold text-[#55E2CE]">
                          {activeMoment.rechecked ? 'Yes' : 'First pass'}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/8 p-4 space-y-1.5">
                      <div className="text-xs font-extrabold text-[#F5B942]">
                        {activeMoment.headline}
                      </div>
                      <p className="text-xs text-white/85 leading-relaxed">
                        {activeMoment.writtenText
                          ? `“${activeMoment.writtenText}”`
                          : activeMoment.summary}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-white/75 leading-relaxed">
                    Select any completed mission or Chapter Challenge on the left to inspect {firstName}’s exact checks and written response.
                  </p>
                )}
              </div>

              {!isPaid && (
                <LockedOverlay
                  dark
                  childTitle={brainMappingTitle}
                  headline={`Inspect ${firstName}’s step-by-step moves`}
                  sub="See every clue tested and every written explanation."
                  onUnlock={openUnlockCheckout}
                />
              )}
            </aside>
          </div>
        </section>

        {/* SECTION 4: CRITICAL THINKING GROWTH */}
        <section className="cx-hairline-t pt-10 space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
              Critical Thinking Growth
            </h2>
            <p className="text-sm text-[#586579] max-w-2xl">
              How {firstName}’s thinking habits are growing across all eight
              areas based on real completed activities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
            <div className="relative overflow-hidden rounded-3xl bg-white border border-[#142033]/10 p-6 sm:p-7 shadow-[var(--shadow-artifact)]">
              <div className={!isPaid ? 'blur-[5px] select-none pointer-events-none space-y-5' : 'space-y-5'}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-[#142033]">
                      Progress Over Time · {selectedGrowthSkill.name}
                    </h3>
                    <p className="text-xs text-[#586579]">
                      Select any of the eight areas to view recorded observations.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#087F80]/10 px-3 py-1 text-xs font-extrabold text-[#087F80]">
                    {selectedGrowthSkill.code} · {selectedGrowthSkill.obsCount} seen
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
                            : 'bg-[#F7F6F1] text-[#586579]'
                        }`}
                      >
                        {s.shortName}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl bg-[#F7F6F1] p-4">
                  <svg viewBox="0 0 360 175" className="w-full h-auto overflow-visible">
                    <defs>
                      <linearGradient id="cxGrowthFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#087F80" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#087F80" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
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

              {!isPaid && (
                <LockedOverlay
                  childTitle={brainMappingTitle}
                  headline={`See ${firstName}’s growth curve`}
                  sub="Inspect progress across all 8 critical thinking skills."
                  onUnlock={openUnlockCheckout}
                />
              )}
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-[#142033] p-6 sm:p-7 text-white shadow-[var(--shadow-device)]">
              <div className={!isPaid ? 'blur-[5px] select-none pointer-events-none flex flex-col justify-between gap-4' : 'flex flex-col justify-between gap-4'}>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-white">
                    All 8 Areas · Brain Map Web
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">
                    Live balance across all eight thinking skills.
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <svg viewBox="0 0 320 310" className="w-full max-w-[300px] h-auto overflow-visible">
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
                    <path
                      d={webPolygonPath}
                      fill="rgba(85, 226, 206, 0.25)"
                      stroke="#55E2CE"
                      strokeWidth="2.5"
                    />
                    {webPoints.map((pt) => (
                      <g
                        key={pt.id}
                        onClick={() => {
                          triggerDialTick(true);
                          setGrowthSkillId(pt.id);
                        }}
                        className="cursor-pointer"
                      >
                        <circle cx={pt.x} cy={pt.y} r="4.5" fill="#55E2CE" />
                        <text
                          x={pt.lx}
                          y={pt.ly}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="10"
                          fontWeight="700"
                          fill="rgba(255,255,255,0.85)"
                        >
                          {pt.shortName}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                <p className="text-xs text-white/75 leading-relaxed">
                  Expands outward as {firstName} completes activities in each
                  skill area.
                </p>
              </div>

              {!isPaid && (
                <LockedOverlay
                  dark
                  childTitle={brainMappingTitle}
                  headline={`Unlock ${firstName}’s 8-Area Brain Map Web`}
                  sub="See strengths and next focus areas at a glance."
                  onUnlock={openUnlockCheckout}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-3xl bg-white border border-[#142033]/10 p-6 sm:p-7 shadow-[var(--shadow-artifact)]">
              <div className={!isPaid ? 'blur-[4px] select-none pointer-events-none space-y-4' : 'space-y-4'}>
                <h3 className="font-display text-xl font-extrabold text-[#142033]">
                  How {firstName}’s reasoning shifted
                </h3>
                {reasoningShift ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#F7F6F1] p-4 space-y-1">
                      <div className="text-xs font-extrabold text-[#586579]">
                        Earliest Recorded Run
                      </div>
                      <p className="text-sm text-[#142033] leading-relaxed">
                        Tested {reasoningShift.earliestChecks} clue
                        {reasoningShift.earliestChecks === 1 ? '' : 's'} before
                        answering.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#087F80]/10 border border-[#087F80]/20 p-4 space-y-1">
                      <div className="text-xs font-extrabold text-[#087F80]">
                        Most Recent Run
                      </div>
                      <p className="text-sm text-[#142033] leading-relaxed">
                        Tested {reasoningShift.latestChecks} clue
                        {reasoningShift.latestChecks === 1 ? '' : 's'}
                        {reasoningShift.latestRechecked
                          ? ' and went back to re-check before locking in.'
                          : ' before locking in.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#586579] leading-relaxed">
                    Complete at least 2 Thinking Missions to compare how{' '}
                    {firstName}’s clue-checking habit evolves over time.
                  </p>
                )}
              </div>

              {!isPaid && (
                <LockedOverlay
                  childTitle={brainMappingTitle}
                  headline="See how their reasoning shifted"
                  sub="Compare earliest runs with recent breakthroughs."
                  onUnlock={openUnlockCheckout}
                />
              )}
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-[#FFFDF7] border border-[#E6DEC8] p-6 sm:p-7 shadow-[var(--shadow-artifact)] flex flex-col justify-center gap-3">
              <div className={!isPaid ? 'blur-[5px] select-none pointer-events-none space-y-3' : 'space-y-3'}>
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#087F80]">
                  In {firstName}’s Own Words
                </div>
                {verbatimQuote ? (
                  <blockquote className="font-display text-xl sm:text-2xl font-extrabold text-[#142033] leading-snug">
                    {verbatimQuote}
                  </blockquote>
                ) : (
                  <p className="text-sm text-[#586579] leading-relaxed">
                    When {firstName} writes an explanation in a Thinking Mission
                    or Chapter Challenge, their exact words will appear here.
                  </p>
                )}
              </div>

              {!isPaid && (
                <LockedOverlay
                  childTitle={brainMappingTitle}
                  headline={`Read what ${firstName} wrote in their own words`}
                  sub="Real verbatim quotes captured during Thinking Missions and Chapter Challenges."
                  onUnlock={openUnlockCheckout}
                />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}