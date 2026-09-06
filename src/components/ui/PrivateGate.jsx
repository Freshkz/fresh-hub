import { Link } from "react-router-dom";

export default function PrivateGate({ backTo, backLabel = "← Volver", lockIcon }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
      <Link to={backTo} className="self-start text-xs text-muted hover:text-text">{backLabel}</Link>
      {lockIcon ? (
        <img src={lockIcon} alt="Privado" className="h-16 w-16 rounded-2xl border border-border bg-surface object-contain p-2" />
      ) : (
        <span className="text-4xl">🔒</span>
      )}
      <h1 className="font-display text-2xl font-semibold text-text">Contenido privado</h1>
      <p className="max-w-sm text-sm text-muted">Esta publicación es privada. Iniciá sesión con una cuenta autorizada para verla.</p>
    </div>
  );
}
