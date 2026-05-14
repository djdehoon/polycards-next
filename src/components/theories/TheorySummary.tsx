import {
  HOW_THEORIES_WORK_TOGETHER,
  KIT_EXAMPLE,
  SUMMARY_ROWS,
} from "@/lib/theories-content";

export function TheorySummary() {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-md sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-white">
        At a glance
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        How the five theories compare—and how PolyCards uses them together.
      </p>

      <div className="mt-8 hidden overflow-hidden rounded-2xl border border-white/10 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/80 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Theory</th>
              <th className="px-4 py-3 font-semibold">Core idea</th>
              <th className="px-4 py-3 font-semibold">In PolyCards</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-300">
            {SUMMARY_ROWS.map((row) => (
              <tr key={row.theory} className="bg-zinc-900/30">
                <td className="px-4 py-3 font-medium text-zinc-100">
                  {row.theory}
                </td>
                <td className="px-4 py-3">{row.coreIdea}</td>
                <td className="px-4 py-3 text-zinc-400">{row.inPolyCards}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-6 space-y-3 md:hidden">
        {SUMMARY_ROWS.map((row) => (
          <li
            key={row.theory}
            className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4"
          >
            <p className="font-semibold text-zinc-100">{row.theory}</p>
            <p className="mt-1 text-sm text-zinc-400">{row.coreIdea}</p>
            <p className="mt-2 text-xs text-amber-200/80">{row.inPolyCards}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-lg font-semibold text-white">How they stack</h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
        {HOW_THEORIES_WORK_TOGETHER}
      </p>

      <h3 className="mt-10 text-lg font-semibold text-white">{KIT_EXAMPLE.title}</h3>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-zinc-300">
        {KIT_EXAMPLE.steps.map((s) => (
          <li key={s.label}>
            <span className="font-medium text-amber-200/90">{s.label}:</span>{" "}
            {s.text}
          </li>
        ))}
      </ol>
    </section>
  );
}
