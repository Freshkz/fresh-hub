import { useEffect, useState } from "react";
import ProjectCard from "../../components/projects/ProjectCard";
import { getProjects } from "../../services/projects";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold mb-8">Proyectos</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </div>
  );
}
