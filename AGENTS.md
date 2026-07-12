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

Local dev uses Docker (hot reload via bind mount):

```bash
docker compose -f docker-compose.dev.yml up --build   # serves config.example.yaml, hot-reloads
```

For a bare Deno run (requires Deno 2.x locally): `deno task dev` (config.example.yaml)
or `deno task start` (reads ./config/config.yaml).

## Config

- `config.yaml` — the real config (gitignored; not committed).
- `config.example.yaml` — committed template. `categories:` lists sections;
  each has `services:` with `name`, `url`, `icon` (Simple Icons slug, optional),
  and `description` (optional). A top-level `title:` sets the page heading.

## Docker

### Production image
Multi-stage `Dockerfile`: the `denoland/deno:debian-2.9.2` stage compiles a
standalone binary via `deno compile`; the runtime stage is `debian:13-slim`.
A minimal default config is baked at `/app/config/config.yaml`.

CI (`.github/workflows/docker.yml`) builds and pushes the image to GitHub
Container Registry (`ghcr.io/<owner>/<repo>:latest`) on every push to `main`.
The published package defaults to **private** — set it public in the repo's
Packages settings if you want others to pull.

`docker-compose.yml` is production-only.

### Dev environment
`Dockerfile.dev` runs the source directly with `deno run --watch` (no compile).
`docker-compose.dev.yml` bind-mounts the repo and serves `config.example.yaml`
by default. Lift it with:

```bash
docker compose -f docker-compose.dev.yml up --build
```

