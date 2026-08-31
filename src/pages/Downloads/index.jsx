import { useEffect, useState } from "react";
import { useMemo } from "react";
import DownloadCard from "../../components/downloads/DownloadCard";
import { getDownloads } from "../../services/downloads";

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    getDownloads().then(setDownloads).catch(() => {});
  }, []);

  const categories = useMemo(() => [...new Set(downloads.map((download) => download.category).filter(Boolean))], [downloads]);
  const filteredDownloads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return downloads.filter((download) => {
      const matchesQuery = !normalizedQuery || [download.name, download.description, download.category, download.format]
        .join(" ").toLowerCase().includes(normalizedQuery);
      return matchesQuery && (category === "all" || download.category === category);
    });
  }, [downloads, query, category]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold mb-4">Descargas</h1>
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar descargas..."
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
        <select value={category} onChange={(event) => setCategory(event.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm">
          <option value="all">Todas las categorías</option>
          {categories.map((itemCategory) => <option key={itemCategory} value={itemCategory}>{itemCategory}</option>)}
        </select>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {filteredDownloads.map((d) => <DownloadCard key={d.id} item={d} />)}
      </div>
      {filteredDownloads.length === 0 && <p className="text-sm text-muted mt-6">No encontramos descargas con esos filtros.</p>}
    </div>
  );
}
