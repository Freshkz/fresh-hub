import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNewsItem } from "../../services/news";

export default function NewsDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getNewsItem(id).then(setItem).catch((err) => setError(err.message || "No se pudo cargar la novedad."));
  }, [id]);

  if (error) return <p className="max-w-3xl mx-auto px-6 py-16 text-red-400">{error}</p>;
  if (!item) return <p className="max-w-3xl mx-auto px-6 py-16 text-muted">Cargando novedad...</p>;

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/news" className="text-xs text-muted hover:text-text">← Volver a novedades</Link>
      <p className="font-mono text-xs text-accent uppercase tracking-wider mt-8 mb-2">{item.type}</p>
      <h1 className="font-display text-3xl font-bold mb-3">{item.title}</h1>
      <p className="font-mono text-xs text-muted mb-8">{new Date(item.date).toLocaleDateString("es-AR")}</p>
      <p className="text-muted leading-7 whitespace-pre-wrap">{item.description || "Sin descripción."}</p>
    </article>
  );
}
