"use client";
import { useMemo, useState } from "react";
import type { ParticipanteEnriquecido } from "@/lib/types";
import { EstadoBadge } from "./EstadoBadge";
import { fechaHora } from "@/lib/format";

const ESTADOS = [
  { v: "todos",          label: "Todos los estados" },
  { v: "pendiente",      label: "Pendientes" },
  { v: "contactado",     label: "Contactados" },
  { v: "alta_prioridad", label: "Alta prioridad" },
  { v: "no_interesado",  label: "No interesados" },
];

function norm(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function TablaParticipantes({ participantes }: { participantes: ParticipanteEnriquecido[] }) {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("todos");
  const [soloConNotas, setSoloConNotas] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = norm(search.trim());
    return participantes.filter(p => {
      if (estado !== "todos" && p.contacto.estado !== estado) return false;
      if (soloConNotas && p.notas.length === 0) return false;
      if (q) {
        const hay = norm(`${p.nombre_completo} ${p.pais_label ?? ""} ${p.cargo_principal ?? ""} ${p.organizacion ?? ""}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => b.prioridad_score - a.prioridad_score || a.nombre_completo.localeCompare(b.nombre_completo));
  }, [participantes, search, estado, soloConNotas]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Participantes</h2>
          <p className="text-xs text-slate-500">{filtered.length} mostrados · {participantes.length} totales · click en una fila para ver detalle</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 no-print">
          <input
            type="search"
            placeholder="Buscar nombre, país, cargo, organización…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            {ESTADOS.map(e => <option key={e.v} value={e.v}>{e.label}</option>)}
          </select>
          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <input type="checkbox" checked={soloConNotas} onChange={e => setSoloConNotas(e.target.checked)} className="rounded" />
            Solo con notas
          </label>
        </div>
      </header>

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
                  <td className="px-4 py-2.5"><EstadoBadge estado={p.contacto.estado} /></td>
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
