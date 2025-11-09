// src/contexts/AuthContext.jsx
// TEMPORAL — Autenticación simulada usando localStorage (sin Firebase ni Supabase)

import { createContext, useContext, useState, useEffect } from "react";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {id, name, email, role}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getCurrentUser();
    if (session) setUser(session);
    setLoading(false);
  }, []);

  const signUp = async ({ name, email, password }) => {
    const newUser = registerUser(name, email, password);
    setUser(newUser);
    return newUser;
  };

  const signIn = async ({ email, password }) => {
    const logged = loginUser(email, password);
    setUser(logged);
    return logged;
  };

  const signOut = () => {
    logoutUser();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: user?.role === "admin",
    isEditor: user?.role === "editor",
    isReporter: user?.role === "reportero",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
