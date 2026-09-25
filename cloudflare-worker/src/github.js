import { json } from "./http.js";

// Proxy a la API de commits de GitHub con el token guardado como secret (5000
// req/hora en vez de 60). Solo para el admin y solo para los repos de
// GITHUB_ALLOWED_REPOS: si no, cualquiera usaría tu token para leer cualquier repo.
// GET /github-commits?repo=Freshkz/fresh-hub&branch=main&page=1&per_page=100&since=...
export async function proxyGithubCommits(url, env, caller, cors) {
  if (caller.role !== "admin") {
    return json({ error: "Solo el admin puede consultar commits." }, 403, cors);
  }

  const repo = url.searchParams.get("repo") || "";
  const allowedRepos = (env.GITHUB_ALLOWED_REPOS || "").split(",").map((value) => value.trim().toLowerCase());
  if (!allowedRepos.includes(repo.toLowerCase())) {
    return json({ error: `Repo no permitido: ${repo}` }, 400, cors);
  }

  const perPage = Math.min(Number(url.searchParams.get("per_page")) || 100, 100);
  const ghUrl = new URL(`https://api.github.com/repos/${repo}/commits`);
  ghUrl.searchParams.set("sha", url.searchParams.get("branch") || "main");
  ghUrl.searchParams.set("per_page", String(perPage));
  ghUrl.searchParams.set("page", url.searchParams.get("page") || "1");
  const since = url.searchParams.get("since");
  if (since) ghUrl.searchParams.set("since", since);

  const ghRes = await fetch(ghUrl.toString(), {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "freshkz-hub-worker",
    },
  });

  return new Response(await ghRes.text(), {
    status: ghRes.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
