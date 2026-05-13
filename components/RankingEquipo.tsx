import type { ReporteData } from "@/lib/queries";
import type { Representante } from "@/lib/types";
import { hotLeads } from "@/lib/insights";

interface RepStats {
  rep: Representante;
  notas: number;
  stand: number;
  hotLeads: number;
}

function compute(data: ReporteData): RepStats[] {
  const map = new Map<string, RepStats>();
  for (const rep of data.representantes) {
    map.set(rep.id, { rep, notas: 0, stand: 0, hotLeads: 0 });
  }

  // Notas por representante
  for (const p of data.participantes) {
    for (const n of p.notas) {
      const s = map.get(n.representante_id);
      if (s) s.notas++;
    }
  }

  // Stand contactos recepcionados
  for (const sc of data.stand_contactos) {
    if (sc.recepcionado_por) {
      const s = map.get(sc.recepcionado_por);
      if (s) s.stand++;
    }
  }

  // Hot leads generados: quien escribió al menos una nota sobre un participante que es hot_lead
  const leads = hotLeads();
  const leadIds = new Set(leads.map(l => l.participante_id));
  for (const p of data.participantes) {
    if (!leadIds.has(p.id)) continue;
    const repsInvolved = new Set<string>();
    for (const n of p.notas) repsInvolved.add(n.representante_id);
    for (const rid of repsInvolved) {
      const s = map.get(rid);
      if (s) s.hotLeads++;
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    (b.notas + b.stand + b.hotLeads * 3) - (a.notas + a.stand + a.hotLeads * 3),
  );
}

export function RankingEquipo({ data }: { data: ReporteData }) {
  const stats = compute(data);
  const maxNotas = Math.max(1, ...stats.map(s => s.notas));

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-900">👥 Ranking del equipo</h2>
        <p className="mt-1 text-xs text-slate-500">
          Actividad de cada representante durante el congreso. Ranking por carga total (notas + stand + hot leads ponderados).
        </p>
      </header>

      <div className="divide-y divide-slate-100">
        {stats.map(s => {
          const pctNotas = (s.notas / maxNotas) * 100;
          return (
            <div key={s.rep.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="h-8 w-1 shrink-0 rounded-full"
                    style={{ background: s.rep.color }}
                  />
                  <div className="font-semibold text-slate-900 truncate">{s.rep.nombre}</div>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-xs">
                  <div className="text-center">
                    <div className="font-num text-base font-bold text-slate-900">{s.notas}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">notas</div>
                  </div>
                  <div className="text-center">
                    <div className="font-num text-base font-bold text-slate-900">{s.stand}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">stand</div>
                  </div>
                  <div className="text-center">
                    <div className="font-num text-base font-bold text-amber-700">{s.hotLeads}</div>
                    <div className="text-[10px] uppercase tracking-widest text-amber-700">hot leads</div>
                  </div>
                </div>
              </div>
              {/* Bar visual de notas */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pctNotas}%`,
                    background: s.rep.color,
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
