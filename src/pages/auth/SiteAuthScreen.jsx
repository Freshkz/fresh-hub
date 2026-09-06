import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function SiteAuthScreen() {
  const { signIn, signUp, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setInfoMsg("¡Listo! Te mandamos un mail de confirmación — revisá tu bandeja de entrada (y spam) para activar la cuenta.");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err) {
      setErrorMsg(err.message || "Ocurrió un error, intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider) => {
    setErrorMsg("");
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || "No se pudo iniciar sesión.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6">
        <h1 className="font-display text-xl font-semibold text-text">
          {mode === "login" ? "Iniciá sesión" : "Creá tu cuenta"}
        </h1>
        <p className="mt-1 text-sm text-muted">Necesitás una cuenta verificada para ver el sitio.</p>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            className="w-full rounded-xl border border-border bg-surface2 px-4 py-2.5 text-sm font-medium text-text hover:border-accent/50"
          >
            Continuar con Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("azure")}
            className="w-full rounded-xl border border-border bg-surface2 px-4 py-2.5 text-sm font-medium text-text hover:border-accent/50"
          >
            Continuar con Microsoft
          </button>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted">o con email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            className="w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-accent"
          />

          {errorMsg && (
            <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">{errorMsg}</p>
          )}
          {infoMsg && (
            <p className="rounded-lg border border-accent2/30 bg-accent2/10 px-3 py-2 text-xs text-accent2">{infoMsg}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Un momento..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErrorMsg(""); setInfoMsg(""); }}
          className="mt-4 w-full text-center text-xs text-muted hover:text-text"
        >
          {mode === "login" ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Iniciá sesión"}
        </button>
      </div>
    </div>
  );
}
