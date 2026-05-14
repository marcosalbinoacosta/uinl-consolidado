import { multiplicadores } from "@/lib/insights";

export function Multiplicadores() {
  const items = multiplicadores();

  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between border-b border-violet-400/50 pb-3">
        <p className="kicker text-violet-700">06 / Multiplicadores</p>
        <p className="font-serif text-xs italic text-slate-500">quienes abren puertas</p>
      </div>

      {items.length === 0 ? (
        <p className="py-8 font-serif italic text-slate-500">Ningún multiplicador identificado todavía.</p>
      ) : (
        <p className="mb-4 font-mono text-[11px] leading-relaxed text-slate-500">
          Contacto que, además de su propio valor comercial, tiene acceso directo a otro decisor relevante y confirmó que puede hacer la presentación o pasar el contacto.
        </p>
      )}

      <ul className="divide-y divide-violet-200/70">
        {items.map(m => (
          <li key={m.participante_id} className="py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h4 className="font-serif text-lg text-slate-900">{m.participante_nombre}</h4>
              <span className="font-mono text-[10px] uppercase tracking-kicker text-violet-700">
                {m.pais_label ?? "—"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">
              <span className="mr-1 font-serif text-lg text-violet-700">→</span>
              {m.multiplier_to}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
