"use client";

export function HeaderActions() {
  return (
    <div className="flex flex-wrap gap-2 no-print">
      <a
        href="/api/export-xlsx"
        download
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Exportar Excel
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Imprimir / Guardar PDF
      </button>
    </div>
  );
}
