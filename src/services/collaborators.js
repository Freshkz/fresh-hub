import { supabase } from "./supabaseClient";

export async function getCollaborators() {
  const { data, error } = await supabase
    .from("collaborators")
    .select("*")
    .order("display_name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCollaboratorByEmail(email) {
  if (!email) return null;
  const { data, error } = await supabase
    .from("collaborators")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCollaborator(payload) {
  const { data, error } = await supabase.from("collaborators").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateCollaborator(id, payload) {
  const { data, error } = await supabase.from("collaborators").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCollaborator(id) {
  const { error } = await supabase.from("collaborators").delete().eq("id", id);
  if (error) throw error;
  return true;
}
