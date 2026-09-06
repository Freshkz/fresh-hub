import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCollaborators, createCollaborator, updateCollaborator, deleteCollaborator } from "../../services/collaborators";
import ConfirmModal from "../../components/ui/ConfirmModal";
import MediaUploadField from "../../components/admin/MediaUploadField";

const empty = { email: "", display_name: "", color: "#33E6B0", avatar_url: "", can_mark_private: false };

export default function CollaboratorsAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try { setItems(await getCollaborators()); }
    catch (err) { setErrorMsg(err.message || "Error cargando colaboradores"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      if (editingId) {
        await updateCollaborator(editingId, form);
      } else {
        await createCollaborator(form);
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setErrorMsg(err.message || "Error guardando colaborador");
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      email: c.email,
      display_name: c.display_name,
      color: c.color,
      avatar_url: c.avatar_url || "",
      can_mark_private: Boolean(c.can_mark_private),
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete;
    setPendingDelete(null);
    try { await deleteCollaborator(id); load(); }
    catch (err) { setErrorMsg(err.message || "Error eliminando colaborador"); }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link to="/admin/dashboard" className="text-xs text-muted hover:text-text">← Dashboard</Link>
      <h1 className="font-display text-xl font-semibold mt-2 mb-1">Colaboradores — Admin</h1>
      <p className="text-xs text-muted mb-4">
        Vinculá cada email (ya creado en Supabase Auth) con un nombre y color propio,
        y decidí quién puede marcar contenido como privado.
      </p>

      {errorMsg && (
        <p className="text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-5 mb-10 space-y-3">
        <input
          placeholder="Email (el mismo con el que se loguea)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={Boolean(editingId)}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-60"
          required
        />
        <input
          placeholder="Nombre para mostrar (ej. Novia, Tomás...)"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          required
        />
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted">Color:</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="h-9 w-14 rounded-lg border border-border bg-surface2 cursor-pointer"
          />
          <span className="text-xs font-mono text-muted">{form.color}</span>
        </div>
        <MediaUploadField
          value={form.avatar_url}
          onChange={(avatar_url) => setForm({ ...form, avatar_url })}
          folder="collaborators"
          label="Imagen o GIF al lado del nombre (opcional)"
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.can_mark_private}
            onChange={(e) => setForm({ ...form, can_mark_private: e.target.checked })}
          />
          🔒 Puede marcar contenido como privado
        </label>
        <div className="flex gap-2">
          <button type="submit" className="bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg">
            {editingId ? "Guardar cambios" : "Agregar colaborador"}
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
          {items.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-border" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: c.color }} />
                )}
                <div>
                  <p className="text-sm font-medium">{c.display_name}</p>
                  <p className="text-xs text-muted">{c.email} {c.can_mark_private && "· 🔒 puede marcar privado"}</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => startEdit(c)} className="text-muted hover:text-text">Editar</button>
                <button onClick={() => setPendingDelete(c.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-muted text-sm">Todavía no agregaste colaboradores.</p>}
        </div>
      )}

      <ConfirmModal
        isOpen={!!pendingDelete}
        title="¿Eliminar este colaborador?"
        message="El contenido que ya creó no se borra, pero deja de tener nombre/color/permiso asignado."
        confirmLabel="Sí, eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
