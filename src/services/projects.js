import { supabase } from "./supabaseClient";
import { withPrivateTeasers } from "./privateTeasers";

// includePrivateTeasers: suma las cards tapadas del contenido exclusivo (solo
// listados públicos; el panel de Admin no las usa).
export async function getProjects({ includePrivateTeasers = false } = {}) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!includePrivateTeasers) return data;
  return withPrivateTeasers(data, "projects", (t) => ({
    id: t.id, name: t.title, image: t.image, featured: t.featured, status: t.category, created_at: t.sort_date,
  }), "created_at");
}

export async function getProject(id) {
  // maybeSingle: si es privado y no tenés acceso, la base no devuelve la fila (no es un error).
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Este proyecto no existe o no tenés acceso.");
  return data;
}

export async function getProjectByLinkedDownload(downloadId) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("linked_download_id", downloadId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProject(project) {
  const { data, error } = await supabase.from("projects").insert(project).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
