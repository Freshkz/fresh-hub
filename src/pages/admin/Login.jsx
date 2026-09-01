import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const result = resetMode
        ? await resetPassword(email)
        : await signIn(email, password);

      if (result.error) {
        setError(resetMode ? "No se pudo enviar el correo de recuperación." : "Email o contraseña incorrectos.");
      } else if (resetMode) {
        setMessage("Revisá tu email para crear una contraseña nueva.");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.message || "No se pudo completar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-xl font-semibold mb-2">Admin login</h1>
      <p className="text-sm text-muted mb-6">
        {resetMode ? "Te enviaremos un enlace para recuperar el acceso." : "Ingresá para administrar el contenido del sitio."}
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        {!resetMode && <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
          />}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-green-400">{message}</p>}
        <button type="submit" disabled={submitting} className="w-full bg-accent text-white text-sm font-semibold py-2.5 rounded-lg disabled:opacity-60">
          {submitting ? "Procesando..." : resetMode ? "Enviar recuperación" : "Ingresar"}
        </button>
      </form>
      <button type="button" onClick={() => { setResetMode(!resetMode); setError(""); setMessage(""); }} className="text-xs text-muted hover:text-text mt-4">
        {resetMode ? "Volver al login" : "Olvidé mi contraseña"}
      </button>
    </div>
  );
}
