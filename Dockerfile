# ---- Build stage ----
FROM denoland/deno:debian-2.9.2 AS builder

WORKDIR /app

COPY deno.json deno.lock ./
COPY main.ts ./

RUN deno compile --allow-net \
    --allow-read \
    --allow-env \
    --output /app/dashboard \
    main.ts

# ---- Runtime stage ----
FROM debian:13-slim

WORKDIR /app

COPY --from=builder /app/dashboard /app/dashboard
COPY public ./public
COPY config.example.yaml ./config.example.yaml

# Minimal default config
RUN mkdir -p /app/config \
 && printf 'title: Dashboard\ncategories: []\n' > /app/config/config.yaml

ENV PORT=8000
EXPOSE 8000

ENTRYPOINT ["/app/dashboard"]
