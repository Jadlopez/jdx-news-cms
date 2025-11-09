// src/hooks/useAssignRole.js
import supabase from "../lib/mockApi";

/**
 * useAssignRole
 * - Llama a la Edge Function set_user_role (implementada en backend/Supabase Edge)
 * - Requiere que el caller esté autenticado (envía token en Authorization)
 * - Devuelve assignRole(targetUid, role)
 *
 * Asegúrate de configurar VITE_SET_ROLE_URL en .env con la URL de tu Edge Function
 */
export function useAssignRole() {
  const endpoint = import.meta.env.VITE_SET_ROLE_URL || "/.netlify/functions/set_user_role"; // fallback

  const assignRole = async (targetUid, role) => {
    // obtener token actual
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No hay sesión activa");

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUid, role }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err?.error || err?.message || "Error asignando rol");
    }
    return res.json();
  };

  return { assignRole };
}