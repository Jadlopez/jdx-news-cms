// src/services/newsService.js
import { supabase } from "../supabase/client.js";

// 📰 Crear noticia
export async function createNews(data) {
  const { data: result, error } = await supabase
    .from("news")
    .insert([{ ...data }])
    .select();

  if (error) throw error;
  return result[0];
}

// 📋 Obtener todas las noticias
export async function getAllNews(status = null) {
  let query = supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// 🔍 Obtener noticia por ID
export async function getNewsById(id) {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// ✏️ Actualizar noticia
export async function updateNews(id, data) {
  const { error } = await supabase
    .from("news")
    .update({ ...data, updated_at: new Date() })
    .eq("id", id);

  if (error) throw error;
}

// 🗑️ Eliminar noticia
export async function deleteNews(id) {
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;
}

// 📸 Subir imagen
export async function uploadImage(file) {
  const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const { data, error } = await supabase.storage
    .from("news")
    .upload(filename, file);

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from("news")
    .getPublicUrl(data.path);
  return { url: publicUrl.publicUrl, path: data.path };
}
