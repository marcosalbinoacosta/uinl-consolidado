import { notFound } from "next/navigation";
import { getReporteData } from "@/lib/queries";
import { hotLeads } from "@/lib/insights";
import { fechaHora } from "@/lib/format";
import { HeadlineBanner } from "@/components/HeadlineBanner";
import { KPIs } from "@/components/KPIs";
import { HotLeads } from "@/components/HotLeads";
import { CoberturaObjetivos } from "@/components/CoberturaObjetivos";
import { MercadosVirgenes } from "@/components/MercadosVirgenes";
import { Multiplicadores } from "@/components/Multiplicadores";
import { ProximosPasos } from "@/components/ProximosPasos";
import { RankingEquipo } from "@/components/RankingEquipo";
import { TablaParticipantes } from "@/components/TablaParticipantes";
import { CronologiaNotas } from "@/components/CronologiaNotas";
import { StandContactos } from "@/components/StandContactos";
import { HeaderActions } from "@/components/HeaderActions";

export const dynamic = "force-dynamic";

const SLUG_VALIDO = "bolivia-2026";

type Props = { params: { slug: string } };

export default async function ReportePage({ params }: Props) {
  if (params.slug !== SLUG_VALIDO) notFound();

  const data = await getReporteData();
  const leads = hotLeads();

  return (
    <main className="min-h-screen">
      {/* Cabecera estilo masthead de periódico */}
      <header className="border-b-2 border-slate-900 bg-paper-100 reveal-1">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-y-3 px-6 py-6">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-kicker text-slate-500">
              +Latina · Inteligencia comercial · Vol. 01
            </p>
            <h1 className="mt-1 font-serif text-4xl leading-none text-slate-900 md:text-5xl">
              Consolidado del congreso
            </h1>
            <p className="mt-2 font-serif text-base italic text-slate-600">
              UINL Bolivia · 2026 · actualizado {fechaHora(data.generado_en)}
            </p>
          </div>
          <HeaderActions />
        </div>
      </header>

      {/* Banner síntesis IA — full bleed */}
      <div className="reveal-2">
        <HeadlineBanner />
      </div>

      {/* Cuerpo editorial */}
      <div className="mx-auto max-w-6xl space-y-16 px-6 py-12 md:space-y-20 md:py-16">
        <div className="reveal-3"><KPIs data={data} /></div>
        <div className="reveal-4"><HotLeads leads={leads} participantes={data.participantes} /></div>
        <div className="reveal-5"><CoberturaObjetivos participantes={data.participantes} /></div>

        <div className="reveal-6 grid gap-x-12 gap-y-12 md:grid-cols-2 print:grid-cols-1">
          <MercadosVirgenes />
          <Multiplicadores />
        </div>

        <div className="reveal-7"><ProximosPasos /></div>
        <div className="reveal-8"><RankingEquipo data={data} /></div>
      </div>

      {/* Quiebre fuerte hacia el archivo crudo (solo pantalla) */}
      <div className="no-print mx-auto max-w-6xl px-6">
        <div className="my-4 flex items-center gap-4">
          <span className="h-px flex-1 bg-slate-900/30" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-kicker text-slate-500">
            Archivo · datos crudos
          </span>
          <span className="h-px flex-1 bg-slate-900/30" />
        </div>
        <p className="mb-8 text-center font-serif text-sm italic text-slate-500">
          La capa ejecutiva termina arriba. Acá quedan las tablas completas para quien necesite bucear en el dato.
        </p>
        <div className="space-y-10 pb-16">
          <TablaParticipantes participantes={data.participantes} />
          <CronologiaNotas participantes={data.participantes} />
          <StandContactos stands={data.stand_contactos} representantes={data.representantes} />
        </div>
      </div>

      {/* Colofón */}
      <footer className="border-t border-slate-300 bg-paper-100">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center font-mono text-[10px] uppercase tracking-kicker text-slate-500">
          +Latina · Congreso UINL Bolivia 2026 · documento interno
        </div>
      </footer>
    </main>
  );
}
