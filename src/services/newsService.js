// src/services/newsService.js
import { supabase } from "../supabase/client.js";

/**
 * 📸 Sube una imagen y devuelve { url, path }
 * path: ruta relativa en el storage (ej: news/123_filename.jpg)
 */
export async function uploadImage(file, folder = "news") {
  if (!file) return null;
  const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const path = `${folder}/${filename}`;

  const { data, error } = await supabase.storage
    .from("news-images")
    .upload(path, file);

  if (error) throw error;

  const {
    data: { publicUrl: url },
  } = supabase.storage.from("news-images").getPublicUrl(path);

  return { url, path };
}

/**
 * 📰 Crear noticia (incluye imageUrl e imagePath si aplica)
 */
export async function createNews(data) {
  // Obtenemos el usuario actual
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Debes iniciar sesión para crear noticias");

  const payload = {
    title: data.title || "",
    subtitle: data.subtitle || "",
    content: data.content || "",
    category: data.category || "General",
    image_url: data.imageUrl || "",
    image_path: data.imagePath || "",
    author: user.id, // Usamos el ID del usuario autenticado
    status: data.status || "Edición", // Edición | Terminado | Publicado | Desactivado
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: news, error } = await supabase
    .from("news")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  // Map DB row (snake_case) to client-friendly camelCase
  return mapNewsRow(news);
}

/**
 * 📋 Obtener todas las noticias (o filtrar por estado)
 */
export async function getAllNews(status = null) {
  let query = supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data.map(mapNewsRow) : [];
}

/**
 * 🔍 Obtener una noticia específica por ID
 */
export async function getNewsById(id) {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return mapNewsRow(data);
}

/**
 * ✏️ Actualizar noticia (mantiene la imagen anterior)
 */
export async function updateNews(id, data) {
  // Map incoming camelCase fields to DB columns
  const payload = {
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    category: data.category,
    image_url: data.imageUrl,
    image_path: data.imagePath,
    // author should not be updated here normally, but allow if present
    author: data.author,
    status: data.status,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("news").update(payload).eq("id", id);
  if (error) throw error;
}

/**
 * 🔄 Cambiar sólo el estado (útil para el editor)
 */
export async function updateNewsStatus(id, status) {
  const { error } = await supabase
    .from("news")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

/**
 * 🗑️ Eliminar noticia + su imagen asociada (si existe)
 */
export async function deleteNews(id, imagePath) {
  // Primero eliminamos la imagen si existe
  if (imagePath) {
    const { error: storageError } = await supabase.storage
      .from("news-images")
      .remove([imagePath]);

    if (storageError) {
      console.warn("Error eliminando imagen:", storageError);
    }
  }

  // Luego eliminamos la noticia
  const { error } = await supabase.from("news").delete().eq("id", id);

  if (error) throw error;
}

export async function deleteImage(path) {
  if (!path) return;
  const { error } = await supabase.storage.from("news-images").remove([path]);
  if (error) throw error;
}

/**
 * 👤 Obtener noticias por autor
 * @param {string} authorId - ID del autor
 * @param {string} [status] - Estado opcional para filtrar
 */
export async function getNewsByAuthor(authorId, status = null) {
  let query = supabase
    .from("news")
    .select("*")
    .eq("author", authorId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data.map(mapNewsRow) : [];
}

function mapNewsRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    content: row.content,
    category: row.category,
    imageUrl: row.image_url || row.imageUrl || "",
    imagePath: row.image_path || row.imagePath || "",
    author: row.author,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
