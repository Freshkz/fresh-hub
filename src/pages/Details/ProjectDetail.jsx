import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject } from "../../services/projects";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProject(id).then(setProject).catch((err) => setError(err.message || "No se pudo cargar el proyecto."));
  }, [id]);

  if (error) return <DetailMessage message={error} />;
  if (!project) return <DetailMessage message="Cargando proyecto..." />;

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/projects" className="text-xs text-muted hover:text-text">← Volver a proyectos</Link>
      <p className="font-mono text-xs text-accent uppercase tracking-wider mt-8 mb-2">{project.status}</p>
      <h1 className="font-display text-3xl font-bold mb-4">{project.name}</h1>
      <p className="text-muted leading-7 mb-8">{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {(project.technologies || []).map((technology) => (
          <span key={technology} className="px-3 py-1.5 rounded-lg bg-surface2 border border-border text-sm">{technology}</span>
        ))}
      </div>
    </article>
  );
}

function DetailMessage({ message }) {
  return <div className="max-w-3xl mx-auto px-6 py-16 text-muted">{message}</div>;
}
