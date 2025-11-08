// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mountedRef.current) return;
      setUser(firebaseUser);
      setUserData(null);

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userDocRef);

          if (!mountedRef.current) return;

          if (snap.exists()) {
            setUserData(snap.data());
          } else {
            // Si no existe documento en Firestore, dejamos un perfil mínimo por defecto.
            setUserData({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? null,
              name: firebaseUser.displayName ?? null,
              role: "reportero",
              createdAt: null,
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          // Mantener userData en null para que otros componentes reaccionen correctamente.
        }
      }

      if (mountedRef.current) setLoading(false);
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    userData,
    loading,
    setUserData, // <-- IMPORTANTE: ahora disponible para components (Login usa esto)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
