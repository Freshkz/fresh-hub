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

  // Categorías disponibles: solo las que efectivamente tiene alguna guía publicada
  const availableCategories = useMemo(() => {
    const set = new Set();
    guides.forEach((guide) => {
      if (Array.isArray(guide.categories)) guide.categories.forEach((category) => set.add(category));
    });
    return guideContentCategories.filter((category) => set.has(category));
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

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={selectedGame}
            onChange={(event) => setSelectedGame(event.target.value)}
            className="appearance-none rounded-xl border border-border bg-surface px-3.5 py-2 pr-9 text-sm text-text outline-none transition-colors hover:border-accent/40 focus:border-accent"
          >
            <option value="all">Todos los juegos</option>
            {availableGames.map((game) => (
              <option key={game} value={game}>#{game}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">▾</span>
        </div>

        {availableCategories.length > 0 && (
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="appearance-none rounded-xl border border-border bg-surface px-3.5 py-2 pr-9 text-sm text-text outline-none transition-colors hover:border-accent2/40 focus:border-accent2"
            >
              <option value="all">Todas las categorías</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">▾</span>
          </div>
        )}

        {(selectedGame !== "all" || selectedCategory !== "all") && (
          <button
            onClick={() => { setSelectedGame("all"); setSelectedCategory("all"); }}
            className="text-xs text-muted underline-offset-2 hover:text-text hover:underline"
          >
            Limpiar filtros
          </button>
        )}
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
