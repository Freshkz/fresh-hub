export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Upload-Role, X-File-Name",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 1. Descarga / Servir archivos (GET /files/...)
    if (request.method === "GET" && url.pathname.startsWith("/files/")) {
      const key = url.pathname.replace("/files/", "");
      const object = await env.MY_BUCKET.get(key);
      if (!object) {
        return new Response("Archivo no encontrado en R2", { status: 404, headers: corsHeaders });
      }
      const headers = new Headers(corsHeaders);
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      return new Response(object.body, { headers });
    }

    // 2. Subida de archivos (PUT o POST)
    if (request.method === "PUT" || request.method === "POST") {
      try {
        const role = request.headers.get("X-Upload-Role") || "editor";
        const rawFileName = request.headers.get("X-File-Name") || `file-${Date.now()}`;
        const fileName = decodeURIComponent(rawFileName).replace(/[^a-zA-Z0-9.-]/g, "_");
        const folder = role === "admin" ? "official" : "community";
        const key = `${folder}/${Date.now()}-${fileName}`;

        await env.MY_BUCKET.put(key, request.body, {
          httpMetadata: {
            contentType: request.headers.get("Content-Type") || "application/octet-stream",
          },
        });

        const publicUrl = `${url.origin}/files/${key}`;

        return new Response(JSON.stringify({ success: true, key: key, url: publicUrl, folder: folder }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("FreshKZ R2 Uploader Active", { headers: corsHeaders });
  },
};
