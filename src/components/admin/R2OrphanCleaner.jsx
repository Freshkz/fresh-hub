import { useState } from "react";
import ConfirmModal from "../ui/ConfirmModal";
import { deleteFromR2, findR2Orphans } from "../../services/r2Upload";
import { formatBytes } from "../../utils/formatBytes";

// Panel del Admin para encontrar y borrar archivos de R2 que ninguna descarga
// ni guía usa (subidas canceladas, archivos reemplazados antes del fix, etc.).
export default function R2OrphanCleaner() {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | searching | deleting
  const [errorMsg, setErrorMsg] = useState("");
  const [confirming, setConfirming] = useState(false);

  const search = async () => {
    setStatus("searching");
    setErrorMsg("");
    try {
      setResult(await findR2Orphans());
    } catch (err) {
      setErrorMsg(err.message || "No se pudo buscar archivos huérfanos.");
    } finally {
      setStatus("idle");
    }
  };

  const deleteAll = async () => {
    setConfirming(false);
    setStatus("deleting");
    setErrorMsg("");
    const failed = [];
    for (const file of result.orphans) {
      try {
        await deleteFromR2(`/files/${file.key}`);
      } catch (err) {
        failed.push(`${file.key}: ${err.message}`);
      }
    }
    if (failed.length) setErrorMsg(`No se pudieron borrar ${failed.length} archivo(s): ${failed.join(" · ")}`);
    await search();
  };

  const orphans = result?.orphans || [];
  const busy = status !== "idle";

  return (
    <section className="mt-12 rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">🧹 Archivos huérfanos en R2</h2>
          <p className="text-xs text-muted">
            Archivos subidos que ninguna descarga ni guía usa. Los de las últimas 24 h no se cuentan.
          </p>
        </div>
        <button
          type="button"
          onClick={search}
          disabled={busy}
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:border-accent/50 hover:text-text disabled:opacity-60"
        >
          {status === "searching" ? "Buscando..." : result ? "Buscar de nuevo" : "Buscar"}
        </button>
      </div>

      {errorMsg && <p className="mt-3 text-xs text-red-400">{errorMsg}</p>}

      {result && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted">
            Revisados {result.scanned} archivo(s).{" "}
            {orphans.length === 0
              ? "No hay huérfanos 🎉"
              : `${orphans.length} huérfano(s), ${formatBytes(result.totalSize)} en total.`}
          </p>

          {orphans.length > 0 && (
            <>
              <ul className="max-h-60 space-y-1 overflow-y-auto">
                {orphans.map((file) => (
                  <li key={file.key} className="flex justify-between gap-3 rounded-lg bg-surface2 px-3 py-1.5 font-mono text-[11px]">
                    <span className="truncate">{file.key}</span>
                    <span className="shrink-0 text-muted">
                      {formatBytes(file.size)} · {new Date(file.uploaded).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={busy}
                className="rounded-lg bg-red-500/90 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {status === "deleting" ? "Borrando..." : `Borrar ${orphans.length} archivo(s)`}
              </button>
            </>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={confirming}
        title="¿Borrar los archivos huérfanos?"
        message={`Se van a borrar ${orphans.length} archivo(s) de Cloudflare R2 (${formatBytes(result?.totalSize)}). Esta acción no se puede deshacer.`}
        confirmLabel="Sí, borrar"
        onConfirm={deleteAll}
        onCancel={() => setConfirming(false)}
      />
    </section>
  );
}
