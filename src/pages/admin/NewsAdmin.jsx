import { useEffect, useState } from "react";
import { getNews, createNews, updateNews, deleteNews } from "../../services/news";

const empty = { title: "", description: "", type: "update", published: true, featured: false };

export default function NewsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try { setItems(await getNews()); }
    catch (err) { setErrorMsg(err.message || "Error cargando novedades"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      if (editingId) await updateNews(editingId, form);
      else await createNews({ ...form, date: new Date().toISOString(), source: "admin" });
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setErrorMsg(err.message || "Error guardando novedad");
    }
  };

  const startEdit = (n) => {
    setEditingId(n.id);
    setForm({
      title: n.title, description: n.description || "", type: n.type,
      published: n.published, featured: n.featured,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta novedad?")) return;
    try { await deleteNews(id); load(); }
    catch (err) { setErrorMsg(err.message || "Error eliminando novedad"); }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <a href="/admin/dashboard" className="text-xs text-muted hover:text-text">← Dashboard</a>
      <h1 className="font-display text-xl font-semibold mt-2 mb-4">News — Admin</h1>

      {errorMsg && (
        <p className="text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-5 mb-10 space-y-3">
        <input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" required />
        <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        <div className="flex items-center gap-4">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm">
            <option value="update">Update</option>
            <option value="release">Release</option>
            <option value="project">Project</option>
            <option value="announcement">Announcement</option>
            <option value="event">Event</option>
            <option value="other">Other</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Publicado
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg">
            {editingId ? "Guardar cambios" : "Crear novedad"}
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
          {items.map((n) => (
            <div key={n.id} className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium">{n.title} {!n.published && <span className="text-muted text-xs ml-1">(borrador)</span>}</p>
                <p className="text-xs text-muted">{n.type} · {n.source}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => startEdit(n)} className="text-muted hover:text-text">Editar</button>
                <button onClick={() => handleDelete(n.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
