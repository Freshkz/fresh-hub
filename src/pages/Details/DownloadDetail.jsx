import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDownload, getMyRating, rateDownload } from "../../services/downloads";
import { getProjectByLinkedDownload } from "../../services/projects";
import StarRating from "../../components/ui/StarRating";

export default function DownloadDetail() {
  const { id } = useParams();
  const [download, setDownload] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [rateError, setRateError] = useState("");
  const [linkedProject, setLinkedProject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDownload(id).then(setDownload).catch((err) => setError(err.message || "No se pudo cargar la descarga."));
    getProjectByLinkedDownload(id).then(setLinkedProject).catch(() => {});
    getMyRating(id).then(setMyScore).catch(() => {});
  }, [id]);

  const handleRate = async (score) => {
    if (!download) return;
    setRateError("");
    try {
      setDownload(await rateDownload(download.id, score));
      setMyScore(score);
    } catch (err) {
      console.warn("No se pudo guardar la calificación:", err.message);
      setRateError("No se pudo guardar tu voto. Probá de nuevo.");
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
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border text-xs font-medium"
            style={download.author_color ? { borderColor: `${download.author_color}55`, color: download.author_color } : { borderColor: undefined }}
          >
            {download.author_avatar_url ? (
              <img src={download.author_avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <span>{download.author_role === "admin" ? "👑" : "👤"}</span>
            )}
            Creado por {download.author_name || (download.author_role === "admin" ? "Admin" : "Colaborador")}
          </span>
        )}
      </div>

      <div className="mb-6">
        <StarRating
          ratingSum={download.rating_sum}
          ratingCount={download.rating_count}
          userScore={myScore}
          onRate={handleRate}
          interactive={true}
        />
        {rateError && <p className="mt-1 text-xs text-red-400">{rateError}</p>}
      </div>

      <p className="text-muted leading-7 mb-6">{download.description || "Sin descripción."}</p>
      <div className="grid grid-cols-2 gap-3 text-sm mb-8">
        <div className="bg-surface border border-border rounded-xl p-4">Versión: {download.version || "—"}</div>
        <div className="bg-surface border border-border rounded-xl p-4">Formato: {download.format || "—"}</div>
        <div className="bg-surface border border-border rounded-xl p-4">Tamaño: {download.size || "—"}</div>
        <div className="bg-surface border border-border rounded-xl p-4">Categoría: {download.category || "—"}</div>
      </div>
      <div className="flex flex-wrap gap-3">
        {download.download_url ? (
          <a href={download.download_url} target="_blank" rel="noreferrer" className="inline-block bg-accent text-white font-semibold px-5 py-3 rounded-xl">
            Descargar archivo
          </a>
        ) : <p className="text-muted">Esta descarga todavía no tiene archivo.</p>}

        {linkedProject && (
          <Link
            to={`/projects/${linkedProject.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 font-semibold text-text hover:border-accent/50 transition"
          >
            🧩 Ver proyecto
          </Link>
        )}
      </div>
    </article>
  );
}
