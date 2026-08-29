import { supabase } from "./supabaseClient";

export async function getSocials() {
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createSocial(item) {
  const { data, error } = await supabase.from("social_links").insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateSocial(id, updates) {
  const { data, error } = await supabase
    .from("social_links")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSocial(id) {
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) throw error;
}
