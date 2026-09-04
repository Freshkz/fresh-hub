import { useState } from "react";

export const PRESET_TAGS = [
  "Minecraft",
  "CS2",
  "Valorant",
  "GTA V",
  "Roblox",
  "League of Legends",
  "FiveM",
  "Rust",
  "Discord Bots",
  "Web Apps",
  "Mods / Plugins",
  "Scripts",
  "Utilidades",
  "Rendimiento / FPS",
  "Servidores",
  "Tutoriales",
];

export default function TagSelector({ selectedTags = [], onChange, label = "Etiquetas / Categorías" }) {
  const [customInput, setCustomInput] = useState("");

  const toggleTag = (tag) => {
    const exists = selectedTags.includes(tag);
    const updated = exists ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag];
    onChange(updated);
  };

  const handleAddCustom = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = customInput.trim().replace(/,/g, "");
      if (val && !selectedTags.includes(val)) {
        onChange([...selectedTags, val]);
        setCustomInput("");
      }
    }
  };

  const removeTag = (tag) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs uppercase tracking-[0.18em] text-muted">{label}</label>}

      {/* Tags seleccionados */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-surface border border-border rounded-xl mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/20 border border-accent/40 text-accent text-xs font-semibold"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-white transition-colors"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input para escribir tags personalizados */}
      <input
        type="text"
        placeholder="Escribe un nuevo tag (ej: Apex, Python) y presiona Enter..."
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        onKeyDown={handleAddCustom}
        className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {/* Sugerencias de tags populares */}
      <div className="pt-1">
        <p className="text-[11px] text-muted mb-1.5">Categorías populares (haz clic para agregar):</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-accent text-white border-accent font-semibold"
                    : "bg-surface2 text-muted border-border hover:text-text hover:border-accent/40"
                }`}
              >
                {isSelected ? `✓ ${tag}` : `+ ${tag}`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
