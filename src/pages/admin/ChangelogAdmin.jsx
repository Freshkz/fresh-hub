import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchChangelogEntries,
  fetchLatestChangelogEntry,
  createChangelogEntry,
  updateChangelogEntry,
  deleteChangelogEntry,
} from "../../services/changelog";
import { fetchAndCategorizeCommits } from "../../services/githubChangelog";
import { useAuth } from "../../hooks/useAuth";
import { logActivity } from "../../services/activityLog";
import ConfirmModal from "../../components/ui/ConfirmModal";

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyForm = { version: "", date: todayIso(), title: "", summary: "", added: "", fixed: "", changed: "" };

// added/fixed/changed en la tabla son arrays; acá adentro del form los editamos
// como texto plano (un bullet por línea) porque es mucho más rápido de tipear/editar.
const linesToArray = (text) => text.split("\n").map((l) => l.trim()).filter(Boolean);
const arrayToLines = (arr) => (arr || []).join("\n");

export default function ChangelogAdmin() {
  const { userEmail, displayName, authorAvatarUrl, authorColor } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [fetchingCommits, setFetchingCommits] = useState(false);
  const [commitInfo, setCommitInfo] = useState(null); // { totalCommits, latestSha, raw }
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      setEntries(await fetchChangelogEntries());
    } catch (err) {
      setErrorMsg(err.message || "Error cargando el changelog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCommitInfo(null);
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setCommitInfo(null);
    setForm({
      version: entry.version,
      date: entry.date,
      title: entry.title,
      summary: entry.summary,
      added: arrayToLines(entry.added),
      fixed: arrayToLines(entry.fixed),
      changed: arrayToLines(entry.changed),
    });
  };

  // Trae los commits nuevos desde GitHub (desde la última versión guardada) y
  // pre-llena los 3 textareas. Nunca guarda solo — el admin revisa y edita antes
  // de tocar "Guardar versión".
  const handleFetchCommits = async () => {
    setFetchingCommits(true);
    setErrorMsg("");
    setOkMsg("");
    try {
      const latest = await fetchLatestChangelogEntry();
      const since = latest ? { sinceSha: latest.lastCommitSha, sinceIso: !latest.lastCommitSha ? `${latest.date}T00:00:00Z` : undefined } : {};
      const result = await fetchAndCategorizeCommits(since);
      setCommitInfo(result);

      if (result.totalCommits === 0) {
        setOkMsg("No hay commits nuevos desde la última versión guardada.");
      } else {
        setForm((prev) => ({
          ...prev,
          added: [prev.added, ...result.grouped.added].filter(Boolean).join("\n"),
          fixed: [prev.fixed, ...result.grouped.fixed].filter(Boolean).join("\n"),
          changed: [prev.changed, ...result.grouped.changed].filter(Boolean).join("\n"),
        }));
        setOkMsg(`Se trajeron ${result.totalCommits} commits nuevos y se clasificaron abajo — revisalos antes de guardar.`);
      }
    } catch (err) {
      setErrorMsg(err.message || "No se pudo traer los commits de GitHub");
    } finally {
      setFetchingCommits(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setOkMsg("");
    setSaving(true);
    const payload = {
      version: form.version.trim(),
      date: form.date,
      title: form.title.trim(),
      summary: form.summary.trim(),
      added: linesToArray(form.added),
      fixed: linesToArray(form.fixed),
      changed: linesToArray(form.changed),
    };
    try {
      if (editingId) {
        await updateChangelogEntry(editingId, payload);
        logActivity({ actorEmail: userEmail, actorName: displayName, actorAvatarUrl: authorAvatarUrl, actorColor: authorColor, action: "updated", entityType: "changelog", entityId: editingId, entityTitle: payload.version });
      } else {
        await createChangelogEntry({
          ...payload,
          source: commitInfo ? "github" : "manual",
          lastCommitSha: commitInfo?.latestSha || null,
        });
        logActivity({ actorEmail: userEmail, actorName: displayName, actorAvatarUrl: authorAvatarUrl, actorColor: authorColor, action: "created", entityType: "changelog", entityTitle: payload.version });
      }
      resetForm();
      load();
    } catch (err) {
      setErrorMsg(err.message || "Error guardando la versión");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteChangelogEntry(pendingDelete.id);
      setPendingDelete(null);
      if (editingId === pendingDelete.id) resetForm();
      load();
    } catch (err) {
      setPendingDelete(null);
      setErrorMsg(err.message || "No se pudo borrar la versión");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/admin/dashboard" className="text-xs text-muted hover:text-text">← Volver al panel</Link>
      <h1 className="mt-2 font-display text-xl font-semibold text-text">📝 Changelog</h1>
      <p className="mt-1 text-sm text-muted">
        Escribí versiones a mano, o traé los commits nuevos de GitHub y usalos como punto de partida.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-border bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-text">{editingId ? "Editando versión" : "Nueva versión"}</p>
          <button
            type="button"
            onClick={handleFetchCommits}
            disabled={fetchingCommits}
            className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 disabled:opacity-50"
          >
            {fetchingCommits ? "Trayendo commits…" : "🔄 Traer commits nuevos de GitHub"}
          </button>
        </div>

        {commitInfo && commitInfo.raw.length > 0 && (
          <details className="rounded-xl border border-border/60 bg-surface2 px-3 py-2 text-xs text-muted">
            <summary className="cursor-pointer select-none text-text">
              {commitInfo.raw.length} commits usados como base (clic para ver el detalle)
            </summary>
            <ul className="mt-2 space-y-1">
              {commitInfo.raw.map((c) => (
                <li key={c.sha}>
                  <span className="font-mono text-[10px] text-muted/70">{c.sha.slice(0, 7)}</span>{" "}
                  <span className="uppercase text-[10px] text-accent2">{c.category}</span>{" "}
                  {c.text}
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Versión</label>
            <input
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              placeholder="v1.7.0"
              required
              className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Fecha</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">Título</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título corto de la versión"
            required
            className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">Resumen</label>
          <textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            rows={2}
            placeholder="1-2 líneas explicando qué trae esta versión"
            className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-mono uppercase tracking-wide text-accent">Added (uno por línea)</label>
            <textarea
              value={form.added}
              onChange={(e) => setForm({ ...form, added: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-xs text-text"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-mono uppercase tracking-wide text-red-300">Fixed (uno por línea)</label>
            <textarea
              value={form.fixed}
              onChange={(e) => setForm({ ...form, fixed: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-xs text-text"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-mono uppercase tracking-wide text-accent2">Changed (uno por línea)</label>
            <textarea
              value={form.changed}
              onChange={(e) => setForm({ ...form, changed: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-xs text-text"
            />
          </div>
        </div>

        {errorMsg && <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">{errorMsg}</p>}
        {okMsg && <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">{okMsg}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Guardar versión"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-text">
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className="mt-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Versiones publicadas</p>
        {loading && <p className="text-sm text-muted">Cargando…</p>}
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id || entry.version} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text">
                  {entry.version} <span className="font-normal text-muted">— {entry.title}</span>
                </p>
                <p className="text-xs text-muted">{entry.date} {entry.source === "github" && "· asistido por GitHub"}</p>
              </div>
              {entry.id && (
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => startEdit(entry)} className="text-xs text-muted hover:text-text">Editar</button>
                  <button onClick={() => setPendingDelete(entry)} className="text-xs text-muted hover:text-red-300">Borrar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title={`¿Borrar la versión ${pendingDelete?.version}?`}
        message="Esto la saca de la página pública de Changelog. No se puede deshacer."
        confirmLabel="Borrar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
