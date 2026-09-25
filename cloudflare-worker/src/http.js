// Helpers HTTP compartidos: CORS y respuestas JSON.

// Solo los orígenes de ALLOWED_ORIGINS (wrangler.toml) pueden llamar a la API
// desde un navegador. Ojo: CORS no reemplaza la auth (curl lo ignora), solo
// evita que otras webs usen la sesión de un visitante contra el Worker.
export function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const headers = {
    "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (allowed.includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
