import { useAuth } from "../../hooks/useAuth";

export default function PrivateLock({ isPrivate, title = "Contenido privado", lockIcon, children }) {
  const { session } = useAuth();
  console.log("[PrivateLock DEBUG]", { isPrivate, hasSession: Boolean(session), sessionEmail: session?.user?.email });

  if (!isPrivate || session) return children;

  return (
    <div className="relative overflow-hidden rounded-[26px]">
      <div className="pointer-events-none select-none blur-md brightness-50">{children}</div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
        {!lockIcon && <span className="text-2xl">🔒</span>}
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-white">{title}</p>
      </div>

      {lockIcon && (
        <img
          src={lockIcon}
          alt="Privado"
          className="absolute bottom-3 right-3 h-9 w-9 rounded-lg border border-white/20 bg-black/40 object-contain p-1 shadow-lg"
        />
      )}
    </div>
  );
}
