import Badge from "../ui/Badge";

export default function ProjectCard({ project }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 card-hover">
      <div className="h-28 rounded-lg mb-4 border border-border bg-gradient-to-br from-accent/15 to-accent2/10 flex items-center justify-center font-mono text-xs text-muted uppercase">
        {project.name}
      </div>
      <h3 className="font-semibold text-sm mb-1.5">{project.name}</h3>
      <p className="text-sm text-muted mb-4">{project.description}</p>
      <div className="flex gap-2 flex-wrap">
        {project.featured && <Badge featured>Featured</Badge>}
        {project.technologies.slice(0, 2).map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
    </div>
  );
}
