import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import SocialGrid from "../social/SocialGrid";
import { useAuth } from "../../hooks/useAuth";
const STATUS_META = {
  online: { label: "Online", dot: "bg-emerald-400", text: "text-emerald-300" },
  degraded: { label: "Degraded", dot: "bg-amber-400", text: "text-amber-300" },
  offline: { label: "Offline", dot: "bg-red-400", text: "text-red-300" },
  pending: { label: "Pending", dot: "bg-muted", text: "text-muted" },
};

export default function Hero({ settings = {}, stats = {}, systemServices = [], onOpenPrivateApp }) {
  const { isAdmin } = useAuth();
  const siteName = settings.site_name || "FreshKZ";
  const tagline = settings.site_tagline || "Todo lo que hago, en un solo lugar";
  const parts = tagline.split(",");
  const firstLine = (parts[0] || tagline).trim();
  const secondLine = (parts[1] || siteName).trim();
  const reduceMotion = useReducedMotion();

  const animatedProps = reduceMotion
    ? { initial: false, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: 24, filter: "blur(10px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      };

  const fallbackServices = [
    { id: "fresh-hub", name: "Fresh Hub", status: "online", detail: "Comprobando...", href: "/", thumbnail: settings.ecosystem_fresh_thumbnail || "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=700&q=80" },
    { id: "cupons", name: "Cupons", status: "pending", detail: "App Privada 🔒", href: "#", thumbnail: settings.ecosystem_cupons_thumbnail || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=80", isPrivate: true },
    { id: "ai-stylist", name: "AI Stylist", status: "pending", detail: "App Privada 🔒", href: "#", thumbnail: settings.ecosystem_ai_stylist_thumbnail || "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80", isPrivate: true },
  ];

  return (
    <section className="relative overflow-hidden pt-24 pb-16 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }}
          transition={reduceMotion ? { duration: 0.1 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
        />
        <motion.div
          animate={reduceMotion ? { opacity: 0.5 } : { opacity: [0.35, 0.65, 0.35], x: [0, 18, 0] }}
          transition={reduceMotion ? { duration: 0.1 } : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-10 top-20 h-40 w-40 rounded-full bg-accent2/15 blur-3xl"
        />
      </div>

      <motion.div
        {...animatedProps}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.42, ease: "easeOut" }}
        className="mb-7 inline-flex items-center gap-2 rounded-full border border-accent2/30 bg-accent2/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent2"
      >
        <span className="h-2 w-2 rounded-full bg-accent2 shadow-[0_0_18px_rgba(51,230,176,0.9)]" />
        hub online — 3 proyectos activos
      </motion.div>

      <motion.h1
        {...animatedProps}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.48, delay: 0.08, ease: "easeOut" }}
        className="mb-4 font-display text-4xl font-bold md:text-6xl"
      >
        {firstLine}
        <br />
        <span className="text-accent">{secondLine}</span>
      </motion.h1>

      <motion.p
        {...animatedProps}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.16, ease: "easeOut" }}
        className="mx-auto mb-8 max-w-xl text-sm text-muted md:text-base"
      >
        {settings.meta_description || `Proyectos, descargas y novedades de ${siteName}. Actualizado seguido, sin vueltas.`}
      </motion.p>

      <motion.div
        {...animatedProps}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.52, delay: 0.22, ease: "easeOut" }}
        className="mb-8 flex flex-wrap justify-center gap-3"
      >
        <Link to="/projects" className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-accentGlow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-12px_rgba(124,92,255,0.75)]">
          Explorar proyectos
        </Link>
        <Link to="/downloads" className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/80 px-5 py-3 text-sm font-medium text-text transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface">
          Ver descargas
        </Link>
        <Link to="/changelog" className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/80 px-5 py-3 text-sm font-medium text-text transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface">
          Ver changelog
        </Link>
      </motion.div>

      <motion.div
        {...animatedProps}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.56, delay: 0.28, ease: "easeOut" }}
        className="mb-14"
      >
        <SocialGrid />
      </motion.div>

      <motion.div
        {...animatedProps}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.34, ease: "easeOut" }}
        className="mx-auto max-w-4xl overflow-hidden rounded-[26px] border border-border bg-surface/85 text-left shadow-[0_30px_60px_-28px_rgba(124,92,255,0.5)] backdrop-blur-sm"
      >
        <div className="flex gap-1.5 border-b border-border bg-surface2 px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
        </div>
        <div className="grid gap-5 p-4 md:grid-cols-[1.4fr_0.8fr] md:p-5">
          <div>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Fresh ecosystem</div>
                <p className="mt-1 font-display text-base font-semibold text-text">Todo lo que estás creando, conectado.</p>
              </div>
              <Link to="/status" className="text-xs text-muted transition-colors hover:text-text">Ver detalles →</Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {(systemServices.length ? systemServices : fallbackServices).map((service) => {
                const meta = STATUS_META[service.status] || STATUS_META.pending;
                const isPrivate = service.isPrivate || service.id === "cupons" || service.id === "ai-stylist";

                const handleClick = (e) => {
                  if (isPrivate && onOpenPrivateApp) {
                    e.preventDefault();
                    onOpenPrivateApp({
                      name: service.name,
                      url: service.href || service.url || "#",
                    });
                  }
                };

                return (
                  <a
                    key={service.id}
                    href={service.href || service.url || "#"}
                    onClick={handleClick}
                    target={service.id === "fresh-hub" ? undefined : "_blank"}
                    rel={service.id === "fresh-hub" ? undefined : "noreferrer"}
                    className="group overflow-hidden rounded-2xl border border-border bg-surface2/70 transition-all hover:-translate-y-1 hover:border-accent/40"
                  >
                    <div className="relative h-20 overflow-hidden">
                      <img src={service.thumbnail} alt="" className="h-full w-full object-cover opacity-70 transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface2 via-surface2/20 to-transparent" />
                      {isPrivate ? (
                        <span className="absolute left-2 top-2 rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 font-mono text-[9px] font-semibold text-amber-300 backdrop-blur-md">
                          🔒 Privada
                        </span>
                      ) : service.latestRelease && (
                        <span title={service.latestRelease.title} className="absolute left-2 top-2 rounded-full border border-accent/70 bg-accent px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_0_16px_rgba(124,92,255,0.55)]">
                          News
                        </span>
                      )}
                      <span className={`absolute right-2 top-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] ${meta.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>
                    <div className="px-3 pb-3">
                      <p className="truncate text-xs font-medium text-text flex items-center justify-between">
                        <span>{service.name}</span>
                        {isPrivate && <span className="text-[10px] text-amber-400 font-mono">PIN</span>}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-muted">{isPrivate ? "Acceso Privado / Exclusivo" : service.detail}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface2/70 p-4 font-mono text-[11px] text-muted">
            <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
              <span className="uppercase tracking-[0.16em] text-accent">Live overview</span>
              <span className="text-accent2">● connected</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between gap-3"><span>projects</span><span className="text-text">{stats.projects ?? "—"} <span className="text-accent2">active</span></span></div>
              <div className="flex justify-between gap-3"><span>downloads</span><span className="text-text">{stats.downloads ?? "—"} files</span></div>
              <div className="flex justify-between gap-3"><span>updates</span><span className="text-text">{stats.news ?? "—"} posts</span></div>
              <div className="flex justify-between gap-3"><span>status</span><span className="text-accent2">● all systems normal</span></div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
