import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { getCollaboratorByEmail } from "../services/collaborators";

const AuthContext = createContext(null);

function isInvalidTokenError(error) {
  return /invalid refresh token|refresh token (not found|already used)|session not found/i.test(
    error?.message || ""
  );
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collaborator, setCollaborator] = useState(null);

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) {
      setCollaborator(null);
      return;
    }
    let cancelled = false;
    getCollaboratorByEmail(email)
      .then((data) => { if (!cancelled) setCollaborator(data); })
      .catch(() => { if (!cancelled) setCollaborator(null); });
    return () => { cancelled = true; };
  }, [session?.user?.email]);

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
    // Antes esto caía en "admin" por defecto para cualquier sesión sin rol
    // explícito. Con registro público abierto, eso le daría acceso de admin
    // a cualquiera que se registre. El default correcto es "visitor":
    // alguien logueado pero sin permisos de edición.
    return session.user?.user_metadata?.role || "visitor";
  }, [session]);

  const value = useMemo(() => ({
    session,
    loading,
    role: userRole,
    isAdmin: userRole === "admin",
    isEditor: userRole === "editor",
    isVisitor: userRole === "visitor",
    // Antes era "Boolean(session)" (cualquiera logueado entraba al panel).
    // Ahora exige rol de admin o editor de verdad.
    canEdit: userRole === "admin" || userRole === "editor",
    userEmail: session?.user?.email || "",
    collaborator,
    displayName: collaborator?.display_name || (userRole === "admin" ? "Admin" : userRole === "editor" ? "Colaborador" : session?.user?.email || "Visitante"),
    authorColor: collaborator?.color || (userRole === "admin" ? "#33E6B0" : "#9CA3AF"),
    authorAvatarUrl: collaborator?.avatar_url || "",
    canMarkPrivate: userRole === "admin" || Boolean(collaborator?.can_mark_private),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
    }),
    signInWithOAuth: (provider) => supabase.auth.signInWithOAuth({
      provider, // "google" | "azure"
      options: { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
    }),
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}admin`,
    }),
  }), [session, loading, userRole, collaborator]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
