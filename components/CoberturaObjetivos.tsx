import type { ParticipanteEnriquecido } from "@/lib/types";
import { paisesObjetivo, CONTINENTE_ORDEN, type PaisObjetivo } from "@/lib/paises-objetivo";
import { insightForParticipante } from "@/lib/insights";

type Status = "reached" | "untouched";

interface Item extends PaisObjetivo {
  status: Status;
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
    const reached = parts.some(p =>
      p.notas.length > 0 ||
      p.contacto.estado === "contactado" ||
      p.contacto.alta_prioridad ||
      insightForParticipante(p.id) !== undefined
    );
    return { ...o, status: reached ? "reached" : "untouched" };
  });
}

const DOT: Record<Status, string> = {
  reached:   "bg-emerald-500",
  untouched: "bg-slate-300",
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
    reached:   items.filter(i => i.status === "reached").length,
    untouched: items.filter(i => i.status === "untouched").length,
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
          <span className="text-emerald-700">●</span> {totals.reached} alcanzados{"  "}
          <span className="text-slate-400">●</span> {totals.untouched} sin tocar
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
                  <li key={item.slug} className="flex items-center gap-3 py-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[item.status]}`} />
                    <span className={`font-serif text-[15px] ${item.status === "reached" ? "text-slate-900" : "text-slate-400"}`}>
                      {item.nombre}
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
