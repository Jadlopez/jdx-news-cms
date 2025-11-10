// src/services/authService.js
import { supabase } from "../supabase/client";

/**
 * Registra usuario y deja que el trigger cree el perfil en la base de datos.
 */
export async function registerUser(email, password, name, role = "reportero") {
  try {
    if (!email || !password || !name) {
      throw new Error("Faltan datos requeridos para el registro");
    }

    // ✅ Registro directo en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin, // opcional
        data: {
          name: name.trim(),
          role: role.trim(),
        },
      },
    });

    if (error) throw error;
    if (!data?.user) throw new Error("No se pudo crear el usuario.");

    console.log("✅ Usuario creado en Auth:", data.user);
    return data.user;
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    throw error;
  }
}
export async function loginUser(email, password) {
  try {
    console.log("🔑 Iniciando sesión:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    console.log("✅ Sesión iniciada correctamente:", data);
    // 🔥 Importante: no retornes solo el usuario,
    // sino también la sesión completa para que el SDK la maneje.
    return data;
  } catch (err) {
    console.error("❌ Error en loginUser:", err);
    throw err;
  }
}
/**
 * Inicia sesión con Google usando Supabase Auth
 */
export async function signInWithGoogle() {
  try {
    console.log("🌐 Iniciando sesión con Google...");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // vuelve a tu app después del login
      },
    });

    if (error) throw error;

    console.log("✅ Redirigiendo a Google:", data?.url);
    return data;
  } catch (err) {
    console.error("❌ Error en signInWithGoogle:", err.message);
    throw err;
  }
}

// 🔍 Obtiene el perfil del usuario desde la tabla "users"
export async function getUserData(userId) {
  try {
    if (!userId) throw new Error("ID de usuario no proporcionado");

    console.log("📡 Obteniendo datos del usuario:", userId);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle(); // evita error si no hay registro

    if (error) throw error;

    if (!data) {
      console.warn("⚠️ No se encontró perfil para este usuario.");
      return null;
    }

    console.log("✅ Perfil del usuario obtenido:", data);
    return data;
  } catch (err) {
    console.error("❌ Error en getUserData:", err.message);
    throw err;
  }
}
