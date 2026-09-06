import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchActivityLog, deleteActivityLogEntry, deleteActivityLogEntries } from "../../services/activityLog";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ui/ConfirmModal";

const actionMeta = {
  created: { icon: "➕", label: "creó", color: "#33E6B0" },
  updated: { icon: "✏️", label: "editó", color: "#F5B942" },
  deleted: { icon: "🗑️", label: "borró", color: "#F87171" },
};

const entityLabels = {
  guide: "una guía",
  project: "un proyecto",
  download: "una descarga",
  news: "una novedad",
  changelog: "una versión del changelog",
};

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  return new Date(dateString).toLocaleDateString("es-AR");
}

function groupByDay(entries) {
  const groups = [];
  let lastKey = null;
  for (const entry of entries) {
    const d = new Date(entry.created_at);
    const key = d.toDateString();
    let label;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (key === today) label = "Hoy";
    else if (key === yesterday) label = "Ayer";
    else label = d.toLocaleDateString("es-AR", { day: "numeric", month: "long" });

    if (key !== lastKey) {
      groups.push({ label, entries: [] });
      lastKey = key;
    }
    groups[groups.length - 1].entries.push(entry);
  }
  return groups;
}

export default function ActivityLogAdmin() {
  const { isAdmin } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [pendingDelete, setPendingDelete] = useState(null); // { mode: "one" | "selected" | "all", id? }

  const load = () => {
    setLoading(true);
    fetchActivityLog()
      .then(setEntries)
      .catch((err) => setErrorMsg(err.message || "No se pudo cargar el log"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const groups = groupByDay(entries);

  const toggleSelected = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setErrorMsg("");
    try {
      if (pendingDelete.mode === "one") {
        await deleteActivityLogEntry(pendingDelete.id);
      } else if (pendingDelete.mode === "selected") {
        await deleteActivityLogEntries(Array.from(selected));
        setSelected(new Set());
      } else if (pendingDelete.mode === "all") {
        await deleteActivityLogEntries(entries.map((e) => e.id));
        setSelected(new Set());
      }
      setPendingDelete(null);
      load();
    } catch (err) {
      setPendingDelete(null);
      setErrorMsg(err.message || "No se pudo borrar del log");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/admin/dashboard" className="text-xs text-muted hover:text-text">← Volver al panel</Link>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-semibold text-text">🕒 Log de actividad</h1>
          <p className="mt-1 text-sm text-muted">Quién hizo qué, y cuándo, en Guías, Proyectos, Descargas y Novedades.</p>
        </div>
        {entries.length > 0 && isAdmin && (
          <div className="flex shrink-0 items-center gap-2">
            {selected.size > 0 && (
              <button
                onClick={() => setPendingDelete({ mode: "selected" })}
                className="rounded-lg border border-red-400/30 bg-red-400/10 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-400/20"
              >
                Borrar seleccionados ({selected.size})
              </button>
            )}
            <button
              onClick={() => setPendingDelete({ mode: "all" })}
              className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-text"
            >
              Vaciar log
            </button>
          </div>
        )}
      </div>

      {loading && <p className="mt-6 text-sm text-muted">Cargando…</p>}
      {errorMsg && (
        <p className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">{errorMsg}</p>
      )}

      {!loading && !errorMsg && (
        <div className="mt-6 space-y-6">
          {entries.length === 0 && <p className="text-sm text-muted">Todavía no hay actividad registrada.</p>}
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{group.label}</p>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                {group.entries.map((entry, i) => {
                  const meta = actionMeta[entry.action] || { icon: "•", label: entry.action, color: "#9CA3AF" };
                  const entityLabel = entityLabels[entry.entity_type] || entry.entity_type;
                  return (
                    <div
                      key={entry.id}
                      className={`group flex items-start gap-3 px-4 py-3 ${i !== group.entries.length - 1 ? "border-b border-border/60" : ""}`}
                      style={{ borderLeft: `3px solid ${meta.color}` }}
                    >
                      {isAdmin && (
                        <input
                          type="checkbox"
                          checked={selected.has(entry.id)}
                          onChange={() => toggleSelected(entry.id)}
                          className="mt-1.5 h-3.5 w-3.5 shrink-0 accent-accent"
                        />
                      )}
                      {entry.actor_avatar_url ? (
                        <img src={entry.actor_avatar_url} alt="" className="mt-0.5 h-7 w-7 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: entry.actor_color || meta.color }}
                        >
                          {(entry.actor_name || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-text">
                          <span className="font-medium">{entry.actor_name || "Alguien"}</span>{" "}
                          <span>{meta.icon} {meta.label}</span>{" "}
                          <span className="text-muted">{entityLabel}</span>
                          {entry.entity_title && <span> — "{entry.entity_title}"</span>}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">{timeAgo(entry.created_at)}</p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => setPendingDelete({ mode: "one", id: entry.id })}
                          title="Borrar esta entrada"
                          className="shrink-0 rounded-lg px-1.5 py-1 text-xs text-muted opacity-0 hover:text-red-300 group-hover:opacity-100"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title={
          pendingDelete?.mode === "all"
            ? "¿Vaciar todo el log?"
            : pendingDelete?.mode === "selected"
              ? `¿Borrar ${selected.size} entradas del log?`
              : "¿Borrar esta entrada del log?"
        }
        message="Esta acción no se puede deshacer. Los archivos y registros reales (guías, proyectos, descargas, novedades) no se ven afectados — solo se borra el historial de actividad."
        confirmLabel="Borrar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
