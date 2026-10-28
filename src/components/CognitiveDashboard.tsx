/**
 * Interim parent-facing state while CubitX validates the V1.2 evidence model.
 * Do not display legacy scores or describe them as AI-analysed cognitive traits.
 */
export default function CognitiveDashboard() {
  return (
    <section
      aria-labelledby="progress-evidence-title"
      className="w-full space-y-4 rounded-3xl border border-[#16244a] bg-[#0a1228] p-6 shadow-xl"
    >
      <div className="border-b border-[#1e2e5c] pb-4">
        <h2 id="progress-evidence-title" className="flex items-center gap-2 text-xl font-bold text-white">
          <span aria-hidden="true">🧠</span>
          Thinking progress
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          CubitX is preparing evidence-based progress notes.
        </p>
      </div>

      <div className="rounded-2xl border border-[#1e2e5c] bg-[#0f1a38] p-4">
        <p className="font-semibold text-white">Progress summaries are temporarily paused.</p>
        <p className="mt-2 text-sm leading-6 text-gray-300">
          We are checking that mission evidence is interpreted fairly and in line with the CubitX framework.
          Until that review is complete, we will not show unvalidated scores or label a child’s thinking from a single activity.
        </p>
      </div>
    </section>
  );
}