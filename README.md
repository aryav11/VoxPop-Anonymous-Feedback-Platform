# VoxPop - Anonymous Feedback Platform

VoxPop is a React + Vite prototype for anonymous feedback, community voting, progress tracking, and administrator responses.

## Quick Start

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run build
```

If the original Supabase project is unavailable, the app automatically falls back to local demo data in the browser. You can also force that mode with:

```bash
VITE_USE_LOCAL_DATA=true npm run dev
```

Set `VITE_DISABLE_LOCAL_FALLBACK=true` if you want failed Supabase requests to stay failed while debugging the real backend.

## Main Folders

- `src/app` contains the React entry point and root app shell.
- `src/features/feedback` contains the feedback submission flow.
- `src/features/chat` contains session lookup and anonymous conversation UI.
- `src/features/dashboard` contains community feed, progress, demo data, and admin screens.
- `src/components/ui` contains the shared UI primitives this app actually uses.
- `src/config` contains Supabase function configuration.
- `src/lib` contains cross-feature helpers such as the API client.
- `supabase/functions` contains the edge function server code.
- `docs` contains structure notes and attribution.

## Notes

This cleaned version focuses on structure and maintainability. The original prototype still needs security hardening before production use, especially around admin access, session privacy, and public community posts.
