import { supabaseAnon } from "./supabase";
import type {
  Comision,
  Contacto,
  Nota,
  NotaDetalle,
  Pais,
  Participacion,
  ParticipacionDetalle,
  Participante,
  ParticipanteEnriquecido,
  Representante,
  StandContacto,
} from "./types";

export interface ReporteData {
  participantes: ParticipanteEnriquecido[];
  paises: Pais[];
  comisiones: Comision[];
  representantes: Representante[];
  stand_contactos: StandContacto[];
  total_notas: number;
  generado_en: string;
}

/**
 * Una sola llamada que trae TODO lo necesario para el reporte.
 * 8 queries en paralelo + join en memoria. Para ~1000 filas totales
 * es instantáneo y evita N+1 que pasaría con selects anidados.
 */
export async function getReporteData(): Promise<ReporteData> {
  const sb = supabaseAnon();

  const [pa, co, re, pr, cn, no, sc, pi] = await Promise.all([
    sb.from("participantes").select("*"),
    sb.from("comisiones").select("*"),
    sb.from("representantes").select("id,nombre,color"),
    sb.from("participaciones").select("*"),
    sb.from("contactos").select("*"),
    sb.from("notas").select("*"),
    sb.from("stand_contactos").select("*"),
    sb.from("paises").select("*"),
  ]);

  const queries = { participantes: pa, comisiones: co, representantes: re, participaciones: pr, contactos: cn, notas: no, stand_contactos: sc, paises: pi };
  for (const [k, q] of Object.entries(queries)) {
    if (q.error) throw new Error(`Error en ${k}: ${q.error.message}`);
  }

  const participantesRaw = (pa.data ?? []) as Participante[];
  const comisiones = (co.data ?? []) as Comision[];
  const representantes = (re.data ?? []) as Representante[];
  const participaciones = (pr.data ?? []) as Participacion[];
  const contactos = (cn.data ?? []) as Contacto[];
  const notas = (no.data ?? []) as Nota[];
  const standContactos = (sc.data ?? []) as StandContacto[];
  const paises = (pi.data ?? []) as Pais[];

  const comisionByCodigo = new Map(comisiones.map(c => [c.codigo, c]));
  const repById = new Map(representantes.map(r => [r.id, r]));
  const contactoByPart = new Map(contactos.map(c => [c.participante_id, c]));

  const partsByPart = new Map<string, ParticipacionDetalle[]>();
  for (const p of participaciones) {
    const comision = comisionByCodigo.get(p.comision_codigo);
    if (!comision) continue;
    const arr = partsByPart.get(p.participante_id) ?? [];
    arr.push({ cargo: p.cargo, comision });
    partsByPart.set(p.participante_id, arr);
  }

  const notasByPart = new Map<string, NotaDetalle[]>();
  for (const n of notas) {
    const arr = notasByPart.get(n.participante_id) ?? [];
    arr.push({ ...n, representante: repById.get(n.representante_id) ?? null });
    notasByPart.set(n.participante_id, arr);
  }
  for (const arr of notasByPart.values()) {
    arr.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  const participantesEnriq: ParticipanteEnriquecido[] = participantesRaw.map(p => ({
    ...p,
    contacto: contactoByPart.get(p.id) ?? {
      participante_id: p.id,
      estado: "pendiente",
      representante_id: null,
      updated_at: p.created_at,
    },
    participaciones: partsByPart.get(p.id) ?? [],
    notas: notasByPart.get(p.id) ?? [],
  }));

  return {
    participantes: participantesEnriq,
    paises,
    comisiones,
    representantes,
    stand_contactos: standContactos,
    total_notas: notas.length,
    generado_en: new Date().toISOString(),
  };
}
