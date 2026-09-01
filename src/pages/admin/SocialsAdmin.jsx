import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSocials, createSocial, updateSocial, deleteSocial } from "../../services/socials";
import MediaUploadField from "../../components/admin/MediaUploadField";

const empty = { name: "", url: "", icon: "", icon_url: "", enabled: true, order: 0 };

export default function SocialsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try { setItems(await getSocials()); }
    catch (err) { setErrorMsg(err.message || "Error cargando redes"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editingId) await updateSocial(editingId, payload);
      else await createSocial(payload);
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setErrorMsg(err.message || "Error guardando red social");
    }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setForm({ name: s.name, url: s.url, icon: s.icon || "", icon_url: s.icon_url || "", enabled: s.enabled, order: s.order });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta red social?")) return;
    try { await deleteSocial(id); load(); }
    catch (err) { setErrorMsg(err.message || "Error eliminando red social"); }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/admin/dashboard" className="text-xs text-muted hover:text-text">← Dashboard</Link>
      <h1 className="font-display text-xl font-semibold mt-2 mb-4">Social Links — Admin</h1>

      {errorMsg && (
        <p className="text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-5 mb-10 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Nombre (ej. GitHub)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" required />
          <input placeholder="Ícono (Instagram, Github, Discord, TikTok o Steam)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        </div>
        <MediaUploadField value={form.icon_url} onChange={(icon_url) => setForm({ ...form, icon_url })} folder="socials" label="Icono personalizado" />
        <input placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" required />
        <div className="flex items-center gap-4">
          <input type="number" placeholder="Orden" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })}
            className="w-24 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
            Habilitada
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg">
            {editingId ? "Guardar cambios" : "Agregar red"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="text-sm text-muted">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? <p className="text-muted text-sm">Cargando...</p> : (
        <div className="space-y-2">
          {items.map((s) => (
            <div key={s.id} className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium">{s.name} {!s.enabled && <span className="text-muted text-xs ml-1">(oculta)</span>}</p>
                <p className="text-xs text-muted">{s.url}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => startEdit(s)} className="text-muted hover:text-text">Editar</button>
                <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
