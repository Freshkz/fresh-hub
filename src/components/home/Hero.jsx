import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import SocialGrid from "../social/SocialGrid";

export default function Hero({ settings = {}, stats = {} }) {
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
        className="mx-auto max-w-md overflow-hidden rounded-[22px] border border-border bg-surface/85 text-left shadow-[0_30px_60px_-28px_rgba(124,92,255,0.5)] backdrop-blur-sm"
      >
        <div className="flex gap-1.5 border-b border-border bg-surface2 px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
        </div>
        <div className="space-y-1 px-4 py-3 font-mono text-[11px] text-muted">
          <div className="flex justify-between">
            <span>projects</span>
            <span className="text-text">{stats.projects ?? "—"} <span className="text-accent2">active</span></span>
          </div>
          <div className="flex justify-between">
            <span>downloads</span>
            <span className="text-text">{stats.downloads ?? "—"} files</span>
          </div>
          <div className="flex justify-between">
            <span>status</span>
            <span className="text-accent2">● all systems normal</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
