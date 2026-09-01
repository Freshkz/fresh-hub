import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSettings, saveSettings } from "../../services/settings";
import MediaUploadField from "../../components/admin/MediaUploadField";

const blank = {
  site_name: "",
  site_tagline: "",
  avatar_url: "",
  primary_color: "#7C5CFF",
  secondary_color: "#33E6B0",
  meta_title: "",
  meta_description: "",
  favicon_url: "",
  ecosystem_fresh_thumbnail: "",
  ecosystem_cupons_thumbnail: "",
  ecosystem_ai_stylist_thumbnail: "",
  og_image_url: "",
};

export default function SettingsAdmin() {
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const settings = await getSettings();
      setForm({
        site_name: settings.site_name || "",
        site_tagline: settings.site_tagline || "",
        avatar_url: settings.avatar_url || "",
        primary_color: settings.primary_color || "#7C5CFF",
        secondary_color: settings.secondary_color || "#33E6B0",
        meta_title: settings.meta_title || "",
        meta_description: settings.meta_description || "",
        favicon_url: settings.favicon_url || "",
        ecosystem_fresh_thumbnail: settings.ecosystem_fresh_thumbnail || "",
        ecosystem_cupons_thumbnail: settings.ecosystem_cupons_thumbnail || "",
        ecosystem_ai_stylist_thumbnail: settings.ecosystem_ai_stylist_thumbnail || "",
        og_image_url: settings.og_image_url || "",
      });
    } catch (err) {
      setErrorMsg(err.message || "No se pudo cargar la configuración.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await saveSettings(form);
      setSuccessMsg("Configuración guardada correctamente.");
    } catch (err) {
      setErrorMsg(err.message || "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/admin/dashboard" className="text-xs text-muted hover:text-text">← Dashboard</Link>
      <h1 className="font-display text-xl font-semibold mt-2 mb-4">Settings — Admin</h1>

      {errorMsg && (
        <p className="text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}
      {successMsg && (
        <p className="text-green-400 text-sm mb-4 bg-green-400/10 border border-green-400/30 rounded-lg px-3 py-2">
          {successMsg}
        </p>
      )}

      {loading ? (
        <p className="text-muted text-sm">Cargando configuración…</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <input
              value={form.site_name}
              onChange={(e) => setForm({ ...form, site_name: e.target.value })}
              placeholder="Nombre del sitio"
              className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={form.meta_title}
              onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
              placeholder="SEO title"
              className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <MediaUploadField value={form.og_image_url} onChange={(og_image_url) => setForm({ ...form, og_image_url })} folder="branding" label="Imagen para compartir en redes" />

          <textarea
            value={form.site_tagline}
            onChange={(e) => setForm({ ...form, site_tagline: e.target.value })}
            placeholder="Tagline / slogan"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm min-h-[90px]"
          />

          <textarea
            value={form.meta_description}
            onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
            placeholder="Meta description"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm min-h-[90px]"
          />

          <div className="grid md:grid-cols-2 gap-3">
            <MediaUploadField value={form.avatar_url} onChange={(avatar_url) => setForm({ ...form, avatar_url })} folder="branding" label="Avatar / logo" />
            <MediaUploadField value={form.favicon_url} onChange={(favicon_url) => setForm({ ...form, favicon_url })} folder="branding" label="Favicon" />
          </div>

          <div className="border-t border-border pt-4">
            <h2 className="mb-1 text-sm font-semibold">Miniaturas del ecosistema</h2>
            <p className="mb-4 text-xs text-muted">Estas imágenes aparecen en el bloque Fresh Ecosystem de la home.</p>
            <div className="space-y-4">
              <MediaUploadField value={form.ecosystem_fresh_thumbnail} onChange={(ecosystem_fresh_thumbnail) => setForm({ ...form, ecosystem_fresh_thumbnail })} folder="ecosystem" label="Fresh Hub" />
              <MediaUploadField value={form.ecosystem_cupons_thumbnail} onChange={(ecosystem_cupons_thumbnail) => setForm({ ...form, ecosystem_cupons_thumbnail })} folder="ecosystem" label="Cupons" />
              <MediaUploadField value={form.ecosystem_ai_stylist_thumbnail} onChange={(ecosystem_ai_stylist_thumbnail) => setForm({ ...form, ecosystem_ai_stylist_thumbnail })} folder="ecosystem" label="AI Stylist" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm">
              <span>Color principal</span>
              <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-10 h-10 rounded border-0 bg-transparent" />
            </label>
            <label className="flex items-center gap-3 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm">
              <span>Color secundario</span>
              <input type="color" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="w-10 h-10 rounded border-0 bg-transparent" />
            </label>
          </div>

          <button type="submit" disabled={saving} className="bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60">
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </form>
      )}
    </div>
  );
}
