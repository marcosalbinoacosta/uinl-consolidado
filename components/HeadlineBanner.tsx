import { insights } from "@/lib/insights";
import { fechaHora } from "@/lib/format";

export function HeadlineBanner() {
  const h = insights.global.headline?.trim();
  if (!h) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-900/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-md md:p-8 print:bg-white print:bg-none print:text-slate-900 print:border-slate-300">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-widest text-amber-200/90 print:text-slate-500">
        <span>✦ Resumen del viaje</span>
        <span className="text-amber-100/40 print:text-slate-300">·</span>
        <span className="text-amber-100/60 print:text-slate-500">síntesis con IA</span>
        <span className="text-amber-100/40 print:text-slate-300">·</span>
        <span className="text-amber-100/60 print:text-slate-500">actualizado {fechaHora(insights.generated_at)}</span>
        <span className="text-amber-100/40 print:text-slate-300">·</span>
        <span className="text-amber-100/60 print:text-slate-500">{insights.total_notes_analyzed} notas analizadas</span>
      </div>
      <p className="mt-3 text-lg leading-relaxed text-slate-50 md:text-xl print:text-slate-900">{h}</p>
    </section>
  );
}
