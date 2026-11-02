import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePreview, setActivePreview] = useState('secret');
  const [demoChoice, setDemoChoice] = useState<string | null>(null);
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});

  const tickerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Navigation Logic
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    closeMenu();
    
    if (targetId === '#top' || targetId === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerOffset = 82; 
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // Scroll Reveal Logic
  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      revealItems.forEach(item => item.classList.add('reveal-hidden'));
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-hidden');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealItems.forEach(item => revealObserver.observe(item));
    }
  }, []);

  // Live Ticker Animation
  useEffect(() => {
    const track = tickerRef.current;
    if (!track) return;

    let animationId: number;
    let position = 0;
    const speed = 0.5;

    const animate = () => {
      if (!isHovered) {
        position -= speed;
        if (Math.abs(position) >= track.scrollWidth / 2) {
          position = 0;
        }
        track.style.transform = `translateX(${position}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isHovered]);

  // Content Data
  const freeMissionData: Record<string, { title: string, text: string, skill: string }> = {
    secret: { title: 'Secret Machine', text: 'A hidden rule is waiting to be discovered. Look for what changes, what stays the same and what you still need to know.', skill: 'THINKING FOCUS · PATTERN AND INFERENCE' },
    balance: { title: 'Balance Detective', text: 'Something needs to be balanced. Notice the available clues and decide what further information would help.', skill: 'THINKING FOCUS · EVIDENCE AND TRADE-OFFS' },
    pattern: { title: 'Pattern Detective', text: 'Spot a possible pattern. Then test your rule instead of assuming the first answer is always right.', skill: 'THINKING FOCUS · PATTERN AND TESTING' },
    cause: { title: 'Cause Detective', text: 'Two events may be connected—but does one cause the other? Consider what else could explain what happened.', skill: 'THINKING FOCUS · CAUSE AND ALTERNATIVE EXPLANATIONS' },
    question: { title: 'Big Question', text: 'You have a chance to ask one question before deciding. Choose the question that would help you think more clearly.', skill: 'THINKING FOCUS · QUESTIONING AND MISSING INFORMATION' }
  };

  const bridgeMessages: Record<string, string> = {
    a: 'Building immediately may feel decisive—but what do we need to know before choosing its length? What could go wrong if the river is wider or faster than expected?',
    b: 'You are looking for information that could shape the design. What else might you want to find out before building?',
    c: 'Finding a shallower crossing could help. How would you check whether that area is safe for everyone?',
    d: 'Strength matters, but using all the material immediately leaves no room to adapt. What information would help you decide how much is enough?'
  };

  const handleCheckout = (price: string) => {
    alert(`Razorpay Flow Initiated for ₹${price}.\n\nDeveloper Note: The Razorpay UI requires an 'order_id' generated securely by your backend (Supabase Edge Function) to prevent price manipulation.`);
  };

  const toggleInsight = (id: string) => {
    setExpandedInsights(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tickerContent = (
    <>
      <span>QUESTION <i>✳</i></span>
      <span>EXPLORE <i>✳</i></span>
      <span>EXPERIMENT <i>✳</i></span>
      <span>DISCOVER <i>✳</i></span>
      <span>CREATE <i>✳</i></span>
      <span>DECIDE <i>✳</i></span>
    </>
  );

  return (
    <div className="landing-page" id="top">
      <header className="topbar">
        <div className="wrap nav">
          <a aria-label="CubitX home" className="brand" href="#top" onClick={(e) => scrollToSection(e, '#top')}>
            <img alt="CubitX" className="cubitx-logo" src="/cubitx-logo.jpg" />
          </a>
          <nav className={`navlinks ${isMenuOpen ? 'open' : ''}`} id="navlinks">
            <a href="#free-missions" onClick={(e) => scrollToSection(e, '#free-missions')}>Start Free</a>
            <a href="#how" onClick={(e) => scrollToSection(e, '#how')}>The Journey</a>
            <a href="#parents" onClick={(e) => scrollToSection(e, '#parents')}>Parent Insights</a>
            <a href="#why-cubitx-exists" onClick={(e) => scrollToSection(e, '#why-cubitx-exists')}>The Research</a>
            <a href="#schools" onClick={(e) => scrollToSection(e, '#schools')}>School Partners</a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, '#pricing')}>Access Plans</a>
          </nav>
          <div className="nav-actions">
            <a className="btn btn-outline" href="#how" onClick={(e) => scrollToSection(e, '#how')}>See how it works</a>
            <button className="btn btn-dark" onClick={() => navigate('/onboard')}>Start Free <span className="arrow">↗</span></button>
          </div>
          <button 
            aria-controls="navlinks" 
            aria-expanded={isMenuOpen} 
            aria-label="Open navigation menu" 
            className="menu-btn" 
            onClick={toggleMenu} 
            type="button"
          >
            {isMenuOpen ? '×' : '☰'}
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap hero-layout">
            <div className="hero-copy">
              <div className="eyebrow"><i className="live-dot"></i> Interactive adventures · Classes 5–10</div>
              <h1 className="display">AI can give your child an instant answer. <em>But do you know what makes your child think?</em></h1>
              <p className="hero-lede">At CubitX, children explore, solve little mysteries, try their ideas and discover answers on their own. Give your child the joy of figuring things out.</p>
              <div className="hero-actions">
                <button className="btn btn-dark" onClick={() => navigate('/onboard')}>Start Free <span className="arrow">↗</span></button>
                <a className="btn btn-outline" href="#how" onClick={(e) => scrollToSection(e, '#how')}>The Journey <span className="arrow">↓</span></a>
              </div>
              <p className="micro">No registration. No payment. Five adventures to begin.</p>
            </div>
            <div aria-label="Decorative illustration of a child exploring a river crossing mission" className="hero-stage">
              <div className="stage-orbit"></div><div className="stage-glow"></div>
              <div className="mission-window">
                <div className="window-bar"><span>CUBITX / MISSION 001</span><span className="window-dots"><i></i><i></i><i></i></span></div>
                <div className="mission-art"><div className="sun"></div><div className="mountain"></div><div className="mountain m2"></div><div className="river"></div><div className="wood-bridge"></div><div className="kid-figure">🧒🏽</div><span className="mission-label">THE RIVER CROSSING</span></div>
                <div className="mission-bottom"><strong>How would you get everyone across?</strong><span>01 / EXPLORE</span></div><div className="mini-progress"><i></i></div>
              </div>
              <div className="float-pill one">A new challenge awaits <b>✦</b></div><div className="float-pill two">Your idea matters. <b>↗</b></div>
            </div>
          </div>
          <div className="scroll-cue">Scroll to explore</div>
        </section>

        <div 
          aria-label="Explore, question, experiment, solve, create, discover" 
          className="ticker"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="ticker-track" ref={tickerRef}>
            {tickerContent}
            {tickerContent}
          </div>
        </div>

        <section className="section free-missions" id="free-missions">
          <div className="wrap">
            <div className="free-head reveal">
              <div><div className="section-kicker">Your first CubitX experience</div>
              <h2 className="section-title">Five free adventures.<br/>A world to explore.</h2>
              </div>
              <div className="free-head-side"><span className="free-stamp">₹0</span><p>No registration. No payment.<br/>Just five chances to think differently.</p></div>
            </div>
            <div className="free-mission-grid">
              {['secret', 'balance', 'pattern', 'cause', 'question'].map((key, index) => {
                const isFeature = key === 'secret';
                const icons: Record<string, string> = { secret: '⚙', balance: '⚖', pattern: '⌁', cause: '↗', question: '?' };
                const classes = `free-mission-card fm-${key} ${isFeature ? 'fm-feature active' : ''} reveal`;
                return (
                  <button 
                    key={key}
                    aria-pressed={activePreview === key} 
                    className={classes} 
                    onClick={() => setActivePreview(key)}
                  >
                    <span className="fm-number">0{index + 1} / {freeMissionData[key].skill.split('· ')[1]}</span>
                    <span className="fm-icon">{icons[key]}</span>
                    <strong>{freeMissionData[key].title}</strong>
                    <span className="fm-tease">{freeMissionData[key].text}</span>
                    <span className="fm-open">Preview adventure ↗</span>
                  </button>
                )
              })}
            </div>
            <div aria-live="polite" className="free-preview reveal">
              <div><span className="preview-eyebrow">SELECTED ADVENTURE</span><h3>{freeMissionData[activePreview].title}</h3><p>{freeMissionData[activePreview].text}</p></div>
              <div className="free-preview-meta"><span>{freeMissionData[activePreview].skill}</span><a className="btn btn-purple" href="#how" onClick={(e) => scrollToSection(e, '#how')}>Try a sample challenge <span className="arrow">↗</span></a></div>
            </div>
            <p className="free-note">Mission names are drawn from the CubitX adventure set. Preview descriptions are illustrative; the live experience should match the actual published missions.</p>
          </div>
        </section>

        <section className="section demo" id="how">
          <div className="wrap">
            <div className="demo-layout">
              <div className="demo-copy reveal">
                <div className="eyebrow">DON'T JUST READ ABOUT IT</div>
                <h2 className="display">Let your child experience the joy of figuring it out.</h2>
                <p>Here is a tiny taste of a CubitX-style challenge. There may be more than one sensible approach. The interesting part is the reason behind the choice.</p>
                <div className="demo-step"><span>1</span><div><b>Explore the situation</b><br/>Notice what is happening and what matters.</div></div>
                <div className="demo-step"><span>2</span><div><b>Choose an approach</b><br/>Make a decision and explain your thinking.</div></div>
                <div className="demo-step"><span>3</span><div><b>See what happens</b><br/>Use the outcome to think about what to try next.</div></div>
              </div>
              <div className="play-card reveal delay2">
                <div className="play-top"><small>TRY A MINI CHALLENGE</small></div>
                <div className="scenario"><div className="scene-emoji">🌧️ 🏞️</div><h3>The village footbridge</h3><p>Heavy rain has made the river rise. A group of villagers needs to cross safely. You have limited wood and rope. What would you do first?</p></div>
                <div className="choices">
                  {['a', 'b', 'c', 'd'].map(opt => {
                    const textOpts: Record<string, string> = { a: 'Build the longest bridge immediately.', b: 'Check the river width and current first.', c: 'Ask people where the water is shallowest.', d: 'Use all the material to make it stronger.' };
                    return (
                      <button 
                        key={opt}
                        className={`choice ${demoChoice === opt ? 'selected' : ''}`} 
                        onClick={() => setDemoChoice(opt)}
                      >
                        {textOpts[opt]}
                      </button>
                    )
                  })}
                </div>
                <div aria-live="polite" className={`feedback ${demoChoice ? 'show' : ''}`}>
                  {demoChoice && bridgeMessages[demoChoice]}
                </div>
                <button className="reset-demo" onClick={() => setDemoChoice(null)}>↻ Try another approach</button>
                <div className="demo-disclaimer">A small illustrative interaction—not a scored assessment. CubitX values the reasoning behind a choice, not a single “correct” click.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section parent-section" id="parents">
          <div className="wrap">
            <div className="parent-head reveal">
              <div className="section-kicker">A window into your child's thinking</div>
              <h2 className="section-title">See more than the answer.<br/><em>See the thinking behind it.</em></h2>
              <p className="section-intro">You are not a spectator in your child’s journey. CubitX is designed to bring you closer to the thinking behind each adventure—so you can notice their approach, understand the evidence available and encourage the next step.</p>
            </div>
            <div className="parent-explainer reveal">
              <div className="parent-explainer-lead"><strong>What you can explore in Parent Insights</strong><p>A clear view of the child’s activities and choices, with observations connected to the evidence behind them—not unsupported labels or scores.</p></div>
              <div className="parent-explainer-points">
                <div className="parent-explainer-point"><span className="parent-explainer-index">01</span><span>Activities explored and choices made</span></div>
                <div className="parent-explainer-point"><span className="parent-explainer-index">02</span><span>Thinking behaviours observed in action</span></div>
                <div className="parent-explainer-point"><span className="parent-explainer-index">03</span><span>Ideas for what to encourage next</span></div>
              </div>
            </div>
            <div className="parent-insight-grid parent-insight-grid-two">
              <article className={`parent-insight-card insight-mint reveal ${expandedInsights['evidence'] ? 'is-open' : ''}`}>
                <div className="insight-card-head">
                  <div><span className="insight-kicker">01 / THINKING EVIDENCE</span><h3>Notice the thinking behind each choice.</h3></div>
                  <button aria-expanded={!!expandedInsights['evidence']} className="insight-expand" onClick={() => toggleInsight('evidence')} type="button">{expandedInsights['evidence'] ? '−' : '+'}</button>
                </div>
                <p className="insight-copy">See where your child asks, reasons, uses clues or considers another possibility.</p>
                <div className="insight-visual evidence-visual">
                  <div className="graph-topline"><b>Evidence across adventures</b><span>ILLUSTRATIVE VIEW</span></div>
                  <svg aria-label="Illustrative evidence map" className="evidence-graph" role="img" viewBox="0 0 520 245">
                    <g className="graph-grid">
                      <path d="M118 35H498 M118 77H498 M118 119H498 M118 161H498 M118 203H498" />
                      <path d="M165 25V210 M260 25V210 M355 25V210 M450 25V210" />
                    </g>
                    <g className="graph-labels">
                      <text x="5" y="40">Questions</text><text x="5" y="82">Reasons</text><text x="5" y="124">Evidence</text><text x="5" y="166">Alternatives</text><text x="5" y="208">Reflection</text>
                      <text textAnchor="middle" x="165" y="231">01</text><text textAnchor="middle" x="260" y="231">02</text><text textAnchor="middle" x="355" y="231">03</text><text textAnchor="middle" x="450" y="231">04</text>
                    </g>
                    <g className="graph-dots">
                      <circle cx="165" cy="35" r="6"/><circle cx="260" cy="35" r="6"/><circle cx="450" cy="35" r="6"/>
                      <circle cx="165" cy="77" r="6"/><circle cx="355" cy="77" r="6"/>
                      <circle cx="260" cy="119" r="6"/><circle cx="355" cy="119" r="6"/><circle cx="450" cy="119" r="6"/>
                      <circle cx="260" cy="161" r="6"/><circle cx="450" cy="161" r="6"/>
                      <circle cx="355" cy="203" r="6"/>
                    </g>
                  </svg>
                  <div className="graph-axis"><span>Adventure 01–04</span><span>● Evidence recorded</span></div>
                </div>
                <div className="insight-more">Each dot represents an example of a behaviour noticed in an activity. It is not a mark, rank or measure of ability. In a live Parent Insight view, selecting an observation should open the original activity response and the observation based on the relevant rubric.</div>
              </article>

              <article className={`parent-insight-card insight-blue reveal ${expandedInsights['journey'] ? 'is-open' : ''}`}>
                <div className="insight-card-head">
                  <div><span className="insight-kicker">02 / DEVELOPMENT OVER TIME</span><h3>Watch evidence build across challenges.</h3></div>
                  <button aria-expanded={!!expandedInsights['journey']} className="insight-expand" onClick={() => toggleInsight('journey')} type="button">{expandedInsights['journey'] ? '−' : '+'}</button>
                </div>
                <p className="insight-copy">Look for repeated examples across different situations—not a judgement from one answer.</p>
                <div className="insight-visual timeline-visual">
                  <div className="timeline-head"><b>An evidence trail</b><span>ILLUSTRATIVE VIEW</span></div>
                  <div className="evidence-timeline">
                    <div className="timeline-event"><span className="timeline-dot"></span><span className="timeline-step">ADVENTURE 01</span><b>Asked for a missing clue</b><small>Questioning</small></div>
                    <div className="timeline-event"><span className="timeline-dot"></span><span className="timeline-step">ADVENTURE 02</span><b>Used evidence to explain a choice</b><small>Reasoning</small></div>
                    <div className="timeline-event"><span className="timeline-dot"></span><span className="timeline-step">ADVENTURE 03</span><b>Considered another possibility</b><small>Evaluation</small></div>
                  </div>
                  <div className="timeline-foot">ACTIVITY → OBSERVATION → EVIDENCE</div>
                </div>
                <div className="insight-more">Look for examples across different challenges, not a judgement from one answer. A live Parent Insight view should let you open each event, read the child’s original response, see the rubric-based observation and understand whether the evidence is isolated, repeated, uncertain or not yet available.</div>
              </article>
            </div>
            
            <div className="parent-trustline reveal">
              <div><span className="trust-icon">✳</span><p><strong>Honest insights. Never labels.</strong> If evidence is insufficient, your insights should say so. No IQ scores, public rankings or permanent labels.</p></div>
              <button className="btn btn-dark" onClick={() => navigate('/onboard')}>Start Free <span className="arrow">↗</span></button>
            </div>
            <p className="parent-demo-note">Illustrative interface only. These dots and events are examples, not real child data or a validated assessment. A live parent view must link each observation to the original activity response.</p>
          </div>
        </section>

        <section className="section research" id="why-cubitx-exists">
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">THE RESEARCH</div>
              <h2 className="display">When answers are instant, the thinking process matters even more.</h2>
              <p>Research is beginning to examine what happens when learners use AI to complete thinking tasks. The findings are nuanced—but they give parents a reason to care about how children learn, not only what they finish.</p>
            </div>
            <div className="research-grid">
              <article className="study reveal">
                <div className="source">MIT MEDIA LAB · 2025</div>
                <h3>What happens when AI does the writing?</h3>
                <div className="study-stat">54</div>
                <small>Adults took part in an exploratory essay-writing study comparing brain-only, search-engine and LLM-assisted work.</small>
                <p>The researchers reported differences in measured brain connectivity across the three groups. The study is preliminary and task-specific.</p>
                <a href="https://www.media.mit.edu/publications/your-brain-on-chatgpt/" rel="noopener noreferrer" target="_blank">Read the MIT study ↗</a>
              </article>
              <article className="study reveal delay1">
                <div className="source">CEPR DISCUSSION PAPER · 2026</div>
                <h3>Homework can improve while learning suffers.</h3>
                <div className="study-stat">−20%</div>
                <small>Monthly exam scores in a 30-month study of 26,811 students in China, following AI adoption.</small>
                <p>The discussion paper reports homework scores rising 18%, completion time falling 30% and monthly exam scores falling 20%. Losses were concentrated among patterns consistent with outsourcing homework to AI.</p>
                <a href="https://cepr.org/publications/dp21577" rel="noopener noreferrer" target="_blank">Read the discussion paper ↗</a>
              </article>
              <article className="study reveal delay2">
                <div className="source">EDUCATIONAL FIELD EXPERIMENT · 2025</div>
                <h3>How AI is used can change the outcome.</h3>
                <div className="study-stat">17%</div>
                <small>Lower unaided exam performance for students using standard GPT-4 in a high-school maths experiment.</small>
                <p>A tutor designed to provide learning support rather than simply answers did not show the same decline. Design and guidance matter.</p>
                <a href="https://pubmed.ncbi.nlm.nih.gov/40560616/" rel="noopener noreferrer" target="_blank">Read the PNAS study ↗</a>
              </article>
            </div>
            <div className="research-note reveal"><b>Important context:</b> These studies do not prove that AI makes children less intelligent, nor do they show that all AI use is harmful. They examine particular tasks, groups and learning conditions. The practical question is how to use technology without outsourcing the thinking children need to practise.</div>
            <div className="research-bottom reveal">
              <h3>Technology should support a child’s thinking—not replace the chance to develop it.</h3>
              <p>That is the idea behind CubitX: children should have opportunities to question, explore, make decisions, learn from outcomes and discover their own answers.</p>
            </div>
          </div>
        </section>

        <section className="section pricing-section" id="pricing">
          <div className="wrap">
            <div className="pricing-head reveal">
              <div className="section-kicker">ACCESS PLANS</div>
              <h2 className="section-title">Explore the plans.<br/>Start with 5 free adventures.</h2>
              <p className="section-intro">Let your child explore CubitX first. The paid plans below are shown for information only; online purchase and checkout are not available yet.</p>
              <button className="btn btn-dark pricing-start-link" onClick={() => navigate('/onboard')}>Start Free ↗</button>
            </div>
            <p className="pricing-info-note" role="note">PLAN INFORMATION ONLY · Paid-plan selection and payment are not enabled yet.</p>
            <div className="pricing-grid">
              <article className="price-card reveal">
                <div className="label">A little start</div><h3>₹49 <small>/ 7 days</small></h3><p>A simple way to explore more of CubitX.</p>
                <ul><li>Seven days of access</li><li>One-time purchase</li><li>No automatic renewal</li><li>₹49 credited towards an eligible annual upgrade within seven days</li></ul>
                <button className="btn btn-outline" onClick={() => handleCheckout('49')} style={{marginTop: 'auto'}} type="button">Select Plan</button>
              </article>
              <article className="price-card reveal">
                <div className="label">Flexible choice</div><h3>₹149 <small>/ 30 days</small></h3><p>For families who prefer a shorter commitment.</p>
                <ul><li>30 days of access per child</li><li>Manual renewal</li><li>No automatic charges</li><li>Family discount for 2–3 paid children</li></ul>
                <button className="btn btn-outline" onClick={() => handleCheckout('149')} style={{marginTop: 'auto'}} type="button">Select Plan</button>
              </article>
              <article className="price-card featured reveal">
                <div className="label">BEST VALUE</div><h3>₹999 <small style={{color: '#BFC6C0'}}>/ 12 months</small></h3><p>A full year of adventures for less than ₹3 a day.</p>
                <ul><li>12 months of access per child</li><li>Less than ₹3 per day for a full year</li><li>Manual renewal</li><li>Family discount for 2–3 paid children</li></ul>
                <button className="btn btn-dark" onClick={() => handleCheckout('999')} style={{marginTop: 'auto'}} type="button">Select Plan</button>
              </article>
            </div>
            <div className="family-discount reveal"><div><strong>One parent account. Up to three child profiles.</strong><p>A 20% family discount applies when two or three child profiles have paid subscriptions.</p></div><strong>20% FAMILY DISCOUNT</strong></div>
            <p className="pricing-foot">All prices are per child before applicable discounts. The ₹49 pass credit applies to an eligible annual upgrade completed within the seven-day pass period. All renewals are manual. No automatic charges.</p>
          </div>
        </section>

        <section aria-labelledby="schools-title" className="school-section" id="schools">
          <div className="wrap school-layout reveal">
            <div>
              <div className="section-kicker">SCHOOL PARTNERS</div>
              <h2 className="section-title" id="schools-title">Make room for thinking in your classroom.</h2>
              <p>Give students opportunities to question, investigate, experiment and solve unfamiliar problems through interactive adventures.</p>
            </div>
            <a className="btn btn-dark school-contact" href="mailto:hello@cubitx.in?subject=CubitX%20for%20Schools">Partner with CubitX <span aria-hidden="true" className="arrow">↗</span></a>
          </div>
        </section>

        <section className="section faq-section" id="faqs">
          <div className="wrap faq-layout">
            <div className="reveal"><div className="section-kicker">Good questions</div><h2 className="section-title">A few things you may wonder.</h2></div>
            <div className="faq-list reveal">
              <details><summary>What is CubitX?</summary><p>An interactive critical-thinking adventure platform for children in Classes 5–10. Children explore situations, make choices, try ideas and discover different ways of approaching problems.</p></details>
              <details><summary>Can my child try it free?</summary><p>Yes. Five free adventures are available without registration.</p></details>
              <details><summary>Is CubitX a quiz app?</summary><p>No. Children explore situations, make decisions, test ideas and explain their thinking.</p></details>
              <details><summary>Does CubitX measure intelligence?</summary><p>No. It provides opportunities to practise critical thinking; it does not claim to measure intelligence or determine permanent ability.</p></details>
              <details><summary>Can I manage multiple children?</summary><p>Yes. One parent account can manage up to three child profiles. Each child has a separate paid entitlement.</p></details>
              <details><summary>Are subscriptions automatically renewed?</summary><p>No. All renewals are manual. You will not be automatically charged.</p></details>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="wrap reveal">
            <img alt="CubitX" className="closing-logo" src="/cubitx-logo.jpg" />
            <div className="eyebrow">The next generation of thinkers starts here</div>
            <h2 className="section-title">The future belongs to those who can think.</h2>
            <p>Give your child the freedom to question, explore and discover.</p>
            <button className="btn btn-dark" onClick={() => navigate('/onboard')}>Start Free <span className="arrow">↗</span></button>
            <p className="micro">No registration. No commitment. Just curiosity.</p>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="footer-top">
            <div className="footer-brand">
              <a aria-label="CubitX home" className="footer-logo-link" href="#top" onClick={(e) => scrollToSection(e, '#top')}>
                <img alt="CubitX" className="footer-logo" src="/cubitx-logo.jpg" />
              </a>
              <p>Develop the Mind Behind the Marks.<br/>Interactive Critical-Thinking Adventures for Classes 5–10.</p>
            </div>
            <div className="footer-links">
              <div><strong>Explore</strong><a href="#free-missions" onClick={(e) => scrollToSection(e, '#free-missions')}>Start Free</a><a href="#how" onClick={(e) => scrollToSection(e, '#how')}>The Journey</a><a href="#parents" onClick={(e) => scrollToSection(e, '#parents')}>Parent Insights</a></div>
              <div><strong>Learn More</strong><a href="#why-cubitx-exists" onClick={(e) => scrollToSection(e, '#why-cubitx-exists')}>The Research</a><a href="#schools" onClick={(e) => scrollToSection(e, '#schools')}>School Partners</a><a href="#pricing" onClick={(e) => scrollToSection(e, '#pricing')}>Access Plans</a><a href="#faqs" onClick={(e) => scrollToSection(e, '#faqs')}>FAQs</a></div>
            </div>
          </div>
          <div className="footer-bottom"><span>© CubitX. All rights reserved.</span><span>www.cubitx.in</span></div>
        </div>
      </footer>

      <div className="mobile-cta">
        <button className="btn btn-dark" onClick={() => navigate('/onboard')}>Start Free <span className="arrow">↗</span></button>
      </div>
    </div>
  );
}