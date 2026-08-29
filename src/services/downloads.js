import { supabase } from "./supabaseClient";

export const DOWNLOAD_BUCKET = import.meta.env.VITE_DOWNLOADS_BUCKET || "downloads";
export const DOWNLOADS_FOLDER = import.meta.env.VITE_DOWNLOADS_FOLDER || "downloads";

export async function getDownloads() {
  const { data, error } = await supabase
    .from("downloads")
    .select("*")
    .order("release_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadDownloadFile(file) {
  if (!file) throw new Error("Seleccioná un archivo para subir.");

  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const filePath = `${DOWNLOADS_FOLDER}/${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(DOWNLOAD_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from(DOWNLOAD_BUCKET).getPublicUrl(filePath);
  if (!urlData?.publicUrl) throw new Error("No se pudo generar la URL pública del archivo.");

  return urlData.publicUrl;
}

export async function createDownload(item) {
  const { data, error } = await supabase.from("downloads").insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateDownload(id, updates) {
  const { data, error } = await supabase
    .from("downloads")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDownload(id) {
  const { error } = await supabase.from("downloads").delete().eq("id", id);
  if (error) throw error;
}
