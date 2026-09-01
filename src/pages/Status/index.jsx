import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSystemStatus } from "../../services/systemStatus";

const STATUS_META = {
  online: { label: "Online", color: "text-emerald-300", dot: "bg-emerald-400", badge: "bg-emerald-400/10 border-emerald-400/20" },
  degraded: { label: "Degraded", color: "text-amber-300", dot: "bg-amber-400", badge: "bg-amber-400/10 border-amber-400/20" },
  offline: { label: "Offline", color: "text-red-300", dot: "bg-red-400", badge: "bg-red-400/10 border-red-400/20" },
  pending: { label: "Pending", color: "text-muted", dot: "bg-muted", badge: "bg-surface2 border-border" },
};

function formatCheckedAt(value) {
  if (!value) return "Todavía no comprobado";
  return new Date(value).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" });
}

export default function StatusPage() {
  const [result, setResult] = useState({ services: [], checkedAt: null });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setResult(await getSystemStatus());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const onlineCount = result.services.filter((service) => service.status === "online").length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 font-mono text-xs uppercase tracking-[0.18em] text-accent">System status</div>
          <h1 className="font-display text-3xl font-semibold">Todo el ecosistema, de un vistazo</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Comprobamos los servicios configurados para que sepas si todo está funcionando correctamente.</p>
        </div>
        <Link to="/" className="text-sm text-muted hover:text-text">← Inicio</Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
        <div>
          <p className="text-sm font-medium text-text">{onlineCount} de {result.services.length || 0} servicios online</p>
          <p className="mt-1 text-xs text-muted">Última comprobación: {formatCheckedAt(result.checkedAt)}</p>
        </div>
        <button type="button" onClick={refresh} disabled={loading} className="rounded-xl border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-text disabled:opacity-50">
          {loading ? "Comprobando..." : "Actualizar estado"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {result.services.map((service) => {
          const meta = STATUS_META[service.status] || STATUS_META.pending;
          return (
            <article key={service.id} className="rounded-[26px] border border-border bg-surface p-5 transition-transform hover:-translate-y-1">
              <div className="mb-8 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface2 text-lg">◉</span>
                <span className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${meta.badge} ${meta.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
              </div>
              <h2 className="font-display text-lg font-semibold text-text">{service.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{service.description}</p>
              <p className={`mt-5 text-xs ${meta.color}`}>{service.detail}</p>
            </article>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted">El estado de los servicios externos depende de que su URL esté configurada en las variables del proyecto.</p>
    </div>
  );
}
