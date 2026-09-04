import TagSelector from "../../components/ui/TagSelector";

const initialForm = {
  title: "",
  game: "Minecraft",
  summary: "",
  image: "",
  tags: [],
  links: "",
  parts: [{ type: "text", title: "", content: "" }],
  published: true,
  featured: false,
};

function parseTags(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
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
      setItems(await fetchGuides({ includeDrafts: true }));
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
      parts: form.parts.filter((part) => part.content || part.url).map((part) => ({ ...part })),
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
      tags: Array.isArray(item.tags) ? item.tags : (item.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      links: (item.links || []).map((link) => `${link.label || "Link"} | ${link.url}`).join("\n"),
      parts: (item.parts || []).length ? item.parts : [{ type: "text", title: "", content: "" }],
      published: item.published !== false,
      featured: Boolean(item.featured),
    });
  };

  const updatePart = (index, key, value) => {
    setForm((current) => ({
      ...current,
      parts: current.parts.map((part, partIndex) => partIndex === index ? { ...part, [key]: value } : part),
    }));
  };

  const addPart = (type) => {
    setForm((current) => ({
      ...current,
      parts: [...current.parts, { type, title: "", content: "", url: "", caption: "" }],
    }));
  };

  const removePart = (index) => {
    setForm((current) => ({ ...current, parts: current.parts.filter((_, partIndex) => partIndex !== index) }));
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
              "Valorant",
              "GTA V",
              "Roblox",
              "League of Legends",
              "FiveM",
              "Rust",
              "Discord Bots",
              "General",
            ].map((game) => <option key={game} value={game}>{game}</option>)}
          </select>
        </div>

        <textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="Resumen breve" className="min-h-[90px] w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent" />

        <MediaUploadField value={form.image} onChange={(image) => setForm({ ...form, image })} folder="guides" label="Miniatura de la guía" />

        <TagSelector
          selectedTags={form.tags}
          onChange={(newTags) => setForm({ ...form, tags: newTags })}
          label="Etiquetas y Categorías de la Guía"
        />

        <textarea value={form.links} onChange={(event) => setForm({ ...form, links: event.target.value })} placeholder={'Links relacionados\nEtiqueta | https://ejemplo.com'} className="min-h-[120px] w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent" />

        <section className="rounded-2xl border border-border bg-surface2 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text">Contenido amplio</h2>
              <p className="mt-1 text-xs text-muted">Crea tantos bloques como necesites: texto, comentarios, tierlists e imágenes.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["text", "＋ Texto"],
                ["image", "＋ Imagen"],
                ["quote", "＋ Comentario"],
              ].map(([type, label]) => (
                <button key={type} type="button" onClick={() => addPart(type)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:border-accent/50 hover:text-text">{label}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {form.parts.map((part, index) => (
              <div key={`${part.type}-${index}`} className="rounded-xl border border-border bg-surface p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{part.type === "image" ? "Imagen" : part.type === "quote" ? "Comentario destacado" : "Texto"} · bloque {index + 1}</span>
                  {form.parts.length > 1 && <button type="button" onClick={() => removePart(index)} className="text-xs text-red-400 hover:text-red-300">Quitar</button>}
                </div>
                <input value={part.title || ""} onChange={(event) => updatePart(index, "title", event.target.value)} placeholder={part.type === "quote" ? "Autor o contexto (opcional)" : "Título de sección (opcional)"} className="mb-2 w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm outline-none focus:border-accent" />
                {part.type === "image" ? (
                  <>
                    <MediaUploadField value={part.url} onChange={(url) => updatePart(index, "url", url)} folder="guides/content" label="Imagen del bloque" />
                    <input value={part.caption || ""} onChange={(event) => updatePart(index, "caption", event.target.value)} placeholder="Descripción de la imagen" className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm outline-none focus:border-accent" />
                  </>
                ) : (
                  <textarea value={part.content || ""} onChange={(event) => updatePart(index, "content", event.target.value)} placeholder={part.type === "quote" ? "Escribe tu comentario, consejo o advertencia..." : "Escribe todo lo necesario. Puedes usar varias líneas y párrafos..."} className="min-h-[130px] w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm leading-6 outline-none focus:border-accent" />
                )}
              </div>
            ))}
          </div>
        </section>

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
