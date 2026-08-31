import InteractiveCard from "../ui/InteractiveCard";

export default function DownloadCard({ item }) {
  return (
    <InteractiveCard
      to={`/downloads/${item.id}`}
      title={item.name}
      description={`${item.size} — ${item.category}`}
      meta={`v${item.version}`}
      badge={item.featured ? "Latest" : undefined}
      tags={[item.format]} 
      gradientClass="from-accent/18 via-accent2/8 to-transparent"
    />
  );
}
