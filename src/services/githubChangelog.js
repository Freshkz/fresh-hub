// Trae commits de un repo PÚBLICO de GitHub y los agrupa en Added/Fixed/Changed
// según el prefijo de Conventional Commits (feat:, fix:, etc).
//
// OJO: esto NO le pega directo a api.github.com. Le pega al Worker de Cloudflare
// (mismo que maneja R2), que reenvía la request a GitHub con un token guardado
// como secret del lado del servidor. Sin esto, el límite sin auth es 60
// req/hora POR IP PÚBLICA — se agota fácil si varios dispositivos salen por la
// misma IP (NAT del ISP), y devuelve 403 "API rate limit exceeded". Con token
// el límite sube a 5000/hora. El token nunca viaja al navegador porque GitHub
// Pages no puede esconder secretos (todo el JS del build es público).

const DEFAULT_REPO = import.meta.env.VITE_GITHUB_REPO || "Freshkz/fresh-hub";
const DEFAULT_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || "main";

// prefijo -> categoría del changelog
const PREFIX_MAP = {
  feat: "added",
  feature: "added",
  fix: "fixed",
  fixes: "fixed",
  bugfix: "fixed",
  perf: "changed",
  refactor: "changed",
  style: "changed",
  docs: "changed",
  chore: "changed",
  build: "changed",
  ci: "changed",
  test: "changed",
  revert: "changed",
};

const CONVENTIONAL_RE = /^(\w+)(\([^)]*\))?(!)?:\s*(.+)$/;

// Heurística de respaldo para commits que NO siguen Conventional Commits
// (la mayoría de este repo está en español libre, tipo "fix imagenes random").
function classifyFreeText(subject) {
  const s = subject.toLowerCase();
  if (/\bfix|arregl|corrig|corrección|bug\b/.test(s)) return "fixed";
  if (/\bagreg|añad|nuevo|implementa|integraci[oó]n|feat\b/.test(s)) return "added";
  return "changed";
}

function isNoiseCommit(subject) {
  const s = subject.trim().toLowerCase();
  if (!s) return true;
  if (s.startsWith("merge ")) return true;
  if (s === "wip" || s.startsWith("wip:")) return true;
  if (/^(a ver|test|prueba|asd|\.+)$/.test(s)) return true;
  return false;
}

/**
 * Clasifica un commit individual.
 * @returns {{ category: 'added'|'fixed'|'changed', text: string, conventional: boolean }}
 */
export function categorizeCommitMessage(message) {
  const subject = (message || "").split("\n")[0].trim();
  const match = subject.match(CONVENTIONAL_RE);
  if (match) {
    const type = match[1].toLowerCase();
    const breaking = Boolean(match[3]);
    const description = match[4].trim();
    const category = breaking ? "changed" : PREFIX_MAP[type] || "changed";
    return { category, text: description, conventional: true };
  }
  return { category: classifyFreeText(subject), text: subject, conventional: false };
}

// Resuelve la URL del Worker igual que r2Upload.js: primero Settings (Supabase),
// después la env var, para que sea configurable desde /admin/settings sin redeploy.
async function resolveWorkerUrl() {
  const { getSettings } = await import("./settings");
  const settings = await getSettings().catch(() => ({}));
  let workerUrl = settings?.r2_worker_url || import.meta.env.VITE_R2_WORKER_URL || "";
  if (workerUrl && !workerUrl.startsWith("http://") && !workerUrl.startsWith("https://")) {
    workerUrl = `https://${workerUrl}`;
  }
  if (!workerUrl || !workerUrl.startsWith("http")) {
    throw new Error(
      "URL de Cloudflare Worker no configurada. Ingresá en Admin -> Settings y guardá la URL (ej: https://fresh-hub-r2-worker...)."
    );
  }
  return workerUrl.replace(/\/$/, "");
}

/**
 * Trae los commits de la rama `branch` posteriores a `sinceIso` (o a partir de
 * `sinceSha` exclusive, si se pasa). Pagina automáticamente hasta 300 commits.
 * Pasa por el Worker de Cloudflare (endpoint /github-commits) en vez de pegarle
 * directo a api.github.com, para usar el token autenticado guardado ahí.
 */
export async function fetchCommitsSince({ repo = DEFAULT_REPO, branch = DEFAULT_BRANCH, sinceIso, sinceSha, maxCommits = 300 } = {}) {
  const commits = [];
  let page = 1;
  const perPage = 100;
  const workerUrl = await resolveWorkerUrl();

  while (commits.length < maxCommits) {
    const url = new URL(`${workerUrl}/github-commits`);
    url.searchParams.set("repo", repo);
    url.searchParams.set("branch", branch);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    if (sinceIso) url.searchParams.set("since", sinceIso);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`GitHub API respondió ${res.status}: ${body || res.statusText}`);
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    for (const item of batch) {
      if (sinceSha && item.sha === sinceSha) {
        return commits; // llegamos al último commit ya procesado, cortamos acá
      }
      commits.push({
        sha: item.sha,
        message: item.commit?.message || "",
        author: item.commit?.author?.name || item.author?.login || "?",
        date: item.commit?.author?.date || null,
        url: item.html_url,
      });
    }

    if (batch.length < perPage) break; // última página
    page += 1;
  }

  return commits.slice(0, maxCommits);
}

/**
 * Trae commits nuevos y los devuelve ya agrupados y filtrados de ruido, listos
 * para prellenar el formulario del Admin (que igual se puede editar a mano
 * antes de guardar — esto nunca publica solo).
 */
export async function fetchAndCategorizeCommits(options) {
  const commits = await fetchCommitsSince(options);
  const grouped = { added: [], fixed: [], changed: [] };
  const raw = [];

  for (const commit of commits) {
    const subject = commit.message.split("\n")[0].trim();
    if (isNoiseCommit(subject)) continue;
    const { category, text } = categorizeCommitMessage(commit.message);
    grouped[category].push(text);
    raw.push({ ...commit, category, text });
  }

  const latestSha = commits[0]?.sha || null;
  return { grouped, raw, latestSha, totalCommits: commits.length };
}
