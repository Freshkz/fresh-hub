import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const ICONS = { release: "🚀", project: "✨", update: "🔄" };

export default function NewsItem({ item }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="border-b border-border last:border-b-0"
    >
      <Link to={`/news/${item.id}`} className="group flex gap-3.5 rounded-2xl p-3.5 transition-colors hover:bg-surface2/60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface2 text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          {ICONS[item.type] || "•"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-3">
            <h4 className="truncate text-sm font-medium text-text">{item.title}</h4>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{item.type}</span>
          </div>
          <span className="font-mono text-[11px] text-muted">
            {new Date(item.date).toLocaleDateString("es-AR")}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
