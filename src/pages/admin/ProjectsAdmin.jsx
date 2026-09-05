import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects, createProject, updateProject, deleteProject } from "../../services/projects";
import { sendDiscordNotification } from "../../services/discord";
import { useAuth } from "../../hooks/useAuth";
import MediaUploadField from "../../components/admin/MediaUploadField";
import ProjectCard from "../../components/projects/ProjectCard";

const empty = { name: "", description: "", technologies: "", image: "", status: "active", featured: false };

export default function ProjectsAdmin() {
  const { userEmail, role } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showMiniPreview, setShowMiniPreview] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const payload = {
      ...form,
      technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await updateProject(editingId, payload);
      } else {
        await createProject({
          ...payload,
          author_email: userEmail,
          author_role: role || "admin",
        });
        sendDiscordNotification({
          title: form.name,
          description: form.description,
          imageUrl: form.image,
          type: "Proyecto",
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
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    try { await deleteProject(id); load(); }
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

      <div className="grid gap-6 lg:grid-cols-[1fr_160px] lg:items-start mb-10">
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-5 space-y-3">
        <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" required />
        <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        <MediaUploadField value={form.image} onChange={(image) => setForm({ ...form, image })} folder="projects" label="Miniatura del proyecto" />
        <input placeholder="Tecnologías (separadas por coma)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })}
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
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
          <div className="pointer-events-none mx-auto w-full max-w-[140px] origin-top scale-90">
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
              <div className="flex gap-3 text-sm">
                <button onClick={() => startEdit(p)} className="text-muted hover:text-text">Editar</button>
                <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
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
    </div>
  );
}
