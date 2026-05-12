# UINL Bolivia 2026 — Consolidado

Reporte read-only del congreso UINL Bolivia 2026. Lee de la misma Supabase que la app operativa, con la **anon key** (lectura). Vive separado del repo de la app para no afectarla.

## Local

```bash
cp .env.example .env.local   # completar URL + ANON KEY de Supabase
npm install
npm run dev                  # http://localhost:3000
```

## Deploy

Conectar este repo a Vercel como proyecto independiente. Setear las dos env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en Vercel → Settings → Environment Variables.

## URL del reporte

`/r/bolivia-2026` — slug fijo, no requiere PIN ni autenticación. Compartir el link es suficiente.
