import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProjects } from "../../services/projects";
import { getDownloads } from "../../services/downloads";
import { getNews } from "../../services/news";
import { getGuides } from "../../services/guides";
import { getSocials } from "../../services/socials";

const links = [
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/downloads", label: "Downloads" },
  { to: "/admin/news", label: "News" },
  { to: "/admin/guides", label: "Guides" },
  { to: "/admin/socials", label: "Social Links" },
  { to: "/admin/settings", label: "Settings" },
];

export default function Dashboard() {
  const { signOut } = useAuth();
  const [stats, setStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    Promise.all([getProjects(), getDownloads(), getNews(), getGuides(), getSocials()])
      .then(([projects, downloads, news, guides, socials]) => {
        setStats({
          projects: projects.length,
          downloads: downloads.length,
          news: news.length,
          guides: guides.length,
          socials: socials.length,
        });
      })
      .catch((err) => setErrorMsg(err.message || "No se pudieron cargar las estadísticas."));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex justify-between items-center mb-10">
        <h1 className="font-display text-xl font-semibold">Admin dashboard</h1>
        <button onClick={signOut} className="text-sm text-muted hover:text-text">
          Cerrar sesión
        </button>
      </div>
      {errorMsg && <p className="text-red-400 text-sm mb-4">{errorMsg}</p>}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          ["Proyectos", stats?.projects],
          ["Descargas", stats?.downloads],
          ["Novedades", stats?.news],
          ["Guías", stats?.guides],
          ["Redes", stats?.socials],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface border border-border rounded-xl px-4 py-4">
            <p className="text-xs text-muted">{label}</p>
            <p className="font-display text-2xl font-semibold mt-1">{value ?? "…"}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="bg-surface border border-border rounded-xl px-5 py-4 text-sm font-medium hover:border-accent/40 transition-colors"
          >
            Gestionar {l.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
