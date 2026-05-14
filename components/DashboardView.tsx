"use client";
import { useState, useMemo } from "react";
import type { ReporteData } from "@/lib/queries";
import type { InsightItem } from "@/lib/insights-types";
import { insights, insightForParticipante } from "@/lib/insights";
import { pct } from "@/lib/format";
import { TablaParticipantes } from "./TablaParticipantes";
import { CoberturaObjetivos } from "./CoberturaObjetivos";
import { MercadosVirgenes } from "./MercadosVirgenes";
import { Multiplicadores } from "./Multiplicadores";
import { ProximosPasos } from "./ProximosPasos";
import { RankingEquipo } from "./RankingEquipo";
import { CronologiaNotas } from "./CronologiaNotas";
import { StandContactos } from "./StandContactos";
import { HotLeads } from "./HotLeads";
import { HeadlineBanner } from "./HeadlineBanner";

type View =
  | "todos"
  | "contactados"
  | "hot_leads"
  | "warm"
  | "comercial"
  | "paises"
  | "notas"
  | "stand"
  | "proximos_pasos"
  | "multiplicadores"
  | "virgenes"
  | "equipo";

const VIEW_LABELS: Record<View, string> = {
  todos:          "Todos los participantes",
  contactados:    "Contactados directos",
  hot_leads:      "Hot leads",
  warm:           "Interés confirmado",
  comercial:      "Con dato comercial",
  paises:         "Países alcanzados",
  notas:          "Cronología de notas",
  stand:          "Contactos del stand",
  proximos_pasos: "Próximos pasos",
  multiplicadores:"Multiplicadores",
  virgenes:       "Mercados vírgenes",
  equipo:         "Ranking del equipo",
};

interface Props {
  data: ReporteData;
  leads: InsightItem[];
}

export function DashboardView({ data, leads }: Props) {
  const [view, setView] = useState<View>("todos");
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // ── Alcance ──────────────────────────────────────────────────────────
  const total = data.participantes.length;
  const contactadosDirect = data.participantes.filter(p => p.contacto.estado === "contactado").length;
  const standTotal = data.stand_contactos.length;
  const paisesAlcanzados = useMemo(() => new Set(
    data.participantes
      .filter(p => p.contacto.estado !== "pendiente" || p.notas.length > 0)
      .map(p => p.pais_id)
      .filter(Boolean)
  ).size, [data.participantes]);

  // ── Acciones ──────────────────────────────────────────────────────────
  const proximosPasosCount  = insights.global.next_steps_count;
  const multiplicadoresCount = insights.global.multipliers_count;
  const virgenes             = insights.global.virgin_markets.length;

  // ── Listas filtradas para vistas de tabla ─────────────────────────────
  const contactadosList = useMemo(
    () => data.participantes.filter(p => p.contacto.estado === "contactado"),
    [data.participantes],
  );
  function navigate(v: View) {
    setView(v);
    setFocusedId(null);
  }

  function handleLeadClick(id: string) {
    setView("todos");
    setFocusedId(prev => (prev === id ? null : id));
  }

  const isActive = (v: View) => view === v;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="no-print w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-paper-50">

        {/* Síntesis IA — destacada arriba */}
        {insights.global.headline && (
          <div className="border-b-2 border-slate-900 bg-slate-900 px-4 py-4">
            <p className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-kicker text-slate-400">
              Síntesis IA
            </p>
            <p className="font-serif text-[13px] italic leading-snug text-slate-100">
              {insights.global.headline}
            </p>
          </div>
        )}

        {/* Sección: Alcance del viaje */}
        <div className="border-b border-slate-200 px-3 py-4">
          <p className="mb-2.5 px-1 font-mono text-[9px] font-semibold uppercase tracking-kicker text-slate-400">
            Alcance del viaje
          </p>
          <div className="space-y-0.5">
            <NavStat value={paisesAlcanzados} label="países alcanzados"   active={isActive("paises")}         onClick={() => navigate("paises")} />
            <NavStat value={contactadosDirect} label="contactados directos" sub={pct(contactadosDirect, total)} active={isActive("contactados")}   onClick={() => navigate("contactados")} color="text-blue-700" />
            <NavStat value={data.total_notas}  label="notas registradas"    active={isActive("notas")}          onClick={() => navigate("notas")} />
            <NavStat value={standTotal}         label="contactos de stand"   active={isActive("stand")}          onClick={() => navigate("stand")} />
          </div>
        </div>

        {/* Sección: Acciones pendientes */}
        <div className="border-b border-slate-200 px-3 py-4">
          <p className="mb-2.5 px-1 font-mono text-[9px] font-semibold uppercase tracking-kicker text-slate-400">
            Acciones pendientes
          </p>
          <div className="space-y-0.5">
            <NavStat value={proximosPasosCount}   label="próximos pasos" active={isActive("proximos_pasos")}  onClick={() => navigate("proximos_pasos")}  color="text-blue-700" />
            <NavStat value={multiplicadoresCount}  label="multiplicadores" active={isActive("multiplicadores")} onClick={() => navigate("multiplicadores")} color="text-violet-700" />
            <NavStat value={virgenes}              label="mercados vírgenes" active={isActive("virgenes")}      onClick={() => navigate("virgenes")}        color="text-rose-700" />
          </div>
        </div>

        {/* Sección: Otros */}
        <div className="border-b border-slate-200 px-3 py-4">
          <p className="mb-2.5 px-1 font-mono text-[9px] font-semibold uppercase tracking-kicker text-slate-400">
            Más vistas
          </p>
          <div className="space-y-0.5">
            <NavStat value={total} label="todos los participantes" active={isActive("todos")} onClick={() => navigate("todos")} />
            <NavStat value={data.representantes.length} label="ranking del equipo" active={isActive("equipo")} onClick={() => navigate("equipo")} />
          </div>
        </div>

        {/* Lista de hot leads clickeables */}
        <div className="px-3 py-4">
          <p className="mb-2.5 px-1 font-mono text-[9px] font-semibold uppercase tracking-kicker text-slate-400">
            Hot leads · acceso rápido
          </p>
          {leads.length === 0 ? (
            <p className="px-1 font-serif text-sm italic text-slate-400">Sin hot leads todavía.</p>
          ) : (
            <ul className="space-y-0.5">
              {leads.map((lead, idx) => {
                const active = focusedId === lead.participante_id && view === "todos";
                return (
                  <li key={lead.participante_id}>
                    <button
                      type="button"
                      onClick={() => handleLeadClick(lead.participante_id)}
                      className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-amber-50 ${
                        active ? "bg-amber-50 ring-1 ring-amber-300" : ""
                      }`}
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-[9px] font-semibold text-amber-600">
                          #{String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">P{lead.priority}</span>
                      </div>
                      <p className="mt-0.5 truncate text-sm font-medium leading-tight text-slate-900">
                        {lead.participante_nombre}
                      </p>
                      <p className="font-mono text-[10px] text-slate-500">{lead.pais_label ?? "—"}</p>
                      {lead.next_step && (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-blue-700">
                          {lead.next_step}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </aside>

      {/* ── Panel derecho ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Encabezado de la vista activa */}
        <div className="no-print flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-2.5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-kicker text-slate-700">
            {VIEW_LABELS[view]}
          </p>
          {view !== "todos" && (
            <button
              type="button"
              onClick={() => navigate("todos")}
              className="font-mono text-[10px] text-slate-400 hover:text-slate-700"
            >
              ← Todos los participantes
            </button>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">

          {view === "todos" && (
            <div className="p-5">
              <TablaParticipantes participantes={data.participantes} defaultShowAll focusedId={focusedId} />
            </div>
          )}

          {view === "contactados" && (
            <div className="p-5">
              <TablaParticipantes participantes={contactadosList} defaultShowAll />
            </div>
          )}

          {view === "hot_leads" && (
            <div className="p-6">
              <HotLeads leads={leads} participantes={data.participantes} />
            </div>
          )}

          {view === "paises" && (
            <div className="p-6">
              <CoberturaObjetivos participantes={data.participantes} />
            </div>
          )}

          {view === "notas" && (
            <div className="p-6">
              <CronologiaNotas participantes={data.participantes} />
            </div>
          )}

          {view === "stand" && (
            <div className="p-6">
              <StandContactos stands={data.stand_contactos} representantes={data.representantes} />
            </div>
          )}

          {view === "proximos_pasos" && (
            <div className="p-6">
              <ProximosPasos />
            </div>
          )}

          {view === "multiplicadores" && (
            <div className="p-6">
              <Multiplicadores />
            </div>
          )}

          {view === "virgenes" && (
            <div className="p-6">
              <MercadosVirgenes />
            </div>
          )}

          {view === "equipo" && (
            <div className="p-6">
              <RankingEquipo data={data} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Componentes internos ───────────────────────────────────────────────

interface NavStatProps {
  value: number;
  label: string;
  sub?: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}

function NavStat({ value, label, sub, color = "text-slate-800", active, onClick }: NavStatProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-baseline justify-between gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "hover:bg-slate-100"
      }`}
    >
      <span className={`font-mono text-lg font-light leading-none ${active ? "text-white" : color}`}>
        {value}
      </span>
      <span className="min-w-0 text-right">
        <span className={`font-mono text-[10px] ${active ? "text-slate-300" : "text-slate-600"}`}>
          {label}
        </span>
        {sub && (
          <span className={`ml-1 font-serif text-[10px] italic ${active ? "text-slate-400" : "text-slate-400"}`}>
            {sub}
          </span>
        )}
      </span>
    </button>
  );
}
