import { insights } from "@/lib/insights";

export function MercadosVirgenes() {
  const items = insights.insights
    .filter(i => i.virgin_market)
    .sort((a, b) => b.priority - a.priority);

  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between border-b border-rose-400/50 pb-3">
        <p className="kicker text-rose-700">05 / Mercados vírgenes</p>
        <p className="font-serif text-xs italic text-slate-500">la oportunidad más limpia</p>
      </div>

      {items.length === 0 ? (
        <p className="py-8 font-serif italic text-slate-500">Ningún mercado virgen detectado todavía.</p>
      ) : (
        <p className="mb-4 font-serif text-[15px] italic leading-relaxed text-slate-700">
          Países donde <span className="font-medium text-rose-700">no tienen papel de seguridad</span>, según lo dicho explícito en las notas. Mercados vírgenes para +LATINA.
        </p>
      )}

      <ul className="divide-y divide-rose-200/70">
        {items.map(v => (
          <li key={v.participante_id} className="py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h4 className="font-serif text-xl text-slate-900">{v.pais_label ?? "—"}</h4>
              <span className="font-mono text-[10px] uppercase tracking-kicker text-rose-700">
                Prio {v.priority}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Contacto: <span className="text-slate-900">{v.participante_nombre}</span>
            </p>
            {v.lead_reason && (
              <p className="mt-2 font-serif text-[15px] leading-relaxed text-slate-800">
                {v.lead_reason}
              </p>
            )}
            {v.next_step && (
              <p className="mt-2 border-l-2 border-blue-400/60 pl-3 text-sm text-slate-700">
                <span className="font-mono text-[10px] uppercase tracking-kicker text-blue-700">Próximo</span>
                <span className="ml-2">{v.next_step}</span>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
