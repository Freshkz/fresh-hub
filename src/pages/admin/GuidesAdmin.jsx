import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createGuide, deleteGuide, fetchGuides, updateGuide } from "../../services/guides";

const initialForm = {
  title: "",
  game: "Minecraft",
  summary: "",
  image: "",
  tags: "",
  links: "",
  content: "",
  published: true,
  featured: false,
};

function parseTags(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseLinks(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf("|");
      if (separatorIndex > -1) {
        const label = line.slice(0, separatorIndex).trim();
        const url = line.slice(separatorIndex + 1).trim();
        return { label: label || "Link", url };
      }
      return { label: "Link", url: line };
    })
    .filter((link) => link.url);
}

function parseContent(value) {
  return value
    .split(/\n{2,}|\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((content) => ({ type: "text", content }));
}

function slugify(value) {
  return String(value || "guia").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function GuidesAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      setItems(await fetchGuides());
    } catch (err) {
      setErrorMsg(err.message || "Error cargando guías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");

    const payload = {
      title: form.title,
      slug: slugify(form.title),
      game: form.game,
      summary: form.summary,
      image: form.image,
      tags: parseTags(form.tags),
      links: parseLinks(form.links),
      parts: parseContent(form.content),
      published: form.published,
      featured: form.featured,
      createdAt: new Date().toISOString(),
    };

    try {
      if (editingId) await updateGuide(editingId, payload);
      else await createGuide(payload);
      setForm(initialForm);
      setEditingId(null);
      load();
    } catch (err) {
      setErrorMsg(err.message || "Error guardando la guía");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      game: item.game || "Minecraft",
      summary: item.summary || "",
      image: item.image || "",
      tags: (item.tags || []).join(", "),
      links: (item.links || []).map((link) => `${link.label || "Link"} | ${link.url}`).join("\n"),
      content: (item.parts || []).map((part) => part.content || "").join("\n\n"),
      published: item.published !== false,
      featured: Boolean(item.featured),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta guía?")) return;
    try {
      await deleteGuide(id);
      load();
    } catch (err) {
      setErrorMsg(err.message || "Error eliminando la guía");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link to="/admin/dashboard" className="text-xs text-muted hover:text-text">← Dashboard</Link>
      <h1 className="mt-2 font-display text-xl font-semibold">Guías — Admin</h1>

      {errorMsg && (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">{errorMsg}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-[28px] border border-border bg-surface p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Título de la guía" className="rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent" required />
          <select value={form.game} onChange={(event) => setForm({ ...form, game: event.target.value })} className="rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent">
            {[
              "Minecraft",
              "CS2",
              "Stardew Valley",
              "General",
            ].map((game) => <option key={game} value={game}>{game}</option>)}
          </select>
        </div>

        <textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="Resumen breve" className="min-h-[90px] w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent" />

        <div className="grid gap-3 md:grid-cols-2">
          <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="URL de imagen" className="rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent" />
          <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="Etiquetas, separadas por coma" className="rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent" />
        </div>

        <textarea value={form.links} onChange={(event) => setForm({ ...form, links: event.target.value })} placeholder={'Links relacionados\nEtiqueta | https://ejemplo.com'} className="min-h-[120px] w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent" />

        <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Contenido de la guía. Cada párrafo va en una línea nueva o doble salto." className="min-h-[180px] w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent" />

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} />
            Publicada
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
            Destacada
          </label>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white">
            {editingId ? "Guardar cambios" : "Crear guía"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }} className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="mt-6 text-sm text-muted">Cargando guías…</p>
      ) : (
        <div className="mt-8 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">{item.title}</p>
                <p className="text-xs text-muted">{item.game} · {item.published ? "Publicada" : "Borrador"}</p>
              </div>
              <div className="flex gap-3 text-sm text-muted">
                <button onClick={() => startEdit(item)} className="hover:text-text">Editar</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
