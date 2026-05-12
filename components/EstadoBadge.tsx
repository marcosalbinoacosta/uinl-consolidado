import type { EstadoContacto } from "@/lib/types";

const STYLES: Record<EstadoContacto, { label: string; cls: string }> = {
  pendiente:      { label: "Pendiente",      cls: "bg-slate-100 text-slate-700 border-slate-200" },
  contactado:     { label: "Contactado",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  alta_prioridad: { label: "Alta prioridad", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  no_interesado:  { label: "No interesado",  cls: "bg-slate-100 text-slate-500 border-slate-200 line-through" },
};

export function EstadoBadge({ estado }: { estado: EstadoContacto }) {
  const s = STYLES[estado] ?? STYLES.pendiente;
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
