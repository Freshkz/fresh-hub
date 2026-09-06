import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import PrivateLock from "../ui/PrivateLock";

export default function GuideCard({ guide, settings = {} }) {
  const reduceMotion = useReducedMotion();

  const card = (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.01 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="group overflow-hidden rounded-[26px] border border-border bg-surface"
    >
      <Link to={`/guides/${guide.slug}`} className="block h-full no-underline">
        <div className="relative h-36 overflow-hidden border-b border-border">
          <img src={guide.image} alt={guide.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-background/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white">
            {(guide.tags && guide.tags[0]) || "General"}
          </span>
          {guide.categories?.[0] && (
            <span className="absolute right-3 bottom-3 rounded-full border border-accent2/40 bg-background/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent2">
              {guide.categories[0]}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="mb-2 text-base font-semibold text-text">{guide.title}</h3>
          {guide.author_role && (
            <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted">
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface2 border font-medium"
                style={guide.author_color ? { borderColor: `${guide.author_color}55`, color: guide.author_color } : undefined}
              >
                {guide.author_avatar_url ? (
                  <img src={guide.author_avatar_url} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                ) : (
                  <span>{guide.author_role === "admin" ? "👑" : "👤"}</span>
                )}
                {guide.author_name || (guide.author_role === "admin" ? "Admin" : "Colaborador")}
              </span>
            </div>
          )}
          <p className="mb-4 text-sm leading-6 text-muted">{guide.summary}</p>
          <div className="flex flex-wrap gap-2">
            {(guide.tags || []).slice(1, 4).map((tag) => (
              <span key={tag} className="rounded-full border border-border bg-surface2 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.article>
  );

  return (
    <PrivateLock isPrivate={guide.is_private} lockIcon={settings.private_lock_guides}>
      {card}
    </PrivateLock>
  );
}
