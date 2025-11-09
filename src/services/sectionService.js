// src/services/sectionService.js
import { supabase } from "../supabase/client.js";

/**
 * Obtiene todas las secciones ordenadas alfabéticamente
 */
export const getSections = async () => {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Crea una nueva sección
 * @param {Object} sectionData - { name, description }
 */
export const createSection = async (sectionData) => {
  const { data, error } = await supabase
    .from("sections")
    .insert([sectionData])
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

/**
 * Obtiene una sección por ID
 */
export const getSectionById = async (id) => {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Actualiza una sección existente
 */
export const updateSection = async (id, updatedData) => {
  const { error } = await supabase
    .from("sections")
    .update(updatedData)
    .eq("id", id);

  if (error) throw error;
};

/**
 * Elimina una sección
 */
export const deleteSection = async (id) => {
  const { error } = await supabase.from("sections").delete().eq("id", id);

  if (error) throw error;
};
