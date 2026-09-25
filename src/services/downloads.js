import { supabase } from "./supabaseClient";
import { withPrivateTeasers } from "./privateTeasers";

// includePrivateTeasers: suma las cards tapadas del contenido exclusivo (solo
// listados públicos; el panel de Admin no las usa).
export async function getDownloads({ includePrivateTeasers = false } = {}) {
  const { data, error } = await supabase
    .from("downloads")
    .select("*")
    .order("release_date", { ascending: false });
  if (error) throw error;
  if (!includePrivateTeasers) return data;
  return withPrivateTeasers(data, "downloads", (t) => ({
    id: t.id, name: t.title, image: t.image, featured: t.featured, category: t.category, release_date: t.sort_date,
  }), "release_date");
}

export async function getDownload(id) {
  // maybeSingle: si es privado y no tenés acceso, la base no devuelve la fila (no es un error).
  const { data, error } = await supabase.from("downloads").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Esta descarga no existe o no tenés acceso.");
  return data;
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
  // Si la RLS no deja borrar, Supabase NO devuelve error: borra 0 filas.
  // Pedimos las filas borradas para distinguir "borrado" de "rechazado".
  const { data, error } = await supabase.from("downloads").delete().eq("id", id).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("No se pudo borrar: no tenés permiso o la descarga ya no existe.");
}

// Un voto por usuario y descarga; votar de nuevo cambia el voto. La base
// recalcula rating_sum/rating_count con un trigger
// (ver supabase/ratings-and-project-types-migration.sql).
export async function rateDownload(id, score) {
  const { error } = await supabase
    .from("download_ratings")
    .upsert({ download_id: id, score, updated_at: new Date().toISOString() }, { onConflict: "download_id,user_id" });
  if (error) throw error;
  return getDownload(id);
}

// Voto del usuario actual (1-5) o 0 si todavía no votó.
export async function getMyRating(id) {
  const { data, error } = await supabase
    .from("download_ratings")
    .select("score")
    .eq("download_id", id)
    .maybeSingle();
  if (error) throw error;
  return data?.score || 0;
}
