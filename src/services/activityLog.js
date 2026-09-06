import { supabase } from "./supabaseClient";

export async function logActivity({ actorEmail, actorName, actorAvatarUrl, actorColor, action, entityType, entityId, entityTitle }) {
  const { error } = await supabase.from("activity_log").insert({
    actor_email: actorEmail,
    actor_name: actorName || actorEmail,
    actor_avatar_url: actorAvatarUrl || null,
    actor_color: actorColor || null,
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    entity_title: entityTitle || "",
  });
  // No tiramos el error para arriba: si falla el log, no queremos romper
  // la acción real del usuario (crear/editar/borrar) por esto.
  if (error) console.error("No se pudo registrar la actividad:", error);
}

export async function fetchActivityLog({ limit = 200 } = {}) {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
