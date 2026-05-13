import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl border-y-2 border-slate-900 bg-paper-100 px-8 py-12 text-center">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-kicker text-slate-500">
          +Latina · Inteligencia comercial
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-slate-900 md:text-5xl">
          Consolidado del congreso
        </h1>
        <p className="mt-3 font-serif text-base italic text-slate-600">
          UINL Bolivia · 2026
        </p>

        <div className="my-8 flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-slate-900/40" />
          <span className="font-mono text-[10px] uppercase tracking-kicker text-slate-500">vol. 01</span>
          <span className="h-px w-12 bg-slate-900/40" />
        </div>

        <Link
          href="/r/bolivia-2026"
          className="group inline-flex items-baseline gap-2 border-b border-slate-900 pb-0.5 font-mono text-xs font-semibold uppercase tracking-kicker text-slate-900 transition-colors hover:text-amber-700"
        >
          Abrir el reporte
          <span className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-amber-700">→</span>
        </Link>

        <p className="mt-10 font-serif text-xs italic text-slate-400">
          Acceso restringido al equipo de +LATINA.
        </p>
      </div>
    </main>
  );
}
