import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { error } = await signIn(email, password);
    if (error) {
      setError("Email o contraseña incorrectos.");
    } else {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-xl font-semibold mb-6">Admin login</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" className="w-full bg-accent text-white text-sm font-semibold py-2.5 rounded-lg">
          Ingresar
        </button>
      </form>
    </div>
  );
}
