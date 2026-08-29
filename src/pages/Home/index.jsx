import { useEffect, useState } from "react";
import Hero from "../../components/home/Hero";
import ProjectCard from "../../components/projects/ProjectCard";
import DownloadCard from "../../components/downloads/DownloadCard";
import NewsItem from "../../components/news/NewsItem";
import { getProjects } from "../../services/projects";
import { getDownloads } from "../../services/downloads";
import { getNews } from "../../services/news";

function SectionHead({ eyebrow, title, to }) {
  return (
    <div className="flex items-baseline justify-between mb-6">
      <div>
        <div className="font-mono text-xs text-accent uppercase tracking-wider mb-1.5">{eyebrow}</div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
      </div>
      <a href={to} className="text-sm text-muted hover:text-text">Ver todos →</a>
    </div>
  );
}

export default function Home({ settings = {} }) {
  const [featured, setFeatured] = useState([]);
  const [latestDownloads, setLatestDownloads] = useState([]);
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    getProjects().then((data) => setFeatured(data.filter((p) => p.featured))).catch(() => {});
    getDownloads().then((data) => setLatestDownloads(data.slice(0, 3))).catch(() => {});
    getNews().then((data) => setLatestNews(data.filter((n) => n.published).slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6">
      <Hero settings={settings} />

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
