import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSettings, saveSettings } from "../../services/settings";

const blank = {
  site_name: "",
  site_tagline: "",
  avatar_url: "",
  primary_color: "#7C5CFF",
  secondary_color: "#33E6B0",
  meta_title: "",
  meta_description: "",
  favicon_url: "",
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
            <input
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              placeholder="URL del avatar/logo"
              className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={form.favicon_url}
              onChange={(e) => setForm({ ...form, favicon_url: e.target.value })}
              placeholder="URL del favicon"
              className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm"
            />
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
