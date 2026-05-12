"use client";

export function HeaderActions() {
  return (
    <div className="flex flex-wrap gap-2 no-print">
      <button
        type="button"
        onClick={() => alert("Export Excel — llega en el próximo commit")}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Exportar Excel
      </button>
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
