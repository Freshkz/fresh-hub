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

// Borra una entrada puntual del log. Solo debe exponerse en la UI a usuarios admin
// (las políticas RLS en Supabase también deberían restringir el delete a admin).
export async function deleteActivityLogEntry(id) {
  const { error } = await supabase.from("activity_log").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// Borra varias entradas a la vez (selección múltiple / "vaciar log").
export async function deleteActivityLogEntries(ids) {
  if (!ids || ids.length === 0) return true;
  const { error } = await supabase.from("activity_log").delete().in("id", ids);
  if (error) throw error;
  return true;
}

// Borra todo el historial anterior a una fecha (útil para "limpiar log viejo").
export async function deleteActivityLogOlderThan(dateIso) {
  const { error } = await supabase.from("activity_log").delete().lt("created_at", dateIso);
  if (error) throw error;
  return true;
}
