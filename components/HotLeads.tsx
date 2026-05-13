"use client";
import { useMemo, useState } from "react";
import type { InsightItem } from "@/lib/insights-types";
import type { ParticipanteEnriquecido } from "@/lib/types";
import { fechaHora } from "@/lib/format";

interface Props {
  leads: InsightItem[];
  participantes: ParticipanteEnriquecido[];
}

export function HotLeads({ leads, participantes }: Props) {
  const partById = useMemo(() => new Map(participantes.map(p => [p.id, p])), [participantes]);
  const [expandido, setExpandido] = useState<string | null>(null);

  if (leads.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Sin hot leads identificados todavía.
      </section>
    );
  }

  return (
    <section>
      <header className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">🔥 Hot Leads — oportunidades comerciales reales</h2>
          <p className="text-xs text-slate-500">
            {leads.length} contactos con dato comercial duro. Ordenados por prioridad IA.
          </p>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-2 print:grid-cols-1">
        {leads.map(lead => {
          const p = partById.get(lead.participante_id);
          const abierto = expandido === lead.participante_id;
          return (
            <article
              key={lead.participante_id}
              className="overflow-hidden rounded-xl border border-amber-200/60 bg-gradient-to-br from-white to-amber-50/30 shadow-sm transition-shadow hover:shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-white">
                        Prio {lead.priority}
                      </span>
                      <span className="text-amber-700">{lead.pais_label ?? "—"}</span>
                    </div>
                    <div className="mt-1.5 truncate text-base font-bold text-slate-900">
                      {lead.participante_nombre}
                    </div>
                    {p?.cargo_principal && (
                      <div className="text-xs text-slate-500">{p.cargo_principal}</div>
                    )}
                  </div>
                </div>

                {lead.lead_reason && (
                  <p className="mt-3 text-sm leading-snug text-slate-800">
                    <span className="font-semibold text-slate-900">▸ </span>
                    {lead.lead_reason}
                  </p>
                )}

                <dl className="mt-3 space-y-1.5 text-xs">
                  {lead.pipeline_usd_clue && (
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-emerald-700">💰 Dato:</dt>
                      <dd className="flex-1 text-slate-700">{lead.pipeline_usd_clue}</dd>
                    </div>
                  )}
                  {lead.next_step && (
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-blue-700">↦ Próximo:</dt>
                      <dd className="flex-1 text-slate-700">{lead.next_step}</dd>
                    </div>
                  )}
                  {lead.multiplier_to && (
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-violet-700">↗ Multiplica:</dt>
                      <dd className="flex-1 text-slate-700">{lead.multiplier_to}</dd>
                    </div>
                  )}
                  {lead.virgin_market && (
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-rose-700">🆕 Mercado:</dt>
                      <dd className="flex-1 text-slate-700">país sin papel de seguridad</dd>
                    </div>
                  )}
                </dl>

                {p && p.notas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setExpandido(abierto ? null : lead.participante_id)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 no-print"
                  >
                    {abierto ? "▾ Ocultar notas" : `▸ Ver ${p.notas.length} nota${p.notas.length === 1 ? "" : "s"} del equipo`}
                  </button>
                )}
              </div>

              {abierto && p && (
                <div className="border-t border-amber-200/60 bg-white/60 px-4 py-3">
                  <ul className="space-y-2">
                    {p.notas.map(n => (
                      <li key={n.id} className="rounded-md border border-slate-200 bg-white p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold" style={{ color: n.representante?.color ?? "#475569" }}>
                            {n.representante?.nombre ?? "—"}
                          </span>
                          <span className="text-slate-400">{fechaHora(n.created_at)}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-slate-700">{n.texto}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
