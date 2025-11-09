// src/services/sectionService.js
import { supabase } from "../supabase/client.js";

export const getSections = async () => {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
};

export const createSection = async (sectionData) => {
  const { data, error } = await supabase
    .from("sections")
    .insert([sectionData])
    .select()
    .single();
  if (error) throw error;
  return data.id;
};

export const getSectionById = async (id) => {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const updateSection = async (id, updatedData) => {
  const { error } = await supabase
    .from("sections")
    .update(updatedData)
    .eq("id", id);
  if (error) throw error;
};

export const deleteSection = async (id) => {
  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) throw error;
};
