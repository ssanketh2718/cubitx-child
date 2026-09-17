import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      {/* NAV */}
      <nav className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <Logo size={28} />
        <button
          onClick={() => navigate('/onboard')}
          className="px-5 py-2 rounded-full bg-white text-navy-900 text-sm font-bold hover:bg-white/90 transition"
        >
          Start
        </button>
      </nav>

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <div className="text-[13px] tracking-[0.15em] uppercase text-blue-300 font-bold mb-5">
          A quiet experiment on children's minds
        </div>
        <h1 className="text-[34px] md:text-[44px] leading-[1.15] font-bold tracking-tight mb-6">
          AI is changing how children think.
          <br />
          <span className="text-blue-300">Not always for the better.</span>
        </h1>
        <p className="text-white/60 text-[17px] leading-[1.75] max-w-2xl">
          The most powerful learning tools in history arrived in our children's
          hands in less than four years. The early research is troubling. This
          is what we know — and what we're doing about it.
        </p>
      </section>

      {/* SECTION 1: Brain activity */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-white/[0.06]">
        <div className="text-[12px] tracking-[0.12em] uppercase text-blue-300 font-bold mb-4">
          01 — What happens inside the brain
        </div>
        <h2 className="text-[26px] md:text-[30px] font-bold tracking-tight mb-8 leading-[1.3]">
          When children use AI to write, fewer regions of the brain
          light up.
        </h2>

        <div className="space-y-5 text-[15.5px] leading-[1.8] text-white/70">
          <p>
            In 2025, researchers at MIT Media Lab placed EEG caps on 54
            participants and asked them to write essays. One group used
            ChatGPT. One group used Google. One group used only their own
            minds.
          </p>
          <p>
            The results were unambiguous. The ChatGPT group showed the{' '}
            <span className="text-white">
              weakest neural connectivity
            </span>{' '}
            — specifically in networks associated with memory, attention, and
            executive function. Participants had more difficulty recalling and
            quoting material they had just written. The AI-assisted essays
            were more linguistically similar to one another and were associated
            with lower feelings of ownership.
          </p>
          <p className="text-[13.5px] text-white/40 italic">
            Source: Kosmyna et al., "Your Brain on ChatGPT: Accumulation of
            Cognitive Debt when Using an AI Assistant for Essay Writing Task,"
            MIT Media Lab, 2025.
          </p>
        </div>
      </section>

      {/* SECTION 2: Children vs adults */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-white/[0.06]">
        <div className="text-[12px] tracking-[0.12em] uppercase text-blue-300 font-bold mb-4">
          02 — Why children are different
        </div>
        <h2 className="text-[26px] md:text-[30px] font-bold tracking-tight mb-8 leading-[1.3]">
          Children's brains respond to AI differently from adults'.
        </h2>

        <div className="space-y-5 text-[15.5px] leading-[1.8] text-white/70">
          <p>
            A 2025 fMRI study at Technion–Israel Institute of Technology asked
            15 children (aged 6–7) and 16 adults to design a store using
            ChatGPT while their brains were scanned.
          </p>
          <p>
            Adults' creative output with ChatGPT was generally on par with
            their baseline creativity. But{' '}
            <span className="text-white">
              children who scored high on creativity tests produced stores no
              more creative than children who scored lower
            </span>
            . The fMRI detected less synchronized blood flow in regions
            associated with attention and information processing — in the
            children, not the adults.
          </p>
          <p className="text-[13.5px] text-white/40 italic">
            Source: Horowitz-Kraus et al., "Lower engagement of cognitive
            control, attention, modulation networks and lower creativity in
            children while using ChatGPT: an fMRI study," Technion, 2025.
          </p>
        </div>
      </section>

      {/* SECTION 3: The long-term data */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-white/[0.06]">
        <div className="text-[12px] tracking-[0.12em] uppercase text-blue-300 font-bold mb-4">
          03 — What two years of data tells us
        </div>
        <h2 className="text-[26px] md:text-[30px] font-bold tracking-tight mb-8 leading-[1.3]">
          Homework scores went up. Exam scores went down.
        </h2>

        <div className="space-y-5 text-[15.5px] leading-[1.8] text-white/70">
          <p>
            A 30-month study followed over 26,000 secondary school students
            in central China. When they started using AI:
          </p>
          <div className="grid grid-cols-2 gap-3 my-6">
            <div className="rounded-xl border border-green/20 bg-green/[0.06] p-5">
              <div className="text-[32px] font-bold text-green leading-none mb-2">
                +18%
              </div>
              <div className="text-[13px] text-white/60 font-medium">
                Homework scores rose
              </div>
            </div>
            <div className="rounded-xl border border-green/20 bg-green/[0.06] p-5">
              <div className="text-[32px] font-bold text-green leading-none mb-2">
                −30%
              </div>
              <div className="text-[13px] text-white/60 font-medium">
                Time spent on assignments
              </div>
            </div>
            <div className="rounded-xl border border-error/20 bg-error/[0.06] p-5">
              <div className="text-[32px] font-bold text-error leading-none mb-2">
                −24%
              </div>
              <div className="text-[13px] text-white/60 font-medium">
                High school exam scores
              </div>
            </div>
            <div className="rounded-xl border border-error/20 bg-error/[0.06] p-5">
              <div className="text-[32px] font-bold text-error leading-none mb-2">
                −18%
              </div>
              <div className="text-[13px] text-white/60 font-medium">
                College entrance exam scores
              </div>
            </div>
          </div>
          <p>
            The pattern was clear: students who outsourced their homework
            lost ground on tests that required them to think without AI.
            Those who still put in the work saw little decline.
          </p>
          <p className="text-[13.5px] text-white/40 italic">
            Source: Study of 26,811 secondary students, central China, 2025.
          </p>
        </div>
      </section>

      {/* SECTION 4: The guardrails */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-white/[0.06]">
        <div className="text-[12px] tracking-[0.12em] uppercase text-blue-300 font-bold mb-4">
          04 — The line that matters
        </div>
        <h2 className="text-[26px] md:text-[30px] font-bold tracking-tight mb-8 leading-[1.3]">
          Not all AI use is the same. The difference is whether the child is
          still thinking.
        </h2>

        <div className="space-y-5 text-[15.5px] leading-[1.8] text-white/70">
          <p>
            A Turkish study tested two types of AI tutors with high school
            students learning maths.
          </p>
          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
              <div className="text-[13px] tracking-[0.1em] uppercase text-error font-bold mb-3">
                AI gives answers
              </div>
              <div className="text-white text-[15px] font-semibold mb-3">
                Practice: +48%
              </div>
              <div className="text-error text-[15px] font-semibold">
                Exam without AI: −17%
              </div>
            </div>
            <div className="rounded-xl border border-blue-400/20 bg-blue-500/[0.06] p-6">
              <div className="text-[13px] tracking-[0.1em] uppercase text-blue-300 font-bold mb-3">
                AI gives hints
              </div>
              <div className="text-white text-[15px] font-semibold mb-3">
                Practice: +127%
              </div>
              <div className="text-green text-[15px] font-semibold">
                Exam without AI: no decline
              </div>
            </div>
          </div>
          <p>
            The same technology. The same subject. The same students. The
            only difference was whether the AI replaced the thinking or
            supported it.
          </p>
          <p className="text-[13.5px] text-white/40 italic">
            Source: Bastani et al., "Generative AI without guardrails can harm
            learning: Evidence from high school mathematics," 2025.
          </p>
        </div>
      </section>

      {/* SECTION 5: Cognitive stunting */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-white/[0.06]">
        <div className="text-[12px] tracking-[0.12em] uppercase text-blue-300 font-bold mb-4">
          05 — What researchers are calling it
        </div>
        <h2 className="text-[26px] md:text-[30px] font-bold tracking-tight mb-8 leading-[1.3]">
          "Cognitive stunting."
        </h2>

        <div className="space-y-5 text-[15.5px] leading-[1.8] text-white/70">
          <p>
            Rebecca Winthrop, a senior fellow at the Brookings Institution,
            coined the term to describe what happens when children outsource
            original reasoning before those neural pathways are fully formed.
          </p>
          <blockquote className="border-l-2 border-blue-400/40 pl-6 py-2 my-6 text-white/80 italic text-[16px]">
            "When young people systematically use AI to complete schoolwork or
            other thinking tasks, they are not offloading skills they already
            possess. They are shortcutting the process of developing those
            skills in the first place."
          </blockquote>
          <p>
            A 200-page Brookings report released in 2026 concluded that the
            risks of AI in schools currently outweigh the benefits — and that
            students need structured guidance, not unrestricted access.
          </p>
          <p className="text-[13.5px] text-white/40 italic">
            Source: Winthrop et al., "A New Direction for Students in an AI
            World," Brookings Institution, 2026.
          </p>
        </div>
      </section>

      {/* SECTION 6: The scale */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-white/[0.06]">
        <div className="text-[12px] tracking-[0.12em] uppercase text-blue-300 font-bold mb-4">
          06 — How fast this is happening
        </div>
        <h2 className="text-[26px] md:text-[30px] font-bold tracking-tight mb-8 leading-[1.3]">
          In three years, AI went from novelty to default.
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
            <div className="text-[28px] font-bold text-blue-300 leading-none mb-2">
              80%
            </div>
            <div className="text-[11.5px] text-white/50 font-medium leading-tight">
              UK students (13–18) use AI for schoolwork
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
            <div className="text-[28px] font-bold text-blue-300 leading-none mb-2">
              62%
            </div>
            <div className="text-[11.5px] text-white/50 font-medium leading-tight">
              Say AI has negatively impacted their skills
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
            <div className="text-[28px] font-bold text-blue-300 leading-none mb-2">
              47%
            </div>
            <div className="text-[11.5px] text-white/50 font-medium leading-tight">
              Can confidently spot AI misinformation
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
            <div className="text-[28px] font-bold text-blue-300 leading-none mb-2">
              72%
            </div>
            <div className="text-[11.5px] text-white/50 font-medium leading-tight">
              Indian children think GenAI is just a search engine
            </div>
          </div>
        </div>

        <p className="text-[15.5px] leading-[1.8] text-white/70">
          In India, the Bharat Survey for EdTech (2025–26) found that 69% of
          children from low-income households use GenAI tools daily. Most
          don't understand what they're using — and there is almost no
          guidance on how to use it well.
        </p>
      </section>

      {/* SECTION 7: What we built */}
      <section className="max-w-3xl mx-auto px-6 py-20 border-t border-white/[0.06]">
        <div className="text-[12px] tracking-[0.12em] uppercase text-blue-300 font-bold mb-4">
          07 — What we built
        </div>
        <h2 className="text-[26px] md:text-[30px] font-bold tracking-tight mb-8 leading-[1.3]">
          CubitX is the opposite of an answer machine.
        </h2>

        <div className="space-y-5 text-[15.5px] leading-[1.8] text-white/70 mb-10">
          <p>
            No chatbot. No instant answers. No AI that does the thinking for
            the child.
          </p>
          <p>
            Five-minute daily missions that ask children to figure things out.
            They test. They guess. They change their minds. They sit with
            confusion until the pattern reveals itself.
          </p>
          <p>
            Every mission is built around what the research shows works:{' '}
            <span className="text-white">
              productive struggle, guided discovery, and the kind of thinking
              that doesn't come with a shortcut.
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-300 text-[13px] font-bold">1</span>
            </div>
            <div>
              <div className="text-white font-semibold mb-1">
                The child does the thinking
              </div>
              <div className="text-[14.5px] text-white/60 leading-[1.7]">
                No AI gives them the answer. They figure it out by testing,
                observing, and forming hypotheses.
              </div>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-300 text-[13px] font-bold">2</span>
            </div>
            <div>
              <div className="text-white font-semibold mb-1">
                Progress comes from the process, not the answer
              </div>
              <div className="text-[14.5px] text-white/60 leading-[1.7]">
                We track how the child thinks — how they test, when they
                revise, whether they spot patterns. Not whether they got
                the final answer right.
              </div>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-300 text-[13px] font-bold">3</span>
            </div>
            <div>
              <div className="text-white font-semibold mb-1">
                Five minutes a day. Every day.
              </div>
              <div className="text-[14.5px] text-white/60 leading-[1.7]">
                The research on cognitive development is clear: consistency
                matters more than intensity. Short, daily practice builds
                the neural pathways that last.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 border-t border-white/[0.06]">
        <h2 className="text-[28px] md:text-[34px] font-bold tracking-tight mb-6 leading-[1.25]">
          Every child is born curious.
          <br />
          Let's help them stay that way.
        </h2>
        <p className="text-white/60 text-[16px] leading-[1.7] mb-8 max-w-xl">
          Five days free. No card needed. Your child's thinking stays
          private and is never shared.
        </p>
        <button
          onClick={() => navigate('/onboard')}
          className="px-8 py-4 rounded-full bg-white text-navy-900 text-[15px] font-bold hover:bg-white/90 transition"
        >
          Start the first mission
        </button>
      </section>

      {/* FOOTER */}
      <footer className="max-w-3xl mx-auto px-6 py-10 border-t border-white/[0.06]">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <Logo size={20} />
          <div className="text-[12px] text-white/30">
            Built in India. Research cited above is publicly available.
          </div>
        </div>
      </footer>
    </div>
  );
}
