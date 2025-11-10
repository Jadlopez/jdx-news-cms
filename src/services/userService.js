import { supabase } from "../supabase/client.js";

/**
 * Obtener usuario por id (tabla 'users')
 */
export async function getUserById(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

/**
 * Actualizar perfil del usuario en la tabla 'users'
 * profileData puede contener: name, bio, phone, avatar_url, avatar_path, ...
 */
export async function updateUserProfile(id, profileData) {
  if (!id) throw new Error("ID de usuario requerido");
  const payload = { ...profileData, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Obtener todos los usuarios (útil para admin)
 */
export async function getAllUsers() {
  const { data, error } = await supabase.from("users").select("*").order("email", { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Soft-delete: marca usuario como inactivo (active = false)
 */
export async function softDeleteUser(id) {
  if (!id) throw new Error("ID de usuario requerido");
  const { error } = await supabase
    .from("users")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}