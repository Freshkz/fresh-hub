import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import Badge from "./Badge";

export default function InteractiveCard({
  to,
  title,
  description,
  meta,
  tags = [],
  badge,
  author,
  className = "",
  gradientClass = "from-accent/18 via-accent/8 to-transparent",
  thumbnail,
  children,
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.012 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={className}
    >
      <Link to={to} className="block h-full no-underline">
        <article className="interactive-card group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-border bg-surface/80 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] md:p-5">
          <div className={`relative mb-4 h-28 overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br ${gradientClass}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_35%)]" />
            <div className="absolute inset-x-3 top-3 flex items-center justify-between z-10">
              {badge ? <Badge featured>{badge}</Badge> : <span className="h-2 w-2 rounded-full bg-accent2 shadow-[0_0_16px_rgba(51,230,176,0.9)]" />}
              {meta ? <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/75">{meta}</span> : null}
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              {thumbnail || (
                <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                  {title || "FreshKZ"}
                </span>
              )}
            </div>
          </div>

          {children || (
            <>
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-base font-semibold text-text">{title}</h3>
              </div>
              {author && (
                <div className="mb-2.5 flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="px-2 py-0.5 rounded-full bg-surface2 border border-border font-medium text-text/80">
                    {author.role === "admin" ? "👑 Admin" : author.role === "editor" ? "👤 Colaborador" : `👤 ${author.name || "Usuario"}`}
                  </span>
                </div>
              )}
              {description ? <p className="mb-4 line-clamp-3 text-sm leading-6 text-muted">{description}</p> : null}
              {tags.length > 0 ? (
                <div className="mt-auto flex flex-wrap gap-2">
                  {tags.slice(0, 3).map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </article>
      </Link>
    </motion.div>
  );
}
