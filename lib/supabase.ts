import { createClient } from "@supabase/supabase-js";

/**
 * Cliente read-only para el reporte consolidado.
 * Usa exclusivamente la anon key (las policies de RLS ya permiten select
 * a anon en todas las tablas que necesitamos).
 *
 * Nunca usar service_role acá. Este sitio es público (slug en URL).
 */
export function supabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
