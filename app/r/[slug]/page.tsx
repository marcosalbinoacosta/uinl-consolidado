type Props = { params: { slug: string } };

export default function ReportePage({ params }: Props) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">UINL · Bolivia 2026</p>
        <h1 className="mt-1 text-3xl font-bold">Consolidado · {params.slug}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Placeholder. La página real con KPIs, tabla de participantes, notas, stand y exports llega en el siguiente commit.
        </p>
      </header>
    </main>
  );
}
