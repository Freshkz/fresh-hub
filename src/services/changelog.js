import { supabase } from "./supabaseClient";

// Fallback: si por lo que sea la tabla no existe todavía (falta correr la migración)
// o Supabase no responde, mostramos igual una entrada vieja en vez de una página
// en blanco. El resto del historial real vive en Supabase (ver changelog-migration.sql).
const legacyFallbackEntries = [
  {
    version: "v1.6.1",
    date: "2026-09-06",
    title: "Privacidad selectiva por publicación",
    summary: "El contenido privado ya no lo ve 'cualquier logueado' — ahora se elige exactamente quién puede verlo, publicación por publicación.",
    added: ["Selector 'Quién más puede ver esto' en los 4 formularios (Descargas, Proyectos, Novedades, Guías), con chips de cada colaborador"],
    fixed: ["El contenido privado se mostraba sin blur a CUALQUIER persona logueada, sin importar quién lo creó ni si tenía permiso; ahora solo lo ven el Admin, el autor, y los colaboradores elegidos explícitamente"],
    changed: ["'Privado' pasó de ser una regla global (logueado = ve todo) a una regla por publicación (autor + Admin + elegidos)"],
  },
];

function fromRow(row) {
  return {
    id: row.id,
    version: row.version,
    date: row.entry_date,
    title: row.title,
    summary: row.summary || "",
    added: row.added || [],
    fixed: row.fixed || [],
    changed: row.changed || [],
    source: row.source || "manual",
    lastCommitSha: row.last_commit_sha || null,
  };
}

export async function fetchChangelogEntries() {
  const { data, error } = await supabase
    .from("changelog_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("No se pudo cargar el changelog desde Supabase, muestro el respaldo:", error);
    return legacyFallbackEntries;
  }
  if (!data || data.length === 0) return legacyFallbackEntries;
  return data.map(fromRow);
}

// La entrada más reciente guardada, para saber desde qué fecha/commit pedirle
// los commits nuevos a GitHub.
export async function fetchLatestChangelogEntry() {
  const { data, error } = await supabase
    .from("changelog_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function createChangelogEntry({ version, date, title, summary, added, fixed, changed, source, lastCommitSha }) {
  const { data, error } = await supabase
    .from("changelog_entries")
    .insert({
      version,
      entry_date: date,
      title,
      summary,
      added: added || [],
      fixed: fixed || [],
      changed: changed || [],
      source: source || "manual",
      last_commit_sha: lastCommitSha || null,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateChangelogEntry(id, { version, date, title, summary, added, fixed, changed }) {
  const { data, error } = await supabase
    .from("changelog_entries")
    .update({
      version,
      entry_date: date,
      title,
      summary,
      added: added || [],
      fixed: fixed || [],
      changed: changed || [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteChangelogEntry(id) {
  const { error } = await supabase.from("changelog_entries").delete().eq("id", id);
  if (error) throw error;
  return true;
}
