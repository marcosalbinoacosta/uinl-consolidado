"use client";

export function HeaderActions() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 no-print">
      <a
        href="/api/export-xlsx"
        download
        className="group inline-flex items-center gap-2 border-b border-slate-900 pb-0.5 font-mono text-[11px] font-semibold uppercase tracking-kicker text-slate-900 transition-colors hover:text-amber-700"
      >
        <span className="text-slate-400 group-hover:text-amber-700">↓</span>
        Excel
      </a>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); window.print(); }}
        className="group inline-flex items-center gap-2 border-b border-slate-900 pb-0.5 font-mono text-[11px] font-semibold uppercase tracking-kicker text-slate-900 transition-colors hover:text-amber-700"
      >
        <span className="text-slate-400 group-hover:text-amber-700">⎙</span>
        Imprimir / PDF
      </a>
    </div>
  );
}
