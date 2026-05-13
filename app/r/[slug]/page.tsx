import { notFound } from "next/navigation";
import { getReporteData } from "@/lib/queries";
import { hotLeads } from "@/lib/insights";
import { fechaHora } from "@/lib/format";
import { HeadlineBanner } from "@/components/HeadlineBanner";
import { KPIs } from "@/components/KPIs";
import { HotLeads } from "@/components/HotLeads";
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
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">UINL · Bolivia 2026</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Consolidado del congreso</h1>
          <p className="mt-1 text-xs text-slate-500">
            Última actualización: {fechaHora(data.generado_en)}
          </p>
        </div>
        <HeaderActions />
      </header>

      <div className="space-y-6">
        <HeadlineBanner />
        <KPIs data={data} />
        <HotLeads leads={leads} participantes={data.participantes} />

        <div className="pt-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Detalle completo · datos crudos
          </h2>
          <div className="space-y-6">
            <TablaParticipantes participantes={data.participantes} />
            <CronologiaNotas participantes={data.participantes} />
            <StandContactos stands={data.stand_contactos} representantes={data.representantes} />
          </div>
        </div>
      </div>

      <footer className="mt-10 text-center text-xs text-slate-400">
        +LATINA · Congreso UINL Bolivia 2026
      </footer>
    </main>
  );
}
