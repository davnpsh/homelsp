import { Application, Router } from "@oak/oak";
import { parse } from "@std/yaml";

interface Service {
  name: string;
  url: string;
  icon?: string;
  description?: string;
}

interface Category {
  name: string;
  services: Service[];
}

interface Config {
  title?: string;
  categories: Category[];
}

const YAML_PATH = Deno.env.get("CONFIG_PATH") ?? "config/config.yaml";

async function loadConfig(): Promise<{ config: Config; path: string }> {
  const candidates = [YAML_PATH, "config.example.yaml"];
  for (const path of candidates) {
    try {
      const raw = await Deno.readTextFile(path);
      const cfg = parse(raw) as Partial<Config>;
      return {
        config: { title: cfg.title, categories: cfg.categories ?? [] },
        path,
      };
    } catch {
      // try the next candidate
    }
  }
  return { config: { title: "Services", categories: [] }, path: YAML_PATH };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function serviceCard(service: Service, category: string): string {
  const initial = escapeHtml(service.name.charAt(0).toUpperCase() || "?");
  const avatar = service.icon
    ? `<img data-icon="${escapeHtml(service.icon)}" src="https://cdn.simpleicons.org/${escapeHtml(service.icon)}" alt="${escapeHtml(service.name)}" class="card-icon" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'avatar-fallback',textContent:'${initial}'}))">`
    : `<div class="avatar-fallback">${initial}</div>`;

  const description = service.description
    ? `<div class="card-desc">${escapeHtml(service.description)}</div>`
    : "";

  return `<a href="${escapeHtml(service.url)}" target="_blank" rel="noopener noreferrer" class="service-card" data-name="${escapeHtml(service.name.toLowerCase())}" data-category="${escapeHtml(category.toLowerCase())}">
      ${avatar}
      <div class="card-body">
        <div class="card-name">${escapeHtml(service.name)}</div>
        ${description}
      </div>
    </a>`;
}

function renderServices(config: Config, configPath: string): string {
  if (config.categories.length === 0) {
    return `<p class="empty">No services configured. Edit <code>${escapeHtml(configPath)}</code>.</p>`;
  }

  const sections = config.categories.map((category) => {
    const cards = category.services.map((s) => serviceCard(s, category.name)).join("");
    return `<section class="category" data-category="${escapeHtml(category.name.toLowerCase())}">
      <h2 class="category-title">${escapeHtml(category.name)}</h2>
      <div class="service-list">${cards}</div>
    </section>`;
  });

  return `<div class="categories">${sections.join("")}</div>`;
}

const router = new Router();

router.get("/", async (ctx) => {
  const { config } = await loadConfig();
  const title = escapeHtml(config.title ?? "Services");
  let html = await Deno.readTextFile("public/index.html");
  html = html.replaceAll("{{TITLE}}", title);
  ctx.response.type = "text/html";
  ctx.response.body = html;
});

router.get("/app.js", async (ctx) => {
  ctx.response.type = "application/javascript";
  ctx.response.body = await Deno.readTextFile("public/app.js");
});

router.get("/styles.css", async (ctx) => {
  ctx.response.type = "text/css";
  ctx.response.body = await Deno.readTextFile("public/styles.css");
});

router.get("/favicon.svg", async (ctx) => {
  ctx.response.type = "image/svg+xml";
  ctx.response.body = await Deno.readTextFile("public/favicon.svg");
});

router.get("/vendor/:file", async (ctx) => {
  const file = ctx.params.file ?? "";
  if (!/^[\w.\-]+$/.test(file)) {
    ctx.response.status = 400;
    return;
  }
  try {
    ctx.response.type = "application/javascript";
    ctx.response.body = await Deno.readTextFile(`public/vendor/${file}`);
  } catch {
    ctx.response.status = 404;
  }
});

router.get("/services", async (ctx) => {
  const { config, path } = await loadConfig();
  const title = escapeHtml(config.title ?? "Services");
  ctx.response.type = "text/html";
  ctx.response.body =
    renderServices(config, path) +
    `<h1 id="page-title" hx-swap-oob="true" class="title">${title}</h1>`;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

const port = Number(Deno.env.get("PORT") ?? 8000);
console.log(`Service dashboard listening on http://localhost:${port}`);
await app.listen({ port });
