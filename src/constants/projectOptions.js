// Opciones de proyecto compartidas entre el panel de Admin y el sitio público.
// Los valores de PROJECT_TYPES tienen que coincidir con el check de la base
// (supabase/ratings-and-project-types-migration.sql).

export const PROJECT_TYPES = [
  { value: "app", label: "App / Programa", icon: "🧩" },
  { value: "web", label: "Sitio web", icon: "🌐" },
  { value: "game", label: "Juego", icon: "🎮" },
  { value: "tool", label: "Herramienta / Automatización", icon: "⚙️" },
  { value: "other", label: "Otro", icon: "✦" },
];

export const PROJECT_STATUSES = [
  { value: "active", label: "Activo" },
  { value: "in-development", label: "En desarrollo" },
  { value: "experimental", label: "Experimental" },
  { value: "archived", label: "Archivado" },
];

export function projectTypeMeta(value) {
  return PROJECT_TYPES.find((type) => type.value === value) || PROJECT_TYPES[0];
}

export function projectStatusLabel(value) {
  return PROJECT_STATUSES.find((status) => status.value === value)?.label || value || "";
}
