import InteractiveCard from "../ui/InteractiveCard";

export default function DownloadCard({ item }) {
  const thumbnail = item.image ? (
    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
  ) : (
    <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/75">v{item.version}</span>
  );

  return (
    <InteractiveCard
      to={`/downloads/${item.id}`}
      title={item.name}
      description={`${item.size} — ${item.category}`}
      meta={`v${item.version}`}
      badge={item.featured ? "Latest" : undefined}
      tags={[item.format]}
      gradientClass="from-accent/18 via-accent2/8 to-transparent"
      thumbnail={thumbnail}
    />
  );
}
