import Badge from "../ui/Badge";
import { Link } from "react-router-dom";

export default function DownloadCard({ item }) {
  return (
    <Link to={`/downloads/${item.id}`} className="block bg-surface border border-border rounded-2xl p-5 card-hover no-underline">
      <div className="h-28 rounded-lg mb-4 border border-border bg-gradient-to-br from-accent/15 to-accent2/10 flex items-center justify-center font-mono text-xs text-muted">
        v{item.version} · {item.format}
      </div>
      <h3 className="font-semibold text-sm mb-1.5 text-text">{item.name}</h3>
      <p className="text-sm text-muted mb-4">{item.size} — {item.category}</p>
      <div className="flex gap-2 flex-wrap">
        {item.featured && <Badge featured>Latest</Badge>}
      </div>
    </Link>
  );
}
