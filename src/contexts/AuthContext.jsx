// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client.js"; // Tu cliente de Supabase
import { getUserData } from "../services/authService"; // La función que creamos antes

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * AuthProvider:
 * - user: objeto de Supabase Auth (si está logueado)
 * - userData: doc de la tabla 'usuarios' con el rol
 * - loading: mientras se resuelve el estado de autenticación
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener el perfil y rol del usuario
  const fetchUserData = async (uid) => {
    try {
      // Usamos la función getUserData del servicio que creamos
      const data = await getUserData(uid);
      if (data) {
        // Normalizar el campo de rol: exponer 'role' en minúsculas
        const normalizedRole = (data.role ?? data.rol ?? "").toString();
        const normalized = {
          ...data,
          rol: data.rol ?? data.role ?? null,
          role: normalizedRole ? normalizedRole.toLowerCase() : null,
        };
        setUserData(normalized); // Contendrá { id, email, rol, role, nombre, ... }
      } else {
        // Esto debería ser raro con el Trigger SQL, pero es un fallback
        setUserData({ rol: "Reportero", role: "reportero" });
        console.warn(
          "Registro de rol no encontrado, asignando rol por defecto."
        );
      }
    } catch (err) {
      console.error("Error al obtener datos de perfil de Supabase:", err);
      setUserData(null);
    }
  };

  useEffect(() => {
    // 1. Manejo del estado inicial (al cargar la página)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    // 2. Suscripción a cambios (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          // Usuario ha iniciado sesión o refrescado
          setUser(session.user);
          fetchUserData(session.user.id);
        } else {
          // Usuario ha cerrado sesión
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      }
    );

    // Limpieza al desmontar el componente
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []); // El array vacío asegura que se ejecute solo al montar

  const value = {
    user,
    userData,
    loading,
    // Usamos la propiedad normalizada 'role' (minúsculas) para consistencia
    isReporter: userData?.role === "reportero",
    isEditor: userData?.role === "editor",
  };

  // 3. Renderizado: Importante que los hijos (Rutas) solo se muestren
  // cuando la carga inicial de Auth ha terminado.
  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Cargando autenticación...</div>}
    </AuthContext.Provider>
  );
}
