export default function ConfirmModal({
  isOpen,
  title = "¿Estás seguro?",
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2.5 h-2.5 rounded-full ${danger ? "bg-red-400" : "bg-accent"} animate-pulse`} />
          <span className={`font-mono text-xs uppercase tracking-wider ${danger ? "text-red-400" : "text-accent"}`}>
            Confirmación
          </span>
        </div>

        <h3 className="font-display text-lg font-bold mb-2">{title}</h3>
        {message && <p className="text-sm text-muted mb-6">{message}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-surface2 border border-border text-muted text-sm font-medium py-2.5 rounded-xl hover:text-text"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity ${
              danger ? "bg-red-500" : "bg-accent"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}