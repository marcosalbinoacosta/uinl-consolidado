import { multiplicadores } from "@/lib/insights";

export function Multiplicadores() {
  const items = multiplicadores();

  return (
    <section className="overflow-hidden rounded-xl border border-violet-200 bg-violet-50/30">
      <header className="border-b border-violet-200/60 bg-violet-50/50 p-4">
        <h2 className="text-lg font-bold text-slate-900">↗ Multiplicadores</h2>
        <p className="mt-1 text-xs text-slate-600">
          Personas que abren puerta a otros contactos. <strong>Cuidarlos vale tanto como cuidar a un cliente.</strong>
        </p>
      </header>

      <div className="p-4">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Ningún multiplicador identificado todavía.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map(m => (
              <li
                key={m.participante_id}
                className="rounded-lg border border-violet-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-700">
                  {m.pais_label ?? "—"}
                </div>
                <div className="mt-0.5 font-semibold text-slate-900">{m.participante_nombre}</div>
                <p className="mt-1.5 text-sm text-slate-700">
                  <span className="font-semibold text-violet-700">→ </span>
                  {m.multiplier_to}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
