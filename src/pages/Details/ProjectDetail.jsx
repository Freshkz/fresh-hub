import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject } from "../../services/projects";
import { projectStatusLabel, projectTypeMeta } from "../../constants/projectOptions";
import { isSafeExternalUrl } from "../../utils/urls";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProject(id).then(setProject).catch((err) => setError(err.message || "No se pudo cargar el proyecto."));
  }, [id]);

  if (error) return <DetailMessage message={error} />;
  if (!project) return <DetailMessage message="Cargando proyecto..." />;

  // Si el proyecto es privado y no tenés acceso, la base no lo devuelve (getProject tira error).
  const type = projectTypeMeta(project.project_type);
  const websiteUrl = isSafeExternalUrl(project.website_url) ? project.website_url : "";

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/projects" className="text-xs text-muted hover:text-text">← Volver a proyectos</Link>
      <p className="font-mono text-xs text-accent uppercase tracking-wider mt-8 mb-2">
        {type.icon} {type.label} · {projectStatusLabel(project.status)}
      </p>
      <h1 className="font-display text-3xl font-bold mb-4">{project.name}</h1>
      <p className="text-muted leading-7 mb-8">{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {(project.technologies || []).map((technology) => (
          <span key={technology} className="px-3 py-1.5 rounded-lg bg-surface2 border border-border text-sm">{technology}</span>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white hover:brightness-110 transition"
          >
            🌐 Visitar sitio
          </a>
        )}
        {project.linked_download_id && (
          <Link
            to={`/downloads/${project.linked_download_id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 font-semibold text-text hover:border-accent/50 transition"
          >
            📥 Descargar este proyecto
          </Link>
        )}
      </div>
    </article>
  );
}

function DetailMessage({ message }) {
  return <div className="max-w-3xl mx-auto px-6 py-16 text-muted">{message}</div>;
}
