import { getSettings } from "./settings";
import { workerErrorMessage, workerFetch } from "./worker";

/**
 * Subida directa a Cloudflare R2 vía Cloudflare Worker con barra de progreso.
 * El Worker decide la carpeta según tu rol real (verificado con Supabase);
 * `role` acá solo se usa para avisar antes de subir si el archivo supera tu límite.
 *
 * @param {Object} options
 * @param {File} options.file - Archivo seleccionado del input
 * @param {string} [options.role="editor"] - Rol del usuario ("admin" u "editor")
 * @param {Function} [options.onProgress] - Callback (percentage: number) => void
 */
export async function uploadToR2({ file, role = "editor", onProgress }) {
  if (!file) throw new Error("Selecciona un archivo para subir.");

  // TODO(escala): este límite solo se chequea en el navegador. Para que sea
  // obligatorio, el Worker tendría que verificar el tamaño del objeto después de subirlo.
  const settings = await getSettings().catch(() => ({}));
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
  const presignRes = await workerFetch(`/presign?filename=${encodeURIComponent(file.name)}`);
  if (!presignRes.ok) {
    throw new Error(`No se pudo generar la URL de subida: ${await workerErrorMessage(presignRes)}`);
  }
  const { uploadUrl, publicUrl } = await presignRes.json();
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

export function isR2FileUrl(url) {
  return Boolean(url) && url.includes("/files/");
}

/**
 * Borra el archivo de Cloudflare R2 si la URL proviene del Worker.
 * Devuelve false si no es un archivo de R2 (ej. link externo de Drive).
 * Si el archivo ya no existía, lo da por borrado.
 * @param {string} downloadUrl
 */
export async function deleteFromR2(downloadUrl) {
  if (!isR2FileUrl(downloadUrl)) return false;

  const fileKey = downloadUrl.split("/files/")[1];
  if (!fileKey) throw new Error("No se pudo extraer la key del archivo desde la URL guardada.");

  const res = await workerFetch(`/files/${fileKey}`, { method: "DELETE" });
  if (res.status === 404) return true;
  if (!res.ok) throw new Error(await workerErrorMessage(res));
  return true;
}

// Para limpiezas "de fondo" (archivos reemplazados o descartados): si falla,
// solo se registra en consola, no interrumpe lo que el usuario está haciendo.
export function discardR2File(url) {
  if (!isR2FileUrl(url)) return;
  deleteFromR2(url).catch((err) => console.warn("No se pudo borrar el archivo descartado de R2:", url, err));
}
