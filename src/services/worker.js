import { getSettings } from "./settings";
import { supabase } from "./supabaseClient";

// URL del Worker de Cloudflare: primero Settings (editable desde /admin/settings
// sin redeploy), después la variable de entorno.
export async function resolveWorkerUrl() {
  const settings = await getSettings().catch(() => ({}));
  let workerUrl = settings?.r2_worker_url || import.meta.env.VITE_R2_WORKER_URL || "";
  if (workerUrl && !/^https?:\/\//.test(workerUrl)) workerUrl = `https://${workerUrl}`;
  if (!workerUrl) {
    throw new Error(
      "URL de Cloudflare Worker no configurada. Ingresá en Admin -> Settings y guardá la URL (ej: https://fresh-hub-r2-worker...)."
    );
  }
  return workerUrl.replace(/\/$/, "");
}

// fetch al Worker con el token de sesión: el Worker verifica con Supabase quién
// sos y qué rol tenés (nunca le creemos a un parámetro que mande el navegador).
export async function workerFetch(pathWithQuery, options = {}) {
  const workerUrl = await resolveWorkerUrl();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");

  return fetch(`${workerUrl}${pathWithQuery}`, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });
}

// Mensaje de error legible a partir de una respuesta fallida del Worker.
export async function workerErrorMessage(res) {
  const body = await res.json().catch(() => null);
  return body?.error || `El Worker respondió ${res.status}`;
}
