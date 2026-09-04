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

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", workerUrl, true);

    xhr.setRequestHeader("X-Upload-Role", role);
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

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
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.url) {
            resolve(response.url);
          } else {
            reject(new Error("Respuesta de Cloudflare R2 sin URL válida."));
          }
        } catch {
          reject(new Error("No se pudo interpretar la respuesta del Worker."));
        }
      } else {
        reject(new Error(`Error de subida a R2 (Status ${xhr.status}): ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Fallo de red al conectar con Cloudflare Worker."));
    xhr.onabort = () => reject(new Error("Subida cancelada."));

    xhr.send(file);
  });
}
