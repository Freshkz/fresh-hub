import { useState } from "react";
import { uploadMedia } from "../../services/media";

export default function MediaUploadField({ value, onChange, folder = "images", label = "Imagen" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      onChange(await uploadMedia(file, folder));
    } catch (err) {
      setError(err.message || "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs uppercase tracking-[0.18em] text-muted">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        <input type="file" accept="image/*" onChange={handleChange} disabled={uploading}
          className="block min-w-0 flex-1 text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:font-medium file:text-white" />
        {uploading && <span className="text-xs text-muted">Subiendo...</span>}
      </div>
      <input value={value || ""} onChange={(event) => onChange(event.target.value)}
        placeholder="O pega una URL de imagen"
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm outline-none focus:border-accent" />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {value && <img src={value} alt="Vista previa" className="h-20 w-32 rounded-lg border border-border object-cover" />}
    </div>
  );
}
