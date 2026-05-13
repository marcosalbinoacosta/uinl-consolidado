import { insights } from "@/lib/insights";

export function MercadosVirgenes() {
  const virgenes = insights.insights
    .filter(i => i.virgin_market)
    .sort((a, b) => b.priority - a.priority);

  return (
    <section className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50/40">
      <header className="border-b border-rose-200/60 bg-rose-50/60 p-4">
        <h2 className="text-lg font-bold text-slate-900">🆕 Mercados vírgenes</h2>
        <p className="mt-1 text-xs text-slate-600">
          Países que <strong>no tienen papel de seguridad</strong> según lo detectado en las notas.
          Es la oportunidad comercial más limpia para +LATINA.
        </p>
      </header>

      <div className="p-4">
        {virgenes.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Ningún mercado virgen detectado todavía.
          </p>
        ) : (
          <ul className="space-y-2">
            {virgenes.map(v => (
              <li
                key={v.participante_id}
                className="rounded-lg border border-rose-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-rose-700">
                      {v.pais_label ?? "—"}
                    </div>
                    <div className="truncate font-semibold text-slate-900">{v.participante_nombre}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                    Prio {v.priority}
                  </span>
                </div>
                {v.lead_reason && (
                  <p className="mt-2 text-sm text-slate-700">{v.lead_reason}</p>
                )}
                {v.next_step && (
                  <p className="mt-2 text-xs">
                    <span className="font-semibold text-blue-700">↦ Próximo: </span>
                    <span className="text-slate-700">{v.next_step}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
