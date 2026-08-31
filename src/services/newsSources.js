import { getNews } from "./news";

export const NEWS_SOURCES = [
  {
    id: "github",
    label: "GitHub",
    description: "Eventos automáticos de repositorios y releases",
  },
  {
    id: "pwa",
    label: "PWA",
    description: "Alertas de aplicaciones y páginas propias",
  },
  {
    id: "api",
    label: "FreshKZ API",
    description: "Sincronización desde el hub central",
  },
  {
    id: "rss",
    label: "RSS / Feed",
    description: "Fuentes externas que se pueden integrar por feed",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Contenido creado manualmente por el panel",
  },
];

function normalizeSourceEntry(entry) {
  return {
    ...entry,
    id: entry.id || `${entry.source || "source"}-${entry.sourceId || entry.title}`,
    date: entry.date || new Date().toISOString(),
    published: entry.published ?? true,
    source: entry.source || "github",
    sourceId: entry.sourceId || `${entry.source || "source"}:${entry.title}`,
    featured: entry.featured ?? false,
    type: entry.type || "update",
  };
}

export async function getAutomaticNews() {
  const now = new Date();

  const entries = [
    {
      id: "github-fresh-release-v1-4-2",
      title: "Fresh release v1.4.2",
      description: "Nueva versión del hub con mejoras visuales y refactor del feed automático.",
      type: "release",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
      url: "https://github.com/Freshkz/fresh-hub/releases",
      source: "github",
      sourceId: "fresh-hub:release:v1.4.2",
      featured: true,
      published: true,
    },
    {
      id: "pwa-ai-stylist-update",
      title: "AI Stylist actualizado",
      description: "Nuevas mejoras y ajustes de flujo para la experiencia de estilo con IA.",
      type: "project",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString(),
      url: "https://github.com/Freshkz",
      source: "pwa",
      sourceId: "ai-stylist:update:v2.1",
      featured: false,
      published: true,
    },
  ];

  return entries.map(normalizeSourceEntry);
}

export async function getUnifiedNews() {
  const [dbNews, autoNews] = await Promise.all([getNews(), getAutomaticNews()]);

  const combined = [...(dbNews || []), ...autoNews];
  const seen = new Map();

  return combined
    .filter(Boolean)
    .map((entry) => normalizeSourceEntry(entry))
    .filter((entry) => {
      const dedupeKey = entry.sourceId || `${entry.source}:${entry.title}:${entry.date}`;
      if (seen.has(dedupeKey)) return false;
      seen.set(dedupeKey, true);
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
