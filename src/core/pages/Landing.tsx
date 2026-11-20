
import { useEffect, useRef, useState } from 'react';
import './Landing.css';

export default function Landing() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [selectedMission, setSelectedMission] = useState('secret');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const missionContent: Record<string, { title: string; text: string; skill: string }> = {
    secret: {
      title: 'Secret Machine',
      text: 'A hidden rule is waiting to be discovered. Look for what changes, what stays the same and what you still need to know.',
      skill: 'THINKING FOCUS · PATTERN AND INFERENCE'
    },
    balance: {
      title: 'Balance Detective',
      text: 'Look beyond what seems obvious. Decide what information would help you compare the two sides fairly.',
      skill: 'THINKING FOCUS · MISSING INFORMATION AND EVIDENCE'
    },
    pattern: {
      title: 'Pattern Detective',
      text: 'Spot a pattern, then test whether your suggested rule continues to hold in another example.',
      skill: 'THINKING FOCUS · PATTERN AND TESTING IDEAS'
    },
    cause: {
      title: 'Cause Detective',
      text: 'When two things happen together, explore what else could explain the connection before deciding what caused what.',
      skill: 'THINKING FOCUS · CAUSE AND ALTERNATIVE EXPLANATIONS'
    },
    question: {
      title: 'Big Question',
      text: 'Choose the question that would help you learn something important before making a decision.',
      skill: 'THINKING FOCUS · QUESTIONING AND INFORMATION'
    }
  };

  const feedbackMessages: Record<string, string> = {
    light: 'That is useful information to investigate. Sunlight can affect plant growth. What else would you compare before drawing a conclusion?',
    height: 'You have noticed the outcome. The next question is what might explain the difference between the plants.',
    water: 'That is another useful factor to check. Comparing water, sunlight and other conditions can help you avoid jumping to one explanation.',
    guess: 'A guess can be a starting point, but it is not evidence by itself. What could you observe or measure to check it?'
  };

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const menuButton = root.querySelector<HTMLButtonElement>('#menuBtn');
    const navigation = root.querySelector<HTMLElement>('#navlinks');

    const closeMenu = () => {
      navigation?.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');
      menuButton?.setAttribute('aria-label', 'Open navigation menu');

      if (menuButton) menuButton.textContent = '☰';
    };

    const onMenuClick = () => {
      if (!navigation || !menuButton) return;

      const open = navigation.classList.toggle('open');

      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute(
        'aria-label',
        open ? 'Close navigation menu' : 'Open navigation menu'
      );

      menuButton.textContent = open ? '×' : '☰';
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      if (target.closest('#navlinks a')) {
        closeMenu();
        return;
      }

      if (
        navigation &&
        menuButton &&
        !navigation.contains(target) &&
        !menuButton.contains(target)
      ) {
        closeMenu();
      }
    };

    menuButton?.addEventListener('click', onMenuClick);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClickOutside);

    return () => {
      menuButton?.removeEventListener('click', onMenuClick);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClickOutside);
    };
  }, []);

  const activeMission = missionContent[selectedMission];
  const activeFeedback = selectedChoice
    ? feedbackMessages[selectedChoice]
    : '';

  return (
    <div className="cubitx-landing-page" ref={pageRef}>

      <header className="topbar">
        <div className="wrap nav">

          <a className="brand" href="#top" aria-label="CubitX home">
            <img src="/cubitx-logo.png" alt="CubitX" />
          </a>

          <nav className="navlinks" id="navlinks" aria-label="Main navigation">
            <a href="#free-missions">Adventures</a>
            <a href="#how">Try a challenge</a>
            <a href="#parents">For parents</a>
            <a href="#pathways">Classes 5–10</a>
            <a href="#pricing">Pricing</a>
            <a href="#faqs">FAQs</a>
            <a href="/signin" style={{ color: 'var(--purple)', fontWeight: 800 }}>
              Log in
            </a>
          </nav>

          <div className="nav-actions">
            <a className="btn btn-outline" href="/signin">Log in</a>
            <a className="btn btn-dark" href="#free-missions">
              Try free <span className="arrow">↗</span>
            </a>
          </div>

          <button
            className="menu-btn"
            id="menuBtn"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded="false"
            aria-controls="navlinks"
          >
            ☰
          </button>

        </div>
      </header>

      <main id="top">

        <section className="hero">
          <div className="wrap hero-layout">

            <div className="hero-copy">
              <div className="hero-tag">
                <span className="hero-dot"></span>
                Interactive thinking adventures · Classes 5–10
              </div>

              <h1 className="display">
                A world of little mysteries.
                <em>A chance to think big.</em>
              </h1>

              <p className="hero-lede">
                What if learning felt less like finding the right answer
                and more like discovering something for yourself?
                CubitX turns curiosity into adventures where children
                question, experiment, solve and rethink.
              </p>

              <div className="hero-actions">
                <a className="btn btn-dark" href="#free-missions">
                  Try 5 Free Adventures <span className="arrow">↗</span>
                </a>
                <a className="btn btn-outline" href="#how">
                  Experience a challenge <span className="arrow">↓</span>
                </a>
              </div>

              <p className="micro">
                No registration. No payment. Five adventures to begin.
              </p>
            </div>

            <div className="hero-stage" aria-label="Illustration of a child exploring a river crossing challenge">
              <div className="orbit"></div>
              <div className="stage-glow"></div>

              <div className="mission-window">
                <div className="window-bar">
                  <span>CUBITX / MISSION 001</span>
                  <span className="window-dots">
                    <i></i><i></i><i></i>
                  </span>
                </div>

                <div className="mission-art">
                  <div className="sun"></div>
                  <div className="mountain"></div>
                  <div className="mountain two"></div>
                  <div className="river"></div>
                  <div className="bridge"></div>
                  <div className="child-figure">🧒🏽</div>
                  <span className="mission-label">THE RIVER CROSSING</span>
                </div>

                <div className="mission-bottom">
                  <strong>How would you get everyone across?</strong>
                  <span>EXPLORE · TEST · DISCOVER</span>
                </div>
              </div>

              <div className="float-pill one">
                A new challenge awaits <b>✦</b>
              </div>
              <div className="float-pill two">
                Your idea matters <b>↗</b>
              </div>
            </div>

          </div>
        </section>

        <div className="ticker" aria-label="Question, explore, experiment, discover, create and decide">
          <div className="ticker-track">
            {['QUESTION', 'EXPLORE', 'EXPERIMENT', 'DISCOVER', 'CREATE', 'DECIDE',
              'QUESTION', 'EXPLORE', 'EXPERIMENT', 'DISCOVER', 'CREATE', 'DECIDE'].map((item, index) => (
              <span key={index}>{item} <i>✳</i></span>
            ))}
          </div>
        </div>

        <section className="section free-missions" id="free-missions">
          <div className="wrap">

            <div className="free-head">
              <div>
                <div className="section-kicker">YOUR FIRST CUBITX EXPERIENCE</div>
                <h2 className="section-title">
                  Five free adventures.<br />A world to explore.
                </h2>
              </div>

              <div className="free-head-side">
                <span className="free-stamp">₹0</span>
                <p>No registration. No payment.<br />Just five chances to think differently.</p>
              </div>
            </div>

            <div className="mission-grid">
              <button className="mission-card feature" type="button"
                aria-pressed={selectedMission === 'secret'}
                onClick={() => setSelectedMission('secret')}>
                <span className="mission-number">01 / THE HIDDEN RULE</span>
                <span className="mission-icon">⚙</span>
                <strong>Secret Machine</strong>
                <span className="mission-tease">Can you uncover the rule behind what goes in — and what comes out?</span>
                <span className="mission-open">Explore preview ↗</span>
              </button>

              <button className="mission-card balance" type="button"
                aria-pressed={selectedMission === 'balance'}
                onClick={() => setSelectedMission('balance')}>
                <span className="mission-number">02 / FIND THE BALANCE</span>
                <span className="mission-icon">⚖</span>
                <strong>Balance Detective</strong>
                <span className="mission-tease">What information would help you compare two sides fairly?</span>
                <span className="mission-open">Explore preview ↗</span>
              </button>

              <button className="mission-card pattern" type="button"
                aria-pressed={selectedMission === 'pattern'}
                onClick={() => setSelectedMission('pattern')}>
                <span className="mission-number">03 / SPOT THE CONNECTION</span>
                <span className="mission-icon">⌁</span>
                <strong>Pattern Detective</strong>
                <span className="mission-tease">Spot a pattern. Then test whether your rule really holds.</span>
                <span className="mission-open">Explore preview ↗</span>
              </button>

              <button className="mission-card cause" type="button"
                aria-pressed={selectedMission === 'cause'}
                onClick={() => setSelectedMission('cause')}>
                <span className="mission-number">04 / WHAT CAUSED WHAT?</span>
                <span className="mission-icon">↗</span>
                <strong>Cause Detective</strong>
                <span className="mission-tease">When two things happen together, is one really the cause?</span>
                <span className="mission-open">Explore preview ↗</span>
              </button>

              <button className="mission-card question" type="button"
                aria-pressed={selectedMission === 'question'}
                onClick={() => setSelectedMission('question')}>
                <span className="mission-number">05 / ONE QUESTION</span>
                <span className="mission-icon">?</span>
                <strong>Big Question</strong>
                <span className="mission-tease">If you could ask one question before deciding, what would it be?</span>
                <span className="mission-open">Explore preview ↗</span>
              </button>
            </div>

            <div className="mission-preview" aria-live="polite">
              <div>
                <span className="preview-label">SELECTED ADVENTURE PREVIEW</span>
                <h3>{activeMission.title}</h3>
                <p>{activeMission.text}</p>
              </div>

              <div className="preview-meta">
                <span>{activeMission.skill}</span>
                <a className="btn btn-purple" href="#how">Try a sample challenge ↗</a>
              </div>
            </div>

            <p className="preview-note">
              These cards preview five introductory adventure themes. The preview
              selector does not itself launch a full mission. The actual free
              experience should match the published mission content.
            </p>

          </div>
        </section>

        <section className="section demo" id="how">
          <div className="wrap demo-layout">

            <div className="demo-copy">
              <div className="eyebrow">DON'T JUST READ ABOUT IT</div>
              <h2>Let your child experience the joy of figuring it out.</h2>
              <p>
                Here is a small sample challenge. There may be more than one
                useful question to ask. The interesting part is the reason
                behind the choice.
              </p>

              {[
                ['1', 'Predict', 'Make an initial guess.'],
                ['2', 'Investigate', 'Look for information that could support or challenge the idea.'],
                ['3', 'Reconsider', 'Look again when new information changes the picture.'],
                ['4', 'Explain', 'Share the reasons and evidence behind the conclusion.']
              ].map(([number, title, description]) => (
                <div className="demo-step" key={number}>
                  <span className="step-number">{number}</span>
                  <div><b>{title}</b><br />{description}</div>
                </div>
              ))}
            </div>

            <div className="play-card">
              <div className="play-top">
                <span>CUBITX · MINI THINKING CHALLENGE</span>
                <span>TRY IT</span>
              </div>

              <div className="scenario">
                <div className="scenario-icon">🌱</div>
                <h3>The School Garden Mystery</h3>
                <p>
                  Two plants are placed in different corners of the school.
                  One grows taller than the other. What would you want to find
                  out before deciding why?
                </p>
              </div>

              <div className="choices">
                {[
                  ['light', 'How much sunlight does each plant receive?'],
                  ['height', 'Which plant looks taller?'],
                  ['water', 'Are both plants getting the same amount of water?'],
                  ['guess', 'Which plant is probably healthier?']
                ].map(([key, label]) => (
                  <button
                    className={`choice ${selectedChoice === key ? 'selected' : ''}`}
                    type="button"
                    key={key}
                    onClick={() => setSelectedChoice(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className={`feedback ${activeFeedback ? 'show' : ''}`} aria-live="polite">
                {activeFeedback}
              </div>

              <button className="reset-demo" type="button" onClick={() => setSelectedChoice(null)}>
                Try another approach ↻
              </button>

              <p className="demo-disclaimer">
                This is an illustrative sample challenge, not a scored assessment
                or a live child progress report.
              </p>
            </div>

          </div>
        </section>

        <section className="section parent-section" id="parents">
          <div className="wrap">

            <div className="parent-head">
              <div className="section-kicker">FOR PARENTS</div>
              <h2 className="section-title">
                See more than the answer. See the thinking behind it.
              </h2>
              <p className="section-intro">
                You are not a spectator in your child's journey. Parent Space
                is designed to help you understand what your child explored,
                which behaviours were observed and what the available evidence
                can — and cannot — tell you.
              </p>
              <p className="parent-promise">
                Answers are everywhere.
                <strong>The joy is in figuring things out.</strong>
              </p>
            </div>

            <div className="parent-intro-card">
              <div>
                <h3>What should a parent be able to discover?</h3>
                <p>
                  A window into a child's learning journey — not a marksheet,
                  intelligence test or judgement of ability.
                </p>
              </div>

              <div className="parent-points">
                <div className="parent-point"><span>01</span> Activities explored and choices made</div>
                <div className="parent-point"><span>02</span> Thinking behaviours observed in action</div>
                <div className="parent-point"><span>03</span> Evidence behind each observation</div>
                <div className="parent-point"><span>04</span> What remains unknown and what to explore next</div>
              </div>
            </div>

            <div className="parent-feature-grid">
              <article className="parent-feature mint">
                <span className="feature-index">01 / SHOW ME THE MOMENT</span>
                <h3>Don't just read what happened. See the moment.</h3>
                <p>
                  A parent should be able to open an observation and inspect
                  the recorded mission interaction — the actual input, output,
                  choice or revision behind it.
                </p>
                <div className="feature-demo">
                  <strong>Illustrative replay preview</strong>
                  <small>Secret Machine · Input 3 → Output 9</small>
                  <small>Recorded action → evidence → explanation</small>
                </div>
                <span className="parent-feature-link">Traceable moments · Read-only replay</span>
              </article>

              <article className="parent-feature blue">
                <span className="feature-index">02 / THE NOT-BROKEN SIGNAL</span>
                <h3>Every learning journey has its own rhythm.</h3>
                <p>
                  No lost streaks. No missed-day penalties. No warning that a
                  child is falling behind. A pause in CubitX activity is simply
                  a pause in CubitX activity.
                </p>
                <div className="feature-demo">
                  <strong>Whenever curiosity returns</strong>
                  <small>Your child can continue exploring whenever they are ready.</small>
                  <small>No guilt. No artificial urgency.</small>
                </div>
                <span className="parent-feature-link">A calmer approach to learning</span>
              </article>

              <article className="parent-feature blue">
                <span className="feature-index">03 / INVISIBLE RIGOR</span>
                <h3>Simple explanations. Serious thinking underneath.</h3>
                <p>
                  Parents should be able to understand a thinking behaviour
                  in everyday language, while educators can inspect the
                  framework definition and evidence requirements.
                </p>
                <div className="feature-demo">
                  <strong>Two ways to understand an observation</strong>
                  <small>What this means at home</small>
                  <small>Framework science · Master Framework V1.2</small>
                </div>
                <span className="parent-feature-link">Accessible and evidence-led</span>
              </article>

              <article className="parent-feature mint">
                <span className="feature-index">04 / THINKING MILESTONE</span>
                <h3>Keep a genuine moment of curiosity.</h3>
                <p>
                  A family keepsake can feature an eligible verbatim question
                  or realisation from the child — without scores, grades
                  or public rankings.
                </p>
                <div className="feature-demo">
                  <strong>“But how do we know that is the correct rule?”</strong>
                  <small>Illustrative quotation · Not an actual child record</small>
                </div>
                <span className="parent-feature-link">The child's own voice comes first</span>
              </article>
            </div>

            <div className="parent-trust">
              <h3>What we know — and what we don't.</h3>
              <p>
                One activity is one moment. A repeated pattern requires varied,
                valid observations. Missing evidence is not a weakness, and
                completing more missions does not automatically prove improvement.
                CubitX should explain what happened, what it may suggest, what
                remains unknown and where the evidence came from.
              </p>
            </div>

            <p className="parent-preview-note">
              Parent Space features shown here describe the intended experience.
              Replay, reporting and milestone-card availability depends on the
              relevant product functionality and verified records being implemented.
              The examples above are illustrative, not actual child reports.
            </p>

          </div>
        </section>

        <section className="section research" id="why-cubitx-exists">
          <div className="wrap">
            <div className="section-kicker">WHY CUBITX EXISTS</div>
            <h2 className="section-title">
              Knowing an answer is not the same as knowing how to think.
            </h2>
            <p className="section-intro">
              Children need opportunities to question, investigate, test ideas
              and reason through unfamiliar situations — not only recall information.
            </p>

            <div className="research-grid">
              <article className="study">
                <span>ACTIVE PARTICIPATION</span>
                <h3>Learning involves doing.</h3>
                <p>
                  Children need opportunities to engage with ideas, explain
                  their reasoning and test their understanding — not only
                  receive information.
                </p>
              </article>

              <article className="study">
                <span>REFLECTION</span>
                <h3>Notice how you are thinking.</h3>
                <p>
                  Planning, monitoring and reconsidering an approach can help
                  learners become more aware of how they work through a challenge.
                </p>
              </article>

              <article className="study">
                <span>EVIDENCE AND JUDGEMENT</span>
                <h3>Good decisions need reasons.</h3>
                <p>
                  Considering evidence, alternatives and uncertainty gives
                  children opportunities to practise thoughtful judgement.
                </p>
              </article>
            </div>

            <div className="research-note">
              These are the learning principles behind the CubitX experience.
              They are not claims that CubitX has already demonstrated a measured
              improvement in learning outcomes. Product effectiveness must be
              evaluated separately.
            </div>
          </div>
        </section>

        <section className="section" id="pathways">
          <div className="wrap">
            <div className="section-kicker">A JOURNEY THAT GROWS</div>

            <div className="path-head">
              <h2 className="section-title">Room to grow, one challenge at a time.</h2>
              <p className="section-intro">
                Different age groups need different kinds of challenges.
                CubitX is designed to grow with the learner.
              </p>
            </div>

            <div className="path-grid">
              <article className="path-card foundation">
                <div>
                  <span className="grade">CLASSES 5–7 · TIER 1</span>
                  <h3>Foundation Explorers</h3>
                  <p>
                    Build confidence through observation, curiosity,
                    simple investigations and everyday problem-solving.
                  </p>
                </div>
                <div className="path-tags">
                  <span>Observe</span><span>Question</span><span>Explore</span>
                </div>
              </article>

              <article className="path-card advanced">
                <div>
                  <span className="grade">CLASSES 8–10 · TIER 2</span>
                  <h3>Advanced Explorers</h3>
                  <p>
                    Take on more layered challenges involving evidence,
                    trade-offs, uncertainty and decisions.
                  </p>
                </div>
                <div className="path-tags">
                  <span>Investigate</span><span>Evaluate</span><span>Decide</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="family-section">
          <div className="wrap family-layout">
            <div>
              <div className="eyebrow">A FAMILY JOURNEY</div>
              <h2>Every child deserves the space to think in their own way.</h2>
              <p>
                One parent-owned family account can support up to three child
                profiles. Each child has their own learning journey and needs
                a separate paid entitlement for paid access.
              </p>
            </div>

            <div className="family-bubbles" aria-label="Illustration of a family">
              <span className="family-bubble">🧒🏽</span>
              <span className="family-bubble">👧🏽</span>
              <span className="family-bubble">🧑🏽</span>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="wrap">
            <div className="pricing-head">
              <div className="section-kicker">SIMPLE, TRANSPARENT ACCESS</div>
              <h2 className="section-title">Choose the pace that works for your family.</h2>
              <p className="section-intro">
                Start with five free adventures. When you are ready,
                choose a plan. All renewals are manual — there are no
                automatic charges.
              </p>
            </div>

            <div className="pricing-info">
              PLAN INFORMATION ONLY · PAID CHECKOUT IS NOT ENABLED YET
            </div>

            <div className="pricing-grid">
              <article className="price-card">
                <span className="price-label">A first step</span>
                <h3>₹49 <small>/ 7 days</small></h3>
                <p>A short introduction to the CubitX adventure experience.</p>
                <ul>
                  <li>7 days of access</li>
                  <li>One-time pass</li>
                  <li>No automatic renewal</li>
                </ul>
              </article>

              <article className="price-card featured">
                <span className="price-label">For regular explorers</span>
                <h3>₹149 <small>/ 30 days</small></h3>
                <p>More time to explore, practise and discover.</p>
                <ul>
                  <li>30 days from activation</li>
                  <li>Manual renewal</li>
                  <li>No automatic charges</li>
                </ul>
              </article>

              <article className="price-card">
                <span className="price-label">The longer journey</span>
                <h3>₹999 <small>/ 12 months</small></h3>
                <p>A year of opportunities to explore and practise thinking.</p>
                <ul>
                  <li>12 months from activation</li>
                  <li>Manual renewal</li>
                  <li>No automatic charges</li>
                </ul>
              </article>
            </div>

            <div className="family-discount">
              <div>
                <strong>Growing together?</strong>
                <p>
                  Families with two or three paid child profiles receive
                  a 20% family discount.
                </p>
              </div>
              <strong>Save 20%</strong>
            </div>

            <p className="pricing-foot">
              Prices are per child, before applicable family or approved school
              discounts. The ₹49 pass may be credited in full towards the same
              child's annual plan upgrade during the pass's seven-day validity,
              subject to the published terms. Payment links and checkout will
              be added when payment integration is ready.
            </p>
          </div>
        </section>

        <section className="school-section" id="schools">
          <div className="wrap school-layout">
            <div>
              <div className="section-kicker">FOR SCHOOLS</div>
              <h2 className="section-title">Make room for thinking in your classroom.</h2>
              <p>
                Give students opportunities to question, investigate,
                experiment and solve unfamiliar problems through interactive
                adventures.
              </p>
            </div>

            <a className="btn btn-dark" href="mailto:hello@cubitx.in?subject=CubitX%20for%20Schools">
              Partner with CubitX ↗
            </a>
          </div>
        </section>

        <section className="section" id="faqs">
          <div className="wrap faq-layout">
            <div>
              <div className="section-kicker">A FEW THINGS YOU MAY WONDER</div>
              <h2 className="section-title">Before you begin.</h2>
              <p className="section-intro">
                A little clarity for families exploring CubitX.
              </p>
            </div>

            <div className="faq-list">
              <details>
                <summary>Which classes is CubitX designed for?</summary>
                <p>
                  CubitX is designed for Classes 5–10. The learning pathways
                  are grouped into Classes 5–7 and Classes 8–10, with challenges
                  suited to each stage.
                </p>
              </details>

              <details>
                <summary>Can my child try CubitX without registering?</summary>
                <p>
                  The introductory experience offers five free adventures
                  without registration. Guest activity evidence exists only
                  during the current session; closing the session may lose
                  that evidence.
                </p>
              </details>

              <details>
                <summary>Does CubitX give children marks or IQ scores?</summary>
                <p>
                  CubitX is designed around evidence-linked observations
                  of activity, not IQ scores, public rankings or fixed labels.
                  One activity is not enough to make a stable judgement about
                  a child.
                </p>
              </details>

              <details>
                <summary>What can parents see?</summary>
                <p>
                  Parent Space is intended to show activities explored,
                  responses or choices, observed thinking in action,
                  what remains unknown and practical ideas for a
                  parent-child conversation. Actual reports must be based
                  only on recorded activity and validated observation rules.
                </p>
              </details>

              <details>
                <summary>How many children can one family account support?</summary>
                <p>
                  One parent-owned family account can support up to three
                  child profiles. Each child needs a separate paid and
                  active entitlement for paid access.
                </p>
              </details>

              <details>
                <summary>Are paid plans and payments available now?</summary>
                <p>
                  The prices shown are plan information only. Paid-plan
                  selection and payment are not enabled yet. The five
                  introductory adventures are free.
                </p>
              </details>

              <details>
                <summary>Does a subscription renew automatically?</summary>
                <p>
                  No. The current pricing decision is manual renewal,
                  with no automatic charges.
                </p>
              </details>

              <details>
                <summary>Can schools use CubitX?</summary>
                <p>
                  Schools can contact CubitX to discuss a possible relationship.
                  School access and staff permissions must be separately
                  authorised.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="final-cta" id="start">
          <div className="wrap">
            <img src="/cubitx-logo.png" alt="CubitX" loading="lazy" />
            <div className="section-kicker">START WITH CURIOSITY</div>
            <h2>Give your child the joy of figuring things out.</h2>
            <p>
              Five free adventures. No registration. A little room to question,
              explore and discover.
            </p>
            <a className="btn btn-dark" href="#free-missions">
              Try 5 Free Adventures ↗
            </a>
          </div>
        </section>

      </main>

      <footer>
        <div className="wrap">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#top" aria-label="CubitX home">
                <img src="/cubitx-logo.png" alt="CubitX" loading="lazy" />
              </a>
              <p>
                Interactive adventures that give children space to question,
                explore and think for themselves.
              </p>
            </div>

            <div className="footer-links">
              <div>
                <strong>Explore</strong>
                <a href="#free-missions">Free adventures</a>
                <a href="#how">How it works</a>
                <a href="#parents">For parents</a>
              </div>

              <div>
                <strong>Learn more</strong>
                <a href="#why-cubitx-exists">Why CubitX</a>
                <a href="#schools">For schools</a>
                <a href="#pricing">Pricing</a>
                <a href="#faqs">FAQs</a>
              </div>

              <div>
                <strong>Contact</strong>
                <a href="mailto:hello@cubitx.in">hello@cubitx.in</a>
                <a href="https://www.cubitx.in">www.cubitx.in</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 CubitX. All rights reserved.</span>
            <span>Develop the mind behind the marks.</span>
          </div>
        </div>
      </footer>

      <div className="mobile-cta">
        <a className="btn btn-dark" href="#free-missions">
          Try 5 Free Adventures ↗
        </a>
      </div>

    </div>
  );
}
