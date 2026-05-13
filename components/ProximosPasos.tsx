import { proximosPasos } from "@/lib/insights";

export function ProximosPasos() {
  const items = proximosPasos();

  return (
    <section className="overflow-hidden rounded-xl border border-blue-200 bg-blue-50/30">
      <header className="border-b border-blue-200/60 bg-blue-50/50 p-4">
        <h2 className="text-lg font-bold text-slate-900">↦ Próximos pasos pendientes</h2>
        <p className="mt-1 text-xs text-slate-600">
          {items.length} acción{items.length === 1 ? "" : "es"} concreta{items.length === 1 ? "" : "s"} identificada{items.length === 1 ? "" : "s"} en las notas. <strong>To-do post viaje</strong> para no perder pista.
        </p>
      </header>

      <div className="p-4">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Ningún próximo paso registrado todavía.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map(p => (
              <li
                key={p.participante_id}
                className="flex items-start gap-3 rounded-lg border border-blue-200 bg-white p-3 shadow-sm"
              >
                <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border border-blue-300" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">{p.next_step}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{p.participante_nombre}</span>
                    {p.pais_label && <span> · {p.pais_label}</span>}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                  P{p.priority}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
