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
  for (const p of data.participantes) {
    for (const n of p.notas) {
      const s = map.get(n.representante_id);
      if (s) s.notas++;
    }
  }
  for (const sc of data.stand_contactos) {
    if (sc.recepcionado_por) {
      const s = map.get(sc.recepcionado_por);
      if (s) s.stand++;
    }
  }
  const leadIds = new Set(hotLeads().map(l => l.participante_id));
  for (const p of data.participantes) {
    if (!leadIds.has(p.id)) continue;
    const reps = new Set<string>();
    for (const n of p.notas) reps.add(n.representante_id);
    for (const rid of reps) {
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
    <section>
      <div className="mb-5 flex items-baseline justify-between border-b border-slate-300 pb-3">
        <p className="kicker">08 / Ranking del equipo</p>
        <p className="font-serif text-xs italic text-slate-500">actividad durante el congreso</p>
      </div>

      <div className="divide-y divide-slate-200">
        {stats.map((s, idx) => {
          const pctNotas = (s.notas / maxNotas) * 100;
          return (
            <div key={s.rep.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-6 py-5">
              <span className="font-mono text-xs font-light text-slate-400">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ background: s.rep.color }}
                  />
                  <h4 className="font-serif text-xl text-slate-900 truncate">{s.rep.nombre}</h4>
                </div>
                <div className="ml-6 mt-2 h-[2px] w-full rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pctNotas}%`, background: s.rep.color, opacity: 0.7 }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-baseline gap-7">
                <div className="text-right">
                  <p className="font-mono text-2xl font-light leading-none text-slate-900">{s.notas}</p>
                  <p className="font-mono text-[9px] uppercase tracking-kicker text-slate-500">notas</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-light leading-none text-slate-900">{s.stand}</p>
                  <p className="font-mono text-[9px] uppercase tracking-kicker text-slate-500">stand</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-light leading-none text-amber-700">{s.hotLeads}</p>
                  <p className="font-mono text-[9px] uppercase tracking-kicker text-amber-700">hot leads</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
