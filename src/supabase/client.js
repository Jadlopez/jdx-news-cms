// src/supabase/client.js
import { createClient } from "@supabase/supabase-js";

// Singleton pattern para asegurar una única instancia del cliente
let supabaseInstance = null;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar las credenciales de Supabase
const envVars = { ...import.meta.env };
delete envVars.SSR; // Eliminar variables innecesarias para el log
delete envVars.MODE;
delete envVars.DEV;
delete envVars.PROD;
console.log("Variables de entorno disponibles:", envVars);

console.log("Inicializando Supabase con:", {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Faltan las credenciales de Supabase");
  throw new Error("Faltan las credenciales de Supabase");
}

// Función para obtener la instancia del cliente
function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: "supabase.auth.token", // Asegurar que usamos la misma key de storage
    },
  });

  return supabaseInstance;
}

export const supabase = getSupabaseClient();

// Verificar la conexión
supabase.auth.onAuthStateChange((event, session) => {
  console.log(
    "Supabase Auth Estado:",
    event,
    session ? "Con sesión" : "Sin sesión"
  );
});

// Verificar que la conexión está funcionando
async function checkConnection() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .single();
    if (error) {
      console.error("Error al verificar la conexión con Supabase:", error);
    } else {
      console.log("Conexión con Supabase establecida correctamente");
    }
  } catch (err) {
    console.error("Error al intentar conectar con Supabase:", err);
  }
}

checkConnection();
