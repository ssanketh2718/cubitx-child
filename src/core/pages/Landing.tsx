import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FREE_DAILY_MISSIONS,
  FREE_THINKING_SHEET_LIMIT,
  PAID_THINKING_SHEET_MIN,
  PRICE_INR,
} from '../config';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';

interface HeroFrame {
  id: string;
  tabLabel: string;
  contextLine: string;
  statusLabel: string;
  statusTone: 'teal' | 'amber' | 'ink';
  title: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  transcript: string;
  footnote: string;
}

const HERO_FRAMES: HeroFrame[] = [
  {
    id: 'baseline-test',
    tabLabel: '01 · Free Test',
    contextLine: 'Free Critical Thinking Test · Classes 5 to 10',
    statusLabel: 'Free to try',
    statusTone: 'teal',
    title: 'Find out if your child rushes to guess or checks clues first',
    leftLabel: 'Daily free',
    leftValue: `${FREE_DAILY_MISSIONS} missions`,
    rightLabel: 'You get',
    rightValue: 'Brain Map',
    transcript:
      'Short puzzles with no marks and no countdown clock. Ends with a simple summary of how your child reasoned.',
    footnote: 'No card needed · Progress saves automatically',
  },
  {
    id: 'chapter-challenge',
    tabLabel: '02 · Challenges',
    contextLine: 'Class 6 · CBSE & Maharashtra State Board · Science',
    statusLabel: 'Chapter-linked',
    statusTone: 'amber',
    title: 'School chapters turned into real-world thinking questions',
    leftLabel: 'Free plan',
    leftValue: `${FREE_THINKING_SHEET_LIMIT} / chapter`,
    rightLabel: 'Full plan',
    rightValue: `${PAID_THINKING_SHEET_MIN}+ / chapter`,
    transcript:
      '“Both plants got water, so we cannot blame the soil until we check how much sunlight each corner gets.”',
    footnote: 'Fresh practice questions tailored for every student',
  },
  {
    id: 'brain-map',
    tabLabel: '03 · Brain Map',
    contextLine: "Aarav's Brain Mapping · Step-by-Step Insights",
    statusLabel: 'Only on CubitX',
    statusTone: 'ink',
    title: 'See every step of how your child thought and fixed their mistake',
    leftLabel: 'Tested 2+ clues',
    leftValue: '78%',
    rightLabel: 'Skills tracked',
    rightValue: '8 areas',
    transcript:
      'Earlier: picked after the first clue. Recently: tested a second number and caught their own mistake.',
    footnote: 'Step-by-step replay + 8-area Brain Map Web',
  },
  {
    id: 'for-parents',
    tabLabel: '04 · For Parents',
    contextLine: 'Family Thinking Conversations · Guided Prompts',
    statusLabel: 'Open to all',
    statusTone: 'teal',
    title: 'Simple everyday questions to talk about together at home',
    leftLabel: 'Weekly prompts',
    leftValue: '3 topics',
    rightLabel: 'Prep needed',
    rightValue: 'None',
    transcript:
      '“Why do heavy trucks have 8 or 10 wide tyres instead of 4 thin bicycle tyres?”',
    footnote: 'Stay curious together and celebrate thoughtful effort',
  },
];

type SampleSkillCode = 'A1' | 'A2' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3';
type SampleStatus = 'observed' | 'early' | 'review' | 'upcoming';

interface SampleSkill {
  id: SampleSkillCode;
  code: SampleSkillCode;
  shortName: string;
  name: string;
  summary: string;
  noticeAtHome: string[];
  whatWeSaw: string;
  stillExploring: string;
  status: SampleStatus;
  obsCount: number;
  howWeObserve: string;
  growthSeries: number[];
  politeProgressNote: string;
  webScore: number;
}

const SAMPLE_SKILLS: SampleSkill[] = [
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
    whatWeSaw: 'Selected targeted questions before changing variables.',
    stillExploring: 'How consistently this shows up in open-ended problems.',
    status: 'observed',
    obsCount: 3,
    howWeObserve: 'Observed when your child checks an unknown factor before making a choice.',
    growthSeries: [28, 42, 58, 72],
    politeProgressNote:
      'Showing steady, thoughtful growth—moving from broad guesses toward focused questions that test one idea at a time.',
    webScore: 72,
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
    whatWeSaw: 'Flagged an unstated sunlight difference in the garden experiment.',
    stillExploring: 'We need a few more varied activities to see if this habit repeats.',
    status: 'early',
    obsCount: 1,
    howWeObserve: 'Observed when your child spots an omitted fact or hidden assumption.',
    growthSeries: [20, 26, 35, 48],
    politeProgressNote:
      'Making a strong start—beginning to pause and notice when an important clue has been left out.',
    webScore: 48,
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
    whatWeSaw: 'Gave clear, cause-and-effect reasons across multiple missions.',
    stillExploring: 'Whether explanations stay just as clear under competing trade-offs.',
    status: 'observed',
    obsCount: 3,
    howWeObserve: 'Observed when your child links their choice directly to an observed cause or rule.',
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
    summary: 'Checks clues and test results before locking in a conclusion.',
    noticeAtHome: [
      'Tests an idea a second time instead of trusting the first coincidence.',
      'Refers back to actual facts or observations when explaining.',
    ],
    whatWeSaw: 'Tested multiple inputs and compared outputs before confirming a rule.',
    stillExploring: 'How they weigh evidence when two clues point in opposite directions.',
    status: 'observed',
    obsCount: 4,
    howWeObserve: 'Observed when your child runs verification checks to rule out competing ideas.',
    growthSeries: [35, 52, 68, 82],
    politeProgressNote:
      'A major strength right now—patiently checking extra clues before settling on a conclusion.',
    webScore: 82,
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
    whatWeSaw: 'Questioned a bold percentage claim based on a tiny test sample.',
    stillExploring: 'Building consistency on tricky exam distractors.',
    status: 'review',
    obsCount: 1,
    howWeObserve: 'Observed when your child flags unsupported generalizations or weak claims.',
    growthSeries: [18, 25, 32, 42],
    politeProgressNote:
      'Early signs are promising—starting to look past confident headlines to check whether the logic holds up.',
    webScore: 42,
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
    whatWeSaw: 'Upcoming missions will introduce multi-option trade-off challenges.',
    stillExploring: 'Next focus area in upcoming sessions.',
    status: 'upcoming',
    obsCount: 0,
    howWeObserve: 'Observed when your child balances competing constraints across viable choices.',
    growthSeries: [15, 18, 22, 28],
    politeProgressNote:
      'Up next on the journey—upcoming missions introduce balancing competing choices and limits.',
    webScore: 28,
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
    whatWeSaw: 'Revised a candidate rule after a second test contradicted the first guess.',
    stillExploring: 'How readily this happens across longer, multi-step puzzles.',
    status: 'early',
    obsCount: 2,
    howWeObserve: 'Observed when your child updates or refines a prior guess after new feedback.',
    growthSeries: [24, 38, 52, 66],
    politeProgressNote:
      'Showing strong flexibility—willing to let go of a first guess when a new clue tells a clearer story.',
    webScore: 66,
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
    whatWeSaw: 'Fresh reflection challenges are ready in upcoming sessions.',
    stillExploring: 'More reflection moments appear as new missions are completed.',
    status: 'upcoming',
    obsCount: 0,
    howWeObserve: 'Observed when your child evaluates their own problem-solving strategy.',
    growthSeries: [16, 20, 26, 34],
    politeProgressNote:
      'Ready next—inviting your child to look back on what strategies helped most.',
    webScore: 34,
  },
];

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

function sampleStatusMeta(status: SampleStatus) {
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

const FAQ_ITEMS = [
  {
    q: 'How are Thinking Missions and Chapter Challenges different?',
    a: `Thinking Missions are interactive puzzles (${FREE_DAILY_MISSIONS} free every day) where your child tests ideas and discovers rules on their own. Chapter Challenges are chapter-linked questions (${FREE_THINKING_SHEET_LIMIT} free per chapter, ${PAID_THINKING_SHEET_MIN}+ on paid plans) built around CBSE and Maharashtra State Board topics so they can handle twisted exam papers.`,
  },
  {
    q: "What makes Your Kid's Brain Map different from normal progress reports?",
    a: "Normal apps only tell you '70% correct.' Your Kid's Brain Map (personalized as your child's own Brain Mapping after sign-in) shows every step your child took—whether they guessed quickly, how they fixed a mistake, and how their thinking skills are growing.",
  },
  {
    q: 'What is HOTS in Scholar Elite, and where is it used?',
    a: 'HOTS (Higher Order Thinking Skills) is the global standard for testing deep reasoning instead of memory—used across Singapore, Malaysia, Indonesia, IB/Cambridge schools, and India’s CBSE competency & Maharashtra Board application exams, as well as SOF, Homi Bhabha, and SilverZone Olympiads.',
  },
  {
    q: 'Will money be cut automatically next year?',
    a: 'No. Every paid plan is a single one-time payment for 1 year. There is zero auto-debit, zero hidden renewal, and zero sales calls.',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  const [frameIdx, setFrameIdx] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const [sandboxTab, setSandboxTab] = useState<'mission' | 'sheet'>('mission');
  const missionTabRef = useRef<HTMLButtonElement>(null);
  const sheetTabRef = useRef<HTMLButtonElement>(null);

  const [machineInput, setMachineInput] = useState<number>(3);
  const [probes, setProbes] = useState<Array<{ x: number; y: number }>>([
    { x: 3, y: 9 },
  ]);
  const [ruleGuess, setRuleGuess] = useState<'plus6' | 'times3' | null>(null);

  const [sheetBoard, setSheetBoard] = useState<
    'CBSE' | 'Maharashtra State Board'
  >('CBSE');
  const [sheetPick, setSheetPick] = useState<number | null>(null);

  const [selectedSkillId, setSelectedSkillId] = useState<SampleSkillCode>('B2');
  const [inspectorTab, setInspectorTab] = useState<'home' | 'how'>('home');
  const [replayStepIdx, setReplayStepIdx] = useState(0);
  const [growthSkillId, setGrowthSkillId] = useState<SampleSkillCode>('B2');

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (heroPaused) return;
    const id = window.setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % HERO_FRAMES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [heroPaused]);

  const activeFrame = HERO_FRAMES[frameIdx];

  const selectedSkill = useMemo(
    () => SAMPLE_SKILLS.find((s) => s.id === selectedSkillId) ?? SAMPLE_SKILLS[3],
    [selectedSkillId]
  );

  const selectedGrowthSkill = useMemo(
    () => SAMPLE_SKILLS.find((s) => s.id === growthSkillId) ?? SAMPLE_SKILLS[3],
    [growthSkillId]
  );

  const replaySteps = [
    {
      label: 'Step 1 · First Test',
      input: '3',
      output: '9',
      thought: 'Initial guess: “Maybe the rule adds 6.”',
      detail:
        'Aarav tested 3 and saw 9. Since both +6 and ×3 give 9, a second check was needed.',
    },
    {
      label: 'Step 2 · Second Clue',
      input: '5',
      output: '15',
      thought: 'Revised idea: “5 + 6 would be 11, not 15. It must be ×3.”',
      detail:
        'Aarav compared the new output against his first guess and updated the rule calmly.',
    },
    {
      label: 'Step 3 · Final Check',
      input: '2',
      output: '6',
      thought: 'Confirmed: “×3 works on a smaller number too.”',
      detail:
        'Aarav verified one last value before locking in the final answer.',
    },
  ];
  const currentReplayStep = replaySteps[replayStepIdx] ?? replaySteps[0];

  const webPoints = useMemo(() => {
    const cx = 160;
    const cy = 155;
    const maxR = 102;
    return SAMPLE_SKILLS.map((s, idx) => {
      const angle = idx * (360 / 8);
      const r = (s.webScore / 100) * maxR;
      const pt = polarToCartesian(cx, cy, r, angle);
      const labelPt = polarToCartesian(cx, cy, maxR + 24, angle);
      return { ...s, x: pt.x, y: pt.y, lx: labelPt.x, ly: labelPt.y };
    });
  }, []);

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
      label: ['Month 1', 'Month 2', 'Month 3', 'Current'][i],
    }));
  }, [selectedGrowthSkill]);

  const linePath = lineChartPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  const areaPath = `${linePath} L 324 148 L 36 148 Z`;

  const handleSandboxTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (
      e.key === 'ArrowRight' ||
      e.key === 'ArrowLeft' ||
      e.key === 'Home' ||
      e.key === 'End'
    ) {
      e.preventDefault();
      let nextTab: 'mission' | 'sheet' = sandboxTab;
      if (e.key === 'Home') nextTab = 'mission';
      else if (e.key === 'End') nextTab = 'sheet';
      else nextTab = sandboxTab === 'mission' ? 'sheet' : 'mission';

      triggerDialTick(false);
      setSandboxTab(nextTab);
      if (nextTab === 'mission') {
        missionTabRef.current?.focus();
      } else {
        sheetTabRef.current?.focus();
      }
    }
  };

  const handleProbe = (n: number) => {
    triggerDialTick(true);
    setMachineInput(n);
    setProbes((prev) =>
      prev.some((p) => p.x === n)
        ? prev
        : [...prev.slice(-3), { x: n, y: n * 3 }]
    );
  };

  const resetMachine = () => {
    triggerDialTick(false);
    setMachineInput(3);
    setProbes([{ x: 3, y: 9 }]);
    setRuleGuess(null);
  };

  const handleStart = () => {
    triggerSoftConfirm(true);
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#142033] font-sans">
      {/* SINGLE TOP BAR — Seamless Logo Blend */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030A18]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#top" className="flex items-center shrink-0">
            <img
              src="/cubitx-logo.jpg"
              alt="CubitX"
              className="h-9 sm:h-10 w-auto object-contain mix-blend-lighten"
            />
          </a>

          <nav
            aria-label="Primary sections"
            className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300"
          >
            <a href="#why-cubitx" className="hover:text-white transition">
              Why CubitX
            </a>
            <a href="#brain-map" className="hover:text-white transition">
              Your Kid&apos;s Brain Map
            </a>
            <a href="#for-parents" className="hover:text-white transition">
              For Parents
            </a>
            <a href="#schools" className="hover:text-white transition">
              For Schools
            </a>
            <a href="#access" className="hover:text-white transition">
              Plans
            </a>
            <a href="#faq" className="hover:text-white transition">
              FAQs
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="rounded-full px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="cx-action-pill bg-[#8FA8FF] px-4 py-2 text-xs font-extrabold text-[#030A18] hover:bg-white cursor-pointer"
            >
              Take Free Thinking Test →
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* =================================================================
            01 · HERO — AI-ERA HOOK + 3-PART SYSTEM + LIVE PREVIEW
            ================================================================= */}
        <section className="grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:py-24">
          <div className="space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#142033]/12 bg-white px-3.5 py-1.5 text-xs font-medium text-[#424F63]">
              <span className="h-2 w-2 rounded-full bg-[#066869]" />
              <span>Classes 5 to 10</span>
              <span className="text-[#142033]/30">·</span>
              <span className="font-semibold text-[#142033]">
                CBSE &amp; Maharashtra State Board
              </span>
              <span className="text-[#142033]/30">·</span>
              <span>Finland&apos;s Learning Model</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[#142033] sm:text-5xl lg:text-[54px]">
              AI gives answers in seconds. Who is teaching your child to think?
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-[#424F63] sm:text-lg">
              Don&apos;t just build critical thinking—
              <strong className="font-semibold text-[#142033]">
                see how your child actually thinks.
              </strong>{' '}
              CubitX combines <strong className="text-[#142033]">Thinking Missions</strong>,{' '}
              <strong className="text-[#142033]">Chapter Challenges</strong>, and{' '}
              <strong className="text-[#142033]">Your Kid&apos;s Brain Map</strong> for
              Classes 5 to 10.
            </p>

            {/* 3-Part Core System Pill Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#142033]">
              <span className="rounded-xl border border-[#142033]/12 bg-white px-3 py-1.5">
                Thinking Missions
              </span>
              <span className="text-[#066869] font-extrabold">+</span>
              <span className="rounded-xl border border-[#142033]/12 bg-white px-3 py-1.5">
                Chapter Challenges
              </span>
              <span className="text-[#066869] font-extrabold">+</span>
              <span className="rounded-xl border border-[#066869]/30 bg-[#066869]/[0.07] px-3 py-1.5 text-[#066869]">
                Your Kid&apos;s Brain Map
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleStart}
                className="cx-action-pill bg-[#142033] px-7 py-3.5 text-sm text-white hover:bg-[#066869] cursor-pointer"
              >
                <span>Take Free Thinking Test (No Sign-Up)</span>
                <span aria-hidden="true">→</span>
              </button>

              <a
                href="#brain-map"
                className="rounded-full border border-[#142033]/20 bg-white px-6 py-3.5 text-sm font-semibold text-[#142033] hover:border-[#142033] transition"
              >
                Explore Sample Brain Map ↓
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs font-medium text-[#424F63]">
              <span>
                ✓ {FREE_DAILY_MISSIONS} Free Missions Daily + {FREE_THINKING_SHEET_LIMIT} Free Challenges/Chapter
              </span>
              <span>·</span>
              <span>✓ Zero Auto-Debit</span>
              <span>·</span>
              <span>✓ Zero Sales Calls</span>
            </div>
          </div>

          {/* LIVE MOVING PREVIEW */}
          <div
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            className="cx-soft-float"
          >
            <div className="rounded-[28px] border border-[#142033]/14 bg-white p-5 sm:p-7 shadow-[var(--shadow-device)] space-y-5">
              <div className="flex items-center justify-between gap-3 border-b border-[#142033]/10 pb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#030A18] px-1">
                    <img
                      src="/cubitx-logo.jpg"
                      alt="CubitX"
                      className="h-4 w-auto object-contain mix-blend-lighten"
                    />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-[#142033]">
                      {activeFrame.contextLine}
                    </div>
                    <div className="font-mono-tech text-[10px] text-[#424F63]">
                      {activeFrame.footnote}
                    </div>
                  </div>
                </div>

                <span
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    activeFrame.statusTone === 'teal'
                      ? 'bg-[#066869]/10 text-[#066869]'
                      : activeFrame.statusTone === 'amber'
                      ? 'bg-[#F5B942]/25 text-[#6E4700]'
                      : 'bg-[#142033]/10 text-[#142033]'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      activeFrame.statusTone === 'teal'
                        ? 'bg-[#066869]'
                        : activeFrame.statusTone === 'amber'
                        ? 'bg-[#8A5A00]'
                        : 'bg-[#142033]'
                    }`}
                  />
                  {activeFrame.statusLabel}
                </span>
              </div>

              <div key={activeFrame.id} className="cx-screen-enter space-y-4">
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#142033] leading-snug">
                  {activeFrame.title}
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#142033]/10 bg-[#F7F6F1] p-4">
                    <div className="text-[11px] font-semibold text-[#424F63]">
                      {activeFrame.leftLabel}
                    </div>
                    <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#142033]">
                      {activeFrame.leftValue}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#066869]/25 bg-[#066869]/[0.06] p-4">
                    <div className="text-[11px] font-semibold text-[#066869]">
                      {activeFrame.rightLabel}
                    </div>
                    <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#066869]">
                      {activeFrame.rightValue}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#142033]/10 bg-[#FFFDF7] px-4 py-3.5 text-xs sm:text-sm text-[#142033] leading-relaxed">
                  {activeFrame.transcript}
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-4 gap-2">
                  {HERO_FRAMES.map((frame, idx) => {
                    const isCurrent = idx === frameIdx;
                    const isPast = idx < frameIdx;
                    return (
                      <button
                        key={frame.id}
                        type="button"
                        aria-pressed={isCurrent}
                        onClick={() => {
                          triggerDialTick(false);
                          setFrameIdx(idx);
                        }}
                        className="space-y-1.5 rounded-md p-1 text-left cursor-pointer group"
                      >
                        <div className="h-1 w-full overflow-hidden rounded-full bg-[#142033]/12">
                          {isCurrent && !heroPaused ? (
                            <div
                              key={`${frame.id}-sweep`}
                              className="h-full w-full bg-[#066869] cx-progress-sweep"
                            />
                          ) : (
                            <div
                              className={`h-full transition-all ${
                                isCurrent || isPast
                                  ? 'w-full bg-[#066869]'
                                  : 'w-0 bg-[#066869]'
                              }`}
                            />
                          )}
                        </div>
                        <span
                          className={`block truncate font-mono-tech text-[10px] font-semibold ${
                            isCurrent
                              ? 'text-[#142033]'
                              : 'text-[#424F63] group-hover:text-[#142033]'
                          }`}
                        >
                          {frame.tabLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setHeroPaused((p) => !p)}
                    className="rounded px-1.5 py-0.5 font-mono-tech text-[10px] font-semibold text-[#424F63] hover:text-[#142033] cursor-pointer"
                  >
                    {heroPaused ? 'Resume live preview' : 'Pause preview'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            02 · WHY CUBITX & NEP 2020 ALIGNMENT
            ================================================================= */}
        <section id="why-cubitx" className="cx-hairline-t py-16 sm:py-24 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
              Why CubitX
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
              AI is weakening kids&apos; thinking—and changing the jobs they will compete for.
            </h2>
            <p className="text-sm sm:text-base text-[#424F63] leading-relaxed">
              Kids copy answers from AI and digests in two minutes, stop using
              their own brains, and go blank when an exam twists the question.
            </p>
          </div>

          <div className="rounded-2xl border border-[#F5B942]/45 bg-[#FFFDF7] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="shrink-0 self-start rounded-full bg-[#F5B942]/25 px-3 py-1 font-mono-tech text-[11px] font-bold text-[#6E4700]">
              Research Finding · Gerlich, 2025
            </span>
            <p className="text-xs sm:text-sm text-[#142033] leading-relaxed">
              A 2025 study found that students who rely heavily on AI tools
              score much lower on independent critical thinking. Simply put: the
              more a child lets AI or guidebooks do the work, the weaker their
              own thinking gets.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-[#142033]/12 bg-white p-6 space-y-2.5">
              <div className="font-mono-tech text-[11px] font-bold text-[#066869]">
                01 · Future Careers
              </div>
              <h3 className="font-display text-lg font-extrabold text-[#142033]">
                Future Jobs Need Thinkers, Not Just Degrees
              </h3>
              <p className="text-xs sm:text-sm text-[#424F63] leading-relaxed">
                AI can already write basic code, summarize chapters, and pass
                routine tests. Tomorrow&apos;s jobs will go to kids who spot
                mistakes, ask sharp questions, and solve new problems.
              </p>
            </div>

            <div className="rounded-3xl border border-[#142033]/12 bg-white p-6 space-y-2.5">
              <div className="font-mono-tech text-[11px] font-bold text-[#066869]">
                02 · Finland&apos;s Learning Model
              </div>
              <h3 className="font-display text-lg font-extrabold text-[#142033]">
                Built on Phenomenon-Based Learning
              </h3>
              <p className="text-xs sm:text-sm text-[#424F63] leading-relaxed">
                In Finland, schools start with real-world problems instead of
                isolated textbook facts. CubitX brings that habit from Class 5—so
                your child leads AI instead of depending on it.
              </p>
            </div>

            <div className="rounded-3xl border border-[#142033]/12 bg-white p-6 space-y-2.5">
              <div className="font-mono-tech text-[11px] font-bold text-[#066869]">
                03 · School-Level Edge
              </div>
              <h3 className="font-display text-lg font-extrabold text-[#142033]">
                Start Early (Classes 5 to 10)
              </h3>
              <p className="text-xs sm:text-sm text-[#424F63] leading-relaxed">
                Memorizing Q&amp;A only works if the exact same question comes in
                the exam. Change one word or number, and kids lose marks.
                Training their brain early fixes this for life.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#142033]/14 bg-white p-6 sm:p-8 space-y-6">
            <div className="space-y-1.5">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
                NEP 2020 &amp; School Exams
              </div>
              <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                NEP 2020 changed the rules. Marks now go to kids who understand.
              </h3>
              <p className="text-xs sm:text-sm text-[#424F63]">
                NEP 2020 (Paras 4.4–4.6) cuts down rote memorization and pushes
                real thinking in school exams.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#142033]/10 bg-[#F7F6F1] p-5 space-y-2">
                <div className="font-display text-base font-extrabold text-[#142033]">
                  CBSE (Classes 5–10)
                </div>
                <p className="text-xs sm:text-sm text-[#424F63] leading-relaxed">
                  <strong className="text-[#142033]">
                    50% of CBSE theory papers
                  </strong>{' '}
                  now ask competency, case-based, and application questions.
                  CubitX trains your child to solve unseen questions without
                  panicking.
                </p>
              </div>

              <div className="rounded-2xl border border-[#142033]/10 bg-[#F7F6F1] p-5 space-y-2">
                <div className="font-display text-base font-extrabold text-[#142033]">
                  Maharashtra State Board (SSC / Balbharati)
                </div>
                <p className="text-xs sm:text-sm text-[#424F63] leading-relaxed">
                  In the{' '}
                  <strong className="text-[#142033]">
                    80 written + 20 internal/activity
                  </strong>{' '}
                  exam pattern, twisted concept questions and{' '}
                  <em>Give Scientific Reasons</em> decide top marks. CubitX
                  builds clear <em>Balbharati</em> understanding.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            03 · LIVE INTERACTIVE SANDBOX
            ================================================================= */}
        <section id="sandbox" className="cx-hairline-t py-16 sm:py-24 space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
                Try It Yourself
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
                See how fast a first guess fools even adults.
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Choose a live demo"
              className="inline-flex rounded-full border border-[#142033]/15 bg-white p-1"
            >
              <button
                ref={missionTabRef}
                id="tab-mission"
                type="button"
                role="tab"
                aria-selected={sandboxTab === 'mission'}
                aria-controls="panel-mission"
                tabIndex={sandboxTab === 'mission' ? 0 : -1}
                onKeyDown={handleSandboxTabKeyDown}
                onClick={() => {
                  triggerDialTick(false);
                  setSandboxTab('mission');
                }}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  sandboxTab === 'mission'
                    ? 'bg-[#142033] text-white'
                    : 'text-[#424F63] hover:text-[#142033]'
                }`}
              >
                Thinking Mission
              </button>
              <button
                ref={sheetTabRef}
                id="tab-sheet"
                type="button"
                role="tab"
                aria-selected={sandboxTab === 'sheet'}
                aria-controls="panel-sheet"
                tabIndex={sandboxTab === 'sheet' ? 0 : -1}
                onKeyDown={handleSandboxTabKeyDown}
                onClick={() => {
                  triggerDialTick(false);
                  setSandboxTab('sheet');
                }}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  sandboxTab === 'sheet'
                    ? 'bg-[#142033] text-white'
                    : 'text-[#424F63] hover:text-[#142033]'
                }`}
              >
                Chapter Challenge
              </button>
            </div>
          </div>

          {sandboxTab === 'mission' ? (
            <div
              id="panel-mission"
              role="tabpanel"
              aria-labelledby="tab-mission"
              tabIndex={0}
              className="grid grid-cols-1 gap-8 rounded-[28px] border border-[#142033]/12 bg-white p-6 sm:p-10 shadow-[var(--shadow-artifact)] lg:grid-cols-[0.9fr_1.1fr] items-center"
            >
              <div className="space-y-4">
                <span className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
                  Thinking Mission Demo · Secret Machine
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                  One clue can trick you. Two clues show the truth.
                </h3>
                <p className="text-sm text-[#424F63] leading-relaxed">
                  Put numbers into this machine and watch what comes out. Most
                  kids lock in a rule after one try. Watch what happens when you
                  test a second number.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="rounded-full bg-[#F7F6F1] border border-[#142033]/12 px-3 py-1 font-mono-tech text-[11px] font-semibold text-[#142033] tabular-nums">
                    {probes.length} test{probes.length === 1 ? '' : 's'} tried
                  </span>
                  <button
                    type="button"
                    onClick={resetMachine}
                    className="rounded px-2 py-1 text-xs font-semibold text-[#424F63] hover:text-[#142033] underline underline-offset-4 cursor-pointer"
                  >
                    Reset machine
                  </button>
                </div>
              </div>

              <div className="space-y-5 rounded-2xl border border-[#142033]/12 bg-[#F7F6F1] p-5 sm:p-6">
                <div className="grid grid-cols-3 items-center gap-3 rounded-2xl border border-[#142033]/10 bg-white p-4 text-center">
                  <div>
                    <div className="font-mono-tech text-[10px] font-semibold uppercase text-[#424F63]">
                      Input
                    </div>
                    <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-[#142033]">
                      {machineInput}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="rounded-full bg-[#142033] px-3 py-1 font-mono-tech text-xs font-bold text-white">
                      Rule
                    </span>
                  </div>
                  <div>
                    <div className="font-mono-tech text-[10px] font-semibold uppercase text-[#066869]">
                      Output
                    </div>
                    <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-[#066869]">
                      {machineInput * 3}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#424F63]">
                    Tap another number to test:
                  </div>
                  <div
                    role="group"
                    aria-label="Test input numbers"
                    className="grid grid-cols-5 gap-2"
                  >
                    {[2, 3, 4, 5, 7].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={machineInput === n}
                        aria-label={`Test number ${n}`}
                        onClick={() => handleProbe(n)}
                        className={`rounded-xl border py-2.5 font-display text-base font-extrabold tabular-nums transition cursor-pointer ${
                          machineInput === n
                            ? 'border-[#142033] bg-[#142033] text-white'
                            : 'border-[#142033]/15 bg-white text-[#142033] hover:border-[#066869]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#424F63]">
                    Which rule fits every number you tested?
                  </div>
                  <div
                    role="group"
                    aria-label="Choose the hidden rule"
                    className="grid grid-cols-2 gap-2.5"
                  >
                    <button
                      type="button"
                      aria-pressed={ruleGuess === 'plus6'}
                      onClick={() => {
                        triggerDialTick(false);
                        setRuleGuess('plus6');
                      }}
                      className={`rounded-xl border p-3 text-left text-xs font-bold transition cursor-pointer ${
                        ruleGuess === 'plus6'
                          ? 'border-[#C83E2B] bg-[#F07868]/12 text-[#8F2416]'
                          : 'border-[#142033]/15 bg-white text-[#142033] hover:border-[#142033]/50'
                      }`}
                    >
                      Input + 6
                    </button>
                    <button
                      type="button"
                      aria-pressed={ruleGuess === 'times3'}
                      onClick={() => {
                        triggerSoftConfirm(true);
                        setRuleGuess('times3');
                      }}
                      className={`rounded-xl border p-3 text-left text-xs font-bold transition cursor-pointer ${
                        ruleGuess === 'times3'
                          ? 'border-[#066869] bg-[#066869]/10 text-[#066869]'
                          : 'border-[#142033]/15 bg-white text-[#142033] hover:border-[#142033]/50'
                      }`}
                    >
                      Input × 3
                    </button>
                  </div>

                  {ruleGuess === 'plus6' && (
                    <p
                      role="status"
                      className="rounded-xl border border-[#C83E2B]/30 bg-white px-3.5 py-2.5 text-xs font-medium text-[#8F2416]"
                    >
                      3 + 6 = 9 works once, but tap 5 above. 5 + 6 would be 11,
                      not 15.
                    </p>
                  )}
                  {ruleGuess === 'times3' && (
                    <p
                      role="status"
                      className="rounded-xl border border-[#066869]/30 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#066869]"
                    >
                      Fits every tested number. That is checking proof before
                      deciding.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              id="panel-sheet"
              role="tabpanel"
              aria-labelledby="tab-sheet"
              tabIndex={0}
              className="grid grid-cols-1 gap-8 rounded-[28px] border border-[#142033]/12 bg-white p-6 sm:p-10 shadow-[var(--shadow-artifact)] lg:grid-cols-[0.9fr_1.1fr] items-center"
            >
              <div className="space-y-4">
                <span className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
                  Chapter Challenge Demo · School Syllabus
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                  School chapters turned into real thinking questions.
                </h3>
                <p className="text-sm text-[#424F63] leading-relaxed">
                  Matched to your child&apos;s Class (5 to 10) and Board. No
                  memorized textbook definitions. Free gives{' '}
                  {FREE_THINKING_SHEET_LIMIT} challenges per chapter; Paid opens{' '}
                  {PAID_THINKING_SHEET_MIN}+ per chapter.
                </p>

                <div
                  role="group"
                  aria-label="Preview board"
                  className="flex flex-wrap gap-2 pt-1"
                >
                  {(['CBSE', 'Maharashtra State Board'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      aria-pressed={sheetBoard === b}
                      onClick={() => {
                        triggerDialTick(false);
                        setSheetBoard(b);
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                        sheetBoard === b
                          ? 'border-[#142033] bg-[#142033] text-white'
                          : 'border-[#142033]/18 bg-[#F7F6F1] text-[#424F63] hover:text-[#142033]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-[#142033]/12 bg-[#F7F6F1] p-5 sm:p-6">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#424F63]">
                  <span>Class 6 · {sheetBoard} · Science</span>
                  <span className="font-mono-tech text-[#066869]">
                    Step 2 · What is really happening?
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#142033] leading-relaxed">
                  Two classmates planted the same seeds in opposite corners of
                  the school garden. After three weeks, one grew much taller.
                  Which explanation misses an important clue?
                </p>

                <div className="space-y-2">
                  {[
                    '“The taller plant must have stronger seeds, because both were watered every morning.”',
                    '“Before blaming the seeds, we should check how many hours of sunlight each corner gets.”',
                  ].map((viewpoint, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-pressed={sheetPick === idx}
                      onClick={() => {
                        triggerDialTick(true);
                        setSheetPick(idx);
                      }}
                      className={`w-full rounded-xl border p-3.5 text-left text-xs sm:text-sm font-medium transition cursor-pointer ${
                        sheetPick === idx
                          ? 'border-[#066869] bg-white text-[#142033]'
                          : 'border-[#142033]/12 bg-white/80 text-[#424F63] hover:border-[#142033]/40 hover:text-[#142033]'
                      }`}
                    >
                      {viewpoint}
                    </button>
                  ))}
                </div>

                {sheetPick !== null && (
                  <p
                    role="status"
                    className="rounded-xl border border-[#066869]/25 bg-white px-4 py-3 text-xs text-[#142033]"
                  >
                    {sheetPick === 0
                      ? 'Good catch. It ignores sunlight and soil differences. Next, the child explains why in one short line of their own words.'
                      : 'That second idea actually checks the missing clue. Look at the first one: it jumps straight to seeds without checking sunlight.'}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* =================================================================
            04 · YOUR KID'S BRAIN MAP — HIGH-CONTRAST SHOWCASE WINDOW
            ================================================================= */}
        <section id="brain-map" className="cx-hairline-t py-16 sm:py-24 space-y-8">
          <div className="max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#087F80]/12 px-3.5 py-1 font-mono-tech text-[10px] font-bold uppercase tracking-[0.14em] text-[#087F80]">
              Only on CubitX · Live Brain Map Preview
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
              Your Kid&apos;s Brain Map: Don&apos;t just check marks. See how your
              child&apos;s brain works.
            </h2>
            <p className="text-sm sm:text-base text-[#424F63] leading-relaxed">
              Other apps only show a percentage score. Scroll inside the live
              window below to explore every chart, step-by-step replay, and
              growth graph included in{' '}
              <strong className="text-[#142033]">Aarav&apos;s Brain Mapping</strong>{' '}
              (personalized with your child&apos;s name after sign-in).
            </p>
          </div>

          {/* EYE-CATCHING DEEP NAVY & TEAL FRAMED SHOWCASE WINDOW */}
          <div className="rounded-[32px] border-2 border-[#087F80]/45 bg-[#030A18] p-2 sm:p-3 shadow-[0_24px_60px_-15px_rgba(3,10,24,0.38)]">
            <div className="rounded-[24px] bg-[#F2F7F6] overflow-hidden">
              {/* Window Title Bar */}
              <div className="bg-gradient-to-r from-[#030A18] via-[#0B2536] to-[#087F80] text-white px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F07868]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F5B942]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#55E2CE]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold tracking-tight">
                    Sample View: Aarav&apos;s Brain Mapping (Class 7 · CBSE)
                  </span>
                </div>
                <span className="rounded-full bg-white/15 border border-white/25 px-3 py-1 font-mono-tech text-[10px] font-bold text-[#55E2CE]">
                  Scroll inside window ↓
                </span>
              </div>

              {/* Scrollable Interior Viewport */}
              <div className="max-h-[680px] overflow-y-auto p-5 sm:p-8 space-y-10">
                {/* Top Child Header + 4 Stat Cards */}
                <div className="space-y-5">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#087F80]/15 pb-4">
                    <div>
                      <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                        Class 7 · Sample Brain Mapping
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033] mt-0.5">
                        Aarav&apos;s Brain Mapping
                      </h3>
                      <p className="text-xs sm:text-sm text-[#424F63]">
                        Step-by-step view of how Aarav checks clues, spots traps, and fixes mistakes—without marks or exam pressure.
                      </p>
                    </div>
                    <span className="rounded-full bg-[#087F80] px-3.5 py-1 text-xs font-bold text-white">
                      Last 30 days
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="rounded-2xl border border-[#087F80]/15 bg-white p-4 shadow-sm">
                      <div className="font-mono-tech text-[10px] font-bold uppercase text-[#586579]">
                        Thinking Missions
                      </div>
                      <div className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                        14
                      </div>
                      <p className="text-[11px] text-[#586579]">Puzzles explored</p>
                    </div>

                    <div className="rounded-2xl border border-[#087F80]/30 bg-white p-4 shadow-sm">
                      <div className="font-mono-tech text-[10px] font-bold uppercase text-[#087F80]">
                        Chapter Challenges
                      </div>
                      <div className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#087F80]">
                        18
                      </div>
                      <p className="text-[11px] text-[#586579]">Board-linked challenges done</p>
                    </div>

                    <div className="rounded-2xl border border-[#087F80]/15 bg-white p-4 shadow-sm">
                      <div className="font-mono-tech text-[10px] font-bold uppercase text-[#586579]">
                        Own-Word Notes
                      </div>
                      <div className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                        9
                      </div>
                      <p className="text-[11px] text-[#586579]">Written in Aarav&apos;s words</p>
                    </div>

                    <div className="rounded-2xl border border-[#087F80]/15 bg-white p-4 shadow-sm">
                      <div className="font-mono-tech text-[10px] font-bold uppercase text-[#586579]">
                        Active Days
                      </div>
                      <div className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                        12
                      </div>
                      <p className="text-[11px] text-[#586579]">Days practised this month</p>
                    </div>
                  </div>

                  {/* 4 Visual Analytical Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-3xl bg-white border border-[#087F80]/15 p-5 shadow-sm flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm font-extrabold text-[#142033]">
                          Thinking Activity
                        </h4>
                        <span className="rounded-full bg-[#087F80]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#087F80]">
                          32 actions
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-2 h-24 pt-2">
                        {[
                          { label: 'Wk 1', pct: 35, active: false },
                          { label: 'Wk 2', pct: 55, active: false },
                          { label: 'Wk 3', pct: 48, active: false },
                          { label: 'Now', pct: 88, active: true },
                        ].map((bar) => (
                          <div
                            key={bar.label}
                            className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                          >
                            <div
                              className={`w-full rounded-t-lg ${
                                bar.active ? 'bg-[#087F80]' : 'bg-[#142033]/15'
                              }`}
                              style={{ height: `${bar.pct}%` }}
                            />
                            <span className="text-[10px] font-bold text-[#586579]">
                              {bar.label}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#586579]">
                        Missions, Chapter Challenges, and clue checks logged.
                      </p>
                    </div>

                    <div className="rounded-3xl bg-[#030A18] p-5 text-white shadow-sm flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm font-extrabold text-white">
                          Skills Explored
                        </h4>
                        <span className="rounded-full bg-[#55E2CE]/20 px-2 py-0.5 text-[10px] font-extrabold text-[#55E2CE]">
                          5 of 8
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg viewBox="0 0 120 120" className="w-24 h-24">
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
                            strokeDasharray={`${(5 / 8) * 289} 289`}
                            transform="rotate(-90 60 60)"
                          />
                          <text
                            x="60"
                            y="58"
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="20"
                            fontWeight="800"
                          >
                            5/8
                          </text>
                          <text
                            x="60"
                            y="73"
                            textAnchor="middle"
                            fill="#55E2CE"
                            fontSize="8.5"
                            fontWeight="700"
                          >
                            ACTIVE SKILLS
                          </text>
                        </svg>
                      </div>
                      <p className="text-[11px] text-white/75">
                        Thinking skills practised across Missions &amp; Challenges.
                      </p>
                    </div>

                    <div className="rounded-3xl bg-white border border-[#087F80]/15 p-5 shadow-sm flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm font-extrabold text-[#142033]">
                          Clue-Testing Habit
                        </h4>
                        <span className="rounded-full bg-[#F5B942]/25 px-2 py-0.5 text-[10px] font-extrabold text-[#8A5A00]">
                          Strong
                        </span>
                      </div>
                      <div className="space-y-2.5 py-1">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-[#142033]">Tested 2+ clues</span>
                            <span className="text-[#087F80]">78%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-[#F0EFE9] overflow-hidden">
                            <div className="h-full w-[78%] rounded-full bg-[#087F80]" />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-[#586579]">First-hunch picks</span>
                            <span className="text-[#586579]">22%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-[#F0EFE9] overflow-hidden">
                            <div className="h-full w-[22%] rounded-full bg-[#F5B942]" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#586579]">
                        Aarav checks extra clues before deciding.
                      </p>
                    </div>

                    <div className="rounded-3xl bg-white border border-[#087F80]/15 p-5 shadow-sm flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm font-extrabold text-[#142033]">
                          Key Thinking Moves
                        </h4>
                        <span className="rounded-full bg-[#5267E8]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#5267E8]">
                          Stage 2
                        </span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: 'Clues checked', val: '14 / 15', color: 'bg-[#087F80]', pct: 92 },
                          { label: 'Mind shifts (Sisu)', val: '6 / 15', color: 'bg-[#5267E8]', pct: 45 },
                          { label: 'Own-word notes', val: '9 / 15', color: 'bg-[#F5B942]', pct: 60 },
                        ].map((row) => (
                          <div key={row.label} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-[#142033]">{row.label}</span>
                              <span className="text-[#586579]">{row.val}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-[#F0EFE9] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${row.color}`}
                                style={{ width: `${row.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#586579]">
                        Targets scale across the 1-year journey.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2 Inside Window: Interactive Eight Thinking Skills */}
                <div className="border-t border-[#087F80]/15 pt-8 space-y-4">
                  <h4 className="font-display text-xl font-extrabold text-[#142033]">
                    Eight Thinking Skills — Click Any Slice to Inspect
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
                    <div className="rounded-3xl bg-white border border-[#087F80]/15 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-[210px_1fr] gap-4 items-center">
                      <svg
                        viewBox="0 0 300 300"
                        className="w-full max-w-[210px] mx-auto h-auto overflow-visible"
                        role="img"
                        aria-label="Eight thinking skills wheel"
                      >
                        {SAMPLE_SKILLS.map((skill, idx) => {
                          const slice = 360 / 8;
                          const start = idx * slice + 2;
                          const end = (idx + 1) * slice - 2;
                          const mid = start + (end - start) / 2;
                          const isSelected = skill.id === selectedSkill.id;
                          const outerR = isSelected ? 138 : 128;
                          const pos = polarToCartesian(150, 150, 92, mid);
                          const meta = sampleStatusMeta(skill.status);

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
                                fillOpacity={isSelected ? 1 : 0.85}
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
                        <circle cx="150" cy="150" r="46" fill="#030A18" />
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

                      <div className="space-y-1">
                        {SAMPLE_SKILLS.map((skill) => {
                          const meta = sampleStatusMeta(skill.status);
                          const active = skill.id === selectedSkill.id;
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => {
                                triggerDialTick(true);
                                setSelectedSkillId(skill.id);
                              }}
                              className={`w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left transition cursor-pointer ${
                                active
                                  ? 'bg-[#030A18] text-white'
                                  : 'bg-[#F2F7F6] text-[#142033] hover:bg-[#E4EFEA]'
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

                    <div className="rounded-3xl bg-white border border-[#087F80]/15 p-6 shadow-sm space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-[#030A18] px-2.5 py-1 text-xs font-extrabold text-[#55E2CE]">
                            {selectedSkill.code}
                          </span>
                          <h5 className="font-display text-lg font-extrabold text-[#142033]">
                            {selectedSkill.name}
                          </h5>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            sampleStatusMeta(selectedSkill.status).badge
                          }`}
                        >
                          {sampleStatusMeta(selectedSkill.status).label}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#586579]">
                        {selectedSkill.summary}
                      </p>

                      <div className="flex gap-2 border-b border-[#142033]/10 pb-2.5">
                        <button
                          type="button"
                          onClick={() => setInspectorTab('home')}
                          className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                            inspectorTab === 'home'
                              ? 'bg-[#030A18] text-white'
                              : 'bg-[#F2F7F6] text-[#586579]'
                          }`}
                        >
                          What to notice
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectorTab('how')}
                          className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                            inspectorTab === 'how'
                              ? 'bg-[#030A18] text-white'
                              : 'bg-[#F2F7F6] text-[#586579]'
                          }`}
                        >
                          How we observe this
                        </button>
                      </div>

                      {inspectorTab === 'home' ? (
                        <div className="space-y-3">
                          <ul className="space-y-1.5 text-xs text-[#142033]">
                            {selectedSkill.noticeAtHome.map((line) => (
                              <li key={line} className="flex items-start gap-2">
                                <span className="text-[#087F80] font-bold">→</span>
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-[#087F80]/8 border border-[#087F80]/20 p-3.5">
                              <div className="text-[11px] font-extrabold text-[#087F80] mb-1">
                                What we saw
                              </div>
                              <p className="text-xs text-[#142033] leading-relaxed">
                                {selectedSkill.whatWeSaw}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-[#F2F7F6] border border-[#142033]/10 p-3.5">
                              <div className="text-[11px] font-extrabold text-[#586579] mb-1">
                                Still exploring
                              </div>
                              <p className="text-xs text-[#586579] leading-relaxed">
                                {selectedSkill.stillExploring}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-[#F2F7F6] p-4 space-y-1">
                          <div className="text-xs font-extrabold text-[#142033]">
                            Observation method
                          </div>
                          <p className="text-xs sm:text-sm text-[#586579] leading-relaxed">
                            {selectedSkill.howWeObserve}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3 Inside Window: Real Thinking Moments + Interactive Step-by-Step Replay */}
                <div className="border-t border-[#087F80]/15 pt-8 space-y-4">
                  <h4 className="font-display text-xl font-extrabold text-[#142033]">
                    Real Thinking Moments &amp; Step-by-Step Replay
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
                    <div className="space-y-3">
                      <div className="rounded-3xl bg-white border border-[#087F80]/15 p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#087F80]">
                          <span className="rounded-md bg-[#087F80]/10 px-2 py-0.5">B2</span>
                          <span>Using evidence</span>
                        </div>
                        <h5 className="font-display text-base font-extrabold text-[#142033]">
                          Tested a second input before locking in a rule
                        </h5>
                        <p className="text-xs sm:text-sm text-[#586579] leading-relaxed">
                          Aarav did not stop at the first coincidence. He ran a second check, saw it contradict +6, and switched to ×3.
                        </p>
                      </div>

                      <div className="rounded-3xl bg-white border border-[#087F80]/15 p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#087F80]">
                          <span className="rounded-md bg-[#087F80]/10 px-2 py-0.5">A1</span>
                          <span>Asking good questions</span>
                        </div>
                        <h5 className="font-display text-base font-extrabold text-[#142033]">
                          Questioned a bold claim with a tiny sample
                        </h5>
                        <p className="text-xs sm:text-sm text-[#586579] leading-relaxed">
                          Aarav paused before trusting a bold percentage and asked who was actually tested.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-[#030A18] p-6 text-white shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h5 className="font-display text-base font-extrabold text-white">
                          Step-by-Step Replay
                        </h5>
                        <span className="rounded-full bg-[#55E2CE]/15 px-3 py-0.5 text-[11px] font-bold text-[#55E2CE]">
                          Aarav&apos;s moves
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
                                ? 'bg-[#55E2CE] text-[#030A18]'
                                : 'bg-white/10 text-white/75 hover:bg-white/20'
                            }`}
                          >
                            Step {idx + 1}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white/8 p-3.5">
                          <div className="text-[11px] font-bold text-[#55E2CE]">
                            Input tried
                          </div>
                          <div className="mt-1 font-display text-2xl font-extrabold tabular-nums">
                            {currentReplayStep.input}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white/8 p-3.5">
                          <div className="text-[11px] font-bold text-[#55E2CE]">
                            Result seen
                          </div>
                          <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#55E2CE]">
                            {currentReplayStep.output}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/8 p-4 space-y-1">
                        <div className="text-xs font-extrabold text-[#F5B942]">
                          {currentReplayStep.thought}
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed">
                          {currentReplayStep.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4 Inside Window: Critical Thinking Growth + 8-Area Brain Map Web */}
                <div className="border-t border-[#087F80]/15 pt-8 space-y-5">
                  <h4 className="font-display text-xl font-extrabold text-[#142033]">
                    Critical Thinking Growth &amp; 8-Area Brain Map Web
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
                    <div className="rounded-3xl bg-white border border-[#087F80]/15 p-6 shadow-sm space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h5 className="font-display text-base font-extrabold text-[#142033]">
                            Progress Over Time · {selectedGrowthSkill.name}
                          </h5>
                          <p className="text-xs text-[#586579]">
                            Tap any skill chip below to inspect its growth curve.
                          </p>
                        </div>
                        <span className="rounded-full bg-[#087F80]/10 px-3 py-1 text-xs font-extrabold text-[#087F80]">
                          {selectedGrowthSkill.code}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {SAMPLE_SKILLS.map((s) => {
                          const active = s.id === selectedGrowthSkill.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                triggerDialTick(true);
                                setGrowthSkillId(s.id);
                              }}
                              className={`rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                                active
                                  ? 'bg-[#030A18] text-[#55E2CE]'
                                  : 'bg-[#F2F7F6] text-[#586579]'
                              }`}
                            >
                              {s.shortName}
                            </button>
                          );
                        })}
                      </div>

                      <div className="rounded-2xl bg-[#F2F7F6] p-4">
                        <svg viewBox="0 0 360 175" className="w-full h-auto overflow-visible">
                          <defs>
                            <linearGradient id="cxLandingGrowth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#087F80" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="#087F80" stopOpacity="0.02" />
                            </linearGradient>
                          </defs>
                          <path d={areaPath} fill="url(#cxLandingGrowth)" />
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

                      <div className="rounded-2xl bg-[#087F80]/8 border border-[#087F80]/20 p-3.5">
                        <div className="text-xs font-extrabold text-[#087F80] mb-0.5">
                          What this tells us about Aarav
                        </div>
                        <p className="text-xs sm:text-sm text-[#142033] leading-relaxed">
                          {selectedGrowthSkill.politeProgressNote}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-[#030A18] p-6 text-white shadow-sm flex flex-col justify-between gap-4">
                      <div>
                        <h5 className="font-display text-base font-extrabold text-white">
                          All 8 Areas · Brain Map Web
                        </h5>
                        <p className="text-xs text-white/70 mt-0.5">
                          Aarav&apos;s thinking balance across all 8 skills.
                        </p>
                      </div>

                      <div className="flex items-center justify-center">
                        <svg viewBox="0 0 320 310" className="w-full max-w-[270px] h-auto overflow-visible">
                          {[0.33, 0.66, 1].map((scale) => {
                            const ringPath =
                              SAMPLE_SKILLS.map((_, idx) => {
                                const pt = polarToCartesian(
                                  160,
                                  155,
                                  102 * scale,
                                  idx * (360 / 8)
                                );
                                return `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
                              }).join(' ') + ' Z';
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
                        Every child&apos;s web has its own shape. Smaller areas are simply new skills to explore next.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-3xl bg-white border border-[#087F80]/15 p-6 shadow-sm space-y-3">
                      <h5 className="font-display text-lg font-extrabold text-[#142033]">
                        How Aarav&apos;s reasoning shifted
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-[#F2F7F6] p-3.5 space-y-1">
                          <div className="text-xs font-extrabold text-[#586579]">
                            Earlier
                          </div>
                          <p className="text-xs sm:text-sm text-[#142033]">
                            Picked an explanation after checking just one initial clue.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[#087F80]/10 border border-[#087F80]/20 p-3.5 space-y-1">
                          <div className="text-xs font-extrabold text-[#087F80]">
                            More Recently
                          </div>
                          <p className="text-xs sm:text-sm text-[#142033]">
                            Tested an extra input and compared outputs before confirming.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-[#FFFDF7] border border-[#E6DEC8] p-6 shadow-sm flex flex-col justify-center gap-2">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-[#087F80]">
                        In Aarav&apos;s Own Words
                      </div>
                      <blockquote className="font-display text-lg sm:text-xl font-extrabold text-[#142033] leading-snug">
                        &ldquo;Wait, if it gives 9 for 3, how do we know it is not just adding 6 until we test another number?&rdquo;
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Bar of Window */}
              <div className="bg-white border-t border-[#087F80]/20 px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-[#424F63]">
                  Take the free thinking test right now to unlock your own child&apos;s live Brain Mapping.
                </p>
                <button
                  type="button"
                  onClick={handleStart}
                  className="cx-action-pill bg-[#087F80] px-5 py-2.5 text-xs text-white hover:bg-[#030A18] cursor-pointer"
                >
                  Take Free Thinking Test →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            05 · FOR PARENTS — BE A PARTNER IN YOUR CHILD'S JOURNEY
            ================================================================= */}
        <section id="for-parents" className="cx-hairline-t py-16 sm:py-24 space-y-10">
          <div className="max-w-2xl space-y-2.5">
            <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
              For Parents
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
              Be a partner in your child&apos;s thinking journey.
            </h2>
            <p className="text-sm sm:text-base text-[#424F63] leading-relaxed">
              Your encouragement shapes how your child approaches unfamiliar
              problems. CubitX gives you simple ways to stay involved and
              explore real-world questions together at home.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-[#142033]/12 bg-white p-6 space-y-2.5">
              <div className="font-mono-tech text-xs font-bold text-[#066869]">
                01 · Spark Everyday Curiosity
              </div>
              <h3 className="font-display text-lg font-extrabold text-[#142033]">
                Start a fun dinner-table conversation
              </h3>
              <p className="text-xs sm:text-sm text-[#424F63] leading-relaxed">
                After a mission on <em>Force &amp; Pressure</em>, ask:{' '}
                <em>
                  &ldquo;Why do heavy trucks have 8 or 10 wide tyres instead of 4 thin ones?&rdquo;
                </em>{' '}
                Let your child share their reasoning in their own words.
              </p>
            </div>

            <div className="rounded-3xl border border-[#142033]/12 bg-white p-6 space-y-2.5">
              <div className="font-mono-tech text-xs font-bold text-[#066869]">
                02 · Build Calm Grit (Sisu)
              </div>
              <h3 className="font-display text-lg font-extrabold text-[#142033]">
                Celebrate how they think through mistakes
              </h3>
              <p className="text-xs sm:text-sm text-[#424F63] leading-relaxed">
                Look at Your Kid&apos;s Brain Map together and say:{' '}
                <em>
                  &ldquo;I saw how you changed your approach after the first try and figured it out.&rdquo;
                </em>{' '}
                Kids grow confident when effort is valued over instant answers.
              </p>
            </div>

            <div className="rounded-3xl border border-[#142033]/12 bg-white p-6 space-y-2.5">
              <div className="font-mono-tech text-xs font-bold text-[#066869]">
                03 · Nurture a Steady Thinking Habit
              </div>
              <h3 className="font-display text-lg font-extrabold text-[#142033]">
                Short, consistent practice that builds clarity
              </h3>
              <p className="text-xs sm:text-sm text-[#424F63] leading-relaxed">
                Solving {FREE_DAILY_MISSIONS} Thinking Missions a day helps
                your child pause, check clues, and tackle tricky school
                questions with calm confidence.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================================
            06 · FOR SCHOOLS (PARTNER WITH US)
            ================================================================= */}
        <section id="schools" className="cx-hairline-t py-16 sm:py-24 space-y-10">
          <div className="max-w-3xl space-y-2.5">
            <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
              For Schools · NEP 2020 Thinking Labs
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
              Partner With Us: Bring Finnish-Style Thinking Labs to Your School
            </h2>
            <p className="text-sm sm:text-base text-[#424F63] leading-relaxed">
              Schools and parents work best together. CubitX helps Classes 5 to
              10 schools run a weekly{' '}
              <strong className="text-[#142033]">
                NEP 2020 Critical Thinking Period
              </strong>{' '}
              using Thinking Missions, Chapter Challenges, and class-level
              Brain Mapping insights—with no extra grading workload for teachers.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#142033]/14 bg-white p-7 sm:p-10 shadow-[var(--shadow-artifact)] grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#142033]/10 bg-[#F7F6F1] p-5 space-y-1.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#066869]">
                  01 · NEP 2020 Ready
                </div>
                <h3 className="font-display text-base font-extrabold text-[#142033]">
                  100% CBSE &amp; State Board Aligned
                </h3>
                <p className="text-xs text-[#424F63] leading-relaxed">
                  Directly builds the 50% competency &amp; application reasoning
                  skills required under NEP 2020.
                </p>
              </div>

              <div className="rounded-2xl border border-[#142033]/10 bg-[#F7F6F1] p-5 space-y-1.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#066869]">
                  02 · Smooth Classroom Setup
                </div>
                <h3 className="font-display text-base font-extrabold text-[#142033]">
                  No Lesson Prep or Paper Checking
                </h3>
                <p className="text-xs text-[#424F63] leading-relaxed">
                  Students solve interactive missions and chapter challenges on
                  screen with instant step-by-step insights.
                </p>
              </div>

              <div className="rounded-2xl border border-[#142033]/10 bg-[#F7F6F1] p-5 space-y-1.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#066869]">
                  03 · Principal Dashboard
                </div>
                <h3 className="font-display text-base font-extrabold text-[#142033]">
                  Class-Wise Thinking Benchmark
                </h3>
                <p className="text-xs text-[#424F63] leading-relaxed">
                  See section-wise reasoning growth across all 8 skills in a
                  positive, supportive format.
                </p>
              </div>

              <div className="rounded-2xl border border-[#142033]/10 bg-[#F7F6F1] p-5 space-y-1.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#066869]">
                  04 · Family Fee Protection
                </div>
                <h3 className="font-display text-base font-extrabold text-[#142033]">
                  100% Balance Carry-Forward
                </h3>
                <p className="text-xs text-[#424F63] leading-relaxed">
                  If a family joins first and their school partners later, their
                  remaining plan balance carries forward automatically.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#030A18] text-white p-6 sm:p-7 space-y-4">
              <span className="inline-block rounded-full bg-[#8FA8FF]/20 px-3 py-1 font-mono-tech text-[10px] font-bold uppercase tracking-wider text-[#8FA8FF]">
                For Principals &amp; Coordinators
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold">
                Start a Free 14-Day School Pilot
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Try CubitX with one section of Classes 5 to 10 in your computer
                lab or smart classroom—complete with a Principal&apos;s Thinking
                Benchmark Report at the end of 14 days.
              </p>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <a
                  href="mailto:hello@cubitx.in?subject=CubitX%2014-Day%20School%20Pilot%20Inquiry"
                  className="cx-action-pill bg-[#8FA8FF] px-5 py-3 text-xs font-extrabold text-[#030A18] hover:bg-white"
                >
                  Book a Free 14-Day School Pilot →
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/teacher')}
                  className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
                >
                  Teacher Sign In
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            07 · PLANS (SIMPLE, HONEST PRICING — ZERO AUTO-DEBIT)
            ================================================================= */}
        <section id="access" className="cx-hairline-t py-16 sm:py-24 space-y-10">
          <div className="max-w-2xl space-y-2">
            <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
              Simple Plans
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
              Start free every day. Pay once only if you want unlimited access.
            </h2>
            <p className="text-sm text-[#424F63]">
              Get {FREE_DAILY_MISSIONS} free Thinking Missions daily plus{' '}
              {FREE_THINKING_SHEET_LIMIT} free Chapter Challenges in every
              chapter—no card needed, no auto-debit, zero sales calls.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* FREE FOREVER */}
            <div className="rounded-3xl border border-[#142033]/14 bg-white p-6 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#424F63]">
                  Free Forever
                </div>
                <div className="font-display text-3xl font-extrabold text-[#142033]">
                  ₹0
                </div>
                <ul className="space-y-2 text-xs text-[#424F63]">
                  <li>✓ {FREE_DAILY_MISSIONS} Free Thinking Missions every day</li>
                  <li>✓ {FREE_THINKING_SHEET_LIMIT} Free Chapter Challenges / chapter</li>
                  <li>✓ Basic Brain Map summary</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="w-full rounded-full border border-[#142033]/25 py-3 text-xs font-extrabold text-[#142033] hover:border-[#142033] transition cursor-pointer"
              >
                Start Free Now →
              </button>
            </div>

            {/* EXPLORER — ₹999 */}
            <div className="rounded-3xl border border-[#142033]/14 bg-white p-6 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#424F63]">
                  Explorer
                </div>
                <div>
                  <span className="font-display text-3xl font-extrabold tabular-nums text-[#142033]">
                    ₹{PRICE_INR}
                  </span>
                  <span className="text-xs font-semibold text-[#424F63]">
                    {' '}
                    / year
                  </span>
                  <div className="text-[11px] text-[#424F63] mt-0.5">
                    ₹83/month · One-Time Payment
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-[#142033]">
                  <li>✓ Unlimited Thinking Missions (1 year)</li>
                  <li>✓ Full Chapter Challenges (CBSE &amp; State Board)</li>
                  <li>✓ Complete Brain Mapping step-by-step analysis</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="w-full rounded-full border border-[#142033]/25 py-3 text-xs font-extrabold text-[#142033] hover:bg-[#142033] hover:text-white transition cursor-pointer"
              >
                Get Explorer — ₹{PRICE_INR} →
              </button>
            </div>

            {/* THINKER PRO — ₹1,499 (MOST POPULAR) */}
            <div className="rounded-3xl border-2 border-[#066869] bg-white p-6 shadow-[var(--shadow-artifact)] flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#066869]">
                    Thinker Pro
                  </span>
                  <span className="rounded-full bg-[#066869]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#066869]">
                    Most Popular
                  </span>
                </div>
                <div>
                  <span className="font-display text-3xl font-extrabold tabular-nums text-[#142033]">
                    ₹1,499
                  </span>
                  <span className="text-xs font-semibold text-[#424F63]">
                    {' '}
                    / year
                  </span>
                  <div className="text-[11px] text-[#424F63] mt-0.5">
                    ₹125/month · One-Time Payment
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-[#142033]">
                  <li>✓ Everything in Explorer</li>
                  <li>✓ Deep Mistake Replays &amp; Weekly Growth Reports</li>
                  <li>✓ Weekly &amp; Monthly Thinking Championships</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="cx-action-pill w-full bg-[#142033] py-3 text-xs text-white hover:bg-[#066869] cursor-pointer"
              >
                Get Thinker Pro — ₹1,499 →
              </button>
            </div>

            {/* SCHOLAR ELITE — ₹2,499 */}
            <div className="rounded-3xl border border-[#142033]/14 bg-white p-6 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#6E4700]">
                  Scholar Elite
                </div>
                <div>
                  <span className="font-display text-3xl font-extrabold tabular-nums text-[#142033]">
                    ₹2,499
                  </span>
                  <span className="text-xs font-semibold text-[#424F63]">
                    {' '}
                    / year
                  </span>
                  <div className="text-[11px] text-[#424F63] mt-0.5">
                    just ₹208/mo — less than 1 week of tuition
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-[#142033]">
                  <li>✓ Everything in Thinker Pro</li>
                  <li>
                    ✓ <strong>Global HOTS Track:</strong> Finland
                    Phenomenon-Based model + HOTS used in Singapore, India (CBSE
                    &amp; State Board), Malaysia &amp; IB/Cambridge + SOF, Homi
                    Bhabha &amp; SilverZone Olympiads
                  </li>
                  <li>✓ Quarterly Exam &amp; Thinking Readiness Report</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="w-full rounded-full border border-[#142033]/25 py-3 text-xs font-extrabold text-[#142033] hover:bg-[#142033] hover:text-white transition cursor-pointer"
              >
                Get Scholar Elite — ₹2,499 →
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#142033]/12 bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-[#142033]">
              <strong>Have 2 kids?</strong> Add your second child at checkout
              for a <strong className="text-[#066869]">flat 20% off</strong>{' '}
              (₹799 / ₹1,199 / ₹1,999)—also applies if you add a 3rd child.
            </div>
            <div className="font-mono-tech text-[11px] text-[#424F63]">
              One-Time UPI / Card · 18% GST Included · Zero Auto-Renewal
            </div>
          </div>
        </section>

        {/* =================================================================
            08 · FAQ ACCORDION
            ================================================================= */}
        <section id="faq" className="cx-hairline-t py-16 sm:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="space-y-2">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
                Questions
              </div>
              <h2 className="font-display text-3xl font-extrabold text-[#142033]">
                Common questions parents ask.
              </h2>
            </div>

            <div className="divide-y divide-[#142033]/12 border-t border-b border-[#142033]/12">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => {
                        triggerDialTick(false);
                        setOpenFaq(isOpen ? null : idx);
                      }}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left cursor-pointer"
                    >
                      <span className="font-display text-base font-bold text-[#142033]">
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className="font-mono-tech text-lg font-medium text-[#424F63]"
                      >
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="pb-5 pr-8 text-sm text-[#424F63] leading-relaxed">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================================
            09 · BOTTOM CTA BANNER
            ================================================================= */}
        <section className="pb-16 sm:pb-24">
          <div className="rounded-[28px] bg-[#030A18] text-white p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold">
                See how your child thinks in 10 minutes.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Take the free thinking test right now—and watch Your Kid&apos;s
                Brain Map update live.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="cx-action-pill bg-[#8FA8FF] px-7 py-3.5 text-sm font-extrabold text-[#030A18] hover:bg-white cursor-pointer shrink-0"
            >
              Take Free Thinking Test →
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#142033]/12 bg-[#EFECE3]/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 text-xs text-[#424F63]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-lg bg-[#030A18] px-2.5 py-1">
              <img
                src="/cubitx-logo.jpg"
                alt="CubitX"
                className="h-4 w-auto object-contain mix-blend-lighten"
              />
            </span>
            <span className="font-display font-bold text-[#142033]">
              Train the mind behind the marks.
            </span>
          </div>
          <div>© 2026 CubitX · hello@cubitx.in</div>
        </div>
      </footer>
    </div>
  );
}