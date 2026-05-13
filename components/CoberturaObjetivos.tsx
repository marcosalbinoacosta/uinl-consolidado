import type { ParticipanteEnriquecido } from "@/lib/types";
import { paisesObjetivo, CONTINENTE_ORDEN, type PaisObjetivo } from "@/lib/paises-objetivo";
import { insightForParticipante } from "@/lib/insights";

type Status = "green" | "yellow" | "red";

interface Item extends PaisObjetivo {
  status: Status;
  hotLeadName: string | null;
  inscriptosCount: number;
  notasCount: number;
}

function computeItems(participantes: ParticipanteEnriquecido[]): Item[] {
  const partByPais = new Map<string, ParticipanteEnriquecido[]>();
  for (const p of participantes) {
    if (!p.pais_id) continue;
    const arr = partByPais.get(p.pais_id) ?? [];
    arr.push(p);
    partByPais.set(p.pais_id, arr);
  }

  return paisesObjetivo.map(o => {
    const parts = partByPais.get(o.slug) ?? [];
    let hasHot = false;
    let hasAny = false;
    let hotLeadName: string | null = null;
    let notasCount = 0;

    for (const p of parts) {
      if (p.notas.length > 0) {
        hasAny = true;
        notasCount += p.notas.length;
      }
      if (p.contacto.alta_prioridad || p.contacto.estado === "contactado") hasAny = true;
      const ins = insightForParticipante(p.id);
      if (ins) {
        hasAny = true;
        if (ins.classification === "hot_lead" && !hotLeadName) {
          hasHot = true;
          hotLeadName = ins.participante_nombre;
        }
      }
    }

    const status: Status = hasHot ? "green" : hasAny ? "yellow" : "red";
    return { ...o, status, hotLeadName, inscriptosCount: parts.length, notasCount };
  });
}

const STATUS_STYLES: Record<Status, { dot: string; border: string; bg: string }> = {
  green:  { dot: "bg-emerald-500", border: "border-emerald-200", bg: "bg-emerald-50/60" },
  yellow: { dot: "bg-amber-400",   border: "border-amber-200",   bg: "bg-amber-50/60" },
  red:    { dot: "bg-slate-300",   border: "border-slate-200",   bg: "bg-white" },
};

const CONTINENTE_LABEL: Record<PaisObjetivo["continente"], string> = {
  America: "América",
  Africa:  "África",
  Europa:  "Europa",
  Asia:    "Asia",
};

export function CoberturaObjetivos({ participantes }: { participantes: ParticipanteEnriquecido[] }) {
  const items = computeItems(participantes);

  const totals = {
    green:  items.filter(i => i.status === "green").length,
    yellow: items.filter(i => i.status === "yellow").length,
    red:    items.filter(i => i.status === "red").length,
  };

  const byContinente = new Map<PaisObjetivo["continente"], Item[]>();
  for (const item of items) {
    const arr = byContinente.get(item.continente) ?? [];
    arr.push(item);
    byContinente.set(item.continente, arr);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-900">🎯 Cobertura de países objetivo</h2>
        <p className="mt-1 text-xs text-slate-500">
          <span className="font-semibold text-emerald-700">{totals.green}</span> con hot lead ·{" "}
          <span className="font-semibold text-amber-700">{totals.yellow}</span> con actividad ·{" "}
          <span className="font-semibold text-slate-500">{totals.red}</span> sin tocar todavía · de {items.length} totales
        </p>
      </header>

      <div className="space-y-5 p-4">
        {CONTINENTE_ORDEN.map(cont => {
          const grupo = byContinente.get(cont) ?? [];
          if (grupo.length === 0) return null;
          return (
            <section key={cont}>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                {CONTINENTE_LABEL[cont]} <span className="text-slate-300">({grupo.length})</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {grupo.map(item => {
                  const st = STATUS_STYLES[item.status];
                  return (
                    <div
                      key={item.slug}
                      className={`rounded-lg border ${st.border} ${st.bg} p-3`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${st.dot}`} />
                        <span className="truncate text-sm font-semibold text-slate-900">{item.nombre}</span>
                      </div>
                      {item.hotLeadName && (
                        <div className="mt-1 truncate text-xs text-emerald-700">
                          🔥 {item.hotLeadName}
                        </div>
                      )}
                      {!item.hotLeadName && item.status === "yellow" && (
                        <div className="mt-1 text-xs text-amber-700">
                          {item.notasCount > 0 ? `${item.notasCount} nota${item.notasCount === 1 ? "" : "s"}` : "actividad registrada"}
                        </div>
                      )}
                      {item.status === "red" && (
                        <div className="mt-1 text-xs text-slate-400">sin contacto registrado</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
