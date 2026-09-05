import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GuideCard from "../../components/guides/GuideCard";
import { fetchGuides, guideGameOptions, guideContentCategories } from "../../services/guides";

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchGuides().then(setGuides).finally(() => setLoading(false));
  }, []);

  // Juegos/temas disponibles: la lista fija + cualquier tag propio que ya se haya usado
  const availableGames = useMemo(() => {
    const set = new Set(guideGameOptions);
    guides.forEach((guide) => {
      if (Array.isArray(guide.tags)) guide.tags.forEach((tag) => set.add(tag));
    });
    return Array.from(set);
  }, [guides]);

  const filteredGuides = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return guides.filter((guide) => {
      const matchesGame =
        selectedGame === "all" ||
        (Array.isArray(guide.tags) && guide.tags.includes(selectedGame));
      const matchesCategory =
        selectedCategory === "all" ||
        (Array.isArray(guide.categories) && guide.categories.includes(selectedCategory));
      const matchesQuery =
        !normalizedQuery ||
        [guide.title, guide.summary, ...(guide.tags || []), ...(guide.categories || [])]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesGame && matchesCategory && matchesQuery;
    });
  }, [guides, selectedGame, selectedCategory, query]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Guides</div>
          <h1 className="mt-2 font-display text-3xl font-semibold">Guías</h1>
        </div>
        <Link to="/" className="text-sm text-muted hover:text-text">← Inicio</Link>
      </div>

      <div className="mb-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar guía..."
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      {/* Filtro por juego/tema */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted mr-1">Juego:</span>
        <button
          onClick={() => setSelectedGame("all")}
          className={`rounded-full px-3 py-1 text-xs transition-all ${
            selectedGame === "all"
              ? "bg-accent text-accent-contrast font-medium"
              : "bg-surface-elevated text-muted hover:text-text border border-border"
          }`}
        >
          Todos
        </button>
        {availableGames.map((game) => (
          <button
            key={game}
            onClick={() => setSelectedGame(selectedGame === game ? "all" : game)}
            className={`rounded-full px-3 py-1 text-xs transition-all ${
              selectedGame === game
                ? "bg-accent text-accent-contrast font-medium shadow-sm"
                : "bg-surface-elevated text-muted hover:text-text border border-border"
            }`}
          >
            #{game}
          </button>
        ))}
      </div>

      {/* Filtro por categoría de contenido */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted mr-1">Categoría:</span>
        <button
          onClick={() => setSelectedCategory("all")}
          className={`rounded-full px-3 py-1 text-xs transition-all ${
            selectedCategory === "all"
              ? "bg-accent2/30 text-accent2 font-medium"
              : "bg-surface-elevated text-muted hover:text-text border border-border"
          }`}
        >
          Todas
        </button>
        {guideContentCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(selectedCategory === category ? "all" : category)}
            className={`rounded-full px-3 py-1 text-xs transition-all ${
              selectedCategory === category
                ? "bg-accent2/30 text-accent2 font-medium shadow-sm"
                : "bg-surface-elevated text-muted hover:text-text border border-border"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {filteredGuides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      {loading && <p className="mt-6 text-sm text-muted">Cargando guías...</p>}
      {filteredGuides.length === 0 && (
        !loading && <p className="mt-6 text-sm text-muted">No encontramos guías con esos filtros.</p>
      )}
    </div>
  );
}
