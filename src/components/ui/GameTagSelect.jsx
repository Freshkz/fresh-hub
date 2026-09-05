import { useState } from "react";

const ADD_CUSTOM_VALUE = "__add_custom__";

export default function GameTagSelect({ selectedTags = [], onChange, options, label = "Juegos / Temas" }) {
  const [showModal, setShowModal] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const addTag = (rawValue) => {
    const val = rawValue.trim();
    if (!val) return;
    const alreadySelected = selectedTags.some((t) => t.toLowerCase() === val.toLowerCase());
    if (alreadySelected) return;
    const knownMatch = options.find((t) => t.toLowerCase() === val.toLowerCase());
    onChange([...selectedTags, knownMatch || val]);
  };

  const handleSelectChange = (event) => {
    const value = event.target.value;
    if (!value) return;
    if (value === ADD_CUSTOM_VALUE) {
      setShowModal(true);
    } else {
      addTag(value);
    }
    event.target.value = "";
  };

  const handleCustomSubmit = () => {
    addTag(customInput);
    setCustomInput("");
    setShowModal(false);
  };

  const closeModal = () => {
    setCustomInput("");
    setShowModal(false);
  };

  const removeTag = (tag) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs uppercase tracking-[0.18em] text-muted">{label}</label>}

      <select
        defaultValue=""
        onChange={handleSelectChange}
        className="w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent"
      >
        <option value="" disabled>Elegí un juego o tema...</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
        <option value={ADD_CUSTOM_VALUE}>＋ Agrega tu etiqueta</option>
      </select>


      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
          onClick={closeModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="mb-1 font-display text-base font-semibold text-text">Agregá tu etiqueta</h3>
            <p className="mb-3 text-xs text-muted">Escribí el nombre del juego o tema que no está en la lista.</p>
            <input
              autoFocus
              type="text"
              value={customInput}
              onChange={(event) => setCustomInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCustomSubmit();
                }
              }}
              placeholder="Ej: Apex Legends"
              className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={closeModal} className="rounded-lg border border-border px-3 py-2 text-xs text-muted">
                Cancelar
              </button>
              <button type="button" onClick={handleCustomSubmit} className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}