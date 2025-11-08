// src/services/authService.js
import { supabase } from "../supabase/client.js";

/**
 * Registra usuario con Supabase Auth.
 * La inserción en la tabla 'usuarios' AHORA es manejada por un Trigger SQL en el backend.
 * @param {string} email
 * @param {string} password
 * @param {string} name (Usado como metadata)
 * @returns {object} Datos del usuario registrado
 */
export async function registerUser(email, password, name) {
  // 1. Registro de usuario con Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    // Puedes pasar el 'name' como metadata
    options: {
      data: { name: name },
    },
  });

  if (authError) {
    throw authError;
  }

  // *** Ya NO se necesita la inserción en la tabla 'usuarios'. El Trigger SQL lo hace. ***

  return authData.user;
}

/**
 * Inicia sesión
 * @param {string} email
 * @param {string} password
 * @returns {object} Sesión del usuario
 */
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
  return data;
}

/**
 * Cierra sesión
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  return true;
}

/**
 * Envía correo para restablecer contraseña
 * @param {string} email
 */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // URL de redirección opcional
    // redirectTo: 'https://example.com/update-password',
  });

  if (error) {
    throw error;
  }
  return true;
}

/**
 * Obtiene datos del usuario (principalmente el rol) desde la tabla 'usuarios'
 * @param {string} uid El UID del usuario autenticado
 * @returns {object | null} Datos del usuario
 */
export async function getUserData(uid) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", uid) // Filtra por ID de usuario
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 es "No Content" (no existe)
    console.error("Error fetching user data:", error);
    throw error;
  }

  return data;
}
