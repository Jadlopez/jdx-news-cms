// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
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
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setUserData(null);

      if (firebaseUser) {
        // leer doc del usuario en Firestore (colección "users")
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserData(snap.data()); // esperemos que tenga { role: "reportero" | "editor", ... }
          } else {
            // si no existe, podrías crear registro por defecto desde el backend o aquí
            setUserData({ role: "reportero" });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
