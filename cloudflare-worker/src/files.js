import { AwsClient } from "aws4fetch";
import { EDITOR_ROLES } from "./auth.js";
import { json } from "./http.js";

const PRESIGN_EXPIRES_SECONDS = 3600 * 6; // 6 horas: de sobra para archivos grandes en conexiones lentas

export function fileKeyFromPath(pathname) {
  return decodeURIComponent(pathname.replace(/^\/files\//, ""));
}

// Keys nuevas: <official|community>/<user-id>/<timestamp>-<nombre>.
// El user-id en la key permite saber de quién es el archivo sin consultar la base.
// Las keys viejas (sin user-id) solo las puede borrar el admin.
function ownerIdFromKey(key) {
  const parts = key.split("/");
  return parts.length >= 3 ? parts[1] : null;
}

// GET /presign?filename=archivo.zip → URL firmada para subir DIRECTO a R2.
export async function presignUpload(url, env, caller, cors) {
  if (!EDITOR_ROLES.includes(caller.role)) {
    return json({ error: "Solo editores o admin pueden subir archivos." }, 403, cors);
  }

  const rawFileName = url.searchParams.get("filename") || "archivo";
  const fileName = rawFileName.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 150);
  const folder = caller.role === "admin" ? "official" : "community";
  const key = `${folder}/${caller.id}/${Date.now()}-${fileName}`;

  const client = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  });
  const r2Endpoint = new URL(`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${key}`);
  r2Endpoint.searchParams.set("X-Amz-Expires", String(PRESIGN_EXPIRES_SECONDS));
  const signed = await client.sign(r2Endpoint, { method: "PUT", aws: { signQuery: true } });

  return json(
    {
      uploadUrl: signed.url,
      publicUrl: `${url.origin}/files/${key}`,
      key,
      folder,
      expiresIn: PRESIGN_EXPIRES_SECONDS,
    },
    200,
    cors
  );
}

// GET /files/<key> → descarga pública. Soporta Range para que las descargas
// grandes se puedan reanudar (y los gestores de descargas funcionen).
export async function serveFile(request, env, key) {
  const object = await env.MY_BUCKET.get(key, { range: request.headers, onlyIf: request.headers });
  if (!object) return new Response("Archivo no encontrado", { status: 404 });

  const headers = new Headers({ "Access-Control-Allow-Origin": "*", "Accept-Ranges": "bytes" });
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  // onlyIf no se cumplió (ej. If-None-Match con el mismo etag): no hay body.
  if (!("body" in object)) return new Response(null, { status: 304, headers });

  if (request.headers.has("range") && object.range) {
    const { range, size } = object;
    const offset = "suffix" in range ? size - range.suffix : range.offset ?? 0;
    const length = "suffix" in range ? range.suffix : range.length ?? size - offset;
    headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${size}`);
    return new Response(object.body, { status: 206, headers });
  }
  return new Response(object.body, { headers });
}

// DELETE /files/<key> → admin borra cualquier archivo; un editor, solo los suyos.
export async function deleteFile(env, caller, key, cors) {
  const isAdmin = caller.role === "admin";
  const isOwner = caller.role === "editor" && ownerIdFromKey(key) === caller.id;
  if (!isAdmin && !isOwner) {
    return json({ error: "No tenés permiso para borrar este archivo." }, 403, cors);
  }

  const existing = await env.MY_BUCKET.head(key);
  if (!existing) return json({ error: "El archivo ya no existe en R2.", key }, 404, cors);

  await env.MY_BUCKET.delete(key);
  return json({ success: true, deletedKey: key }, 200, cors);
}
