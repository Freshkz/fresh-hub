import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { getCollaboratorByEmail, getCurrentRole } from "../services/collaborators";

const AuthContext = createContext(null);

function isInvalidTokenError(error) {
  return /invalid refresh token|refresh token (not found|already used)|session not found/i.test(
    error?.message || ""
  );
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  // `email` marca para qué usuario se resolvió el rol: mientras no coincida con
  // la sesión actual, seguimos "cargando" (si no, ProtectedRoute redirige al
  // login durante el instante en que el rol todavía no llegó).
  const [access, setAccess] = useState({ email: null, role: null, collaborator: null });

  const sessionEmail = session?.user?.email || null;

  useEffect(() => {
    if (!sessionEmail) return;
    let cancelled = false;
    Promise.all([
      getCollaboratorByEmail(sessionEmail).catch(() => null),
      getCurrentRole().catch((error) => {
        console.error("No se pudo obtener el rol:", error);
        return "visitor";
      }),
    ]).then(([collaborator, role]) => {
      if (!cancelled) setAccess({ email: sessionEmail, role, collaborator });
    });
    return () => { cancelled = true; };
  }, [sessionEmail]);

  const accessReady = !sessionEmail || access.email === sessionEmail;
  const collaborator = sessionEmail && accessReady ? access.collaborator : null;
  const loading = sessionLoading || !accessReady;

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
        if (mounted) setSessionLoading(false);
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

  // El rol NUNCA se lee de user_metadata: el usuario lo puede editar desde el
  // navegador. Viene de la base (collaborators.role vía current_app_role()).
  // Esto solo decide qué se muestra; lo que se puede hacer lo decide la RLS.
  const userRole = !session ? null : accessReady ? access.role || "visitor" : "visitor";

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
