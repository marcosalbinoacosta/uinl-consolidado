import { notFound } from "next/navigation";
import { getReporteData } from "@/lib/queries";
import { hotLeads } from "@/lib/insights";
import { fechaHora } from "@/lib/format";
import { DashboardView } from "@/components/DashboardView";
import { HeaderActions } from "@/components/HeaderActions";

export const dynamic = "force-dynamic";

const SLUG_VALIDO = "bolivia-2026";

type Props = { params: { slug: string } };

export default async function ReportePage({ params }: Props) {
  if (params.slug !== SLUG_VALIDO) notFound();

  const data = await getReporteData();
  const leads = hotLeads();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header compacto */}
      <header className="shrink-0 border-b-2 border-slate-900 bg-paper-100">
        <div className="flex flex-wrap items-center justify-between gap-y-1 px-6 py-3">
          <div className="min-w-0">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-kicker text-slate-500">
              +Latina · Inteligencia comercial · Vol. 01
            </p>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h1 className="font-serif text-2xl leading-tight text-slate-900">
                Consolidado del congreso
              </h1>
              <p className="font-serif text-sm italic text-slate-500">
                UINL Bolivia · 2026 · {fechaHora(data.generado_en)}
              </p>
            </div>
          </div>
          <HeaderActions />
        </div>
      </header>

      <DashboardView data={data} leads={leads} />
    </div>
  );
}
