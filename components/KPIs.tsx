import type { ReporteData } from "@/lib/queries";
import { insights } from "@/lib/insights";
import { pct } from "@/lib/format";

export function KPIs({ data }: { data: ReporteData }) {
  const total = data.participantes.length;
  const contactados = data.participantes.filter(p => p.contacto.estado === "contactado").length;
  const alta = data.participantes.filter(p => p.contacto.alta_prioridad === true).length;
  const noInteresados = data.participantes.filter(p => p.contacto.estado === "no_interesado").length;
  const standTotal = data.stand_contactos.length;

  const primarios = [
    {
      label: "Hot leads",
      value: insights.global.hot_leads_count,
      sub: insights.global.countries_with_hot_leads.length > 0
        ? `${insights.global.countries_with_hot_leads.length} países`
        : null,
      accent: "border-amber-400 bg-amber-50",
      num: "text-amber-700",
    },
    {
      label: "Mercados vírgenes",
      value: insights.global.virgin_markets.length,
      sub: insights.global.virgin_markets.length > 0
        ? insights.global.virgin_markets.join(" · ")
        : "ninguno detectado",
      accent: "border-rose-300 bg-rose-50",
      num: "text-rose-700",
    },
    {
      label: "Próximos pasos",
      value: insights.global.next_steps_count,
      sub: `${insights.global.multipliers_count} multiplicadores activos`,
      accent: "border-blue-300 bg-blue-50",
      num: "text-blue-700",
    },
  ];

  const secundarios = [
    { label: "Participantes UINL", value: total, sub: null },
    { label: "Contactados", value: contactados, sub: `${pct(contactados, total)} del total` },
    { label: "Alta prioridad", value: alta, sub: null },
    { label: "No interesados", value: noInteresados, sub: null },
    { label: "Notas", value: data.total_notas, sub: null },
    { label: "Stand", value: standTotal, sub: null },
  ];

  return (
    <div className="space-y-3">
      {/* Primarios: las 3 métricas que cuentan la historia */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {primarios.map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.accent}`}>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">{s.label}</div>
            <div className={`mt-1 font-num text-3xl font-bold ${s.num}`}>{s.value}</div>
            {s.sub && <div className="mt-0.5 text-xs text-slate-600 truncate">{s.sub}</div>}
          </div>
        ))}
      </section>

      {/* Secundarios: las 6 métricas operativas */}
      <section className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {secundarios.map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{s.label}</div>
            <div className="mt-0.5 font-num text-xl font-bold text-slate-900">{s.value}</div>
            {s.sub && <div className="text-[10px] text-slate-500">{s.sub}</div>}
          </div>
        ))}
      </section>
    </div>
  );
}
