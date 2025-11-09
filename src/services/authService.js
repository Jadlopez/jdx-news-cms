// src/services/authService.js
import { supabase } from "../supabase/client.js";

/**
 * Registra usuario y crea perfil en la base de datos
 */
export async function registerUser(email, password, name, role = "reportero") {
  try {
    // Crear el usuario en auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (signUpError) throw signUpError;
    if (!authData?.user) throw new Error("No se pudo crear la cuenta");

    // El trigger creará el perfil automáticamente
    return authData.user;
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
}

/**
 * Inicia sesión con email/password
 */
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Inicia sesión con Google
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });

  if (error) throw error;
  return data;
}

/**
 * Cierra sesión
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Envía correo para restablecer contraseña
 */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

/**
 * Obtiene datos del usuario desde la base de datos
 */
export async function getUserData(uid) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", uid)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Guarda o actualiza datos del usuario en la base de datos
 */
export async function saveUserData(uid, data) {
  const { error } = await supabase.from("users").upsert({
    id: uid,
    ...data,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}
