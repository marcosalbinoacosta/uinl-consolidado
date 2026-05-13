# UINL Bolivia 2026 — Consolidado

Reporte read-only del congreso UINL Bolivia 2026. Lee de la misma Supabase que la app operativa, con la **anon key** (lectura). Vive separado del repo de la app para no afectarla.

## Local

```bash
cp .env.example .env.local   # completar URL + ANON KEY de Supabase + ANTHROPIC_API_KEY
npm install
npm run dev                  # http://localhost:3000
```

## Extracción de insights con IA

`scripts/extract-insights.ts` analiza las notas del equipo con Claude Haiku 4.5
y produce `data/insights.json` consumido por el dashboard.

```bash
npm run extract
```

Se corre **on-demand** (no hay cron). Cada corrida cuesta ~USD 0.01.
Requiere `ANTHROPIC_API_KEY` en `.env.local`.

## Deploy

Conectar este repo a Vercel como proyecto independiente. Setear las dos env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en Vercel → Settings → Environment Variables.

## URL del reporte

`/r/bolivia-2026` — slug fijo, no requiere PIN ni autenticación. Compartir el link es suficiente.
