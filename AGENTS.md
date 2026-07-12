# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

A minimal, self-hosted **services dashboard**. It displays your self-hosted
services grouped by category. There is no database and no service health
checking — the backend simply renders whatever you put in a YAML config file.

## Stack (DASH, no SQLite)

- **Deno** + **oak** — HTTP server (`main.ts`)
- **Alpine.js** — client interactivity (theme toggle, icon-theme toggle)
- **HTMX** — loads/refreshes the services fragment
- **Pure CSS** — `public/styles.css` (no Tailwind/build step)
- **Simple Icons** (CDN) — per-service brand logos

## Conventions

- `main.ts` renders HTML as template strings; each service `<img>` carries a
  `data-icon` slug. Do not introduce a CSS framework or build step.
- Config is read **fresh on every request** from the YAML file — do not cache it
  in memory.
- Static assets (`public/`) are served by `main.ts` routes (`/app.js`,
  `/styles.css`, `/vendor/:file`); the binary still needs `public/` next to it.

## Running

```bash
deno task dev     # serves config.example.yaml, hot-reloads
deno task start   # production: reads config.yaml
deno --version    # requires Deno 2.x
```

## Config

- `config.yaml` — the real config (gitignored; not committed).
- `config.example.yaml` — committed template. `categories:` lists sections;
  each has `services:` with `name`, `url`, `icon` (Simple Icons slug, optional),
  and `description` (optional). A top-level `title:` sets the page heading.

## Docker

Multi-stage `Dockerfile` builds a standalone binary via `deno compile` and runs
it on `denoland/deno:debian-2.9.2`.

```bash
docker compose build --no-cache
docker compose up
# mount your config dir: ./config:/app/config  (reads /app/config/config.yaml)
```
