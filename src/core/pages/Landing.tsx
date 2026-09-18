// src/core/pages/Landing.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

/* ════════════════════════════════════════════════════════════
   BRAND TOKENS — extracted from cubitx-logo.png
   ────────────────────────────────────────────────────────────
   If the logo's blue differs from what's below, change ONLY
   BRAND.blue / blueBright / blueSoft. Everything re-skins.
   ════════════════════════════════════════════════════════════ */
const BRAND = {
  surface: '#05091a',                 // page background (from logo bg)
  surface2: '#0a1228',                // card surface
  blue: '#7b8dff',                    // PRIMARY — match logo X accent
  blueBright: '#9aaaff',              // brighter — headline emphasis
  blueSoft: '#a8b6ff',                // muted accent
  ink: '#ffffff',                     // text primary
  inkDim: 'rgba(255,255,255,0.62)',   // body
  inkFaint: 'rgba(255,255,255,0.38)', // meta
  inkGhost: 'rgba(255,255,255,0.14)', // borders
};

const thinkingLoop = [
  { n: '01', t: 'Predict',     d: 'Commit to an idea before you know the answer.' },
  { n: '02', t: 'Investigate', d: 'Look closer. Test something. Follow the evidence.' },
  { n: '03', t: 'Revise',      d: 'When reality disagrees, change your mind.' },
  { n: '04', t: 'Explain',     d: 'Put into words what changed your thinking.' },
];

const giftOptions = [
  { em: '🎁', label: 'Give the gift anyway' },
  { em: '🤔', label: 'Ask your sister why she said that' },
  { em: '💬', label: 'Ask your mom what she wants' },
  { em: '⏸️', label: 'Wait and give it to her later' },
];

const giftResponses: Record<number, string> = {
  0: 'You trusted your own judgment over a whisper. Sometimes right. Sometimes costly. Always yours.',
  1: 'You treated the whisper as information, not truth. Curiosity before conclusion — that is the habit.',
  2: 'You chose certainty over surprise. You traded the moment for the truth. That is a real trade-off.',
  3: 'You refused to decide while you were unsure. Patience is a form of thinking too.',
};

const researchCards = [
  { tag: 'MIT MEDIA LAB · 2025', big: '54',
    title: 'Participants',
    body: 'EEG study comparing people writing with ChatGPT, Google, and unaided.',
    finding: 'The ChatGPT group showed the weakest measured neural connectivity.' },
  { tag: 'TECHNION · 2025', big: '31',
    title: 'Participants',
    body: 'Children aged 6–7 compared with adults using ChatGPT in a creative task.',
    finding: 'Reported differences in cognitive-control and attention-related activity in children.' },
  { tag: 'LONGITUDINAL · 30 MONTHS', big: '26,811',
    title: 'Students',
    body: 'How AI use related to homework and exam performance over time.',
    finding: 'Homework performance rose while some exam performance declined among heavy AI users.' },
  { tag: 'TURKEY · 2025', big: 'AI',
    title: 'Two approaches',
    body: 'A mathematics study comparing AI that supplied answers vs AI that gave hints.',
    finding: 'The distinction was whether the student stayed responsible for the reasoning.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [giftChoice, setGiftChoice] = useState<number | null>(null);
  const [giftHover, setGiftHover]   = useState<number | null>(null);

  const start     = () => navigate('/onboard');
  const toMission = () =>
    document.getElementById('hero-mission')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div
      className="min-h-screen overflow-x-hidden antialiased"
      style={{ background: BRAND.surface, color: BRAND.ink, fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.01em' }}
    >
      {/* AMBIENT GLOW */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-24rem] h-[48rem] w-[48rem] -translate-x-1/2 rounded-full blur-[140px]"
             style={{ background: BRAND.blue, opacity: 0.08 }} />
        <div className="absolute right-[-14rem] top-[60rem] h-[36rem] w-[36rem] rounded-full blur-[140px]"
             style={{ background: BRAND.blue, opacity: 0.04 }} />
      </div>

      {/* NAV */}
      <header className="relative z-30">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8 md:py-6">
          <a href="/" aria-label="CubitX" className="flex items-center">
            <img src="/cubitx-logo.png" alt="CubitX" className="h-9 w-auto select-none md:h-10" draggable={false} />
          </a>

          <div className="hidden items-center gap-9 md:flex">
            {[['How it works', '#how-it-works'], ['The difference', '#difference'], ['For parents', '#parents'], ['Research', '#research']].map(([label, href]) => (
              <a key={label} href={href}
                 className="text-[13px] font-medium transition"
                 style={{ color: BRAND.inkDim }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.ink)}
                 onMouseLeave={(e) => (e.currentTarget.style.color = BRAND.inkDim)}>
                {label}
              </a>
            ))}
          </div>

          <button onClick={start}
                  className="rounded-full px-5 py-2.5 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
                  style={{ background: BRAND.blue, color: BRAND.surface, boxShadow: `0 8px 30px ${BRAND.blue}33` }}>
            Start free
          </button>
        </nav>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section className="mx-auto max-w-6xl px-5 pb-24 pt-12 md:px-8 md:pb-32 md:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8" style={{ background: BRAND.blue }} />
                <span className="text-[11px] font-bold uppercase"
                      style={{ color: BRAND.blueSoft, letterSpacing: '0.22em' }}>
                  Judgment practice for curious minds
                </span>
              </div>

              <h1 className="max-w-[16ch] text-[42px] font-semibold leading-[1.02] sm:text-[54px] md:text-[64px] lg:text-[68px]">
                The world can give your child{' '}
                <span style={{ color: BRAND.inkFaint }}>answers.</span>
                <br />
                <span style={{ color: BRAND.blueBright }}>CubitX teaches them</span>{' '}
                to find their own.
              </h1>

              <p className="mt-7 max-w-lg text-[17px] leading-[1.65] md:text-[18px]" style={{ color: BRAND.inkDim }}>
                Five-minute thinking missions where children commit to a judgment,
                watch what happens, and discover how they decide. No instant answers.
                No chatbot doing the thinking for them.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={start}
                        className="group rounded-full px-7 py-4 text-[14px] font-bold transition-transform hover:-translate-y-1"
                        style={{ background: BRAND.ink, color: BRAND.surface, boxShadow: '0 14px 44px rgba(255,255,255,0.10)' }}>
                  Start 30 days free
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                </button>

                <button onClick={toMission}
                        className="rounded-full px-7 py-4 text-[14px] font-semibold transition"
                        style={{ border: `1px solid ${BRAND.inkGhost}`, background: 'rgba(255,255,255,0.03)', color: BRAND.inkDim }}>
                  Try a real mission
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium" style={{ color: BRAND.inkFaint }}>
                <span>5 min / day</span><span>·</span><span>No card required</span><span>·</span><span>Made in India</span>
              </div>
            </div>

            {/* HERO MISSION CARD */}
            <div id="hero-mission" className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] blur-3xl"
                   style={{ background: BRAND.blue, opacity: 0.10 }} />

              <div className="relative overflow-hidden rounded-[1.75rem]"
                   style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}`, boxShadow: '0 30px 100px rgba(0,0,0,0.5)' }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${BRAND.inkGhost}` }}>
                  <div>
                    <div className="text-[9px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.18em' }}>
                      Mission 01 · Judgment
                    </div>
                    <div className="mt-1 text-[12px] font-semibold" style={{ color: BRAND.inkDim }}>
                      The Wrong Gift
                    </div>
                  </div>
                  <div className="text-[10px]" style={{ color: BRAND.inkFaint }}>1 min</div>
                </div>

                <div className="px-6 pb-7 pt-7 md:px-7">
                  <h2 className="text-[22px] font-semibold leading-[1.25] md:text-[25px]">
                    It's your mom's birthday.
                  </h2>

                  <p className="mt-4 text-[14.5px] leading-[1.7]" style={{ color: BRAND.inkDim }}>
                    You saved your own money for weeks and bought her something you thought she'd love.
                    <br /><br />
                    Your younger sister whispers:{' '}
                    <span style={{ color: BRAND.ink }}>"She told me she doesn't want that."</span>
                    <br /><br />
                    Your sister sometimes says things to get attention.
                  </p>

                  <div className="mt-7 rounded-2xl p-5"
                       style={{ background: `${BRAND.blue}12`, border: `1px solid ${BRAND.blue}33` }}>
                    <div className="text-[10.5px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.14em' }}>
                      What do you do?
                    </div>

                    <div className="mt-4 grid gap-2">
                      {giftOptions.map((opt, i) => {
                        const selected = giftChoice === i;
                        const hover    = giftHover === i && !selected;
                        return (
                          <button key={i}
                                  onClick={() => setGiftChoice(i)}
                                  onMouseEnter={() => setGiftHover(i)}
                                  onMouseLeave={() => setGiftHover(null)}
                                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                                  style={{
                                    background: selected ? BRAND.blue : hover ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
                                    border: `1px solid ${selected ? BRAND.blue : BRAND.inkGhost}`,
                                    color: selected ? BRAND.surface : BRAND.ink,
                                  }}>
                            <span className="text-[18px] leading-none">{opt.em}</span>
                            <span className="text-[13.5px] font-semibold">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {giftChoice !== null && (
                      <div className="mt-5 rounded-xl px-4 py-3.5 text-[13px] leading-[1.6]"
                           style={{ background: `${BRAND.blue}14`, border: `1px solid ${BRAND.blue}40`, color: BRAND.ink }}>
                        <span style={{ color: BRAND.blueBright, fontWeight: 700 }}>CubitX noticed · </span>
                        {giftResponses[giftChoice]}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-[10.5px]" style={{ color: BRAND.inkFaint }}>
                      {giftChoice === null ? 'Tap an answer. Any answer.' : 'There is no single right answer.'}
                    </span>
                    <button onClick={start} className="text-[12px] font-bold transition" style={{ color: BRAND.blueBright }}>
                      {giftChoice === null ? 'See what happens →' : 'Start your child →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BRAND STATEMENT */}
        <section style={{ borderTop: `1px solid ${BRAND.inkGhost}`, borderBottom: `1px solid ${BRAND.inkGhost}`, background: 'rgba(255,255,255,0.012)' }}>
          <div className="mx-auto max-w-5xl px-5 py-20 text-center md:px-8 md:py-28">
            <div className="text-[10px] font-bold uppercase" style={{ color: BRAND.inkFaint, letterSpacing: '0.22em' }}>
              The idea
            </div>
            <h2 className="mx-auto mt-6 max-w-4xl text-[30px] font-medium leading-[1.15] md:text-[46px]">
              School teaches children{' '}
              <span style={{ color: BRAND.inkFaint }}>what is known.</span>
              <br />
              The world keeps asking{' '}
              <span style={{ color: BRAND.blueBright }}>what they can figure out.</span>
            </h2>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
          <div className="max-w-2xl">
            <div className="text-[10px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.22em' }}>
              How CubitX works
            </div>
            <h2 className="mt-5 text-[34px] font-semibold leading-[1.05] md:text-[48px]">
              The child is the engine.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.7] md:text-[17px]" style={{ color: BRAND.inkDim }}>
              CubitX doesn't rush children toward the answer. It creates situations
              where the answer becomes worth discovering.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-[1.5rem] md:grid-cols-4"
               style={{ background: BRAND.inkGhost, border: `1px solid ${BRAND.inkGhost}` }}>
            {thinkingLoop.map((item) => (
              <div key={item.n} className="p-7 md:min-h-[240px] md:p-7" style={{ background: BRAND.surface2 }}>
                <div className="text-[11px] font-bold" style={{ color: BRAND.blueSoft, letterSpacing: '0.15em' }}>
                  {item.n}
                </div>
                <div className="mt-14 text-[22px] font-semibold">{item.t}</div>
                <p className="mt-3 text-[13px] leading-[1.65]" style={{ color: BRAND.inkDim }}>{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* THE DIFFERENCE */}
        <section id="difference" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-24 text-center md:px-8 md:py-36">
          <div className="text-[10px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.22em' }}>
            The difference
          </div>

          <h2 className="mt-7 text-[36px] font-semibold leading-[1.05] md:text-[56px]">
            AI is very good at
            <br />
            <span style={{ color: BRAND.inkFaint }}>giving the answer.</span>
          </h2>

          <div className="mx-auto my-9 h-px w-16" style={{ background: BRAND.blue, opacity: 0.6 }} />

          <h3 className="text-[28px] font-medium leading-[1.15] md:text-[42px]">
            That's precisely why
            <br />
            <span style={{ color: BRAND.blueBright }}>CubitX doesn't.</span>
          </h3>

          <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.75] md:text-[16px]" style={{ color: BRAND.inkDim }}>
            Your child still has to notice the problem, form a judgment, test an idea,
            meet the evidence, and decide whether to change their mind.
            That decision cannot be outsourced.
          </p>
        </section>

        {/* PARENT VALUE */}
        <section id="parents" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <div>
              <div className="text-[10px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.22em' }}>
                For parents
              </div>

              <h2 className="mt-5 text-[34px] font-semibold leading-[1.08] md:text-[46px]">
                School tells you
                <br />
                <span style={{ color: BRAND.inkFaint }}>what they scored.</span>
                <br />
                We show you
                <br />
                <span style={{ color: BRAND.blueBright }}>how they thought.</span>
              </h2>

              <p className="mt-7 max-w-lg text-[15.5px] leading-[1.75]" style={{ color: BRAND.inkDim }}>
                Every week, CubitX turns your child's play into a short, clear picture
                of the thinking habits we're noticing — not what they got right,
                but how they decide.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {['Judgment', 'Evidence revision', 'Curiosity', 'Alternatives', 'Reasoning in words'].map((tag) => (
                  <span key={tag}
                        className="rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold"
                        style={{ background: `${BRAND.blue}14`, color: BRAND.blueSoft, border: `1px solid ${BRAND.blue}28` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] p-7 md:p-8"
                 style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}`, boxShadow: '0 30px 100px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center justify-between pb-5" style={{ borderBottom: `1px solid ${BRAND.inkGhost}` }}>
                <div>
                  <div className="text-[9px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.16em' }}>
                    Weekly thinking note
                  </div>
                  <div className="mt-1 text-[13px] font-semibold" style={{ color: BRAND.inkDim }}>
                    This week's observation
                  </div>
                </div>
                <img src="/cubitx-logo.png" alt="" className="h-5 w-auto opacity-60" />
              </div>

              <div className="py-7">
                <div className="text-[10px] font-bold uppercase" style={{ color: BRAND.inkFaint, letterSpacing: '0.16em' }}>
                  What we noticed
                </div>
                <p className="mt-3 text-[17.5px] font-medium leading-[1.5]">
                  Aarav asked <span style={{ color: BRAND.blueBright }}>what else could be true</span>{' '}
                  before committing to the first explanation.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl p-4"
                       style={{ background: `${BRAND.blue}10`, border: `1px solid ${BRAND.blue}28` }}>
                    <div className="text-[9px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.14em' }}>
                      Developing
                    </div>
                    <div className="mt-2 text-[13.5px] font-semibold">Evidence revision</div>
                    <div className="mt-2 text-[11.5px] leading-[1.55]" style={{ color: BRAND.inkFaint }}>
                      More willing to change an idea after new evidence.
                    </div>
                  </div>

                  <div className="rounded-xl p-4"
                       style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BRAND.inkGhost}` }}>
                    <div className="text-[9px] font-bold uppercase" style={{ color: BRAND.inkFaint, letterSpacing: '0.14em' }}>
                      Next focus
                    </div>
                    <div className="mt-2 text-[13.5px] font-semibold">Alternative explanations</div>
                    <div className="mt-2 text-[11.5px] leading-[1.55]" style={{ color: BRAND.inkFaint }}>
                      Looking beyond the first plausible cause.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 text-[11px] leading-[1.6]"
                   style={{ borderTop: `1px solid ${BRAND.inkGhost}`, color: BRAND.inkFaint }}>
                Not a report card. A window into how your child approaches hard questions.
              </div>
            </div>
          </div>
        </section>

        {/* RESEARCH */}
        <section id="research" className="scroll-mt-20"
                 style={{ borderTop: `1px solid ${BRAND.inkGhost}`, borderBottom: `1px solid ${BRAND.inkGhost}`, background: 'rgba(255,255,255,0.012)' }}>
          <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <div className="text-[10px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.22em' }}>
                  The evidence
                </div>
                <h2 className="mt-5 text-[34px] font-semibold leading-[1.05] md:text-[48px]">
                  Why we built this.
                </h2>
                <p className="mt-5 text-[15.5px] leading-[1.75] md:text-[16.5px]" style={{ color: BRAND.inkDim }}>
                  The question isn't whether children will meet AI. They already have.
                  The question is what happens when the thinking itself becomes optional.
                </p>
              </div>
              <div className="max-w-xs text-[11px] leading-[1.6]" style={{ color: BRAND.inkFaint }}>
                Selected research and reported findings. Sources on request.
              </div>
            </div>

            <div className="mt-12 grid gap-3 md:grid-cols-2">
              {researchCards.map((c) => (
                <article key={c.tag} className="rounded-[1.4rem] p-7 transition"
                         style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[9px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.16em' }}>
                      {c.tag}
                    </div>
                    <div className="text-[24px] font-semibold" style={{ color: BRAND.inkFaint, letterSpacing: '-0.03em' }}>
                      {c.big}
                    </div>
                  </div>
                  <h3 className="mt-6 text-[21px] font-semibold">{c.title}</h3>
                  <p className="mt-2.5 text-[13px] leading-[1.65]" style={{ color: BRAND.inkDim }}>{c.body}</p>
                  <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${BRAND.inkGhost}` }}>
                    <div className="text-[9px] font-bold uppercase" style={{ color: BRAND.inkFaint, letterSpacing: '0.15em' }}>
                      Reported finding
                    </div>
                    <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: BRAND.ink }}>{c.finding}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 overflow-hidden rounded-[1.75rem]"
                 style={{ background: `${BRAND.blue}0a`, border: `1px solid ${BRAND.blue}26` }}>
              <div className="grid md:grid-cols-[0.75fr_1.25fr]">
                <div className="p-8 md:p-10"
                     style={{ borderBottom: `1px solid ${BRAND.inkGhost}`, borderRight: `1px solid ${BRAND.inkGhost}` }}>
                  <div className="text-[9px] font-bold uppercase" style={{ color: BRAND.blueBright, letterSpacing: '0.18em' }}>
                    The question we care about
                  </div>
                  <div className="mt-7 text-[24px] font-semibold leading-[1.15] md:text-[30px]">
                    Is the technology helping the child think —{' '}
                    <span style={{ color: BRAND.blueBright }}>or thinking for them?</span>
                  </div>
                </div>
                <div className="p-8 md:p-10">
                  <p className="text-[15.5px] leading-[1.75]" style={{ color: BRAND.inkDim }}>
                    Research on AI-assisted learning is developing quickly. One recurring
                    distinction is especially relevant: systems that simply produce answers
                    can reduce the learner's need to reason, while systems that offer guidance
                    can leave more of the reasoning with the learner.
                  </p>
                  <p className="mt-5 text-[13px] leading-[1.7]" style={{ color: BRAND.inkFaint }}>
                    That distinction is the foundation of our product design.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="mx-auto max-w-5xl px-5 py-24 md:px-8 md:py-32">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.22em' }}>
              One plan. One price.
            </div>
            <h2 className="mx-auto mt-5 max-w-2xl text-[34px] font-semibold leading-[1.08] md:text-[46px]">
              About ₹3 a day.
              <br />
              <span style={{ color: BRAND.blueBright }}>Less than one tuition class.</span>
            </h2>
          </div>

          <div className="mx-auto mt-12 max-w-2xl rounded-[1.75rem] p-8 md:p-10"
               style={{ background: BRAND.surface2, border: `1px solid ${BRAND.blue}44`, boxShadow: `0 30px 100px ${BRAND.blue}14` }}>
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="text-[13px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.16em' }}>
                  CubitX · Full access
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[48px] font-semibold leading-none">₹999</span>
                  <span className="text-[16px]" style={{ color: BRAND.inkDim }}>/ year</span>
                </div>
              </div>
              <div className="rounded-full px-3.5 py-1.5 text-[11px] font-bold"
                   style={{ background: `${BRAND.blue}20`, color: BRAND.blueBright }}>
                30 days free
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              {[
                'Unlimited access for your child',
                'All missions, all puzzles',
                'Parent dashboard — how they think, not what they score',
                'Weekly thinking note',
                'Cancel anytime',
              ].map((line) => (
                <div key={line} className="flex items-start gap-3">
                  <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: BRAND.blueBright }} />
                  <span className="text-[14.5px]" style={{ color: BRAND.inkDim }}>{line}</span>
                </div>
              ))}
            </div>

            <button onClick={start}
                    className="mt-9 w-full rounded-full py-4 text-[15px] font-bold transition-transform hover:-translate-y-0.5"
                    style={{ background: BRAND.ink, color: BRAND.surface, boxShadow: '0 14px 44px rgba(255,255,255,0.10)' }}>
              Start 30 days free →
            </button>

            <div className="mt-4 text-center text-[11.5px]" style={{ color: BRAND.inkFaint }}>
              No card required to start. Cancel with one tap.
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section style={{ borderTop: `1px solid ${BRAND.inkGhost}`, background: 'rgba(255,255,255,0.012)' }}>
          <div className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
            <div className="grid gap-10 md:grid-cols-3">
              {[
                ['No answer machine', 'Every mission is built around your child\u2019s reasoning, not instant generation.'],
                ['No marks obsession', 'We care about the process, not just whether the answer was right.'],
                ['Private by design', 'Your child\u2019s thinking data belongs to your family. Never sold, never advertised.'],
              ].map(([title, body]) => (
                <div key={title}>
                  <div className="text-[12px] font-bold">{title}</div>
                  <p className="mt-2 text-[12.5px] leading-[1.65]" style={{ color: BRAND.inkFaint }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-5xl px-5 py-28 text-center md:px-8 md:py-36">
          <div className="text-[10px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.22em' }}>
            Start small
          </div>

          <h2 className="mx-auto mt-6 max-w-3xl text-[38px] font-semibold leading-[1.02] md:text-[60px]">
            Give curiosity
            <br />
            <span style={{ color: BRAND.blueBright }}>somewhere to go.</span>
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-[15.5px] leading-[1.75] md:text-[16.5px]" style={{ color: BRAND.inkDim }}>
            Thirty days. Five minutes a day. See how your child decides when the answer isn't obvious.
          </p>

          <button onClick={start}
                  className="mt-9 rounded-full px-9 py-4 text-[15px] font-bold transition-transform hover:-translate-y-1"
                  style={{ background: BRAND.ink, color: BRAND.surface, boxShadow: '0 18px 54px rgba(255,255,255,0.10)' }}>
            Begin the first mission →
          </button>

          <div className="mt-5 text-[11.5px]" style={{ color: BRAND.inkFaint }}>
            Free for 30 days · ₹999/year afterwards · Cancel anytime
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${BRAND.inkGhost}` }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <img src="/cubitx-logo.png" alt="CubitX" className="h-6 w-auto opacity-80" />
          <div className="flex flex-wrap gap-5 text-[11.5px]" style={{ color: BRAND.inkFaint }}>
            <a href="#how-it-works" className="transition hover:text-white">How it works</a>
            <a href="#difference"    className="transition hover:text-white">The difference</a>
            <a href="#research"      className="transition hover:text-white">Research</a>
            <span>Made in India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
