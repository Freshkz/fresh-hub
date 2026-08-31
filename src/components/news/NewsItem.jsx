const ICONS = { release: "🚀", project: "✨", update: "🔄" };
import { Link } from "react-router-dom";

export default function NewsItem({ item }) {
  return (
    <Link to={`/news/${item.id}`} className="flex gap-3.5 py-4 border-b border-border last:border-b-0 hover:bg-surface2/40">
      <div className="w-8 h-8 shrink-0 rounded-lg bg-surface2 border border-border flex items-center justify-center text-sm">
        {ICONS[item.type] || "•"}
      </div>
      <div>
        <h4 className="text-sm font-medium mb-0.5">{item.title}</h4>
        <span className="font-mono text-xs text-muted">
          {new Date(item.date).toLocaleDateString("es-AR")} · {item.type}
        </span>
      </div>
    </Link>
  );
}
