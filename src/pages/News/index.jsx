import { useEffect, useState } from "react";
import { useMemo } from "react";
import NewsItem from "../../components/news/NewsItem";
import { getUnifiedNews } from "../../services/newsSources";

export default function News() {
  const [news, setNews] = useState([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  useEffect(() => {
    getUnifiedNews()
      .then((data) => setNews(data.filter((n) => n.published !== false)))
      .catch(() => {});
  }, []);

  const types = useMemo(() => [...new Set(news.map((item) => item.type).filter(Boolean))], [news]);
  const filteredNews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return news.filter((item) => {
      const matchesQuery = !normalizedQuery || [item.title, item.description, item.type].join(" ").toLowerCase().includes(normalizedQuery);
      return matchesQuery && (type === "all" || item.type === type);
    });
  }, [news, query, type]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold mb-4">Novedades</h1>
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar novedades..."
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        <select value={type} onChange={(event) => setType(event.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm">
          <option value="all">Todos los tipos</option>
          {types.map((itemType) => <option key={itemType} value={itemType}>{itemType}</option>)}
        </select>
      </div>
      <div className="bg-surface border border-border rounded-2xl px-5">
        {filteredNews.map((n) => <NewsItem key={n.id} item={n} />)}
      </div>
      {filteredNews.length === 0 && <p className="text-sm text-muted mt-6">No encontramos novedades con esos filtros.</p>}
    </div>
  );
}
