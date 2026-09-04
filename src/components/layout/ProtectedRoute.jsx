import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { canEdit, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!canEdit) return <Navigate to="/admin" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/admin/dashboard" replace />;

  return children;
}
