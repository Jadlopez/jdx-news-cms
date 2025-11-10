// src/supabase/client.js
import { createClient } from "@supabase/supabase-js";

/**
 * supabase/client.js
 * - Singleton para una única instancia del cliente Supabase
 * - detectSessionInUrl = false para evitar que Supabase procese parámetros en la URL
 *   (esto evita eventos de auth inesperados al cambiar pestañas o recargar)
 */

let supabaseInstance = null;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY");
  throw new Error("Faltan las credenciales de Supabase");
}

function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // importante para SPAs
    },
    // puedes añadir otras opciones si las necesitas
  });

  // debug ligero de auth (se puede comentar en producción)
  supabaseInstance.auth.onAuthStateChange((event, session) => {
    // Solo debug — no provoques lógica de UI aquí
    console.debug("[supabase] onAuthStateChange:", event, { hasSession: !!session });
  });

  return supabaseInstance;
}

export const supabase = getSupabaseClient();

/**
 * Optional: prueba básica de conexión no intrusiva.
 * Intenta seleccionar 1 fila de 'news' (más seguro que tocar tabla users).
 */
async function checkConnection() {
  try {
    const { data, error } = await supabase.from("news").select("id").limit(1);
    if (error) {
      console.warn("Supabase checkConnection warning:", error.message || error);
    } else {
      console.debug("Supabase: conexión OK (news sample):", data?.length ?? 0);
    }
  } catch (err) {
    console.error("Supabase checkConnection error:", err);
  }
}

checkConnection();
