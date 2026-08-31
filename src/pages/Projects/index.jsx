import { useEffect, useState } from "react";
import { useMemo } from "react";
import ProjectCard from "../../components/projects/ProjectCard";
import { getProjects } from "../../services/projects";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {});
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesQuery = !normalizedQuery || [project.name, project.description, ...(project.technologies || [])]
        .join(" ").toLowerCase().includes(normalizedQuery);
      return matchesQuery && (status === "all" || project.status === status);
    });
  }, [projects, query, status]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold mb-4">Proyectos</h1>
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar proyectos..."
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        <select value={status} onChange={(event) => setStatus(event.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm">
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="in-development">En desarrollo</option>
          <option value="experimental">Experimentales</option>
          <option value="archived">Archivados</option>
        </select>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {filteredProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
      {filteredProjects.length === 0 && <p className="text-sm text-muted mt-6">No encontramos proyectos con esos filtros.</p>}
    </div>
  );
}
