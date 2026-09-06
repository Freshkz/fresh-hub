import InteractiveCard from "../ui/InteractiveCard";
import PrivateLock from "../ui/PrivateLock";

export default function ProjectCard({ project, settings = {} }) {
  const thumbnail = project.image ? (
    <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
  ) : (
    <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{project.name}</span>
  );

  const authorObj = project.author_role
    ? { role: project.author_role, email: project.author_email, name: project.author_name, color: project.author_color, avatarUrl: project.author_avatar_url }
    : null;

  return (
    <PrivateLock isPrivate={project.is_private} lockIcon={settings.private_lock_projects}>
      <InteractiveCard
        to={`/projects/${project.id}`}
        title={project.name}
        description={project.description}
        meta={project.category || "Project"}
        badge={project.featured ? "Featured" : undefined}
        author={authorObj}
        tags={(project.technologies || []).slice(0, 2)}
        gradientClass="from-accent/18 via-accent2/10 to-transparent"
        thumbnail={thumbnail}
      />
    </PrivateLock>
  );
}
