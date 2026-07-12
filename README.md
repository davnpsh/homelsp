# homelsp

HomeL(ab)S(tart)P(age) is a simple dashboard for my HomeLab. Built with the DASH stack: Deno (with oak) + Alpine.js + SQLite + HTMX.
Except this application does not use SQLite.

> [!CAUTION]  
> This application was built entirely using generative AI. This is due to the low complexity of the request
and because no other tool out there fits my specific needs. This is meant as an experiment and for personal
use.

## Deploy

With the [docker-compose.yml](./docker-compose.yml) file:

```yml
services:
  dashboard:
    image: ghcr.io/davnpsh/homelsp:latest
    container_name: dashboard
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./config:/app/config:ro
```

## Configuration

Check this [example config file](./config.example.yaml). Copy it inside the `config` directory
mounted to the docker container and modify it to your needs.
Each category has `services:` with `name`, `url`, `icon` (Simple Icons slug, optional) and
`description` (optional). A top-level `title:` sets the page heading.

To edit, set a top-level `title:` and add `categories:`, each with a `name` and
a `services:` list. Example of one category with a single service:

```yaml
title: My Home Lab
categories:
  - name: Media
    services:
      - name: Plex
        url: https://plex.example.com
        icon: plex
        description: Media server
```

## Development

With Docker, lift a hot-reloading dev environment:

```bash
docker compose -f docker-compose.dev.yml up --build
```

It serves `config.example.yaml` by default at http://localhost:8000.