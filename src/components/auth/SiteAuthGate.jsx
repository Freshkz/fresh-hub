import { useAuth } from "../../hooks/useAuth";
import SiteAuthScreen from "../../pages/auth/SiteAuthScreen";

export default function SiteAuthGate({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return <SiteAuthScreen />;
  }

  return children;
}
