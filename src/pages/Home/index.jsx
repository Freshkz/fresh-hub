import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Hero from "../../components/home/Hero";
import ProjectCard from "../../components/projects/ProjectCard";
import DownloadCard from "../../components/downloads/DownloadCard";
import NewsItem from "../../components/news/NewsItem";
import { getProjects } from "../../services/projects";
import { getDownloads } from "../../services/downloads";
import { getNews } from "../../services/news";
import { getSocials } from "../../services/socials";
import { getSystemStatus } from "../../services/systemStatus";

function SectionHead({ eyebrow, title, to }) {
  return (
    <div className="flex items-baseline justify-between mb-6">
      <div>
        <div className="font-mono text-xs text-accent uppercase tracking-wider mb-1.5">{eyebrow}</div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
      </div>
      <Link to={to} className="text-sm text-muted hover:text-text">Ver todos →</Link>
    </div>
  );
}

export default function Home({ settings = {} }) {
  const [featured, setFeatured] = useState([]);
  const [latestDownloads, setLatestDownloads] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [stats, setStats] = useState({});
  const [discordLink, setDiscordLink] = useState(null);
  const [hubOnline, setHubOnline] = useState(null);

  useEffect(() => {
    getProjects().then((data) => {
      setFeatured(data.filter((p) => p.featured));
      setStats((current) => ({ ...current, projects: data.length }));
    }).catch(() => {});
    getDownloads().then((data) => {
      setLatestDownloads(data.slice(0, 3));
      setStats((current) => ({ ...current, downloads: data.length }));
    }).catch(() => {});
    getNews().then((data) => {
      setLatestNews(data.filter((n) => n.published).slice(0, 3));
      setStats((current) => ({ ...current, news: data.length }));
    }).catch(() => {});
    getSocials().then((data) => {
      const discord = data.find((social) => {
        const isEnabled = social.enabled !== false;
        const label = social.name || "";
        const url = social.url || "";
        return isEnabled && (/discord/i.test(label) || /discord/i.test(url));
      });
      setDiscordLink(discord || null);
    }).catch(() => {});
    getSystemStatus().then(({ services }) => {
      setHubOnline(services.find((service) => service.id === "fresh-hub")?.status === "online");
    }).catch(() => setHubOnline(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6">
      <Hero settings={settings} stats={stats} />

      {discordLink && (
        <section className="py-8">
          <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-accent uppercase tracking-wider mb-2">Comunidad</div>
              <h2 className="font-display text-xl font-semibold mb-1">Unite al Discord</h2>
              <p className="text-sm text-muted">Charlas, novedades y comunidad en tiempo real.</p>
            </div>
            <a href={discordLink.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center bg-accent text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
              Entrar al Discord
            </a>
          </div>
        </section>
      )}

      <section className="pb-8">
        <Link to="/status" className="group flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent/35">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-accent">System status</div>
            <p className="mt-1 text-sm text-muted">Consulta el estado de Fresh y sus aplicaciones.</p>
          </div>
          <span className="flex items-center gap-2 text-sm text-muted group-hover:text-text">
            <span className={`h-2 w-2 rounded-full ${hubOnline === null ? "bg-muted" : hubOnline ? "bg-emerald-400" : "bg-red-400"}`} />
            {hubOnline === null ? "Comprobando..." : hubOnline ? "Fresh online" : "Ver estado"} →
          </span>
        </Link>
      </section>

      <section className="py-16">
        <SectionHead eyebrow="Featured" title="Proyectos destacados" to="/projects" />
        <div className="grid md:grid-cols-3 gap-4">
          {featured.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </section>

      <section className="py-16">
        <SectionHead eyebrow="Downloads" title="Últimas descargas" to="/downloads" />
        <div className="grid md:grid-cols-3 gap-4">
          {latestDownloads.map((d) => <DownloadCard key={d.id} item={d} />)}
        </div>
      </section>

      <section className="py-16">
        <SectionHead eyebrow="Feed" title="Novedades" to="/news" />
        <div className="bg-surface border border-border rounded-2xl px-5">
          {latestNews.map((n) => <NewsItem key={n.id} item={n} />)}
        </div>
      </section>
    </div>
  );
}
