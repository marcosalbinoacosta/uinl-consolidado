import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">UINL · Bolivia 2026</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Consolidado del congreso</h1>
        <p className="mt-3 text-slate-600">
          Reporte de participantes, notas y contactos de stand acumulados durante el congreso.
        </p>
        <Link
          href="/r/bolivia-2026"
          className="mt-6 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Abrir reporte →
        </Link>
      </div>
      <p className="mt-6 text-center text-xs text-slate-400">
        Acceso restringido al equipo de +LATINA.
      </p>
    </main>
  );
}
