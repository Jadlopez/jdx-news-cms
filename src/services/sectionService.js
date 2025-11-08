import { supabase } from "../supabase/client.js";

/**
 * Nombre de la tabla de secciones (categorías de noticias)
 */
const SECTIONS_TABLE = "secciones";

/**
 * Obtiene todas las secciones ordenadas alfabéticamente (RF-10)
 * La política RLS de esta tabla permite la lectura pública.
 */
export const getSections = async () => {
  const { data, error } = await supabase
    .from(SECTIONS_TABLE)
    .select("id, nombre, slug, descripcion") // Selecciona las columnas necesarias
    .order("nombre", { ascending: true }); // Ordena por nombre (asc)

  if (error) {
    console.error("Error al obtener secciones:", error);
    throw error;
  }

  // Supabase ya devuelve un array de objetos, no es necesario mapear docs.
  return data;
};

/**
 * Crea una nueva sección (Solo Editor, validado por RLS)
 * @param {Object} sectionData - { nombre, slug, descripcion }
 */
export const createSection = async (sectionData) => {
  const { data, error } = await supabase
    .from(SECTIONS_TABLE)
    .insert([sectionData])
    .select("id") // Pide que devuelva el ID del registro creado
    .single();

  if (error) {
    console.error("Error al crear sección:", error);
    // La RLS de INSERT fallará aquí si el usuario no es Editor.
    throw error;
  }

  return data.id;
};

/**
 * Obtiene una sección por ID
 */
export const getSectionById = async (id) => {
  const { data, error } = await supabase
    .from(SECTIONS_TABLE)
    .select("id, nombre, slug, descripcion")
    .eq("id", id) // Filtra donde la columna 'id' es igual al valor pasado
    .single(); // Espera un único resultado

  if (error && error.code !== "PGRST116") {
    // PGRST116 = No Content (no se encontró)
    console.error("Error al obtener sección por ID:", error);
    throw error;
  }

  return data; // Retorna null si no existe, o el objeto si se encuentra.
};

/**
 * Actualiza una sección existente (Solo Editor, validado por RLS)
 */
export const updateSection = async (id, updatedData) => {
  const { error } = await supabase
    .from(SECTIONS_TABLE)
    .update(updatedData)
    .eq("id", id)
    .single(); // Se usa single() para asegurar que solo una fila sea afectada (opcional pero seguro)

  if (error) {
    console.error("Error al actualizar sección:", error);
    // La RLS de UPDATE fallará aquí si el usuario no es Editor.
    throw error;
  }
};

/**
 * Elimina una sección (Solo Editor, validado por RLS)
 */
export const deleteSection = async (id) => {
  const { error } = await supabase.from(SECTIONS_TABLE).delete().eq("id", id); // Filtra por el ID a eliminar

  if (error) {
    console.error("Error al eliminar sección:", error);
    // La RLS de DELETE fallará aquí si el usuario no es Editor.
    throw error;
  }
};
