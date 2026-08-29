import { useAuth } from "../../hooks/useAuth";

const links = [
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/downloads", label: "Downloads" },
  { to: "/admin/news", label: "News" },
  { to: "/admin/socials", label: "Social Links" },
  { to: "/admin/settings", label: "Settings" },
];

export default function Dashboard() {
  const { signOut } = useAuth();
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex justify-between items-center mb-10">
        <h1 className="font-display text-xl font-semibold">Admin dashboard</h1>
        <button onClick={signOut} className="text-sm text-muted hover:text-text">
          Cerrar sesión
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {links.map((l) => (
          <a
            key={l.to}
            href={l.to}
            className="bg-surface border border-border rounded-xl px-5 py-4 text-sm font-medium hover:border-accent/40 transition-colors"
          >
            Gestionar {l.label} →
          </a>
        ))}
      </div>
    </div>
  );
}
