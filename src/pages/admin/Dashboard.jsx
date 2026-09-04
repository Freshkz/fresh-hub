import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProjects } from "../../services/projects";
import { getDownloads } from "../../services/downloads";
import { getNews } from "../../services/news";
import { getGuides } from "../../services/guides";
import { getSocials } from "../../services/socials";

const links = [
  { to: "/admin/projects", label: "Projects", adminOnly: false },
  { to: "/admin/downloads", label: "Downloads", adminOnly: false },
  { to: "/admin/news", label: "News", adminOnly: false },
  { to: "/admin/guides", label: "Guides", adminOnly: false },
  { to: "/admin/socials", label: "Social Links", adminOnly: true },
  { to: "/admin/settings", label: "Settings", adminOnly: true },
];

export default function Dashboard() {
  const { signOut, userEmail, isAdmin, role } = useAuth();
  const [stats, setStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    Promise.allSettled([getProjects(), getDownloads(), getNews(), getGuides(), getSocials()])
      .then(([projects, downloads, news, guides, socials]) => {
        setStats({
          projects: projects.status === "fulfilled" ? projects.value.length : 0,
          downloads: downloads.status === "fulfilled" ? downloads.value.length : 0,
          news: news.status === "fulfilled" ? news.value.length : 0,
          guides: guides.status === "fulfilled" ? guides.value.length : 0,
          socials: socials.status === "fulfilled" ? socials.value.length : 0,
        });
      })
      .catch((err) => setErrorMsg(err.message || "No se pudieron cargar las estadísticas."));
  }, []);

  const visibleLinks = links.filter((l) => !l.adminOnly || isAdmin);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-display text-xl font-semibold">Dashboard</h1>
          <p className="text-xs text-muted mt-1 flex items-center gap-2">
            <span>{userEmail}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${isAdmin ? "bg-accent/20 text-accent border border-accent/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
              {isAdmin ? "Admin" : "Editor / Amigo"}
            </span>
          </p>
        </div>
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
        {visibleLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="bg-surface border border-border rounded-xl px-5 py-4 text-sm font-medium hover:border-accent/40 transition-colors flex items-center justify-between"
          >
            <span>Gestionar {l.label}</span>
            <span className="text-muted">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
