import { insights } from "@/lib/insights";
import { fechaHora } from "@/lib/format";

export function HeadlineBanner() {
  const h = insights.global.headline?.trim();
  if (!h) return null;

  return (
    <section className="relative overflow-hidden border-y border-slate-900/10 bg-slate-900 px-8 py-14 text-white md:px-16 md:py-20 print:border-slate-300 print:bg-white print:text-slate-900">
      {/* Decorative oversized quote mark — solo en pantalla */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-4 top-0 select-none font-serif text-[14rem] leading-none text-amber-400/10 md:left-12 md:text-[18rem] print:hidden"
      >
        “
      </span>

      <div className="relative mx-auto max-w-5xl">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-kicker text-amber-300/90 print:text-slate-500">
          01 / Síntesis · análisis con IA · Claude Haiku 4.5
        </p>
        <p className="mt-5 font-serif text-2xl italic leading-snug text-slate-50 md:text-4xl md:leading-tight print:text-slate-900">
          {h}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-kicker text-slate-400 print:text-slate-500">
          <span>Generado {fechaHora(insights.generated_at)}</span>
          <span className="text-slate-600 print:text-slate-300">·</span>
          <span>{insights.total_notes_analyzed} notas analizadas</span>
          <span className="text-slate-600 print:text-slate-300">·</span>
          <span>{insights.total_participants_analyzed} participantes con actividad</span>
        </div>
      </div>
    </section>
  );
}
