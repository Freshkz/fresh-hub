import { supabase } from "./supabaseClient";

export const DEFAULT_SETTINGS = {
  id: null,
  site_name: "FreshKZ",
  site_tagline: "Todo lo que hago, en un solo lugar",
  avatar_url: "",
  primary_color: "#7C5CFF",
  secondary_color: "#33E6B0",
  meta_title: "FreshKZ Hub",
  meta_description: "Proyectos, descargas y novedades de FreshKZ.",
  favicon_url: "",
};

function normalizeSettings(row = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...row,
    id: row.id ?? null,
    site_name: row.site_name || row.name || row.title || DEFAULT_SETTINGS.site_name,
    site_tagline: row.site_tagline || row.tagline || row.subtitle || DEFAULT_SETTINGS.site_tagline,
    avatar_url: row.avatar_url || row.logo_url || row.avatar || "",
    primary_color: row.primary_color || row.accent_color || row.color_primary || DEFAULT_SETTINGS.primary_color,
    secondary_color: row.secondary_color || row.accent2_color || row.color_secondary || DEFAULT_SETTINGS.secondary_color,
    meta_title: row.meta_title || row.seo_title || row.site_name || DEFAULT_SETTINGS.meta_title,
    meta_description: row.meta_description || row.seo_description || row.description || DEFAULT_SETTINGS.meta_description,
    favicon_url: row.favicon_url || "",
  };
}

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").limit(1);
  if (error) throw error;

  const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
  return normalizeSettings(row || {});
}

export async function saveSettings(formData) {
  const normalized = normalizeSettings(formData);
  const { data: existingRows, error: fetchError } = await supabase.from("settings").select("*").limit(1);
  if (fetchError) throw fetchError;

  const existing = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;

  const payload = {
    name: normalized.site_name,
    tagline: normalized.site_tagline,
    avatar_url: normalized.avatar_url,
    primary_color: normalized.primary_color,
    secondary_color: normalized.secondary_color,
    seo_title: normalized.meta_title,
    seo_description: normalized.meta_description,
    favicon_url: normalized.favicon_url,
  };

  if (!existing) {
    const { data, error } = await supabase.from("settings").insert(payload).select().single();
    if (error) throw error;
    return normalizeSettings(data);
  }

  const { data, error } = await supabase
    .from("settings")
    .update(payload)
    .eq("id", existing.id)
    .select()
    .single();

  if (error) throw error;
  return normalizeSettings(data);
}
