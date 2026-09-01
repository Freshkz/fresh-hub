import InteractiveCard from "../ui/InteractiveCard";

export default function ProjectCard({ project }) {
  const thumbnail = project.image ? (
    <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
  ) : (
    <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{project.name}</span>
  );

  return (
    <InteractiveCard
      to={`/projects/${project.id}`}
      title={project.name}
      description={project.description}
      meta={project.category || "Project"}
      badge={project.featured ? "Featured" : undefined}
      tags={(project.technologies || []).slice(0, 2)}
      gradientClass="from-accent/18 via-accent2/10 to-transparent"
      thumbnail={thumbnail}
    />
  );
}
