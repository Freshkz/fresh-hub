import { getSettings } from "./settings";

/**
 * Subida directa a Cloudflare R2 vía Cloudflare Worker con barra de progreso y control de límites por rol.
 * 
 * @param {Object} options
 * @param {File} options.file - Archivo seleccionado del input
 * @param {string} [options.role="editor"] - Rol del usuario ("admin" u "editor")
 * @param {Function} [options.onProgress] - Callback (percentage: number) => void
 */
export async function uploadToR2({ file, role = "editor", onProgress }) {
  if (!file) throw new Error("Selecciona un archivo para subir.");

  // Cargar configuración de Settings para obtener workerUrl y límites
  const settings = await getSettings().catch(() => ({}));
  let workerUrl = settings?.r2_worker_url || import.meta.env.VITE_R2_WORKER_URL || "";

  if (workerUrl && !workerUrl.startsWith("http://") && !workerUrl.startsWith("https://")) {
    workerUrl = `https://${workerUrl}`;
  }

  if (!workerUrl || !workerUrl.startsWith("http")) {
    throw new Error(
      "URL de Cloudflare Worker no configurada. Ingresa en Admin -> Settings y guarda la URL (ej: https://fresh-hub-r2-worker...)."
    );
  }

  // Determinar el límite máximo en GB según el rol
  const isAdmin = role === "admin";
  const limitGb = isAdmin
    ? parseFloat(settings?.r2_admin_limit_gb) || 5
    : parseFloat(settings?.r2_editor_limit_gb) || 1;

  const maxBytes = limitGb * 1024 * 1024 * 1024;
  if (file.size > maxBytes) {
    const fileSizeGb = (file.size / (1024 * 1024 * 1024)).toFixed(2);
    throw new Error(
      `El archivo pesa ${fileSizeGb} GB y tu límite como ${isAdmin ? "Admin" : "Editor/Amigo"} es de ${limitGb} GB.`
    );
  }

  // Paso 1: pedirle al Worker una URL prefirmada (esta petición es liviana, no lleva el archivo,
  // así que nunca choca con el límite de tamaño del proxy de Cloudflare).
  const presignUrl = new URL(`${workerUrl.replace(/\/$/, "")}/presign`);
  presignUrl.searchParams.set("filename", file.name);
  presignUrl.searchParams.set("role", role);

  const presignRes = await fetch(presignUrl.toString());
  if (!presignRes.ok) {
    const text = await presignRes.text().catch(() => "");
    throw new Error(`No se pudo generar la URL de subida (Status ${presignRes.status}): ${text}`);
  }
  const { uploadUrl, publicUrl, error: presignError } = await presignRes.json();
  if (presignError) throw new Error(presignError);
  if (!uploadUrl || !publicUrl) throw new Error("Respuesta de /presign incompleta.");

  // Paso 2: subir el archivo DIRECTO a R2 con la URL prefirmada, sin pasar por el proxy del Worker.
  // Importante: no seteamos Content-Type acá porque no fue incluido al firmar la URL — si lo
  // mandamos, R2 rechaza la subida por firma inválida.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(publicUrl);
      } else {
        reject(new Error(`Error de subida a R2 (Status ${xhr.status}): ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Fallo de red al subir el archivo directo a R2."));
    xhr.onabort = () => reject(new Error("Subida cancelada."));

    xhr.send(file);
  });
}

/**
 * Elimina automáticamente el archivo de Cloudflare R2 si la URL proviene del Worker.
 * @param {string} downloadUrl
 */
export async function deleteFromR2(downloadUrl) {
  if (!downloadUrl) return false;
  try {
    const settings = await getSettings().catch(() => ({}));
    let workerUrl = settings?.r2_worker_url || import.meta.env.VITE_R2_WORKER_URL || "";
    if (workerUrl && !workerUrl.startsWith("http://") && !workerUrl.startsWith("https://")) {
      workerUrl = `https://${workerUrl}`;
    }

    if (!workerUrl || !downloadUrl.includes("/files/")) return false;

    const fileKey = downloadUrl.split("/files/")[1];
    if (!fileKey) return false;

    const deleteTargetUrl = `${workerUrl.replace(/\/$/, "")}/files/${fileKey}`;
    const res = await fetch(deleteTargetUrl, { method: "DELETE" });
    return res.ok;
  } catch (err) {
    console.warn("No se pudo eliminar el archivo de Cloudflare R2:", err.message);
    return false;
  }
}
