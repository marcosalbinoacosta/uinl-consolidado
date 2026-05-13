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
        ? `en ${insights.global.countries_with_hot_leads.length} países`
        : "—",
      accentText: "text-amber-700",
      accentRule: "after:bg-amber-500",
    },
    {
      label: "Mercados vírgenes",
      value: insights.global.virgin_markets.length,
      sub: insights.global.virgin_markets.length > 0
        ? insights.global.virgin_markets.join(" · ")
        : "ninguno detectado",
      accentText: "text-rose-700",
      accentRule: "after:bg-rose-500",
    },
    {
      label: "Próximos pasos",
      value: insights.global.next_steps_count,
      sub: `${insights.global.multipliers_count} multiplicadores activos`,
      accentText: "text-blue-700",
      accentRule: "after:bg-blue-500",
    },
  ];

  const secundarios = [
    { label: "Participantes UINL",  value: total,         sub: null },
    { label: "Contactados",          value: contactados,   sub: pct(contactados, total) },
    { label: "Alta prioridad",       value: alta,          sub: null },
    { label: "No interesados",       value: noInteresados, sub: null },
    { label: "Notas",                value: data.total_notas, sub: null },
    { label: "Stand contactos",      value: standTotal,    sub: null },
  ];

  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between border-b border-slate-300 pb-3">
        <p className="kicker">02 / Resultado del viaje</p>
        <p className="font-serif text-xs italic text-slate-500">tres números que importan</p>
      </div>

      {/* Primarios: grandes, sin tarjeta, divididos por reglas verticales */}
      <div className="grid grid-cols-1 divide-y divide-slate-300 border-b border-slate-300 md:grid-cols-3 md:divide-x md:divide-y-0">
        {primarios.map(s => (
          <div
            key={s.label}
            className={`relative px-1 py-6 md:px-8 md:py-7 after:absolute after:left-0 after:top-0 after:h-px after:w-10 ${s.accentRule} md:after:left-8`}
          >
            <p className="kicker">{s.label}</p>
            <p className={`mt-3 font-mono text-5xl font-light leading-none tracking-tight ${s.accentText}`}>
              {s.value}
            </p>
            {s.sub && (
              <p className="mt-2 font-serif text-sm italic text-slate-600">{s.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Secundarios: chiquitos, en línea, separados por reglas */}
      <div className="mt-px grid grid-cols-3 divide-x divide-slate-200 md:grid-cols-6">
        {secundarios.map(s => (
          <div key={s.label} className="px-3 py-4">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-kicker text-slate-500">{s.label}</p>
            <p className="mt-1 font-mono text-xl font-light text-slate-900">{s.value}</p>
            {s.sub && <p className="font-serif text-[11px] italic text-slate-500">{s.sub}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
