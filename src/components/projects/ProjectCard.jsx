import InteractiveCard from "../ui/InteractiveCard";

export default function ProjectCard({ project }) {
  return (
    <InteractiveCard
      to={`/projects/${project.id}`}
      title={project.name}
      description={project.description}
      meta={project.category || "Project"}
      badge={project.featured ? "Featured" : undefined}
      tags={(project.technologies || []).slice(0, 2)}
      gradientClass="from-accent/18 via-accent2/10 to-transparent"
    />
  );
}
