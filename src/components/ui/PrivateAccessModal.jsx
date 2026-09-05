import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function PrivateAccessModal({ isOpen, onClose, targetApp, requiredPin = "1234" }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { isAdmin } = useAuth();

  if (!isOpen || !targetApp) return null;

  // Si el usuario es el Admin principal, autorizar automáticamente
  if (isAdmin) {
    window.open(targetApp.url, "_blank", "noreferrer");
    onClose();
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (pin.trim() === requiredPin.trim()) {
      window.open(targetApp.url, "_blank", "noreferrer");
      setPin("");
      onClose();
    } else {
      setError("PIN o clave de acceso incorrecta.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs text-accent uppercase tracking-wider">Acceso Privado</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text text-sm font-semibold px-2 py-1 rounded-lg border border-border"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-display text-xl font-bold mb-1">🔒 {targetApp.name}</h3>
          <p className="text-sm text-muted">
            Esta aplicación es privada y exclusiva. Ingresa la clave secreta o PIN para ingresar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Clave de acceso / PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent font-mono tracking-widest text-center text-lg"
            autoFocus
          />

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-surface2 border border-border text-muted text-sm font-medium py-2.5 rounded-xl hover:text-text"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-accent text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Desbloquear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
