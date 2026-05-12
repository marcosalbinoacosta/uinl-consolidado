import type { ReporteData } from "@/lib/queries";
import { pct } from "@/lib/format";

export function KPIs({ data }: { data: ReporteData }) {
  const total = data.participantes.length;
  const contactados = data.participantes.filter(p => p.contacto.estado === "contactado").length;
  const alta = data.participantes.filter(p => p.contacto.estado === "alta_prioridad").length;
  const noInteresados = data.participantes.filter(p => p.contacto.estado === "no_interesado").length;
  const standTotal = data.stand_contactos.length;
  const standPaises = new Set(data.stand_contactos.map(s => s.pais_id).filter(Boolean)).size;

  const stats = [
    { label: "Participantes UINL", value: total, sub: null },
    { label: "Contactados", value: contactados, sub: `${pct(contactados, total)} del total` },
    { label: "Alta prioridad", value: alta, sub: null },
    { label: "No interesados", value: noInteresados, sub: null },
    { label: "Notas registradas", value: data.total_notas, sub: null },
    { label: "Contactos de stand", value: standTotal, sub: standPaises > 0 ? `${standPaises} países` : null },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {stats.map(s => (
        <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{s.label}</div>
          <div className="mt-1 font-num text-2xl font-bold text-slate-900">{s.value}</div>
          {s.sub && <div className="mt-0.5 text-xs text-slate-500">{s.sub}</div>}
        </div>
      ))}
    </section>
  );
}
