import * as XLSX from "xlsx";
import type { ReporteData } from "./queries";
import type { Representante } from "./types";
import { insights, hotLeads, multiplicadores, proximosPasos } from "./insights";
import { paisesObjetivo, CONTINENTE_ORDEN } from "./paises-objetivo";

type Row = Array<string | number | null>;

function ws(rows: Row[], colWidths?: number[]): XLSX.WorkSheet {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  if (colWidths) sheet["!cols"] = colWidths.map(w => ({ wch: w }));
  return sheet;
}

function bool(v: boolean | null): string {
  return v === null ? "" : v ? "Sí" : "No";
}

function dateLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ===== 1. Resumen =====
function buildResumen(data: ReporteData): XLSX.WorkSheet {
  const total = data.participantes.length;
  const contactados = data.participantes.filter(p => p.contacto.estado === "contactado").length;
  const alta = data.participantes.filter(p => p.contacto.alta_prioridad).length;
  const noInt = data.participantes.filter(p => p.contacto.estado === "no_interesado").length;

  const rows: Row[] = [
    ["Consolidado UINL Bolivia 2026"],
    [`Generado: ${dateLocal(new Date().toISOString())}`],
    [],
    ["Síntesis (IA):", insights.global.headline],
    [],
    ["MÉTRICA", "VALOR"],
    ["Participantes UINL", total],
    ["Contactados", contactados],
    ["Alta prioridad", alta],
    ["No interesados", noInt],
    ["Notas registradas", data.total_notas],
    ["Contactos de stand", data.stand_contactos.length],
    [],
    ["Hot leads identificados (IA)", insights.global.hot_leads_count],
    ["Países con hot lead", insights.global.countries_with_hot_leads.join(", ")],
    ["Mercados vírgenes", insights.global.virgin_markets.join(", ")],
    ["Multiplicadores activos", insights.global.multipliers_count],
    ["Próximos pasos pendientes", insights.global.next_steps_count],
  ];
  return ws(rows, [40, 60]);
}

// ===== 2. Hot Leads =====
function buildHotLeads(): XLSX.WorkSheet {
  const headers: Row = ["Prio", "País", "Nombre", "Por qué es hot", "Pipeline / dato comercial", "Próximo paso", "Multiplica a", "Mercado virgen"];
  const rows: Row[] = [
    ["HOT LEADS — oportunidades comerciales identificadas por IA"],
    [],
    headers,
    ...hotLeads().map(l => [
      l.priority,
      l.pais_label ?? "",
      l.participante_nombre,
      l.lead_reason ?? "",
      l.pipeline_usd_clue ?? "",
      l.next_step ?? "",
      l.multiplier_to ?? "",
      bool(l.virgin_market),
    ] as Row),
  ];
  return ws(rows, [6, 20, 30, 50, 50, 50, 40, 8]);
}

// ===== 3. Mercados Vírgenes =====
function buildMercadosVirgenes(): XLSX.WorkSheet {
  const items = insights.insights.filter(i => i.virgin_market).sort((a, b) => b.priority - a.priority);
  const headers: Row = ["País", "Contacto", "Por qué", "Próximo paso", "Prioridad"];
  const rows: Row[] = [
    ["MERCADOS VÍRGENES — países sin papel de seguridad"],
    [],
    headers,
    ...items.map(v => [
      v.pais_label ?? "",
      v.participante_nombre,
      v.lead_reason ?? "",
      v.next_step ?? "",
      v.priority,
    ] as Row),
  ];
  return ws(rows, [20, 30, 50, 50, 10]);
}

// ===== 4. Multiplicadores =====
function buildMultiplicadores(): XLSX.WorkSheet {
  const headers: Row = ["País", "Persona", "Abre puerta a", "Clasificación", "Prioridad"];
  const rows: Row[] = [
    ["MULTIPLICADORES — personas que abren puerta a otros contactos"],
    [],
    headers,
    ...multiplicadores().map(m => [
      m.pais_label ?? "",
      m.participante_nombre,
      m.multiplier_to ?? "",
      m.classification,
      m.priority,
    ] as Row),
  ];
  return ws(rows, [20, 30, 60, 14, 10]);
}

// ===== 5. Próximos Pasos =====
function buildProximosPasos(): XLSX.WorkSheet {
  const headers: Row = ["Prio", "Acción", "Persona involucrada", "País", "Clasificación"];
  const rows: Row[] = [
    ["PRÓXIMOS PASOS — to-do extraído de las notas"],
    [],
    headers,
    ...proximosPasos().map(p => [
      p.priority,
      p.next_step ?? "",
      p.participante_nombre,
      p.pais_label ?? "",
      p.classification,
    ] as Row),
  ];
  return ws(rows, [6, 60, 30, 20, 14]);
}

// ===== 6. Cobertura 28 objetivos =====
function buildCobertura(data: ReporteData): XLSX.WorkSheet {
  const partByPais = new Map<string, typeof data.participantes>();
  for (const p of data.participantes) {
    if (!p.pais_id) continue;
    const arr = partByPais.get(p.pais_id) ?? [];
    arr.push(p);
    partByPais.set(p.pais_id, arr);
  }
  const insightsByPart = new Map(insights.insights.map(i => [i.participante_id, i]));

  const headers: Row = ["Continente", "País", "Estado", "Inscriptos", "Notas", "Hot lead identificado"];
  const rows: Row[] = [["COBERTURA — 28 países objetivo"], [], headers];

  for (const cont of CONTINENTE_ORDEN) {
    for (const o of paisesObjetivo.filter(p => p.continente === cont)) {
      const parts = partByPais.get(o.slug) ?? [];
      let hasHot = false;
      let hotName = "";
      let hasAny = false;
      let notasTotal = 0;
      for (const p of parts) {
        notasTotal += p.notas.length;
        if (p.notas.length > 0 || p.contacto.alta_prioridad || p.contacto.estado === "contactado") hasAny = true;
        const ins = insightsByPart.get(p.id);
        if (ins) {
          hasAny = true;
          if (ins.classification === "hot_lead" && !hotName) {
            hasHot = true;
            hotName = ins.participante_nombre;
          }
        }
      }
      const estado = hasHot ? "🟢 Hot lead" : hasAny ? "🟡 Con actividad" : "🔴 Sin tocar";
      rows.push([o.continente, o.nombre, estado, parts.length, notasTotal, hotName]);
    }
  }
  return ws(rows, [12, 25, 18, 12, 8, 30]);
}

// ===== 7. Ranking equipo =====
function buildRanking(data: ReporteData): XLSX.WorkSheet {
  const map = new Map<string, { rep: Representante; notas: number; stand: number; hotLeads: number }>();
  for (const r of data.representantes) map.set(r.id, { rep: r, notas: 0, stand: 0, hotLeads: 0 });
  for (const p of data.participantes) {
    for (const n of p.notas) {
      const s = map.get(n.representante_id);
      if (s) s.notas++;
    }
  }
  for (const sc of data.stand_contactos) {
    if (sc.recepcionado_por) {
      const s = map.get(sc.recepcionado_por);
      if (s) s.stand++;
    }
  }
  const leadIds = new Set(hotLeads().map(l => l.participante_id));
  for (const p of data.participantes) {
    if (!leadIds.has(p.id)) continue;
    const reps = new Set<string>();
    for (const n of p.notas) reps.add(n.representante_id);
    for (const rid of reps) {
      const s = map.get(rid);
      if (s) s.hotLeads++;
    }
  }

  const arr = Array.from(map.values()).sort((a, b) => (b.notas + b.stand + b.hotLeads * 3) - (a.notas + a.stand + a.hotLeads * 3));
  const rows: Row[] = [
    ["RANKING DEL EQUIPO"],
    [],
    ["Representante", "Notas", "Stand contactos", "Hot leads generados", "Score (notas + stand + hot×3)"],
    ...arr.map(s => [s.rep.nombre, s.notas, s.stand, s.hotLeads, s.notas + s.stand + s.hotLeads * 3] as Row),
  ];
  return ws(rows, [25, 8, 16, 22, 30]);
}

// ===== 8. Participantes =====
function buildParticipantes(data: ReporteData): XLSX.WorkSheet {
  const headers: Row = ["Nombre", "País", "Cargo principal", "Email", "Teléfono", "Organización", "Estado", "Alta prioridad", "Notas (#)", "Prioridad score"];
  const rows: Row[] = [["PARTICIPANTES UINL"], [], headers];
  const ordered = [...data.participantes].sort((a, b) => {
    if (a.contacto.alta_prioridad !== b.contacto.alta_prioridad) return a.contacto.alta_prioridad ? -1 : 1;
    return b.prioridad_score - a.prioridad_score || a.nombre_completo.localeCompare(b.nombre_completo);
  });
  for (const p of ordered) {
    rows.push([
      p.nombre_completo,
      p.pais_label ?? "",
      p.cargo_principal ?? "",
      p.email ?? "",
      p.telefono ?? "",
      p.organizacion ?? "",
      p.contacto.estado,
      bool(p.contacto.alta_prioridad),
      p.notas.length,
      p.prioridad_score,
    ]);
  }
  return ws(rows, [30, 18, 28, 28, 16, 28, 14, 14, 10, 10]);
}

// ===== 9. Notas =====
function buildNotas(data: ReporteData): XLSX.WorkSheet {
  const rows: Row[] = [["NOTAS — cronología completa"], [], ["Fecha", "Autor", "Participante", "País", "Texto"]];
  // Aplanar
  const flat: Array<{ when: string; autor: string; nombre: string; pais: string; texto: string }> = [];
  for (const p of data.participantes) {
    for (const n of p.notas) {
      flat.push({
        when: n.created_at,
        autor: n.representante?.nombre ?? "",
        nombre: p.nombre_completo,
        pais: p.pais_label ?? "",
        texto: n.texto,
      });
    }
  }
  flat.sort((a, b) => b.when.localeCompare(a.when));
  for (const n of flat) rows.push([dateLocal(n.when), n.autor, n.nombre, n.pais, n.texto]);
  return ws(rows, [18, 18, 30, 18, 80]);
}

// ===== 10. Stand F.0024-02 =====
function buildStand(data: ReporteData): XLSX.WorkSheet {
  const repsById = new Map(data.representantes.map(r => [r.id, r]));
  const headers: Row = [
    "Fecha", "Recepcionado por", "Contacto", "Cargo", "Institución", "País", "Email", "Teléfono",
    "Notarios aprox", "Emite formularios", "Líneas formularios", "Sistema emisión",
    "Falsificaciones", "Riesgos / oportunidades",
    "Seguridad física actual", "Consumo folios", "Modalidad compra", "Impresor", "Proveedor impresión",
    "Seguridad digital", "Herramientas digitales", "Desarrollo", "Proveedor desarrollo",
    "Próximos pasos solicitados", "Canal preferido",
    "Observaciones", "Tarjeta URL",
  ];
  const rows: Row[] = [["STAND F.0024-02 — formularios cargados"], [], headers];
  const sorted = [...data.stand_contactos].sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
  for (const s of sorted) {
    const rep = s.recepcionado_por ? repsById.get(s.recepcionado_por)?.nombre ?? "" : "";
    rows.push([
      s.fecha, rep, s.contacto_nombre, s.cargo ?? "", s.institucion ?? "", s.pais_label ?? "", s.email ?? "", s.telefono ?? "",
      s.p1_notarios_aprox, bool(s.p2_emite_formularios), s.p3_lineas_formularios, s.p4_sistema_emision ?? "",
      bool(s.p5_falsificaciones), s.p6_riesgos ?? "",
      s.p7_seguridad_fisica ?? "", s.p8_consumo_folios ?? "", s.p9_modalidad_compra ?? "", s.p10_impresor ?? "", s.p11_proveedor_impresion ?? "",
      s.p12_seguridad_digital ?? "", s.p13_herramientas ?? "", s.p14_desarrollo ?? "", s.p14_proveedor_desarrollo ?? "",
      (s.p15_proximos_pasos ?? []).join(", "), (s.p16_canal_contacto ?? []).join(", "),
      s.observaciones ?? "", s.tarjeta_url ?? "",
    ]);
  }
  return ws(rows);
}

// ===== 11. Países =====
function buildPaises(data: ReporteData): XLSX.WorkSheet {
  const partByPais = new Map<string, number>();
  for (const p of data.participantes) {
    if (!p.pais_id) continue;
    partByPais.set(p.pais_id, (partByPais.get(p.pais_id) ?? 0) + 1);
  }
  const headers: Row = ["País", "Continente", "Inscriptos", "Organización notarial", "Notarios", "Habitantes", "Consumo anual", "Tipo de foja", "Impresor", "Características"];
  const rows: Row[] = [["PAÍSES UINL"], [], headers];
  const ordered = [...data.paises].sort((a, b) => a.nombre.localeCompare(b.nombre));
  for (const p of ordered) {
    rows.push([
      p.nombre,
      p.continente ?? "",
      partByPais.get(p.id) ?? 0,
      p.organizacion_notarial ?? "",
      p.cantidad_notarios ?? "",
      p.cantidad_habitantes ?? "",
      p.consumo_anual ?? "",
      p.foja_tipo ?? "",
      p.impresor_fojas ?? "",
      p.caracteristicas_tecnicas ?? "",
    ]);
  }
  return ws(rows, [20, 12, 10, 30, 12, 14, 14, 18, 14, 30]);
}

export function buildXlsx(data: ReporteData): Uint8Array {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildResumen(data),         "Resumen");
  XLSX.utils.book_append_sheet(wb, buildHotLeads(),             "Hot Leads");
  XLSX.utils.book_append_sheet(wb, buildMercadosVirgenes(),     "Mercados Vírgenes");
  XLSX.utils.book_append_sheet(wb, buildMultiplicadores(),      "Multiplicadores");
  XLSX.utils.book_append_sheet(wb, buildProximosPasos(),        "Próximos Pasos");
  XLSX.utils.book_append_sheet(wb, buildCobertura(data),        "Cobertura Objetivos");
  XLSX.utils.book_append_sheet(wb, buildRanking(data),          "Ranking Equipo");
  XLSX.utils.book_append_sheet(wb, buildParticipantes(data),    "Participantes");
  XLSX.utils.book_append_sheet(wb, buildNotas(data),            "Notas");
  XLSX.utils.book_append_sheet(wb, buildStand(data),            "Stand F0024-02");
  XLSX.utils.book_append_sheet(wb, buildPaises(data),           "Países");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
}
