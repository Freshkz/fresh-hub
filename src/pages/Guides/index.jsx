import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GuideCard from "../../components/guides/GuideCard";
import { fetchGuides, guideCategories } from "../../services/guides";

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchGuides().then(setGuides).finally(() => setLoading(false));
  }, []);

  // Compute all available tags dynamically from guides + categories
  const allAvailableTags = useMemo(() => {
    const set = new Set();
    guideCategories.forEach((cat) => set.add(cat));
    guides.forEach((guide) => {
      if (Array.isArray(guide.tags)) {
        guide.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set);
  }, [guides]);

  const filteredGuides = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return guides.filter((guide) => {
      const matchesGame = game === "all" || guide.game === game;
      const matchesTag =
        selectedTag === "all" ||
        guide.game === selectedTag ||
        (Array.isArray(guide.tags) && guide.tags.includes(selectedTag));
      const matchesQuery =
        !normalizedQuery ||
        [guide.title, guide.summary, guide.game, ...(guide.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesGame && matchesTag && matchesQuery;
    });
  }, [guides, game, selectedTag, query]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Guides</div>
          <h1 className="mt-2 font-display text-3xl font-semibold">Guías por juego</h1>
        </div>
        <Link to="/" className="text-sm text-muted hover:text-text">← Inicio</Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar guía..."
          className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        <select
          value={game}
          onChange={(event) => {
            setGame(event.target.value);
            if (event.target.value !== "all") setSelectedTag("all");
          }}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">Todos los juegos</option>
          {guideCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Interactive Tag Filter Chips */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted mr-1">Etiquetas:</span>
        <button
          onClick={() => { setSelectedTag("all"); setGame("all"); }}
          className={`rounded-full px-3 py-1 text-xs transition-all ${
            selectedTag === "all" && game === "all"
              ? "bg-accent text-accent-contrast font-medium"
              : "bg-surface-elevated text-muted hover:text-text border border-border"
          }`}
        >
          Todas
        </button>
        {allAvailableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? "all" : tag)}
            className={`rounded-full px-3 py-1 text-xs transition-all ${
              selectedTag === tag
                ? "bg-accent text-accent-contrast font-medium shadow-sm"
                : "bg-surface-elevated text-muted hover:text-text border border-border"
            }`}
          >
            #{tag}
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

