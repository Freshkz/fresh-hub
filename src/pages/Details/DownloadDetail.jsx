import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDownload, rateDownload } from "../../services/downloads";
import StarRating from "../../components/ui/StarRating";

export default function DownloadDetail() {
  const { id } = useParams();
  const [download, setDownload] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDownload(id).then(setDownload).catch((err) => setError(err.message || "No se pudo cargar la descarga."));
  }, [id]);

  const handleRate = async (score) => {
    if (!download) return;
    try {
      const updated = await rateDownload(download.id, score, download.rating_sum, download.rating_count);
      setDownload(updated);
    } catch (err) {
      console.warn("No se pudo guardar la calificación:", err.message);
    }
  };

  if (error) return <p className="max-w-3xl mx-auto px-6 py-16 text-red-400">{error}</p>;
  if (!download) return <p className="max-w-3xl mx-auto px-6 py-16 text-muted">Cargando descarga...</p>;

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/downloads" className="text-xs text-muted hover:text-text">← Volver a descargas</Link>
      <div className="flex items-start justify-between gap-4 mt-6 mb-3">
        <h1 className="font-display text-3xl font-bold">{download.name}</h1>
        {download.author_role && (
          <span className="px-3 py-1 rounded-full bg-surface border border-border text-xs text-muted">
            {download.author_role === "admin" ? "👑 Creado por Admin" : "👤 Creado por Colaborador"}
          </span>
        )}
      </div>

      <div className="mb-6">
        <StarRating
          ratingSum={download.rating_sum}
          ratingCount={download.rating_count}
          onRate={handleRate}
          interactive={true}
        />
      </div>

      <p className="text-muted leading-7 mb-6">{download.description || "Sin descripción."}</p>
      <div className="grid grid-cols-2 gap-3 text-sm mb-8">
        <div className="bg-surface border border-border rounded-xl p-4">Versión: {download.version || "—"}</div>
        <div className="bg-surface border border-border rounded-xl p-4">Formato: {download.format || "—"}</div>
        <div className="bg-surface border border-border rounded-xl p-4">Tamaño: {download.size || "—"}</div>
        <div className="bg-surface border border-border rounded-xl p-4">Categoría: {download.category || "—"}</div>
      </div>
      {download.download_url ? (
        <a href={download.download_url} target="_blank" rel="noreferrer" className="inline-block bg-accent text-white font-semibold px-5 py-3 rounded-xl">
          Descargar archivo
        </a>
      ) : <p className="text-muted">Esta descarga todavía no tiene archivo.</p>}
    </article>
  );
}
