/**
 * Tipos compartidos del archivo data/insights.json producido por
 * scripts/extract-insights.ts. El dashboard consume estos tipos.
 */

export type InsightClassification = "hot_lead" | "warm" | "social" | "info_only";

export interface InsightItem {
  participante_id: string;
  participante_nombre: string;
  pais_label: string | null;
  classification: InsightClassification;
  lead_reason: string | null;
  next_step: string | null;
  multiplier_to: string | null;
  virgin_market: boolean;
  pipeline_usd_clue: string | null;
  priority: number; // 0-100
}

export interface InsightsFile {
  generated_at: string;
  model: string;
  total_notes_analyzed: number;
  total_participants_analyzed: number;
  insights: InsightItem[];
  global: {
    hot_leads_count: number;
    countries_with_hot_leads: string[];
    virgin_markets: string[];
    next_steps_count: number;
    multipliers_count: number;
    headline: string;
  };
  cost_usd: number | null;
}
