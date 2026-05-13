"use client";
import { useMemo, useState } from "react";
import type { Representante, StandContacto } from "@/lib/types";
import { fechaCorta } from "@/lib/format";

const SISTEMA_EMISION_LABEL: Record<string, string> = {
  fisico: "Físico",
  digital: "Digital",
  mixto: "Mixto",
};
const MODALIDAD_LABEL: Record<string, string> = {
  compra_directa: "Compra directa",
  licitacion_publica: "Licitación pública",
  otro: "Otro",
};
const IMPRESOR_LABEL: Record<string, string> = {
  estatal: "Estatal",
  privada: "Privada",
  mixto: "Mixto",
};
const DESARROLLO_LABEL: Record<string, string> = {
  propio: "Propio",
  externo: "Externo",
};

function valStr(v: string | number | null): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}
function valBool(v: boolean | null): string {
  if (v === null) return "—";
  return v ? "Sí" : "No";
}
function valArr(a: string[] | null | undefined): string {
  if (!a || a.length === 0) return "—";
  return a.join(", ");
}

export function StandContactos({ stands, representantes }: { stands: StandContacto[]; representantes: Representante[] }) {
  const [expandido, setExpandido] = useState<string | null>(null);
  const [filtroRep, setFiltroRep] = useState("todos");

  const repsById = useMemo(() => new Map(representantes.map(r => [r.id, r])), [representantes]);

  const sorted = useMemo(() => {
    let s = stands;
    if (filtroRep !== "todos") s = s.filter(x => x.recepcionado_por === filtroRep);
    return [...s].sort((a, b) => {
      const f = (b.fecha ?? "").localeCompare(a.fecha ?? "");
      if (f !== 0) return f;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [stands, filtroRep]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Contactos de stand · F.0024-02</h2>
          <p className="text-xs text-slate-500">
            {sorted.length} de {stands.length} formularios · click en una card para ver el detalle completo
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 no-print">
          <select
            value={filtroRep}
            onChange={e => setFiltroRep(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="todos">Todos los recepcionados</option>
            {representantes.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
      </header>

      {sorted.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">
          Sin contactos de stand registrados.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {sorted.map(s => {
            const abierto = expandido === s.id;
            const rep = s.recepcionado_por ? repsById.get(s.recepcionado_por) : null;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setExpandido(abierto ? null : s.id)}
                  className={`flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-slate-50 ${abierto ? "bg-slate-50" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">{abierto ? "▾" : "▸"}</span>
                      <span className="font-semibold text-slate-900">{s.contacto_nombre}</span>
                      {s.cargo && <span className="text-slate-500">· {s.cargo}</span>}
                    </div>
                    <div className="mt-0.5 ml-5 text-xs text-slate-600">
                      {s.institucion && <span>{s.institucion} · </span>}
                      <span>{s.pais_label ?? "—"}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-slate-400">{fechaCorta(s.fecha)}</div>
                    {rep && (
                      <div className="mt-0.5 text-xs font-semibold" style={{ color: rep.color }}>
                        {rep.nombre}
                      </div>
                    )}
                  </div>
                </button>
                {abierto && (
                  <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <DetalleStand s={s} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function DetalleStand({ s }: { s: StandContacto }) {
  const groups: Array<{ title: string; rows: Array<[string, string]> }> = [
    {
      title: "Contacto",
      rows: [
        ["Email", valStr(s.email)],
        ["Teléfono", valStr(s.telefono)],
      ],
    },
    {
      title: "Institución",
      rows: [
        ["Notarios aprox.", valStr(s.p1_notarios_aprox)],
        ["Emite formularios", valBool(s.p2_emite_formularios)],
        ["Líneas de formularios", valStr(s.p3_lineas_formularios)],
        ["Sistema de emisión", s.p4_sistema_emision ? SISTEMA_EMISION_LABEL[s.p4_sistema_emision] : "—"],
      ],
    },
    {
      title: "Seguridad documental",
      rows: [
        ["Falsificaciones", valBool(s.p5_falsificaciones)],
        ["Riesgos / oportunidades", valStr(s.p6_riesgos)],
      ],
    },
    {
      title: "Solución física",
      rows: [
        ["Seguridad física actual", valStr(s.p7_seguridad_fisica)],
        ["Consumo de folios", valStr(s.p8_consumo_folios)],
        ["Modalidad de compra", s.p9_modalidad_compra ? MODALIDAD_LABEL[s.p9_modalidad_compra] : "—"],
        ["Impresor", s.p10_impresor ? IMPRESOR_LABEL[s.p10_impresor] : "—"],
        ["Proveedor de impresión", valStr(s.p11_proveedor_impresion)],
      ],
    },
    {
      title: "Solución digital",
      rows: [
        ["Seguridad digital", valStr(s.p12_seguridad_digital)],
        ["Herramientas digitales", valStr(s.p13_herramientas)],
        ["Desarrollo", s.p14_desarrollo ? DESARROLLO_LABEL[s.p14_desarrollo] : "—"],
        ["Proveedor de desarrollo", valStr(s.p14_proveedor_desarrollo)],
      ],
    },
    {
      title: "Próximos pasos",
      rows: [
        ["Pasos solicitados", valArr(s.p15_proximos_pasos)],
        ["Canal preferido", valArr(s.p16_canal_contacto)],
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(g => (
          <div key={g.title}>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{g.title}</div>
            <dl className="mt-1 space-y-0.5 text-sm">
              {g.rows.map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="shrink-0 text-slate-500">{k}:</dt>
                  <dd className="flex-1 text-slate-700">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {s.observaciones && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Observaciones</div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{s.observaciones}</p>
        </div>
      )}

      {s.tarjeta_url && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Tarjeta personal</div>
          <a href={s.tarjeta_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.tarjeta_url} alt="Tarjeta personal" className="max-h-48 rounded-md border border-slate-200" />
          </a>
        </div>
      )}
    </div>
  );
}
