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
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      const currentUser = session?.user;
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
            // Si no existe perfil en la base de datos, creamos uno por defecto
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
          // Mantener userData en null para que otros componentes reaccionen correctamente
        }
      }

      if (mountedRef.current) setLoading(false);
    });

    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserData(null);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
