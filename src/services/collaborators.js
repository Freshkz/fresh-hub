import { supabase } from "./supabaseClient";

// Normaliza el email antes de guardarlo/buscarlo: Postgres compara texto
// exacto (mayúsculas/minúsculas y espacios incluidos), y Supabase Auth
// siempre guarda el email de login en minúsculas — si acá quedara con otra
// capitalización o un espacio de más, la búsqueda no lo encuentra nunca y
// esa persona ve el fallback genérico de "Colaborador" sin su nombre/color/avatar.
function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

export async function getCollaborators() {
  const { data, error } = await supabase
    .from("collaborators")
    .select("*")
    .order("display_name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCollaboratorByEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const { data, error } = await supabase
    .from("collaborators")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCollaborator(payload) {
  const { data, error } = await supabase
    .from("collaborators")
    .insert({ ...payload, email: normalizeEmail(payload.email) })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCollaborator(id, payload) {
  const { data, error } = await supabase
    .from("collaborators")
    .update({ ...payload, email: normalizeEmail(payload.email) })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCollaborator(id) {
  const { error } = await supabase.from("collaborators").delete().eq("id", id);
  if (error) throw error;
  return true;
}
