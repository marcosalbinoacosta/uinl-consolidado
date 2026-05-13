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
      <section>
        <div className="mb-5 flex items-baseline justify-between border-b border-slate-300 pb-3">
          <p className="kicker">03 / Hot leads</p>
        </div>
        <p className="py-8 font-serif italic text-slate-500">Sin hot leads identificados todavía.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-baseline justify-between border-b border-slate-300 pb-3">
        <p className="kicker">03 / Hot leads · oportunidades comerciales reales</p>
        <p className="font-serif text-xs italic text-slate-500">
          {leads.length} con dato comercial duro
        </p>
      </div>

      <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 print:grid-cols-1">
        {leads.map((lead, idx) => {
          const p = partById.get(lead.participante_id);
          const abierto = expandido === lead.participante_id;
          const num = String(idx + 1).padStart(2, "0");
          return (
            <article key={lead.participante_id} className="relative">
              {/* Kicker con número de lead + país */}
              <div className="flex items-baseline gap-3 border-b border-amber-400/40 pb-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-kicker text-amber-700">
                  Lead {num}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-kicker text-slate-400">·</span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-kicker text-slate-700">
                  {lead.pais_label ?? "—"}
                </span>
                <span className="ml-auto font-mono text-[10px] text-slate-500">
                  prio <span className="font-semibold text-amber-700">{lead.priority}</span>
                </span>
              </div>

              {/* Nombre como un titular */}
              <h3 className="mt-4 font-serif text-2xl leading-tight text-slate-900">
                {lead.participante_nombre}
              </h3>
              {p?.cargo_principal && (
                <p className="mt-1 text-sm text-slate-500">{p.cargo_principal}</p>
              )}

              {/* Lead reason como bajada */}
              {lead.lead_reason && (
                <p className="mt-4 font-serif text-[15px] leading-relaxed text-slate-800">
                  {lead.lead_reason}
                </p>
              )}

              {/* Hechos clave en bloque tipo ficha */}
              <dl className="mt-5 space-y-2.5 border-l-2 border-amber-400/60 pl-4 text-sm">
                {lead.pipeline_usd_clue && (
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-kicker text-emerald-700">Dato comercial</dt>
                    <dd className="mt-0.5 text-slate-800">{lead.pipeline_usd_clue}</dd>
                  </div>
                )}
                {lead.next_step && (
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-kicker text-blue-700">Próximo paso</dt>
                    <dd className="mt-0.5 text-slate-800">{lead.next_step}</dd>
                  </div>
                )}
                {lead.multiplier_to && (
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-kicker text-violet-700">Abre puerta</dt>
                    <dd className="mt-0.5 text-slate-800">{lead.multiplier_to}</dd>
                  </div>
                )}
                {lead.virgin_market && (
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-kicker text-rose-700">Mercado</dt>
                    <dd className="mt-0.5 text-slate-800">país sin papel de seguridad</dd>
                  </div>
                )}
              </dl>

              {p && p.notas.length > 0 && (
                <div className="no-print">
                  <button
                    type="button"
                    onClick={() => setExpandido(abierto ? null : lead.participante_id)}
                    className="mt-5 font-mono text-[10px] uppercase tracking-kicker text-slate-500 hover:text-slate-900"
                  >
                    {abierto
                      ? "↑ Ocultar notas del equipo"
                      : `↓ Leer ${p.notas.length} nota${p.notas.length === 1 ? "" : "s"} del equipo`}
                  </button>
                  {abierto && (
                    <ul className="mt-3 space-y-3 border-t border-slate-200 pt-3">
                      {p.notas.map(n => (
                        <li key={n.id} className="text-sm">
                          <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-kicker">
                            <span className="font-semibold" style={{ color: n.representante?.color ?? "#475569" }}>
                              {n.representante?.nombre ?? "—"}
                            </span>
                            <span className="text-slate-400">{fechaHora(n.created_at)}</span>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap text-slate-700">{n.texto}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
