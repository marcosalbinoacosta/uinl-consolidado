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
    let hasHot = false, hasAny = false, hotLeadName: string | null = null, notasCount = 0;

    for (const p of parts) {
      if (p.notas.length > 0) { hasAny = true; notasCount += p.notas.length; }
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

const DOT: Record<Status, string> = {
  green:  "bg-emerald-500",
  yellow: "bg-amber-400",
  red:    "bg-slate-300",
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
    <section>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-y-2 border-b border-slate-300 pb-3">
        <p className="kicker">04 / Cobertura · 28 países objetivo</p>
        <p className="font-mono text-[11px] text-slate-600">
          <span className="text-emerald-700">●</span> {totals.green} con hot lead{"  "}
          <span className="text-amber-600">●</span> {totals.yellow} con actividad{"  "}
          <span className="text-slate-400">●</span> {totals.red} sin tocar
        </p>
      </div>

      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {CONTINENTE_ORDEN.map(cont => {
          const grupo = byContinente.get(cont) ?? [];
          if (grupo.length === 0) return null;
          return (
            <div key={cont}>
              <h3 className="mb-2 font-serif text-xl text-slate-900">
                {CONTINENTE_LABEL[cont]}
                <span className="ml-2 font-mono text-xs text-slate-400">({grupo.length})</span>
              </h3>
              <ul className="divide-y divide-slate-200 border-y border-slate-200">
                {grupo.map(item => (
                  <li key={item.slug} className="flex items-baseline gap-3 py-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[item.status]}`} />
                    <span className="font-serif text-[15px] text-slate-900">{item.nombre}</span>
                    <span className="ml-auto flex items-baseline gap-2 text-right text-xs">
                      {item.hotLeadName ? (
                        <span className="font-sans text-emerald-700">{item.hotLeadName}</span>
                      ) : item.status === "yellow" ? (
                        <span className="font-mono text-amber-700">
                          {item.notasCount > 0 ? `${item.notasCount} nota${item.notasCount === 1 ? "" : "s"}` : "actividad"}
                        </span>
                      ) : (
                        <span className="font-mono italic text-slate-400">sin contacto</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
