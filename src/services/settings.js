import { supabase } from "./supabaseClient";

export const DEFAULT_SETTINGS = {
  id: null,
  site_name: "Fresh",
  site_tagline: "Todo lo que hago, en un solo lugar",
  avatar_url: "",
  primary_color: "#7C5CFF",
  secondary_color: "#33E6B0",
  meta_title: "Fresh Hub",
  meta_description: "Proyectos, descargas y novedades de Fresh.",
  favicon_url: "",
};

function normalizeSettings(row = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...row,
    id: row.id ?? null,
    site_name: row.site_name || row.name || row.title || row.brand_name || DEFAULT_SETTINGS.site_name,
    site_tagline: row.site_tagline || row.tagline || row.subtitle || DEFAULT_SETTINGS.site_tagline,
    avatar_url: row.avatar_url || row.logo_url || row.avatar || "",
    primary_color: row.primary_color || row.accent_color || row.color_primary || DEFAULT_SETTINGS.primary_color,
    secondary_color: row.secondary_color || row.accent2_color || row.color_secondary || DEFAULT_SETTINGS.secondary_color,
    meta_title: row.meta_title || row.seo_title || row.site_name || DEFAULT_SETTINGS.meta_title,
    meta_description: row.meta_description || row.seo_description || row.description || DEFAULT_SETTINGS.meta_description,
    favicon_url: row.favicon_url || row.favicon || "",
  };
}

function buildSettingsPayload(normalized, existing = null) {
  const existingColumns = new Set(existing ? Object.keys(existing) : []);
  const payload = {};

  const fieldMap = [
    ["site_name", ["site_name", "name", "title", "brand_name"]],
    ["site_tagline", ["site_tagline", "tagline", "subtitle"]],
    ["meta_title", ["meta_title", "seo_title", "site_name"]],
    ["meta_description", ["meta_description", "seo_description", "description"]],
    ["avatar_url", ["avatar_url", "logo_url", "avatar"]],
    ["primary_color", ["primary_color", "accent_color", "color_primary"]],
    ["secondary_color", ["secondary_color", "accent2_color", "color_secondary"]],
    ["favicon_url", ["favicon_url", "favicon"]],
  ];

  for (const [outputKey, candidateColumns] of fieldMap) {
    const value = normalized[outputKey] ?? "";
    const matched = candidateColumns.find((column) => existingColumns.has(column));

    if (matched) {
      payload[matched] = value;
      continue;
    }

    if (!existing && ["site_name", "site_tagline", "meta_title", "meta_description", "avatar_url", "primary_color", "secondary_color", "favicon_url"].includes(outputKey)) {
      payload[outputKey] = value;
    }
  }

  return payload;
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
  const payload = buildSettingsPayload(normalized, existing);

  if (Object.keys(payload).length === 0) {
    return normalizeSettings(existing || {});
  }

  if (!existing) {
    const { data, error } = await supabase.from("settings").insert(payload).select().maybeSingle();
    if (error) throw error;
    return normalizeSettings(data || payload);
  }

  const hasIdColumn = Object.prototype.hasOwnProperty.call(existing, "id");
  let query = supabase.from("settings").update(payload);

  if (hasIdColumn) {
    query = query.eq("id", existing.id);
  }

  const { data, error } = await query.select().maybeSingle();
  if (error) throw error;
  return normalizeSettings(data || { ...existing, ...payload });
}
