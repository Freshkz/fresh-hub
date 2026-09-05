import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDownloads, createDownload, updateDownload, deleteDownload, uploadDownloadFile } from "../../services/downloads";
import { uploadToR2, deleteFromR2 } from "../../services/r2Upload";
import { sendDiscordNotification } from "../../services/discord";
import { useAuth } from "../../hooks/useAuth";
import MediaUploadField from "../../components/admin/MediaUploadField";
import ConfirmModal from "../../components/ui/ConfirmModal";

const empty = {
  name: "", description: "", category: "", version: "", size: "",
  format: "", download_url: "", image: "", featured: false, status: "published",
};

export default function DownloadsAdmin() {
  const { userEmail, role, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try { setItems(await getDownloads()); }
    catch (err) { setErrorMsg(err.message || "Error cargando descargas"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleFileUploadR2 = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setErrorMsg("");

    try {
      const publicUrl = await uploadToR2({
        file,
        role: role || "editor",
        onProgress: (percent) => setUploadProgress(percent),
      });

      // Calcular tamaño legible automáticamente
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeGb = (file.size / (1024 * 1024 * 1024)).toFixed(2);
      const formattedSize = file.size > 1024 * 1024 * 1024 ? `${sizeGb} GB` : `${sizeMb} MB`;
      const extension = file.name.split(".").pop()?.toUpperCase() || "ZIP";

      setForm((current) => ({
        ...current,
        download_url: publicUrl,
        size: current.size || formattedSize,
        format: current.format || extension,
        name: current.name || file.name.replace(/\.[^/.]+$/, ""),
      }));
    } catch (err) {
      setErrorMsg(err.message || "No se pudo subir a Cloudflare R2.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      if (editingId) {
        await updateDownload(editingId, form);
      } else {
        await createDownload({
          ...form,
          release_date: new Date().toISOString(),
          author_email: userEmail,
          author_role: role || "admin",
        });
        sendDiscordNotification({
          title: `${form.name} ${form.version ? `(v${form.version})` : ""}`,
          description: form.description,
          url: form.download_url,
          imageUrl: form.image,
          type: "Descarga",
          color: 0x33E6B0,
        });
      }
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
      image: d.image || "",
    });
  };

  const handleDelete = (id, downloadUrl) => {
    setPendingDelete({ id, downloadUrl });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, downloadUrl } = pendingDelete;
    setPendingDelete(null);
    setErrorMsg("");
    try {
      if (downloadUrl) {
        await deleteFromR2(downloadUrl);
      }
      await deleteDownload(id);
      load();
    } catch (err) {
      setErrorMsg(err.message || "Error eliminando descarga");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/admin/dashboard" className="text-xs text-muted hover:text-text">← Dashboard</Link>
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
        <MediaUploadField value={form.image} onChange={(image) => setForm({ ...form, image })} folder="downloads" label="Miniatura de la descarga" />
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

        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs uppercase tracking-[0.18em] text-accent font-semibold">
              Subida directa a Cloudflare R2 🚀
            </label>
            <span className="text-[11px] text-muted font-mono">
              Límite: {isAdmin ? "5 GB (Admin)" : "1 GB (Editor)"}
            </span>
          </div>

          <input
            type="file"
            onChange={handleFileUploadR2}
            disabled={uploading}
            className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-white file:font-medium"
          />

          {uploading && (
            <div className="space-y-1 py-1">
              <div className="w-full bg-surface2 rounded-full h-2 overflow-hidden border border-border">
                <div
                  className="bg-accent h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-accent font-mono text-center">Subiendo a R2: {uploadProgress}%</p>
            </div>
          )}
        </div>

        <input placeholder="URL de descarga (o link externo como Drive/Mediafire)" value={form.download_url} onChange={(e) => setForm({ ...form, download_url: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent font-mono text-xs" />

        {form.download_url && (
          <a href={form.download_url} target="_blank" rel="noreferrer" className="inline-block text-xs text-accent underline">
            Ver archivo en R2 / externo →
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
          <button type="submit" disabled={uploading} className="bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? "Subiendo archivo..." : editingId ? "Guardar cambios" : "Crear descarga"}
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
                <button onClick={() => handleDelete(d.id, d.download_url)} className="text-red-400 hover:text-red-300">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!pendingDelete}
        title="¿Eliminar esta descarga?"
        message="Se va a borrar también el archivo en Cloudflare R2 si corresponde. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
