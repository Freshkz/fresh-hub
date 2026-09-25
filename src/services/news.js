import { supabase } from "./supabaseClient";

export async function getNews() {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getNewsItem(id) {
  // maybeSingle: si es privado y no tenés acceso, la base no devuelve la fila (no es un error).
  const { data, error } = await supabase.from("news").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Esta novedad no existe o no tenés acceso.");
  return data;
}

export async function createNews(item) {
  const { data, error } = await supabase.from("news").insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateNews(id, updates) {
  const { data, error } = await supabase
    .from("news")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNews(id) {
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;
}
