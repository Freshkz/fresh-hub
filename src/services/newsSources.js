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

const GITHUB_REPOSITORIES = [
  { owner: "Freshkz", repo: "Cupons", label: "Cupons" },
  { owner: "Freshkz", repo: "fresh-hub", label: "Fresh Hub" },
  { owner: "Freshkz", repo: "ai-stylist", label: "AI Stylist" },
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

async function fetchReleases(repository) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://api.github.com/repos/${repository.owner}/${repository.repo}/releases?per_page=5`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`GitHub respondió ${response.status} para ${repository.repo}`);
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function getGitHubNews() {
  const results = await Promise.allSettled(GITHUB_REPOSITORIES.map(async (repository) => {
    const releases = await fetchReleases(repository);
    return releases.map((release) => normalizeSourceEntry({
      id: `github-${repository.repo}-${release.id}`,
      title: `${repository.label}: ${release.name || release.tag_name}`,
      description: release.body?.trim() || `Nueva release ${release.tag_name} disponible.`,
      type: "release",
      date: release.published_at || release.created_at,
      url: release.html_url,
      source: "github",
      sourceId: `github:${repository.owner}/${repository.repo}:release:${release.id}`,
      featured: release.prerelease === false,
      published: true,
    }));
  }));

  return results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);
}

export async function getAutomaticNews() {
  return getGitHubNews();
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
