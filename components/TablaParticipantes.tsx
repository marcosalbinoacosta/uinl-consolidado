"use client";
import { useMemo, useState } from "react";
import type { ParticipanteEnriquecido } from "@/lib/types";
import { EstadoBadge, AltaPrioridadBadge } from "./EstadoBadge";
import { fechaHora } from "@/lib/format";

const ESTADOS = [
  { v: "todos",         label: "Todos los estados" },
  { v: "pendiente",     label: "Pendientes" },
  { v: "contactado",    label: "Contactados" },
  { v: "no_interesado", label: "No interesados" },
];

function norm(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function TablaParticipantes({ participantes }: { participantes: ParticipanteEnriquecido[] }) {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("todos");
  const [soloConNotas, setSoloConNotas] = useState(false);
  const [soloAlta, setSoloAlta] = useState(false);
  const [verTodos, setVerTodos] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);

  // Hay interaccion si: hay texto buscado, filtro de estado != todos, algun checkbox, o usuario clickeo "ver todos"
  const hasInteraction =
    search.trim().length > 0 ||
    estado !== "todos" ||
    soloConNotas ||
    soloAlta ||
    verTodos;

  const filtered = useMemo(() => {
    if (!hasInteraction) return [];
    const q = norm(search.trim());
    return participantes.filter(p => {
      if (estado !== "todos" && p.contacto.estado !== estado) return false;
      if (soloConNotas && p.notas.length === 0) return false;
      if (soloAlta && !p.contacto.alta_prioridad) return false;
      if (q) {
        const hay = norm(`${p.nombre_completo} ${p.pais_label ?? ""} ${p.cargo_principal ?? ""} ${p.organizacion ?? ""}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.contacto.alta_prioridad !== b.contacto.alta_prioridad) {
        return a.contacto.alta_prioridad ? -1 : 1;
      }
      return b.prioridad_score - a.prioridad_score || a.nombre_completo.localeCompare(b.nombre_completo);
    });
  }, [participantes, search, estado, soloConNotas, soloAlta, hasInteraction]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="border-b border-slate-200 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Participantes</h2>
            <p className="text-xs text-slate-500">
              {participantes.length} totales · buscá por nombre, país, cargo u organización
            </p>
          </div>
          {hasInteraction && (
            <div className="text-xs text-slate-500 no-print">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setEstado("todos");
                  setSoloAlta(false);
                  setSoloConNotas(false);
                  setVerTodos(false);
                }}
                className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Buscador prominente */}
        <div className="relative mt-4 no-print">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
          <input
            type="search"
            placeholder="Empezá a escribir un nombre, país, cargo…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-base focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {/* Filtros secundarios */}
        <div className="mt-2 flex flex-wrap items-center gap-2 no-print">
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            {ESTADOS.map(e => <option key={e.v} value={e.v}>{e.label}</option>)}
          </select>
          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <input type="checkbox" checked={soloAlta} onChange={e => setSoloAlta(e.target.checked)} className="rounded" />
            Solo alta prioridad
          </label>
          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <input type="checkbox" checked={soloConNotas} onChange={e => setSoloConNotas(e.target.checked)} className="rounded" />
            Solo con notas
          </label>
        </div>
      </header>

      {/* Empty state cuando no hay interaccion */}
      {!hasInteraction && (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-slate-500">Empezá a escribir arriba para ver participantes.</p>
          <button
            type="button"
            onClick={() => setVerTodos(true)}
            className="mt-3 inline-flex rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 no-print"
          >
            Ver los {participantes.length} todos
          </button>
        </div>
      )}

      {/* Resultados */}
      {hasInteraction && (
        <>
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
            Mostrando {filtered.length} de {participantes.length} · click en una fila para ver detalle
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5">País</th>
                  <th className="px-4 py-2.5">Cargo principal</th>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5 text-right">Notas</th>
                  <th className="px-4 py-2.5 text-right">Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {filtered.flatMap(p => {
                  const abierto = expandido === p.id;
                  return [
                    <tr
                      key={p.id}
                      onClick={() => setExpandido(abierto ? null : p.id)}
                      className={`cursor-pointer border-t border-slate-100 transition-colors hover:bg-slate-50 ${abierto ? "bg-slate-50" : ""}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-900">
                        <span className="mr-2 inline-block text-slate-400">{abierto ? "▾" : "▸"}</span>
                        {p.nombre_completo}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{p.pais_label ?? "—"}</td>
                      <td className="px-4 py-2.5 text-slate-600">{p.cargo_principal ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <EstadoBadge estado={p.contacto.estado} />
                        {p.contacto.alta_prioridad && <AltaPrioridadBadge />}
                      </td>
                      <td className="px-4 py-2.5 text-right font-num text-slate-700">{p.notas.length}</td>
                      <td className="px-4 py-2.5 text-right font-num font-semibold text-slate-900">{p.prioridad_score}</td>
                    </tr>,
                    abierto ? (
                      <tr key={`${p.id}-exp`}>
                        <td colSpan={6} className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                          <DetalleParticipante p={p} />
                        </td>
                      </tr>
                    ) : null,
                  ].filter(Boolean) as JSX.Element[];
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                      Sin resultados con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function DetalleParticipante({ p }: { p: ParticipanteEnriquecido }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Contacto</div>
        <div className="mt-1 space-y-0.5 text-sm">
          <div className="text-slate-700"><span className="text-slate-400">Email:</span> {p.email ?? "—"}</div>
          <div className="text-slate-700"><span className="text-slate-400">Tel:</span> {p.telefono ?? "—"}</div>
          <div className="text-slate-700"><span className="text-slate-400">Organización:</span> {p.organizacion ?? "—"}</div>
        </div>
      </div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Participaciones UINL</div>
        {p.participaciones.length === 0 ? (
          <div className="mt-1 text-sm text-slate-400">—</div>
        ) : (
          <ul className="mt-1 space-y-0.5 text-sm">
            {p.participaciones.map((pp, i) => (
              <li key={i} className="text-slate-700">
                <span className="font-medium">{pp.cargo ?? "Miembro"}</span> · {pp.comision.nombre} <span className="text-slate-400">({pp.comision.codigo})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="md:col-span-1">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Roles declarados</div>
        <div className="mt-1 text-sm text-slate-700">{p.roles_raw ?? "—"}</div>
      </div>
      <div className="md:col-span-3">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Notas ({p.notas.length})</div>
        {p.notas.length === 0 ? (
          <div className="mt-1 text-sm text-slate-400">Sin notas registradas.</div>
        ) : (
          <ul className="mt-2 space-y-2">
            {p.notas.map(n => (
              <li key={n.id} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold" style={{ color: n.representante?.color ?? undefined }}>
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
    </div>
  );
}
