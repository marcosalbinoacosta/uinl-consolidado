"use client";
import { useMemo, useState } from "react";
import type { ParticipanteEnriquecido } from "@/lib/types";
import { fechaHora } from "@/lib/format";

interface NotaCronologia {
  id: string;
  participante_id: string;
  participante_nombre: string;
  representante_id: string;
  representante_nombre: string;
  representante_color: string;
  texto: string;
  created_at: string;
}

export function CronologiaNotas({ participantes }: { participantes: ParticipanteEnriquecido[] }) {
  const [autor, setAutor] = useState<string>("todos");

  const todas: NotaCronologia[] = useMemo(() => {
    const out: NotaCronologia[] = [];
    for (const p of participantes) {
      for (const n of p.notas) {
        out.push({
          id: n.id,
          participante_id: p.id,
          participante_nombre: p.nombre_completo,
          representante_id: n.representante_id,
          representante_nombre: n.representante?.nombre ?? "—",
          representante_color: n.representante?.color ?? "#475569",
          texto: n.texto,
          created_at: n.created_at,
        });
      }
    }
    out.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return out;
  }, [participantes]);

  const autores = useMemo(() => {
    const m = new Map<string, { nombre: string; color: string }>();
    for (const n of todas) {
      if (!m.has(n.representante_id)) m.set(n.representante_id, { nombre: n.representante_nombre, color: n.representante_color });
    }
    return Array.from(m.entries()).map(([id, v]) => ({ id, ...v })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [todas]);

  const filtered = useMemo(() => {
    if (autor === "todos") return todas;
    return todas.filter(n => n.representante_id === autor);
  }, [todas, autor]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Cronología de notas</h2>
          <p className="text-xs text-slate-500">
            {filtered.length} de {todas.length} notas · más recientes primero
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 no-print">
          <select
            value={autor}
            onChange={e => setAutor(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="todos">Todos los autores</option>
            {autores.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">
          Sin notas con los filtros aplicados.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filtered.map(n => (
            <li key={n.id} className="p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold" style={{ color: n.representante_color }}>
                  {n.representante_nombre}
                </span>
                <span className="text-slate-400">{fechaHora(n.created_at)}</span>
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">{n.participante_nombre}</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{n.texto}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
