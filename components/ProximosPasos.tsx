import { proximosPasos } from "@/lib/insights";

export function ProximosPasos() {
  const items = proximosPasos();

  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between border-b border-blue-400/50 pb-3">
        <p className="kicker text-blue-700">07 / Próximos pasos pendientes</p>
        <p className="font-serif text-xs italic text-slate-500">to-do post viaje</p>
      </div>

      {items.length === 0 ? (
        <p className="py-8 font-serif italic text-slate-500">Ningún próximo paso registrado todavía.</p>
      ) : (
        <p className="mb-5 font-serif text-[15px] italic leading-relaxed text-slate-700">
          {items.length} acciones concretas identificadas en las notas. No perder pista de ninguna.
        </p>
      )}

      <ol className="space-y-3">
        {items.map((p, idx) => (
          <li
            key={p.participante_id}
            className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-slate-200 pb-3"
          >
            <span className="font-mono text-xs font-light text-slate-400">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-serif text-[15px] leading-snug text-slate-900">{p.next_step}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                <span className="text-slate-700">{p.participante_nombre}</span>
                {p.pais_label && <span> · {p.pais_label}</span>}
              </p>
            </div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-kicker text-blue-700">
              P{p.priority}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
