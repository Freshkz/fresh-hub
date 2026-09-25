import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProjectCard from "../../components/projects/ProjectCard";
import { getProjects } from "../../services/projects";
import useSiteSettings from "../../hooks/useSiteSettings";
import { PROJECT_STATUSES, PROJECT_TYPES } from "../../constants/projectOptions";

export default function Projects() {
  const settings = useSiteSettings();
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  // El tipo va en la URL (?tipo=web) para poder compartir, por ejemplo, "mis sitios web".
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("tipo") || "all";
  const setType = (value) => setSearchParams(value === "all" ? {} : { tipo: value }, { replace: true });

  useEffect(() => {
    getProjects({ includePrivateTeasers: true }).then(setProjects).catch(() => {});
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesQuery = !normalizedQuery || [project.name, project.description, ...(project.technologies || [])]
        .join(" ").toLowerCase().includes(normalizedQuery);
      const projectType = project.project_type || "app";
      return matchesQuery
        && (status === "all" || project.status === status)
        && (type === "all" || projectType === type);
    });
  }, [projects, query, status, type]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold mb-4">Proyectos</h1>
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar proyectos..."
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        <select value={type} onChange={(event) => setType(event.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm">
          <option value="all">Todos los tipos</option>
          {PROJECT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.icon} {item.label}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm">
          <option value="all">Todos los estados</option>
          {PROJECT_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {filteredProjects.map((p) => <ProjectCard key={p.id} project={{ ...p, image: p.image || settings.default_project_thumbnail }} settings={settings} />)}
      </div>
      {filteredProjects.length === 0 && <p className="text-sm text-muted mt-6">No encontramos proyectos con esos filtros.</p>}
    </div>
  );
}
