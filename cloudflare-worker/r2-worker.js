import { AwsClient } from "aws4fetch";

const PRESIGN_EXPIRES_SECONDS = 3600 * 6; // 6 horas — de sobra para subir archivos grandes en conexiones lentas

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Upload-Role, X-File-Name",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 0. Generar URL prefirmada para subir DIRECTO a R2 (sin pasar por el proxy de Cloudflare)
    //    GET /presign?filename=archivo.zip&role=admin&contentType=application/zip
    if (request.method === "GET" && url.pathname === "/presign") {
      try {
        const rawFileName = url.searchParams.get("filename") || `file-${Date.now()}`;
        const role = url.searchParams.get("role") || "editor";
        const fileName = decodeURIComponent(rawFileName).replace(/[^a-zA-Z0-9.-]/g, "_");
        const folder = role === "admin" ? "official" : "community";
        const key = `${folder}/${Date.now()}-${fileName}`;

        const client = new AwsClient({
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        });

        const r2Endpoint = new URL(
          `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${key}`
        );
        r2Endpoint.searchParams.set("X-Amz-Expires", String(PRESIGN_EXPIRES_SECONDS));

        const signedRequest = await client.sign(r2Endpoint, {
          method: "PUT",
          aws: { signQuery: true },
        });

        const publicUrl = `${url.origin}/files/${key}`;

        return new Response(
          JSON.stringify({
            uploadUrl: signedRequest.url,
            publicUrl,
            key,
            folder,
            expiresIn: PRESIGN_EXPIRES_SECONDS,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 1. Descargar o Servir archivos (GET /files/...) — sin cambios, sigue usando el binding
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

    // 2. Subida directa al Worker (PUT/POST) — se deja como respaldo para archivos chicos,
    //    pero el frontend ahora usa /presign + subida directa a R2 para archivos grandes.
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

    // 3. Borrado automático de archivos (DELETE /files/...) — sin cambios
    if (request.method === "DELETE") {
      try {
        const key = url.pathname.replace("/files/", "");
        if (key) {
          await env.MY_BUCKET.delete(key);
        }
        return new Response(JSON.stringify({ success: true, deletedKey: key }), {
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
