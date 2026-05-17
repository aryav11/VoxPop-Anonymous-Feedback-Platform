# Project Structure

This project is organized by responsibility first, then by feature.

```txt
VoxPop-cleaned/
  assets/                  README screenshots
  docs/                    project notes and attribution
  supabase/                Supabase edge function source
  src/
    app/                   React entry point and root layout
    components/ui/         shared UI primitives used by the app
    config/                app configuration constants
    lib/                   cross-feature utilities
    features/
      feedback/            submit anonymous feedback
      chat/                load sessions and continue conversations
      dashboard/           community feed, progress, demo data, admin UI
    styles/                global compiled app styles
```

## Rules Of Thumb

- Put feature-specific code inside its feature folder.
- Put reusable UI in `src/components/ui`.
- Put shared helpers in `src/lib`.
- Put configuration in `src/config`.
- Keep server functions outside the frontend tree in `supabase/`.
- Do not commit `node_modules` or `dist`; regenerate them with npm.
