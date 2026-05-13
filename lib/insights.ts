import insightsData from "@/data/insights.json";
import type { InsightItem, InsightsFile } from "./insights-types";

/**
 * Carga estática del JSON de insights generado por scripts/extract-insights.ts.
 * Bundleado en build time — refresca cuando se commitea + redeploya.
 */
export const insights = insightsData as unknown as InsightsFile;

export function hotLeads(): InsightItem[] {
  return insights.insights
    .filter(i => i.classification === "hot_lead")
    .sort((a, b) => b.priority - a.priority);
}

export function warmLeads(): InsightItem[] {
  return insights.insights
    .filter(i => i.classification === "warm")
    .sort((a, b) => b.priority - a.priority);
}

export function multiplicadores(): InsightItem[] {
  return insights.insights
    .filter(i => i.multiplier_to)
    .sort((a, b) => b.priority - a.priority);
}

export function proximosPasos(): InsightItem[] {
  return insights.insights
    .filter(i => i.next_step)
    .sort((a, b) => b.priority - a.priority);
}

export function insightForParticipante(id: string): InsightItem | undefined {
  return insights.insights.find(i => i.participante_id === id);
}

/** ¿Hace cuántos minutos se generó? Útil para flag de stale. */
export function insightsAgeMinutes(): number {
  const generated = new Date(insights.generated_at).getTime();
  return Math.round((Date.now() - generated) / 60000);
}
