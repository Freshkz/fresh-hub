import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error && /future|jwt|issued/i.test(error.message || "")) {
          await supabase.auth.signOut();
          setSession(null);
          return;
        }
        setSession(data.session ?? null);
      } catch (error) {
        if (error && /future|jwt|issued/i.test(error.message || "")) {
          await supabase.auth.signOut().catch(() => {});
        }
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "TOKEN_REFRESH_FAILED" || event === "SIGNED_OUT") {
        setSession(null);
        return;
      }
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  return { session, loading, signIn, signOut, isAdmin: !!session };
}
