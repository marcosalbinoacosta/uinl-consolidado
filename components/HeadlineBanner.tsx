import { insights } from "@/lib/insights";
import { fechaHora } from "@/lib/format";

export function HeadlineBanner() {
  const h = insights.global.headline?.trim();
  if (!h) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-900/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-md md:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-widest text-amber-200/90">
        <span>✦ Resumen del viaje</span>
        <span className="text-amber-100/40">·</span>
        <span className="text-amber-100/60">síntesis por IA</span>
        <span className="text-amber-100/40">·</span>
        <span className="text-amber-100/60">{fechaHora(insights.generated_at)}</span>
        <span className="text-amber-100/40">·</span>
        <span className="text-amber-100/60">{insights.total_notes_analyzed} notas analizadas</span>
      </div>
      <p className="mt-3 text-lg leading-relaxed text-slate-50 md:text-xl">{h}</p>
      <p className="mt-4 text-[11px] text-slate-300/80 no-print">
        Para actualizar este resumen ejecutá <code className="rounded bg-slate-700/60 px-1.5 py-0.5 font-mono text-slate-100">npm run extract</code> en el repo.
      </p>
    </section>
  );
}
