// src/services/authService.js
import { supabase } from "../supabase/client";
/**
 * Registra usuario y crea perfil en la base de datos
 */
export async function registerUser(email, password, name, role = "reportero") {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });

  if (error) throw error;
  return data.user;
}

/**
 * 🔹 Obtiene el perfil de un usuario desde la tabla "users"
 */
export async function getUserData(uid) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", uid)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * 🔹 Guarda o actualiza un perfil de usuario
 */
export async function saveUserData(uid, payload) {
  if (!uid || !payload)
    throw new Error("Datos incompletos para guardar perfil");

  const { error } = await supabase.from("users").upsert(payload);
  if (error) throw error;
  return true;
}

/**
 * 🔹 Autenticación con Google (OAuth)
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/register`,
    },
  });
  if (error) throw error;
  return data;
}
