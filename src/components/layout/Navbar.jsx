import { Link } from "react-router-dom";

const links = [
  { label: "Inicio", to: "/" },
  { label: "Descargas", to: "/downloads" },
  { label: "Proyectos", to: "/projects" },
  { label: "Novedades", to: "/news" },
];

export default function Navbar({ settings = {} }) {
  const siteName = settings.site_name || "FreshKZ";
  const avatarUrl = settings.avatar_url || "";

  return (
    <nav className="sticky top-0 z-20 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
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
        <Link
          to="/admin"
          className="text-xs px-3 py-2 rounded-lg border border-border text-muted hover:text-text hover:border-accent/40 transition-colors"
        >
          Admin
        </Link>
      </div>
    </nav>
  );
}
