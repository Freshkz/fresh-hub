import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects, createProject, updateProject, deleteProject } from "../../services/projects";
import { getDownloads } from "../../services/downloads";
import { sendDiscordNotification } from "../../services/discord";
import { logActivity } from "../../services/activityLog";
import { useAuth } from "../../hooks/useAuth";
import MediaUploadField from "../../components/admin/MediaUploadField";
import ProjectCard from "../../components/projects/ProjectCard";
import ConfirmModal from "../../components/ui/ConfirmModal";
import VisibleToPicker from "../../components/admin/VisibleToPicker";

const empty = { name: "", description: "", technologies: "", image: "", status: "active", featured: false, is_private: false, visible_to: [], linked_download_id: "" };

export default function ProjectsAdmin() {
  const { userEmail, role, isAdmin, canMarkPrivate, displayName, authorColor, authorAvatarUrl } = useAuth();
  const [projects, setProjects] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showMiniPreview, setShowMiniPreview] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      setProjects(await getProjects());
    } catch (err) {
      setErrorMsg(err.message || "Error cargando proyectos");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { getDownloads().then(setDownloads).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const payload = {
      ...form,
      technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
      linked_download_id: form.linked_download_id || null,
    };
    try {
      if (editingId) {
        await updateProject(editingId, payload);
        logActivity({ actorEmail: userEmail, actorName: displayName, actorAvatarUrl: authorAvatarUrl, actorColor: authorColor, action: "updated", entityType: "project", entityId: editingId, entityTitle: form.name });
      } else {
        await createProject({
          ...payload,
          author_email: userEmail,
          author_role: role || "admin",
          author_name: displayName,
          author_color: authorColor,
          author_avatar_url: authorAvatarUrl,
        });
        logActivity({ actorEmail: userEmail, actorName: displayName, actorAvatarUrl: authorAvatarUrl, actorColor: authorColor, action: "created", entityType: "project", entityTitle: form.name });
        sendDiscordNotification({
          title: form.name,
          description: form.description,
          imageUrl: form.image,
          type: "Proyecto",
          authorName: displayName,
          authorAvatarUrl: authorAvatarUrl,
          fields: [
            { name: "Estado", value: form.status || "—", inline: true },
            { name: "Tecnologías", value: form.technologies || "—", inline: true },
          ],
        });
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setErrorMsg(err.message || "Error guardando proyecto");
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      image: p.image || "",
      technologies: (p.technologies || []).join(", "),
      status: p.status,
      featured: p.featured,
      is_private: Boolean(p.is_private),
      visible_to: Array.isArray(p.visible_to) ? p.visible_to : [],
      linked_download_id: p.linked_download_id || "",
    });
  };

  const handleDelete = (id) => {
    setPendingDelete(id);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete;
    const deletedItem = projects.find((p) => p.id === id);
    setPendingDelete(null);
    try {
      await deleteProject(id);
      logActivity({ actorEmail: userEmail, actorName: displayName, actorAvatarUrl: authorAvatarUrl, actorColor: authorColor, action: "deleted", entityType: "project", entityId: id, entityTitle: deletedItem?.name });
      load();
    }
    catch (err) { setErrorMsg(err.message || "Error eliminando proyecto"); }
  };

  const previewProject = {
    id: "preview",
    name: form.name || "Nombre del proyecto",
    description: form.description || "La descripción va a aparecer acá.",
    image: form.image,
    technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
    status: form.status,
    featured: form.featured,
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link to="/admin/dashboard" className="text-xs text-muted hover:text-text">← Dashboard</Link>
      <h1 className="font-display text-xl font-semibold mt-2 mb-4">Projects — Admin</h1>

      {errorMsg && (
        <p className="text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_260px] lg:items-start mb-10">
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-5 space-y-3">
        <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" required />
        <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        <MediaUploadField value={form.image} onChange={(image) => setForm({ ...form, image })} folder="projects" label="Miniatura del proyecto" />
        <input placeholder="Tecnologías (separadas por coma)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />

        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">📥 Descarga vinculada (opcional)</label>
          <select value={form.linked_download_id} onChange={(e) => setForm({ ...form, linked_download_id: e.target.value })}
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="">— Ninguna —</option>
            {downloads.map((d) => <option key={d.id} value={d.id}>{d.name} {d.version ? `(v${d.version})` : ""}</option>)}
          </select>
          <p className="mt-1 text-[11px] text-muted">Si este proyecto tiene un archivo para descargar, cargalo primero en Descargas y despues elegilo acá.</p>
        </div>
        <div className="flex items-center gap-4">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm">
            <option value="active">Active</option>
            <option value="in-development">In development</option>
            <option value="archived">Archived</option>
            <option value="experimental">Experimental</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured
          </label>
          {canMarkPrivate && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={form.is_private} onChange={(e) => setForm({ ...form, is_private: e.target.checked })} />
                🔒 Privado
              </label>
              {form.is_private && (
                <VisibleToPicker value={form.visible_to} onChange={(visible_to) => setForm({ ...form, visible_to })} />
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg">
            {editingId ? "Guardar cambios" : "Crear proyecto"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="text-sm text-muted">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="lg:sticky lg:top-6 space-y-2">
        <button
          type="button"
          onClick={() => setShowMiniPreview((current) => !current)}
          className="w-full rounded-lg border border-border px-2 py-1.5 text-[11px] leading-tight text-muted hover:border-accent/50 hover:text-text"
        >
          {showMiniPreview ? "Ocultar vista previa" : "👁 Vista previa"}
        </button>

        {showMiniPreview && (
          <div className="pointer-events-none mx-auto w-full max-w-[240px]">
            <ProjectCard project={previewProject} />
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowFullPreview(true)}
          className="w-full rounded-lg border border-border px-2 py-1.5 text-[11px] leading-tight text-muted hover:border-accent/50 hover:text-text"
        >
          Ver página completa
        </button>
      </div>
      </div>

      {loading ? <p className="text-muted text-sm">Cargando...</p> : (
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium">{p.name} {p.featured && <span className="text-accent text-xs ml-1">★</span>}</p>
                <p className="text-xs text-muted">{p.status}</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {(isAdmin || p.author_email === userEmail) ? (
                  <>
                    <button onClick={() => startEdit(p)} className="text-muted hover:text-text">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
                  </>
                ) : (
                  <span className="text-xs font-medium text-red-400">🔒 No es tuya, no podés modificarla</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showFullPreview && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm"
          style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto max-w-3xl px-6 py-10">
            <button
              type="button"
              onClick={() => setShowFullPreview(false)}
              className="mb-4 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text hover:border-accent/50"
            >
              ✕ Cerrar vista previa
            </button>
            <article>
              <p className="font-mono text-xs text-accent uppercase tracking-wider mb-2">{previewProject.status}</p>
              <h1 className="font-display text-3xl font-bold mb-4">{previewProject.name}</h1>
              <p className="text-muted leading-7 mb-8">{previewProject.description}</p>
              <div className="flex flex-wrap gap-2">
                {previewProject.technologies.map((technology) => (
                  <span key={technology} className="px-3 py-1.5 rounded-lg bg-surface2 border border-border text-sm">{technology}</span>
                ))}
              </div>
            </article>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={!!pendingDelete}
        title="¿Eliminar este proyecto?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
