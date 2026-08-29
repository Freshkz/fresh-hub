import { useEffect, useState } from "react";
import { getDownloads, createDownload, updateDownload, deleteDownload, uploadDownloadFile } from "../../services/downloads";

const empty = {
  name: "", description: "", category: "", version: "", size: "",
  format: "", download_url: "", featured: false, status: "published",
};

export default function DownloadsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try { setItems(await getDownloads()); }
    catch (err) { setErrorMsg(err.message || "Error cargando descargas"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");

    try {
      const publicUrl = await uploadDownloadFile(file);
      setForm((current) => ({ ...current, download_url: publicUrl }));
      setErrorMsg("");
    } catch (err) {
      setErrorMsg(err.message || "No se pudo subir el archivo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      if (editingId) await updateDownload(editingId, form);
      else await createDownload({ ...form, release_date: new Date().toISOString() });
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setErrorMsg(err.message || "Error guardando descarga");
    }
  };

  const startEdit = (d) => {
    setEditingId(d.id);
    setForm({
      name: d.name, description: d.description || "", category: d.category || "",
      version: d.version || "", size: d.size || "", format: d.format || "",
      download_url: d.download_url || "", featured: d.featured, status: d.status,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta descarga?")) return;
    try { await deleteDownload(id); load(); }
    catch (err) { setErrorMsg(err.message || "Error eliminando descarga"); }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <a href="/admin/dashboard" className="text-xs text-muted hover:text-text">← Dashboard</a>
      <h1 className="font-display text-xl font-semibold mt-2 mb-4">Downloads — Admin</h1>

      {errorMsg && (
        <p className="text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-5 mb-10 space-y-3">
        <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" required />
        <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Categoría (ej. Minecraft)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
          <input placeholder="Versión (ej. 1.4.2)" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
          <input placeholder="Tamaño (ej. 524 MB)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
          <input placeholder="Formato (ej. RAR)" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        </div>

        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-[0.18em] text-muted">Archivo de descarga</label>
          <div className="flex items-center gap-3">
            <input type="file" onChange={handleFileUpload} disabled={uploading}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-white file:font-medium" />
            {uploading && <span className="text-xs text-muted">Subiendo…</span>}
          </div>
          <p className="text-[11px] text-muted">
            Si el bucket <span className="font-mono">downloads</span> no existe, créalo como público en Supabase Storage. También podés pegar la URL manualmente si ya tenés un archivo alojado.
          </p>
        </div>

        <input placeholder="URL de descarga (link a Cloudflare R2 u otro)" value={form.download_url} onChange={(e) => setForm({ ...form, download_url: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />

        {form.download_url && (
          <a href={form.download_url} target="_blank" rel="noreferrer" className="inline-block text-xs text-accent underline">
            Ver archivo actual
          </a>
        )}

        <div className="flex items-center gap-4">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg">
            {editingId ? "Guardar cambios" : "Crear descarga"}
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
          {items.map((d) => (
            <div key={d.id} className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium">{d.name} {d.featured && <span className="text-accent text-xs ml-1">★</span>}</p>
                <p className="text-xs text-muted">v{d.version} · {d.size}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => startEdit(d)} className="text-muted hover:text-text">Editar</button>
                <button onClick={() => handleDelete(d.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
