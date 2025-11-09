// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { supabase } from "../supabase/client";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * AuthProvider:
 * - user: objeto de Firebase Auth (si está logueado)
 * - userData: doc de Firestore con metadatos del usuario (ej: role)
 * - loading: mientras se resuelve el estado de autenticación
 * - setUserData: función para actualizar userData desde componentes (por ejemplo Login)
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    // First, try to get current user synchronously so page refreshes have immediate state
    (async () => {
      try {
        const { data: userDataResp, error: userErr } =
          await supabase.auth.getUser();
        if (userErr) console.debug("AuthContext.getUser error:", userErr);
        const currentUser = userDataResp?.user ?? null;
        console.debug("AuthContext.getUser - currentUser:", currentUser);
        if (!mountedRef.current) return;
        setUser(currentUser);
        setUserData(null);

        if (currentUser) {
          try {
            const { data: profile, error } = await supabase
              .from("users")
              .select("*")
              .eq("id", currentUser.id)
              .single();

            if (!mountedRef.current) return;

            if (error) throw error;

            if (profile) {
              setUserData(profile);
            } else {
              setUserData({
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser.user_metadata?.name ?? null,
                role: "reportero",
                created_at: new Date().toISOString(),
              });
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
          }
        }
      } catch (err) {
        console.error("AuthContext init getUser failed:", err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    // Subscribe to auth changes to react to sign in / sign out events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.debug(
        "AuthContext.onAuthStateChange event:",
        event,
        session?.user ?? null
      );
      if (!mountedRef.current) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setUserData(null);

      (async () => {
        if (currentUser) {
          try {
            const { data: profile, error } = await supabase
              .from("users")
              .select("*")
              .eq("id", currentUser.id)
              .single();

            if (!mountedRef.current) return;

            if (error) throw error;

            if (profile) setUserData(profile);
            else
              setUserData({
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser.user_metadata?.name ?? null,
                role: "reportero",
                created_at: new Date().toISOString(),
              });
          } catch (err) {
            console.error("Error fetching user data (onAuthStateChange):", err);
          }
        }

        if (mountedRef.current) setLoading(false);
      })();
    });

    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      // Debug: log user before sign out
      try {
        const { data: before } = await supabase.auth.getUser();
        console.debug("AuthContext.logout - before user:", before);
      } catch (e) {
        console.debug("AuthContext.logout - getUser before failed:", e);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Debug: log user after sign out
      try {
        const { data: after } = await supabase.auth.getUser();
        console.debug("AuthContext.logout - after user:", after);
      } catch (e) {
        console.debug("AuthContext.logout - getUser after failed:", e);
      }

      setUser(null);
      setUserData(null);
      setAuthError(null);
    } catch (error) {
      console.error("Error en logout:", error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    setUserData,
    logout, // <-- Añadimos la función de logout al contexto
    authError,
    setAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
