import ExcelJS from "exceljs";
import type { ReporteData } from "./queries";
import type { Representante } from "./types";
import { insights, hotLeads, multiplicadores, proximosPasos } from "./insights";
import { paisesObjetivo, CONTINENTE_ORDEN } from "./paises-objetivo";

// Paleta (ARGB con FF al inicio = alpha completo)
const C = {
  dark:    "FF0B1B3B",
  text:    "FF1F2937",
  white:   "FFFFFFFF",
  header:  "FFE5E7EB",
  border:  "FFCBD5E1",
  amber:   "FFFEF3C7",
  amberDk: "FFB45309",
  rose:    "FFFCE7F3",
  roseDk:  "FFBE185D",
  violet:  "FFEDE9FE",
  violetDk:"FF6D28D9",
  blue:    "FFDBEAFE",
  blueDk:  "FF1D4ED8",
  green:   "FFD1FAE5",
  greenDk: "FF047857",
  yellow:  "FFFEF3C7",
  yellowDk:"FF92400E",
  red:     "FFFEE2E2",
  redDk:   "FF991B1B",
  zebra:   "FFF8FAFC",
};

function addTitle(ws: ExcelJS.Worksheet, title: string, span: number, accent: string = C.dark) {
  ws.mergeCells(1, 1, 1, span);
  const t = ws.getCell(1, 1);
  t.value = title;
  t.font = { name: "Calibri", bold: true, size: 14, color: { argb: C.white } };
  t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: accent } };
  t.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  ws.getRow(1).height = 28;
}

function addHeaders(ws: ExcelJS.Worksheet, headers: string[], rowNum: number = 3, fillColor: string = C.header) {
  const row = ws.getRow(rowNum);
  row.values = headers;
  for (let i = 1; i <= headers.length; i++) {
    const cell = row.getCell(i);
    cell.font = { name: "Calibri", bold: true, size: 10, color: { argb: C.text } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillColor } };
    cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    cell.border = { bottom: { style: "medium", color: { argb: C.border } } };
  }
  row.height = 22;
}

function setWidths(ws: ExcelJS.Worksheet, widths: number[]) {
  for (let i = 0; i < widths.length; i++) {
    ws.getColumn(i + 1).width = widths[i];
  }
}

function freezeAndFilter(ws: ExcelJS.Worksheet, headerRow: number, lastCol: number) {
  ws.views = [{ state: "frozen", ySplit: headerRow }];
  ws.autoFilter = {
    from: { row: headerRow, column: 1 },
    to: { row: headerRow, column: lastCol },
  };
}

function styleDataRange(ws: ExcelJS.Worksheet, firstRow: number, lastRow: number, lastCol: number, opts?: { zebra?: boolean }) {
  for (let r = firstRow; r <= lastRow; r++) {
    const row = ws.getRow(r);
    const isZebra = opts?.zebra && (r - firstRow) % 2 === 1;
    for (let c = 1; c <= lastCol; c++) {
      const cell = row.getCell(c);
      cell.font = { name: "Calibri", size: 10, color: { argb: C.text } };
      cell.alignment = { vertical: "top", wrapText: true };
      if (isZebra) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.zebra } };
      }
    }
  }
}

function fmtBool(v: boolean | null | undefined): string {
  if (v === null || v === undefined) return "";
  return v ? "Sí" : "No";
}

function fmtDateCell(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

// ============================================================================
// 1. RESUMEN
// ============================================================================
function buildResumen(wb: ExcelJS.Workbook, data: ReporteData) {
  const ws = wb.addWorksheet("Resumen", { properties: { tabColor: { argb: C.dark } } });
  setWidths(ws, [38, 60]);
  addTitle(ws, "Consolidado UINL · Bolivia 2026", 2);

  const total = data.participantes.length;
  const contactados = data.participantes.filter(p => p.contacto.estado === "contactado").length;
  const alta = data.participantes.filter(p => p.contacto.alta_prioridad).length;
  const noInt = data.participantes.filter(p => p.contacto.estado === "no_interesado").length;

  ws.getRow(3).values = ["Síntesis (IA):"];
  ws.getCell("A3").font = { bold: true, size: 11 };
  ws.getCell("B3").value = insights.global.headline;
  ws.getCell("B3").alignment = { wrapText: true, vertical: "top" };
  ws.getRow(3).height = 60;

  // Section: Métricas operativas
  const r = (n: number, label: string, value: string | number) => {
    ws.getCell(`A${n}`).value = label;
    ws.getCell(`A${n}`).font = { name: "Calibri", size: 10, color: { argb: C.text } };
    ws.getCell(`B${n}`).value = value;
    ws.getCell(`B${n}`).font = { name: "Calibri", size: 10, bold: true, color: { argb: C.text } };
  };

  ws.mergeCells("A5:B5");
  ws.getCell("A5").value = "MÉTRICAS OPERATIVAS";
  ws.getCell("A5").font = { bold: true, size: 11, color: { argb: C.white } };
  ws.getCell("A5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.dark } };
  ws.getCell("A5").alignment = { horizontal: "left", indent: 1 };
  ws.getRow(5).height = 20;
  r(6, "Participantes UINL", total);
  r(7, "Contactados", contactados);
  r(8, "Alta prioridad", alta);
  r(9, "No interesados", noInt);
  r(10, "Notas registradas", data.total_notas);
  r(11, "Contactos de stand", data.stand_contactos.length);

  ws.mergeCells("A13:B13");
  ws.getCell("A13").value = "ANÁLISIS DE IA";
  ws.getCell("A13").font = { bold: true, size: 11, color: { argb: C.white } };
  ws.getCell("A13").fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.amberDk } };
  ws.getCell("A13").alignment = { horizontal: "left", indent: 1 };
  ws.getRow(13).height = 20;
  r(14, "Hot leads identificados", insights.global.hot_leads_count);
  r(15, "Países con hot lead", insights.global.countries_with_hot_leads.join(", "));
  r(16, "Mercados vírgenes", insights.global.virgin_markets.join(", "));
  r(17, "Multiplicadores activos", insights.global.multipliers_count);
  r(18, "Próximos pasos pendientes", insights.global.next_steps_count);

  ws.getCell("A20").value = "Generado:";
  ws.getCell("A20").font = { italic: true, size: 9, color: { argb: "FF6B7280" } };
  ws.getCell("B20").value = new Date();
  ws.getCell("B20").numFmt = "dd/mm/yyyy hh:mm";
  ws.getCell("B20").font = { italic: true, size: 9, color: { argb: "FF6B7280" } };
}

// ============================================================================
// 2. HOT LEADS
// ============================================================================
function buildHotLeads(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet("Hot Leads", { properties: { tabColor: { argb: C.amberDk } } });
  const widths = [8, 22, 32, 50, 50, 50, 38, 12];
  setWidths(ws, widths);
  addTitle(ws, "🔥 Hot Leads — oportunidades comerciales identificadas", widths.length, C.amberDk);
  const headers = ["Prio", "País", "Nombre", "Por qué es hot", "Pipeline / dato comercial", "Próximo paso", "Multiplica a", "Mercado virgen"];
  addHeaders(ws, headers, 3, C.amber);

  const leads = hotLeads();
  for (const l of leads) {
    ws.addRow([
      l.priority,
      l.pais_label ?? "",
      l.participante_nombre,
      l.lead_reason ?? "",
      l.pipeline_usd_clue ?? "",
      l.next_step ?? "",
      l.multiplier_to ?? "",
      fmtBool(l.virgin_market),
    ]);
  }
  styleDataRange(ws, 4, 3 + leads.length, widths.length, { zebra: true });
  freezeAndFilter(ws, 3, widths.length);
}

// ============================================================================
// 3. MERCADOS VÍRGENES
// ============================================================================
function buildMercadosVirgenes(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet("Mercados Vírgenes", { properties: { tabColor: { argb: C.roseDk } } });
  const widths = [22, 32, 55, 50, 10];
  setWidths(ws, widths);
  addTitle(ws, "🆕 Mercados vírgenes — países sin papel de seguridad", widths.length, C.roseDk);
  const headers = ["País", "Contacto", "Por qué", "Próximo paso", "Prioridad"];
  addHeaders(ws, headers, 3, C.rose);

  const items = insights.insights.filter(i => i.virgin_market).sort((a, b) => b.priority - a.priority);
  for (const v of items) {
    ws.addRow([v.pais_label ?? "", v.participante_nombre, v.lead_reason ?? "", v.next_step ?? "", v.priority]);
  }
  styleDataRange(ws, 4, 3 + items.length, widths.length, { zebra: true });
  freezeAndFilter(ws, 3, widths.length);
}

// ============================================================================
// 4. MULTIPLICADORES
// ============================================================================
function buildMultiplicadores(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet("Multiplicadores", { properties: { tabColor: { argb: C.violetDk } } });
  const widths = [22, 32, 60, 16, 10];
  setWidths(ws, widths);
  addTitle(ws, "↗ Multiplicadores — personas que abren puerta a otros contactos", widths.length, C.violetDk);
  const headers = ["País", "Persona", "Abre puerta a", "Clasificación", "Prioridad"];
  addHeaders(ws, headers, 3, C.violet);

  const items = multiplicadores();
  for (const m of items) {
    ws.addRow([m.pais_label ?? "", m.participante_nombre, m.multiplier_to ?? "", m.classification, m.priority]);
  }
  styleDataRange(ws, 4, 3 + items.length, widths.length, { zebra: true });
  freezeAndFilter(ws, 3, widths.length);
}

// ============================================================================
// 5. PRÓXIMOS PASOS
// ============================================================================
function buildProximosPasos(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet("Próximos Pasos", { properties: { tabColor: { argb: C.blueDk } } });
  const widths = [8, 60, 32, 22, 14];
  setWidths(ws, widths);
  addTitle(ws, "↦ Próximos pasos — to-do post viaje", widths.length, C.blueDk);
  const headers = ["Prio", "Acción", "Persona", "País", "Clasificación"];
  addHeaders(ws, headers, 3, C.blue);

  const items = proximosPasos();
  for (const p of items) {
    ws.addRow([p.priority, p.next_step ?? "", p.participante_nombre, p.pais_label ?? "", p.classification]);
  }
  styleDataRange(ws, 4, 3 + items.length, widths.length, { zebra: true });
  freezeAndFilter(ws, 3, widths.length);
}

// ============================================================================
// 6. COBERTURA OBJETIVOS (con color por status)
// ============================================================================
function buildCobertura(wb: ExcelJS.Workbook, data: ReporteData) {
  const ws = wb.addWorksheet("Cobertura Objetivos", { properties: { tabColor: { argb: C.greenDk } } });
  const widths = [14, 28, 22, 12, 10, 32];
  setWidths(ws, widths);
  addTitle(ws, "🎯 Cobertura — los 28 países objetivo de campaña", widths.length, C.dark);
  const headers = ["Continente", "País", "Estado", "Inscriptos", "Notas", "Hot lead identificado"];
  addHeaders(ws, headers, 3);

  const partByPais = new Map<string, typeof data.participantes>();
  for (const p of data.participantes) {
    if (!p.pais_id) continue;
    const arr = partByPais.get(p.pais_id) ?? [];
    arr.push(p);
    partByPais.set(p.pais_id, arr);
  }
  const insightsByPart = new Map(insights.insights.map(i => [i.participante_id, i]));

  let row = 4;
  for (const cont of CONTINENTE_ORDEN) {
    for (const o of paisesObjetivo.filter(p => p.continente === cont)) {
      const parts = partByPais.get(o.slug) ?? [];
      let hasHot = false, hasAny = false, hotName = "", notasTotal = 0;
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
      const status: "green" | "yellow" | "red" = hasHot ? "green" : hasAny ? "yellow" : "red";
      const statusLabel = status === "green" ? "🟢 Hot lead" : status === "yellow" ? "🟡 Con actividad" : "🔴 Sin tocar";
      const statusBg = status === "green" ? C.green : status === "yellow" ? C.yellow : C.red;
      const statusFg = status === "green" ? C.greenDk : status === "yellow" ? C.yellowDk : C.redDk;

      ws.getRow(row).values = [o.continente, o.nombre, statusLabel, parts.length, notasTotal, hotName];
      // Estilo por fila
      for (let c = 1; c <= widths.length; c++) {
        const cell = ws.getRow(row).getCell(c);
        cell.font = { name: "Calibri", size: 10, color: { argb: C.text } };
        cell.alignment = { vertical: "middle" };
      }
      // El "estado" lleva fondo de color
      const estadoCell = ws.getRow(row).getCell(3);
      estadoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusBg } };
      estadoCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: statusFg } };
      ws.getRow(row).height = 18;
      row++;
    }
  }
  freezeAndFilter(ws, 3, widths.length);
}

// ============================================================================
// 7. RANKING EQUIPO
// ============================================================================
function buildRanking(wb: ExcelJS.Workbook, data: ReporteData) {
  const ws = wb.addWorksheet("Ranking Equipo", { properties: { tabColor: { argb: C.dark } } });
  const widths = [28, 10, 18, 22, 16];
  setWidths(ws, widths);
  addTitle(ws, "👥 Ranking del equipo durante el congreso", widths.length);
  const headers = ["Representante", "Notas", "Stand", "Hot leads generados", "Score"];
  addHeaders(ws, headers, 3);

  const map = new Map<string, { rep: Representante; notas: number; stand: number; hotLeads: number }>();
  for (const r of data.representantes) map.set(r.id, { rep: r, notas: 0, stand: 0, hotLeads: 0 });
  for (const p of data.participantes) for (const n of p.notas) {
    const s = map.get(n.representante_id);
    if (s) s.notas++;
  }
  for (const sc of data.stand_contactos) if (sc.recepcionado_por) {
    const s = map.get(sc.recepcionado_por);
    if (s) s.stand++;
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
  const arr = Array.from(map.values()).sort((a, b) =>
    (b.notas + b.stand + b.hotLeads * 3) - (a.notas + a.stand + a.hotLeads * 3),
  );
  for (const s of arr) {
    ws.addRow([s.rep.nombre, s.notas, s.stand, s.hotLeads, s.notas + s.stand + s.hotLeads * 3]);
  }
  styleDataRange(ws, 4, 3 + arr.length, widths.length, { zebra: true });
  freezeAndFilter(ws, 3, widths.length);
}

// ============================================================================
// 8. PARTICIPANTES
// ============================================================================
function buildParticipantes(wb: ExcelJS.Workbook, data: ReporteData) {
  const ws = wb.addWorksheet("Participantes", { properties: { tabColor: { argb: C.text } } });
  const widths = [32, 20, 30, 30, 18, 30, 16, 14, 8, 10];
  setWidths(ws, widths);
  addTitle(ws, "Participantes UINL — lista completa", widths.length);
  const headers = ["Nombre", "País", "Cargo principal", "Email", "Teléfono", "Organización", "Estado", "Alta prioridad", "Notas", "Prioridad"];
  addHeaders(ws, headers, 3);

  const ordered = [...data.participantes].sort((a, b) => {
    if (a.contacto.alta_prioridad !== b.contacto.alta_prioridad) return a.contacto.alta_prioridad ? -1 : 1;
    return b.prioridad_score - a.prioridad_score || a.nombre_completo.localeCompare(b.nombre_completo);
  });
  for (const p of ordered) {
    ws.addRow([
      p.nombre_completo,
      p.pais_label ?? "",
      p.cargo_principal ?? "",
      p.email ?? "",
      p.telefono ?? "",
      p.organizacion ?? "",
      p.contacto.estado,
      fmtBool(p.contacto.alta_prioridad),
      p.notas.length,
      p.prioridad_score,
    ]);
  }
  styleDataRange(ws, 4, 3 + ordered.length, widths.length, { zebra: true });
  freezeAndFilter(ws, 3, widths.length);
}

// ============================================================================
// 9. NOTAS
// ============================================================================
function buildNotas(wb: ExcelJS.Workbook, data: ReporteData) {
  const ws = wb.addWorksheet("Notas", { properties: { tabColor: { argb: C.text } } });
  const widths = [20, 20, 32, 20, 90];
  setWidths(ws, widths);
  addTitle(ws, "Notas — cronología completa del equipo", widths.length);
  const headers = ["Fecha", "Autor", "Participante", "País", "Texto"];
  addHeaders(ws, headers, 3);

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

  for (const n of flat) {
    const newRow = ws.addRow([fmtDateCell(n.when), n.autor, n.nombre, n.pais, n.texto]);
    newRow.getCell(1).numFmt = "dd/mm/yyyy hh:mm";
  }
  styleDataRange(ws, 4, 3 + flat.length, widths.length, { zebra: true });
  freezeAndFilter(ws, 3, widths.length);
}

// ============================================================================
// 10. STAND F.0024-02
// ============================================================================
function buildStand(wb: ExcelJS.Workbook, data: ReporteData) {
  const ws = wb.addWorksheet("Stand F0024-02", { properties: { tabColor: { argb: C.text } } });
  const headers = [
    "Fecha", "Recepcionado por", "Contacto", "Cargo", "Institución", "País", "Email", "Teléfono",
    "Notarios aprox", "Emite formularios", "Líneas formularios", "Sistema emisión",
    "Falsificaciones", "Riesgos / oportunidades",
    "Seguridad física actual", "Consumo folios", "Modalidad compra", "Impresor", "Proveedor impresión",
    "Seguridad digital", "Herramientas digitales", "Desarrollo", "Proveedor desarrollo",
    "Próximos pasos solicitados", "Canal preferido",
    "Observaciones", "Tarjeta URL",
  ];
  const widths = [14, 18, 28, 22, 28, 18, 26, 16, 12, 12, 12, 14, 12, 40, 30, 18, 18, 14, 26, 30, 30, 14, 26, 32, 22, 40, 36];
  setWidths(ws, widths);
  addTitle(ws, "Stand · Formularios F.0024-02 cargados", widths.length);
  addHeaders(ws, headers, 3);

  const repsById = new Map(data.representantes.map(r => [r.id, r]));
  const sorted = [...data.stand_contactos].sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
  for (const s of sorted) {
    const rep = s.recepcionado_por ? repsById.get(s.recepcionado_por)?.nombre ?? "" : "";
    const newRow = ws.addRow([
      fmtDateCell(s.fecha), rep, s.contacto_nombre, s.cargo ?? "", s.institucion ?? "", s.pais_label ?? "", s.email ?? "", s.telefono ?? "",
      s.p1_notarios_aprox, fmtBool(s.p2_emite_formularios), s.p3_lineas_formularios, s.p4_sistema_emision ?? "",
      fmtBool(s.p5_falsificaciones), s.p6_riesgos ?? "",
      s.p7_seguridad_fisica ?? "", s.p8_consumo_folios ?? "", s.p9_modalidad_compra ?? "", s.p10_impresor ?? "", s.p11_proveedor_impresion ?? "",
      s.p12_seguridad_digital ?? "", s.p13_herramientas ?? "", s.p14_desarrollo ?? "", s.p14_proveedor_desarrollo ?? "",
      (s.p15_proximos_pasos ?? []).join(", "), (s.p16_canal_contacto ?? []).join(", "),
      s.observaciones ?? "", s.tarjeta_url ?? "",
    ]);
    newRow.getCell(1).numFmt = "dd/mm/yyyy";
  }
  styleDataRange(ws, 4, 3 + sorted.length, widths.length, { zebra: true });
  freezeAndFilter(ws, 3, widths.length);
}

// ============================================================================
// 11. PAÍSES
// ============================================================================
function buildPaises(wb: ExcelJS.Workbook, data: ReporteData) {
  const ws = wb.addWorksheet("Países", { properties: { tabColor: { argb: C.text } } });
  const widths = [22, 14, 12, 32, 12, 16, 16, 20, 14, 32];
  setWidths(ws, widths);
  addTitle(ws, "Países UINL — catálogo con metadata comercial", widths.length);
  const headers = ["País", "Continente", "Inscriptos", "Organización notarial", "Notarios", "Habitantes", "Consumo anual", "Tipo de foja", "Impresor", "Características técnicas"];
  addHeaders(ws, headers, 3);

  const partByPais = new Map<string, number>();
  for (const p of data.participantes) {
    if (!p.pais_id) continue;
    partByPais.set(p.pais_id, (partByPais.get(p.pais_id) ?? 0) + 1);
  }

  const ordered = [...data.paises].sort((a, b) => a.nombre.localeCompare(b.nombre));
  for (const p of ordered) {
    ws.addRow([
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
  // Formato de número para miles (notarios, habitantes, consumo)
  for (let r = 4; r <= 3 + ordered.length; r++) {
    ws.getCell(r, 5).numFmt = "#,##0";
    ws.getCell(r, 6).numFmt = "#,##0";
    ws.getCell(r, 7).numFmt = "#,##0";
  }
  styleDataRange(ws, 4, 3 + ordered.length, widths.length, { zebra: true });
  freezeAndFilter(ws, 3, widths.length);
}

// ============================================================================
// BUILDER PUBLICO
// ============================================================================
export async function buildXlsx(data: ReporteData): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Dashboard UINL Bolivia 2026";
  wb.created = new Date();
  wb.properties.date1904 = false;

  buildResumen(wb, data);
  buildHotLeads(wb);
  buildMercadosVirgenes(wb);
  buildMultiplicadores(wb);
  buildProximosPasos(wb);
  buildCobertura(wb, data);
  buildRanking(wb, data);
  buildParticipantes(wb, data);
  buildNotas(wb, data);
  buildStand(wb, data);
  buildPaises(wb, data);

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return new Uint8Array(arrayBuffer as ArrayBuffer);
}
