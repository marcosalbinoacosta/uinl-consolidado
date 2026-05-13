/**
 * Extrae insights de las notas del equipo durante el congreso UINL Bolivia 2026.
 *
 * Lee:
 *   - notas, participantes, paises, representantes, stand_contactos (anon key, RLS allow select)
 * Pasa el contexto agregado a Claude Haiku 4.5 en una sola llamada
 * Clasifica cada participante con notas/stand como:
 *   hot_lead | warm | social | info_only
 * Detecta:
 *   - multiplicadores (X va a presentar a Y)
 *   - mercados vírgenes (país sin papel de seguridad)
 *   - próximos pasos accionables
 *   - pipeline clues (USD/volumen mencionados)
 * Escribe data/insights.json para que lo consuma el dashboard.
 *
 * Uso (desde uinl-consolidado/):
 *   npm run extract
 *
 * Requisitos en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 *   ANTHROPIC_API_KEY=...
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import type { InsightItem, InsightsFile } from "../lib/insights-types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("✗ Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}
if (!ANTHROPIC_KEY) {
  console.error("✗ Falta ANTHROPIC_API_KEY en .env.local");
  console.error("  Sugerencia: copialo desde APP pocket/.env.local (lo usa /api/brief)");
  process.exit(1);
}

const MODEL = "claude-haiku-4-5-20251001";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

interface ContextoParticipante {
  participante_id: string;
  nombre: string;
  pais_label: string | null;
  cargo_principal: string | null;
  organizacion: string | null;
  pais_info: {
    organizacion_notarial: string | null;
    cantidad_notarios: number | null;
    consumo_anual: number | null;
    foja_tipo: string | null;
    impresor_fojas: string | null;
    caracteristicas_tecnicas: string | null;
  } | null;
  notas: Array<{ autor: string; fecha: string; texto: string }>;
  stand_forms_count: number;
}

const SYSTEM_PROMPT = `Sos analista de inteligencia comercial para +LATINA, empresa boliviana de papel de seguridad para escrituras notariales. Tu trabajo: leer las notas que el equipo tomó durante el congreso UINL Bolivia 2026 y clasificar cada participante con notas/stand para identificar dónde están las oportunidades comerciales reales.

Clasificación de cada participante:
- "hot_lead": hay info comercial concreta (sistema de fojas conocido, falsificaciones detectadas, presupuestos/montos mencionados, cargo decisorio, cotización pedida, compromiso explícito).
- "warm": conversación con potencial comercial pero sin acción concreta pendiente.
- "social": solo saludo o presentación cordial sin contenido comercial.
- "info_only": la nota aporta info útil pero la persona no es lead (ej. "está en la comisión X").

Para cada participante, además identificá:
- MULTIPLICADOR: si la nota dice que va a presentar a otro contacto, abrir puerta a otra institución, etc. (ej. "me va a poner en contacto con", "nos presenta a", "tiene el contacto de", "le voy a decir que").
- MERCADO VIRGEN: si explícita o implícitamente el país NO tiene papel de seguridad o tiene un sistema débil que +LATINA podría reemplazar.
- PIPELINE CLUE: cualquier USD, volumen mensual/anual, cantidad de fojas/folios, o magnitud concreta del mercado mencionada.
- NEXT STEP: acción concreta que el equipo dejó pendiente (cotizar, enviar info, ir al evento X, reunirse con Y, etc.).
- LEAD REASON: si es hot_lead, una frase corta (max 15 palabras) que explica POR QUÉ.

Priority 0-100:
- 80-100 = hot_lead con next_step claro y dato comercial duro
- 60-79 = hot_lead pero sin next_step claro, o warm con dato fuerte
- 40-59 = warm sin dato fuerte
- 20-39 = social con multiplicador potencial
- 0-19 = social/info puro

Responde SOLO con JSON válido, sin markdown, sin texto antes ni después.`;

function userPrompt(targets: ContextoParticipante[]): string {
  return `Analizá estos ${targets.length} participantes (cada uno con sus notas):

${JSON.stringify(targets, null, 2)}

Devolvé un único objeto JSON con esta forma EXACTA:
{
  "insights": [
    {
      "participante_id": "<uuid del participante>",
      "classification": "hot_lead" | "warm" | "social" | "info_only",
      "lead_reason": "<frase corta o null>",
      "next_step": "<acción concreta o null>",
      "multiplier_to": "<'X → Y (contexto)' o null>",
      "virgin_market": <true | false>,
      "pipeline_usd_clue": "<texto que mencione cifras concretas o null>",
      "priority": <0-100>
    }
  ],
  "headline": "<1-2 líneas en castellano resumiendo el viaje desde el ángulo comercial>"
}

Una entrada por cada participant_id que te pasé. Castellano rioplatense, conciso, sin relleno.`;
}

async function main() {
  console.log("→ Cargando datos de Supabase...");
  const [notasQ, partsQ, paisesQ, repsQ, standQ] = await Promise.all([
    sb.from("notas").select("*").order("created_at", { ascending: true }),
    sb.from("participantes").select("*"),
    sb.from("paises").select("*"),
    sb.from("representantes").select("id,nombre,color"),
    sb.from("stand_contactos").select("*"),
  ]);

  for (const [k, q] of Object.entries({ notas: notasQ, participantes: partsQ, paises: paisesQ, representantes: repsQ, stand: standQ })) {
    if (q.error) throw new Error(`Error en ${k}: ${q.error.message}`);
  }

  const notas = notasQ.data ?? [];
  const parts = partsQ.data ?? [];
  const paises = paisesQ.data ?? [];
  const reps = repsQ.data ?? [];
  const stand = standQ.data ?? [];

  console.log(`  ${notas.length} notas · ${parts.length} participantes · ${stand.length} stand contacts`);

  const partById = new Map(parts.map((p: any) => [p.id, p]));
  const paisById = new Map(paises.map((p: any) => [p.id, p]));
  const repById = new Map(reps.map((r: any) => [r.id, r]));

  // notas y stand por participante
  const notasByPart = new Map<string, any[]>();
  for (const n of notas) {
    const arr = notasByPart.get(n.participante_id) ?? [];
    arr.push(n);
    notasByPart.set(n.participante_id, arr);
  }
  const standByPart = new Map<string, any[]>();
  for (const s of stand) {
    if (s.participante_id) {
      const arr = standByPart.get(s.participante_id) ?? [];
      arr.push(s);
      standByPart.set(s.participante_id, arr);
    }
  }

  const allTouched = new Set([...notasByPart.keys(), ...standByPart.keys()]);
  const targets: ContextoParticipante[] = [];
  for (const id of allTouched) {
    const p: any = partById.get(id);
    if (!p) continue;
    const pais: any = p.pais_id ? paisById.get(p.pais_id) : null;
    targets.push({
      participante_id: p.id,
      nombre: p.nombre_completo,
      pais_label: p.pais_label,
      cargo_principal: p.cargo_principal,
      organizacion: p.organizacion,
      pais_info: pais ? {
        organizacion_notarial: pais.organizacion_notarial,
        cantidad_notarios: pais.cantidad_notarios,
        consumo_anual: pais.consumo_anual,
        foja_tipo: pais.foja_tipo,
        impresor_fojas: pais.impresor_fojas,
        caracteristicas_tecnicas: pais.caracteristicas_tecnicas,
      } : null,
      notas: (notasByPart.get(id) ?? []).map((n: any) => ({
        autor: repById.get(n.representante_id)?.nombre ?? "?",
        fecha: n.created_at,
        texto: n.texto,
      })),
      stand_forms_count: (standByPart.get(id) ?? []).length,
    });
  }

  if (targets.length === 0) {
    console.error("✗ No hay participantes con notas ni stand. Nada para analizar.");
    process.exit(1);
  }
  console.log(`  ${targets.length} participantes con actividad → mandando a Claude Haiku 4.5...`);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt(targets) }],
  });

  let text = "";
  for (const block of response.content) {
    if (block.type === "text") text += block.text;
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("✗ No se encontró JSON en la respuesta del modelo:");
    console.error(text);
    process.exit(1);
  }

  let parsed: { insights: any[]; headline: string };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e: any) {
    console.error("✗ Error parseando JSON:", e.message);
    console.error(jsonMatch[0]);
    process.exit(1);
  }

  // Enriquecer con nombre y país para no tener que rehacer lookup desde el dashboard
  const insights: InsightItem[] = (parsed.insights ?? []).map((i: any) => {
    const p: any = partById.get(i.participante_id);
    return {
      participante_id: i.participante_id,
      participante_nombre: p?.nombre_completo ?? "?",
      pais_label: p?.pais_label ?? null,
      classification: i.classification,
      lead_reason: i.lead_reason || null,
      next_step: i.next_step || null,
      multiplier_to: i.multiplier_to || null,
      virgin_market: i.virgin_market === true,
      pipeline_usd_clue: i.pipeline_usd_clue || null,
      priority: typeof i.priority === "number" ? i.priority : 0,
    };
  });

  // Agregados globales (los calculo en TS, no en el modelo, para que sean deterministicos)
  const hotLeads = insights.filter(i => i.classification === "hot_lead");
  const countriesWithHotLeads = new Set<string>();
  for (const i of hotLeads) if (i.pais_label) countriesWithHotLeads.add(i.pais_label);
  const virginMarkets = new Set<string>();
  for (const i of insights) if (i.virgin_market && i.pais_label) virginMarkets.add(i.pais_label);
  const nextStepsCount = insights.filter(i => i.next_step).length;
  const multipliersCount = insights.filter(i => i.multiplier_to).length;

  // Estimación de costo (precios públicos Anthropic Haiku 4.5: $1/MTok input, $5/MTok output)
  const costUsd =
    (response.usage.input_tokens / 1_000_000) * 1.0 +
    (response.usage.output_tokens / 1_000_000) * 5.0;

  const output: InsightsFile = {
    generated_at: new Date().toISOString(),
    model: MODEL,
    total_notes_analyzed: notas.length,
    total_participants_analyzed: targets.length,
    insights,
    global: {
      hot_leads_count: hotLeads.length,
      countries_with_hot_leads: Array.from(countriesWithHotLeads).sort(),
      virgin_markets: Array.from(virginMarkets).sort(),
      next_steps_count: nextStepsCount,
      multipliers_count: multipliersCount,
      headline: parsed.headline ?? "",
    },
    cost_usd: Number(costUsd.toFixed(4)),
  };

  const outPath = path.join(process.cwd(), "data", "insights.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");

  console.log("");
  console.log(`✓ ${insights.length} insights → ${outPath}`);
  console.log(`  ${hotLeads.length} hot leads · ${countriesWithHotLeads.size} países con hot lead · ${virginMarkets.size} mercados vírgenes`);
  console.log(`  ${multipliersCount} multiplicadores · ${nextStepsCount} próximos pasos pendientes`);
  console.log("");
  console.log(`  Headline: ${parsed.headline}`);
  console.log("");
  console.log(`  Tokens: ${response.usage.input_tokens} in + ${response.usage.output_tokens} out`);
  console.log(`  Costo:  USD ${costUsd.toFixed(4)}`);
}

main().catch(e => {
  console.error("✗", e);
  process.exit(1);
});
