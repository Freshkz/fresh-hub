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
  ecosystem_fresh_thumbnail: "",
  ecosystem_cupons_thumbnail: "",
  ecosystem_ai_stylist_thumbnail: "",
  og_image_url: "",
  default_guide_thumbnail: "",
  default_project_thumbnail: "",
  default_download_thumbnail: "",
  discord_webhook_url: "",
  discord_server_id: "",
  private_apps_pin: "1234",
  r2_worker_url: "",
  r2_admin_limit_gb: 5,
  r2_editor_limit_gb: 1,
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
    ecosystem_fresh_thumbnail: row.ecosystem_fresh_thumbnail || "",
    ecosystem_cupons_thumbnail: row.ecosystem_cupons_thumbnail || "",
    ecosystem_ai_stylist_thumbnail: row.ecosystem_ai_stylist_thumbnail || "",
    og_image_url: row.og_image_url || row.og_image || "",
    default_guide_thumbnail: row.default_guide_thumbnail || "",
    default_project_thumbnail: row.default_project_thumbnail || "",
    default_download_thumbnail: row.default_download_thumbnail || "",
    discord_webhook_url: row.discord_webhook_url || "",
    discord_server_id: row.discord_server_id || "",
    private_apps_pin: row.private_apps_pin || "1234",
    r2_worker_url: row.r2_worker_url || "",
    r2_admin_limit_gb: row.r2_admin_limit_gb ?? 5,
    r2_editor_limit_gb: row.r2_editor_limit_gb ?? 1,
  };
}

function buildSettingsPayloadVariants(normalized) {
  return [
    {
      site_name: normalized.site_name,
      site_tagline: normalized.site_tagline,
      meta_title: normalized.meta_title,
      meta_description: normalized.meta_description,
      avatar_url: normalized.avatar_url,
      primary_color: normalized.primary_color,
      secondary_color: normalized.secondary_color,
      favicon_url: normalized.favicon_url,
      ecosystem_fresh_thumbnail: normalized.ecosystem_fresh_thumbnail,
      ecosystem_cupons_thumbnail: normalized.ecosystem_cupons_thumbnail,
      ecosystem_ai_stylist_thumbnail: normalized.ecosystem_ai_stylist_thumbnail,
      og_image_url: normalized.og_image_url,
      default_guide_thumbnail: normalized.default_guide_thumbnail,
      default_project_thumbnail: normalized.default_project_thumbnail,
      default_download_thumbnail: normalized.default_download_thumbnail,
      discord_webhook_url: normalized.discord_webhook_url,
      discord_server_id: normalized.discord_server_id,
      private_apps_pin: normalized.private_apps_pin,
      r2_worker_url: normalized.r2_worker_url,
      r2_admin_limit_gb: normalized.r2_admin_limit_gb,
      r2_editor_limit_gb: normalized.r2_editor_limit_gb,
    },
  ];
}

function isMissingColumnError(error) {
  const message = error?.message || "";
  return /column .* does not exist|Could not find the '.*' column of 'settings' in the schema cache/i.test(message);
}

function isKeyValueRows(rows) {
  return Array.isArray(rows) && rows.length > 0 && rows.every((row) => Object.prototype.hasOwnProperty.call(row, "key") && Object.prototype.hasOwnProperty.call(row, "value"));
}

function settingsFromKeyValueRows(rows) {
  return rows.reduce((settings, row) => {
    if (row.key) settings[row.key] = row.value ?? "";
    return settings;
  }, {});
}

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*");
  if (error) throw error;

  if (isKeyValueRows(data)) return normalizeSettings(settingsFromKeyValueRows(data));
  const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
  return normalizeSettings(row || {});
}

export async function saveSettings(formData) {
  const normalized = normalizeSettings(formData);
  const { data: existingRows, error: fetchError } = await supabase.from("settings").select("*");
  if (fetchError) throw fetchError;

  if (isKeyValueRows(existingRows) || (Array.isArray(existingRows) && existingRows.length === 0)) {
    const keyValueRows = Object.entries(normalized)
      .filter(([key]) => key !== "id")
      .map(([key, value]) => ({ key, value: value ?? "" }));
    const { error } = await supabase.from("settings").upsert(keyValueRows, { onConflict: "key" });
    if (error) throw error;
    return normalized;
  }

  const existing = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;
  const payloadVariants = buildSettingsPayloadVariants(normalized);

  let lastError = null;
  for (const payload of payloadVariants) {
    try {
      if (!existing) {
        const { data, error } = await supabase.from("settings").insert(payload).select().maybeSingle();
        if (!error) return normalizeSettings(data || payload);
        if (!isMissingColumnError(error)) throw error;
      } else {
        const hasIdColumn = Object.prototype.hasOwnProperty.call(existing, "id");
        let query = supabase.from("settings").update(payload);

        if (hasIdColumn) {
          query = query.eq("id", existing.id);
        }

        const { data, error } = await query.select().maybeSingle();
        if (!error) return normalizeSettings(data || { ...existing, ...payload });
        if (!isMissingColumnError(error)) throw error;
      }
    } catch (error) {
      lastError = error;
      if (!isMissingColumnError(error)) throw error;
    }
  }

  if (lastError) throw lastError;
  return normalizeSettings(existing || {});
}