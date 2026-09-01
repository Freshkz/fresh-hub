import { supabase } from "./supabaseClient";

export const MEDIA_BUCKET = import.meta.env.VITE_MEDIA_BUCKET || "media";

export async function uploadMedia(file, folder = "images") {
  if (!file) throw new Error("Seleccioná una imagen.");
  if (!file.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen.");
  if (file.size > 8 * 1024 * 1024) throw new Error("La imagen no puede superar los 8 MB.");

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("No se pudo generar la URL pública.");
  return data.publicUrl;
}
