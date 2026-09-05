import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const links = [
  { label: "Inicio", to: "/" },
  { label: "Descargas", to: "/downloads" },
  { label: "Proyectos", to: "/projects" },
  { label: "Novedades", to: "/news" },
  { label: "Guías", to: "/guides" },
  { label: "Changelog", to: "/changelog" },
  { label: "Status", to: "/status" },
];

export default function Navbar({ settings = {} }) {
  const siteName = settings.site_name || "Fresh";
  const avatarUrl = settings.avatar_url || "";
  const { canEdit } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav
      className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-base">
          {avatarUrl ? (
            <img src={avatarUrl} alt={siteName} className="w-7 h-7 rounded-full object-cover border border-border" />
          ) : (
            <span className="w-2 h-2 rounded-sm bg-accent shadow-[0_0_12px_theme(colors.accent)]" />
          )}
          {siteName}
        </Link>

        <div className="hidden md:flex gap-7 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-text transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={canEdit ? "/admin/dashboard" : "/admin"}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-border text-muted hover:text-text hover:border-accent/40 transition-colors"
          >
            {canEdit && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            {canEdit ? "Dashboard" : "Admin"}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text"
          >
            <span className="relative block h-3.5 w-4">
              <span className={`absolute left-0 top-0 h-0.5 w-4 bg-current transition-transform ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-current transition-opacity ${menuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 bottom-0 h-0.5 w-4 bg-current transition-transform ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="flex flex-col px-4 py-3 text-sm text-muted">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-lg px-2 py-2.5 hover:bg-surface hover:text-text transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
