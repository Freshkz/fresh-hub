import InteractiveCard from "../ui/InteractiveCard";

export default function AppCard({ app }) {
  return (
    <InteractiveCard
      to={app.link || "#"}
      title={app.name}
      description={app.description}
      meta={app.category || "App"}
      badge={app.badge || "New"}
      tags={app.tags || []}
      gradientClass={app.gradientClass || "from-accent/18 via-accent/6 to-transparent"}
      thumbnail={
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg shadow-[0_0_28px_rgba(124,92,255,0.2)]">
            {app.icon || "✦"}
          </div>
        </div>
      }
    />
  );
}
