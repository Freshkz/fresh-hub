export default function CategoryToggle({ selectedCategories = [], onChange, options, label = "Categoría del contenido" }) {
  const toggle = (category) => {
    const exists = selectedCategories.includes(category);
    onChange(exists ? selectedCategories.filter((c) => c !== category) : [...selectedCategories, category]);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs uppercase tracking-[0.18em] text-muted">{label}</label>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggle(category)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                isSelected
                  ? "bg-accent2/20 text-accent2 border-accent2/50 font-semibold"
                  : "bg-surface2 text-muted border-border hover:text-text hover:border-accent2/40"
              }`}
            >
              {isSelected ? `✓ ${category}` : category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
