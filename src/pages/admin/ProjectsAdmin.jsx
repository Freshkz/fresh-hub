import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects, createProject, updateProject, deleteProject } from "../../services/projects";
import { sendDiscordNotification } from "../../services/discord";
import MediaUploadField from "../../components/admin/MediaUploadField";

const empty = { name: "", description: "", technologies: "", image: "", status: "active", featured: false };

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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
        const created = await createProject(payload);
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/admin/dashboard" className="text-xs text-muted hover:text-text">← Dashboard</Link>
      <h1 className="font-display text-xl font-semibold mt-2 mb-4">Projects — Admin</h1>

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
    </div>
  );
}
