// src/services/authService.js
import { supabase } from "../supabase/client.js";

/**
 * Registra usuario y crea perfil en la base de datos
 */
export async function registerUser(email, password, name, role = "reportero") {
  console.log('Iniciando registro de usuario:', { email, name, role });
  
  try {
    // Primero intentamos registrar el usuario en auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      }
    });

    if (signUpError) {
      console.error('Error en signUp:', signUpError);
      throw signUpError;
    }

    if (!data) {
      console.error('No se recibió respuesta de signUp');
      throw new Error('No se pudo crear la cuenta');
    }

    console.log('Respuesta de signUp:', data);

    const user = data.user;
    const session = data.session;

    if (!user) {
      console.error('No se recibió usuario después de signUp');
      throw new Error('Error al crear usuario');
    }

    // El trigger debería crear el perfil automáticamente, pero podemos verificar
    try {
      const { data: profile, error: profileCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileCheckError) {
        console.warn('Error al verificar perfil:', profileCheckError);
      } else if (!profile) {
        console.log('Perfil no encontrado, intentando crear manualmente');
        
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            name,
            email,
            role,
            created_at: new Date().toISOString(),
          }]);

        if (insertError) {
          console.error('Error al crear perfil manualmente:', insertError);
        }
      } else {
        console.log('Perfil existente encontrado:', profile);
      }
    } catch (err) {
      console.error('Error al manejar perfil:', err);
    }

    return user;
  } catch (error) {
    console.error('Error en registerUser:', error);
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
