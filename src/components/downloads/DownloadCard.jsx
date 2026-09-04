import InteractiveCard from "../ui/InteractiveCard";
import StarRating from "../ui/StarRating";

export default function DownloadCard({ item }) {
  const thumbnail = item.image ? (
    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
  ) : (
    <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/75">v{item.version}</span>
  );

  const authorObj = item.author_role ? { role: item.author_role, email: item.author_email } : null;

  return (
    <div className="flex flex-col h-full">
      <InteractiveCard
        to={`/downloads/${item.id}`}
        title={item.name}
        description={`${item.size} — ${item.category}`}
        meta={`v${item.version}`}
        badge={item.featured ? "Latest" : undefined}
        author={authorObj}
        tags={[item.format]}
        gradientClass="from-accent/18 via-accent2/8 to-transparent"
        thumbnail={thumbnail}
      />
      <div className="-mt-3 mb-2 px-5 z-10">
        <StarRating ratingSum={item.rating_sum} ratingCount={item.rating_count} interactive={false} />
      </div>
    </div>
  );
}
