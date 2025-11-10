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
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    console.log("Iniciando AuthContext...");
    mountedRef.current = true;
    setLoading(true);

    // First, try to get current user synchronously so page refreshes have immediate state
    (async () => {
      console.log("Verificando sesión inicial...");
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError)
          console.debug("AuthContext.getSession error:", sessionError);

        const currentUser = session?.user ?? null;
        console.debug("AuthContext.getSession - currentUser:", currentUser);

        if (!mountedRef.current) return;
        setUser(currentUser);
        setUserData(null);

        if (currentUser) {
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
              role: null,
              profileMissing: true,
              created_at: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error("AuthContext init getSession failed:", err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    // Subscribe to auth changes to react to sign in / sign out events
    console.log("Configurando suscripción a cambios de autenticación...");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Cambio de estado de autenticación detectado:", {
        event,
        hasSession: !!session,
      });
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
            // Igual que en la inicialización: si no hay perfil en la tabla,
            // no asignamos un rol por defecto.
            else
              setUserData({
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser.user_metadata?.name ?? null,
                role: null,
                profileMissing: true,
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
    // Exponer setUser para que componentes puedan sincronizar el estado de
    // autenticación inmediatamente después de operaciones de login/registro.
    setUser,
    logout,
    authError,
    setAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
