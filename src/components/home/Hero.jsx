import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SocialGrid from "../social/SocialGrid";

export default function Hero({ settings = {} }) {
  const siteName = settings.site_name || "FreshKZ";
  const tagline = settings.site_tagline || "Todo lo que hago, en un solo lugar";
  const parts = tagline.split(",");
  const firstLine = (parts[0] || tagline).trim();
  const secondLine = (parts[1] || siteName).trim();

  return (
    <section className="pt-24 pb-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 font-mono text-xs text-accent2 bg-accent2/10 border border-accent2/25 px-3 py-1.5 rounded-full mb-7"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pulse" />
        hub online — 3 proyectos activos
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-display font-bold text-4xl md:text-5xl mb-4"
      >
        {firstLine}
        <br />
        <span className="text-accent">{secondLine}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-muted max-w-md mx-auto mb-8"
      >
        {settings.meta_description || `Proyectos, descargas y novedades de ${siteName}. Actualizado seguido, sin vueltas.`}
      </motion.p>

      <div className="flex gap-3 justify-center mb-8">
        <Link to="/projects" className="bg-accent text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-accentGlow">
          Explorar proyectos
        </Link>
        <Link to="/downloads" className="border border-border text-sm font-medium px-5 py-3 rounded-xl">
          Ver descargas
        </Link>
      </div>

      <div className="mb-14">
        <SocialGrid />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-md mx-auto bg-surface border border-border rounded-xl overflow-hidden text-left"
      >
        <div className="flex gap-1.5 px-3.5 py-2.5 border-b border-border bg-surface2">
          <span className="w-2 h-2 rounded-full bg-[#3a3a44]" />
          <span className="w-2 h-2 rounded-full bg-[#3a3a44]" />
          <span className="w-2 h-2 rounded-full bg-[#3a3a44]" />
        </div>
        <div className="px-4 py-3 font-mono text-xs text-muted space-y-1">
          <div className="flex justify-between">
            <span>projects</span>
            <span className="text-text">8 <span className="text-accent2">active</span></span>
          </div>
          <div className="flex justify-between">
            <span>downloads</span>
            <span className="text-text">24 files</span>
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
