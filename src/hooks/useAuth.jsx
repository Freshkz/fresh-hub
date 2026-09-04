import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);

function isInvalidTokenError(error) {
  return /invalid refresh token|refresh token (not found|already used)|session not found/i.test(
    error?.message || ""
  );
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          if (isInvalidTokenError(error)) {
            await supabase.auth.signOut();
          }
          throw error;
        }
        if (mounted) setSession(data.session ?? null);
      } catch (error) {
        if (mounted) setSession(null);
        if (!isInvalidTokenError(error)) console.error("No se pudo recuperar la sesión:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const userRole = useMemo(() => {
    if (!session) return null;
    return session.user?.user_metadata?.role || "admin";
  }, [session]);

  const value = useMemo(() => ({
    session,
    loading,
    role: userRole,
    isAdmin: userRole === "admin",
    isEditor: userRole === "editor",
    canEdit: Boolean(session),
    userEmail: session?.user?.email || "",
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}admin`,
    }),
  }), [session, loading, userRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
