// FreshKZ Hub Worker: subidas/descargas de R2 + proxy de commits de GitHub.
//
// Rutas:
//   GET    /files/<key>      público (descargas)
//   GET    /presign          editor/admin → URL firmada para subir directo a R2
//   DELETE /files/<key>      admin cualquiera; editor solo sus archivos
//   GET    /github-commits   solo admin, repos de GITHUB_ALLOWED_REPOS
//
// Todo lo que no es descarga pública exige "Authorization: Bearer <token de Supabase>".

import { getCaller } from "./auth.js";
import { deleteFile, fileKeyFromPath, presignUpload, serveFile } from "./files.js";
import { proxyGithubCommits } from "./github.js";
import { corsHeaders, json } from "./http.js";

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(request.url);
    const isFileRoute = url.pathname.startsWith("/files/");

    try {
      if (request.method === "GET" && isFileRoute) {
        return await serveFile(request, env, fileKeyFromPath(url.pathname));
      }
      if (request.method === "GET" && url.pathname === "/") {
        return new Response("FreshKZ Worker activo", { headers: cors });
      }

      const caller = await getCaller(request, env);
      if (!caller) return json({ error: "Tenés que iniciar sesión." }, 401, cors);

      if (request.method === "GET" && url.pathname === "/presign") {
        return await presignUpload(url, env, caller, cors);
      }
      if (request.method === "DELETE" && isFileRoute) {
        return await deleteFile(env, caller, fileKeyFromPath(url.pathname), cors);
      }
      if (request.method === "GET" && url.pathname === "/github-commits") {
        return await proxyGithubCommits(url, env, caller, cors);
      }
      return json({ error: "Ruta no encontrada." }, 404, cors);
    } catch (err) {
      console.error("Error en el Worker:", err);
      return json({ error: "Error interno del Worker." }, 500, cors);
    }
  },
};
