import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchActivityLog } from "../../services/activityLog";

const actionMeta = {
  created: { icon: "➕", label: "creó", color: "#33E6B0" },
  updated: { icon: "✏️", label: "editó", color: "#F5B942" },
  deleted: { icon: "🗑️", label: "borró", color: "#F87171" },
};

const entityLabels = {
  guide: "guía",
  project: "proyecto",
  download: "descarga",
  news: "novedad",
  changelog: "versión del changelog",
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

export default function ActivityLogDropdown() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchActivityLog({ limit: 8 })
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted hover:border-accent/40 hover:text-text transition-colors"
      >
        🕒 <span className="hidden sm:inline">Actividad</span>
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-text">Actividad reciente</p>
            <p className="text-xs text-muted">Quién publicó qué, últimas 8 acciones</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && <p className="px-4 py-6 text-center text-xs text-muted">Cargando…</p>}
            {!loading && entries.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-muted">Todavía no hay actividad registrada.</p>
            )}
            {!loading && entries.map((entry) => {
              const meta = actionMeta[entry.action] || { icon: "•", label: entry.action, color: "#9CA3AF" };
              const entityLabel = entityLabels[entry.entity_type] || entry.entity_type;
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-2.5 border-b border-border/60 px-4 py-3 last:border-b-0"
                  style={{ borderLeft: `3px solid ${meta.color}` }}
                >
                  {entry.actor_avatar_url ? (
                    <img src={entry.actor_avatar_url} alt="" className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: entry.actor_color || meta.color }}
                    >
                      {(entry.actor_name || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-snug text-text">
                      <span className="font-medium">{entry.actor_name || "Alguien"}</span>{" "}
                      <span>{meta.icon} {meta.label}</span>{" "}
                      <span className="text-muted">{entityLabel}</span>
                      {entry.entity_title && <span className="text-muted"> — "{entry.entity_title}"</span>}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">{timeAgo(entry.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/admin/activity-log"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-2.5 text-center text-xs font-medium text-accent hover:text-accent2"
          >
            Ver historial completo →
          </Link>
        </div>
      )}
    </div>
  );
}
