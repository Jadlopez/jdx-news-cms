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

  // Helper para obtener perfil desde la tabla 'users'
  const fetchUserData = async (uid) => {
    if (!uid) return null;
    try {
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", uid)
        .maybeSingle();
      if (error) throw error;
      return profile ?? null;
    } catch (err) {
      console.error("fetchUserData error:", err);
      return null;
    }
  };

  useEffect(() => {
    console.log("[AuthContext] user:", user);
    console.log("[AuthContext] userData:", userData);
    console.log("[AuthContext] loading:", loading);
  }, [user, userData, loading]);

  // refreshUserData expuesto para que componentes actualicen el perfil
  const refreshUserData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      if (!currentUser) {
        setUser(null);
        setUserData(null);
        return;
      }
      const profile = await fetchUserData(currentUser.id);
      if (mountedRef.current) {
        setUser(currentUser);
        setUserData(
          profile ?? {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.user_metadata?.name ?? null,
            role: null,
            profileMissing: true,
            created_at: new Date().toISOString(),
          }
        );
      }
    } catch (err) {
      console.error("refreshUserData failed:", err);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    (async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError)
          console.debug("AuthContext.getSession error:", sessionError);

        const currentUser = session?.user ?? null;
        if (!mountedRef.current) return;
        setUser(currentUser);
        setUserData(null);

        if (currentUser) {
          const profile = await fetchUserData(currentUser.id);
          if (!mountedRef.current) return;
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setUserData(null);

      (async () => {
        if (currentUser) {
          try {
            const profile = await fetchUserData(currentUser.id);
            if (!mountedRef.current) return;
            if (profile) setUserData(profile);
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
    setUser,
    logout,
    authError,
    setAuthError,
    refreshUserData, // <-- expuesto
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
